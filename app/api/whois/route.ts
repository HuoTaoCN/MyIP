import { NextRequest, NextResponse } from "next/server";

function isIp(str: string) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(str) || /^[0-9a-f:]+$/i.test(str);
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ error: "缺少查询参数" }, { status: 400 });

  try {
    let url: string;
    if (isIp(q)) {
      url = `https://rdap.arin.net/registry/ip/${encodeURIComponent(q)}`;
    } else {
      const domain = q.replace(/^https?:\/\//, "").split("/")[0];
      url = `https://rdap.org/domain/${encodeURIComponent(domain)}`;
    }

    const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!res.ok) throw new Error(`RDAP 返回 ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
