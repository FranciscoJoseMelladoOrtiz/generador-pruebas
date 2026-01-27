import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@components": path.resolve(__dirname, "src/components"),
      "@models": path.resolve(__dirname, "src/models"),
      "@utils": path.resolve(__dirname, "src/utils"),
    };
    return config;
  },
};

export default nextConfig;
