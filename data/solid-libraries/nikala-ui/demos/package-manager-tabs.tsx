import { PackageManagerTabs } from "@/components/ui/package-manager-tabs";
const importCode = `import { PackageManagerTabs } from "@/components/ui/package-manager-tabs";`;
const defaultCode = `<PackageManagerTabs
  managers={["bun", "pnpm", "npm", "yarn"]}
  command="add @nikala-ui/core"
/>`;
const customManagersCode = `<PackageManagerTabs
  managers={["bunx", "npx", "pnpm", "yarn"]}
  command="add button"
/>`;
const createCode = `<PackageManagerTabs
  managers={["bun", "pnpm", "npm", "yarn"]}
  command="create @nikala-ui/docs my-project"
/>`;
const explicitCommandsCode = `<PackageManagerTabs
  managers={["bun", "pnpm", "npm", "deno"]}
  commands={{
    bun: "bun run dev --port 3000",
    pnpm: "pnpm dev --port 3000",
    npm: "npm run dev -- --port 3000",
    deno: "deno task dev --port 3000",
  }}
/>`;
export default function Demo() {

return <>
          <div class="w-full max-w-xl">
            <PackageManagerTabs
              managers={["bun", "pnpm", "npm", "yarn"]}
              command="add @nikala-ui/core"
            />
          </div>
        </>;
}
