// Global test setup: serves the production build (`vite build` output in dist/)
// through `wrangler dev`, the same workerd runtime and asset handling Cloudflare
// uses, with the standalone MCP service behind /api/mcp. Page tests request it
// over HTTP through tests/site.mjs.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = new URL("../", import.meta.url);
const children = [];
// Local binding state (the image cache) lives outside dist/ and starts empty.
const state = mkdtempSync(join(tmpdir(), "col-worker-"));

/** Waits for a child process to print a line matching `pattern`. */
function waitFor(child, pattern, name) {
  return new Promise((resolve, reject) => {
    let output = "";
    const onData = (chunk) => {
      output += chunk;
      const match = output.match(pattern);
      if (match) resolve(match);
    };
    child.stdout.setEncoding("utf8").on("data", onData);
    child.stderr.setEncoding("utf8").on("data", onData);
    child.once("exit", (code) => reject(new Error(`${name} exited with ${code}:\n${output}`)));
  });
}

const freePort = () => new Promise((resolve) => {
  const server = createServer().listen(0, "127.0.0.1", () => {
    const { port } = server.address();
    server.close(() => resolve(port));
  });
});

/** Ends a process and, on Windows, the workerd process wrangler starts under it. */
function stop(child) {
  if (child.exitCode !== null) return;
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  else child.kill("SIGTERM");
}

export async function globalSetup() {
  try {
    await startSite();
  } catch (error) {
    await globalTeardown();
    throw error;
  }
}

async function startSite() {
  if (!existsSync(new URL("dist/server/wrangler.json", root))) throw new Error("Build the site first: bun run build");

  const mcp = spawn(process.execPath, ["mcp-app/server.ts"], { cwd: root, env: { ...process.env, PORT: "0" } });
  children.push(mcp);
  const [mcpUrl] = await waitFor(mcp, /http:\/\/localhost:\d+/, "MCP service");

  const port = await freePort();
  const wrangler = spawn(process.execPath, [
    "node_modules/wrangler/bin/wrangler.js", "dev", "--config", "dist/server/wrangler.json",
    "--ip", "127.0.0.1", "--port", String(port), "--persist-to", state, "--show-interactive-dev-session=false",
    // Runtime variables, as the dashboard provides them in production.
    "--var", `COL_MCP_ORIGIN:${mcpUrl}`, "--var", "COL_MCP_ALLOWED_ORIGINS:http://localhost:3000",
  ], { cwd: root, env: { ...process.env, WRANGLER_SEND_METRICS: "false" } });
  children.push(wrangler);
  await waitFor(wrangler, /Ready on http:\/\/[\d.:]+/, "wrangler dev");
  process.env.COL_SITE_URL = `http://127.0.0.1:${port}`;
}

export async function globalTeardown() {
  for (const child of children) stop(child);
  rmSync(state, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
