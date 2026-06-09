import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["ua-parser-js"],
  // Hide the floating Next.js dev-mode indicator (the "N" badge)
  devIndicators: false,
};

export default nextConfig;
