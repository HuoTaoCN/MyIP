import { NextRequest, NextResponse } from "next/server";

// Looks up the hardware vendor for a MAC address (OUI) via the free macvendors.com API.
export async function GET(req: NextRequest) {
  const addr = req.nextUrl.searchParams.get("addr")?.trim() ?? "";
  if (!addr) return NextResponse.json({ error: "缺少 addr 参数" }, { status: 400 });

  // Basic validation: need at least the 3-byte OUI prefix.
  const cleaned = addr.replace(/[^0-9a-fA-F]/g, "");
  if (cleaned.length < 6) {
    return NextResponse.json({ addr, error: "MAC 地址格式无效" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.macvendors.com/${encodeURIComponent(addr)}`, {
      cache: "no-store",
    });
    if (res.status === 404) {
      return NextResponse.json({ addr, vendor: null, error: "未找到该 MAC 的厂商信息" });
    }
    if (!res.ok) {
      return NextResponse.json({ addr, vendor: null, error: `查询失败 (${res.status})` });
    }
    const vendor = await res.text();
    return NextResponse.json({ addr, vendor });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ addr, vendor: null, error: msg }, { status: 500 });
  }
}
