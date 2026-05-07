import type { NextConfig } from "next";

const isTauri = process.env.IS_TAURI === "true";

const nextConfig: NextConfig = {
  output: isTauri ? "export" : undefined,
  trailingSlash: isTauri ? true : undefined,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
