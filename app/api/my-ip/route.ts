import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // On Cloudflare the real visitor IP is in CF-Connecting-IP; x-forwarded-for
  // there points at Cloudflare's own edge, which is why every lookup otherwise
  // resolved to a Cloudflare AS13335 address.
  const cf = req.headers.get("cf-connecting-ip");
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = cf?.trim() || (forwarded ? forwarded.split(",")[0].trim() : realIp ?? "127.0.0.1");

  // Local / private IPs (localhost dev) can't be geolocated — query without an
  // explicit IP so ip-api returns the server's real public egress IP instead.
  const isLocal =
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.16.") ||
    ip.startsWith("fe80") ||
    ip === "0.0.0.0";

  try {
    const fields = "status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,mobile,proxy,hosting,query";
    const lookup = isLocal ? "" : ip;
    const res = await fetch(`http://ip-api.com/json/${lookup}?fields=${fields}`, { cache: "no-store" });
    const data = await res.json();
    // Prefer the geolocated `query` IP (real public IP) over the local socket IP.
    return NextResponse.json({ ...data, ip: data.query ?? ip });
  } catch {
    return NextResponse.json({ ip, error: "无法获取 IP 信息" }, { status: 500 });
  }
}
