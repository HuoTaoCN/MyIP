import { NextRequest, NextResponse } from "next/server";
import dns from "dns/promises";

export async function GET(req: NextRequest) {
  const ip = req.nextUrl.searchParams.get("ip")?.trim() ?? "";
  if (!ip) return NextResponse.json({ error: "缺少 ip 参数" }, { status: 400 });

  try {
    const hostnames = await dns.reverse(ip);
    return NextResponse.json({ ip, hostnames });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ip, hostnames: [], error: msg });
  }
}
