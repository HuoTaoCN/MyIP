import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["ua-parser-js"],
  // Hide the floating Next.js dev-mode indicator (the "N" badge)
  devIndicators: false,
  // After one HTTPS visit, browsers auto-upgrade future http:// to https://
  // (defense-in-depth; also enable "Always Use HTTPS" in the Cloudflare zone).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
        ],
      },
    ];
  },
};

export default nextConfig;

// Allow `next dev` to access Cloudflare bindings/env locally via OpenNext.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
