import { NextRequest, NextResponse } from "next/server";
import { doh } from "@/lib/doh";

// Build the reverse-DNS (.arpa) query name for an IPv4 or IPv6 address.
function arpaName(ip: string): string | null {
  // IPv4
  const v4 = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const parts = v4.slice(1).map(Number);
    if (parts.some((n) => n > 255)) return null;
    return `${parts.slice().reverse().join(".")}.in-addr.arpa`;
  }
  // IPv6 — expand to full 32 nibbles, reverse, join with dots
  if (ip.includes(":")) {
    const expanded = expandV6(ip);
    if (!expanded) return null;
    const nibbles = expanded.replace(/:/g, "");
    if (nibbles.length !== 32) return null;
    return `${nibbles.split("").reverse().join(".")}.ip6.arpa`;
  }
  return null;
}

function expandV6(ip: string): string | null {
  if (!/^[0-9a-fA-F:]+$/.test(ip)) return null;
  const dbl = ip.split("::");
  if (dbl.length > 2) return null;
  const head = dbl[0] ? dbl[0].split(":") : [];
  const tail = dbl.length === 2 && dbl[1] ? dbl[1].split(":") : [];
  const missing = 8 - head.length - tail.length;
  if (dbl.length === 1 && head.length !== 8) return null;
  if (missing < 0) return null;
  const groups = [...head, ...Array(dbl.length === 2 ? missing : 0).fill("0"), ...tail];
  if (groups.length !== 8) return null;
  return groups.map((g) => g.padStart(4, "0").toLowerCase()).join(":");
}

export async function GET(req: NextRequest) {
  const ip = req.nextUrl.searchParams.get("ip")?.trim() ?? "";
  if (!ip) return NextResponse.json({ error: "缺少 ip 参数" }, { status: 400 });

  const name = arpaName(ip);
  if (!name) return NextResponse.json({ ip, hostnames: [], error: "无效的 IP 地址" }, { status: 400 });

  try {
    // DNS-over-HTTPS PTR lookup — works on the edge without node:dns.
    const data = await doh(name, "PTR");
    const hostnames: string[] = (data.Answer ?? [])
      .filter((a) => a.type === 12) // PTR
      .map((a) => a.data.replace(/\.$/, ""));
    return NextResponse.json({ ip, hostnames });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ip, hostnames: [], error: msg });
  }
}
