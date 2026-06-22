import type { NextRequest } from "next/server";

// On Cloudflare the real visitor IP is in CF-Connecting-IP; x-forwarded-for
// there points at Cloudflare's own edge. Fall back to the usual proxy headers
// for other hosts / local dev.
export function clientIp(req: NextRequest): string {
  const cf = req.headers.get("cf-connecting-ip");
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  return cf?.trim() || (forwarded ? forwarded.split(",")[0].trim() : realIp ?? "127.0.0.1");
}

export function isPrivateOrLocal(ip: string): boolean {
  return (
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.16.") ||
    ip.startsWith("fe80") ||
    ip === "0.0.0.0"
  );
}
