import type { NextConfig } from "next";

const isTauri = process.env.IS_TAURI === "true";

const nextConfig: NextConfig = {
  output: isTauri ? "export" : "standalone",
  trailingSlash: isTauri ? true : undefined,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
