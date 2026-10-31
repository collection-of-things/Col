import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: { "/api/mcp": ["./data/component-previews/media/*"] },
  images: {
    // Contributor avatars load through the server-side optimizer.
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com", port: "", pathname: "/u/**", search: "?v=4" },
    ],
  },
  async headers() {
    return [{
      source: "/col-social-preview:version(.*).jpg",
      headers: [{ key: "Cache-Control", value: "public, max-age=60, s-maxage=60" }],
    }];
  },
};

export default nextConfig;
