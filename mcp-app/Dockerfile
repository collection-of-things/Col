# Col's MCP service for Railway (or any container host). Build context is the
# repository root so lib/ and data/ sit next to mcp-app/ exactly as in dev.
#
# Railway: set the service's Dockerfile path to mcp-app/Dockerfile (or
# RAILWAY_DOCKERFILE_PATH=mcp-app/Dockerfile) and keep the root directory at
# the repository root — the build context must include lib/ and data/.
FROM node:24-slim

WORKDIR /app

# Runtime deps resolve from /app/node_modules: lib/ and data/ import zod,
# @babel/parser and @modelcontextprotocol/server, and mcp-app/package.json
# pins exactly that set (everything else is type-only or node: builtins).
COPY mcp-app/package.json mcp-app/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

COPY lib ./lib
COPY data ./data
COPY mcp-app ./mcp-app

ENV NODE_ENV=production
# Railway injects PORT; 8787 is the local default.
EXPOSE 8787

# Node 24 strips TypeScript types natively; server.ts adapts the fetch
# handler to node:http. Run from /app so ../lib and ../data resolve.
CMD ["node", "mcp-app/server.ts"]
