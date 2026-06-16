import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["ua-parser-js"],
  // Hide the floating Next.js dev-mode indicator (the "N" badge)
  devIndicators: false,
};

export default nextConfig;

// Allow `next dev` to access Cloudflare bindings/env locally via OpenNext.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
