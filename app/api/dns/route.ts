import { NextRequest, NextResponse } from "next/server";

// DNS-over-HTTPS resolver proxy (Cloudflare). Resolves A/AAAA/MX/TXT/NS/CNAME etc.
export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name")?.trim() ?? "";
  const type = (req.nextUrl.searchParams.get("type") ?? "A").trim().toUpperCase();
  if (!name) return NextResponse.json({ error: "缺少 name 参数" }, { status: 400 });

  try {
    const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`;
    const res = await fetch(url, {
      headers: { Accept: "application/dns-json" },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
