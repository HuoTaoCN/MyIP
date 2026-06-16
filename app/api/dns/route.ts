import { NextRequest, NextResponse } from "next/server";
import { doh } from "@/lib/doh";

// DNS-over-HTTPS resolver proxy. Resolves A/AAAA/MX/TXT/NS/CNAME etc.
// Uses Cloudflare with a Google fallback for resilience.
export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name")?.trim() ?? "";
  const type = (req.nextUrl.searchParams.get("type") ?? "A").trim().toUpperCase();
  if (!name) return NextResponse.json({ error: "缺少 name 参数" }, { status: 400 });

  try {
    const data = await doh(name, type);
    return NextResponse.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
