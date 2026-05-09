import type { NextConfig } from "next";

const isTauri = process.env.IS_TAURI === "true";

const nextConfig: NextConfig = {
  // output: "export",
  // trailingSlash: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
