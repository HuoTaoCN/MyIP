import { NextRequest, NextResponse } from "next/server";
import { clientIp, isPrivateOrLocal } from "@/lib/clientIp";
import { aggregateSources } from "@/lib/ipSources";

export async function GET(req: NextRequest) {
  const param = req.nextUrl.searchParams.get("ip")?.trim();
  let ip = param || clientIp(req);

  // For local/dev requests, fall back to ip-api's view of our egress so the
  // comparison still has a real public IP to look up.
  if (!param && isPrivateOrLocal(ip)) {
    try {
      const me = await fetch("http://ip-api.com/json/?fields=query", { cache: "no-store" });
      const d = await me.json();
      if (d?.query) ip = d.query;
    } catch { /* keep local ip */ }
  }

  try {
    const results = await aggregateSources(ip);
    return NextResponse.json({ ip, results });
  } catch {
    return NextResponse.json({ ip, results: [], error: "lookup_failed" }, { status: 500 });
  }
}
