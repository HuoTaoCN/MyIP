import { NextRequest, NextResponse } from "next/server";
import { doh } from "@/lib/doh";

// Public DNSBL zones we query. Each is an A-record lookup on the reversed IP;
// a successful resolve means the IP is listed.
const ZONES: { zone: string; name: string }[] = [
  { zone: "zen.spamhaus.org", name: "Spamhaus ZEN" },
  { zone: "bl.spamcop.net", name: "SpamCop" },
  { zone: "b.barracudacentral.org", name: "Barracuda" },
  { zone: "dnsbl.dronebl.org", name: "DroneBL" },
];

function clientIp(req: NextRequest): string {
  // CF-Connecting-IP is Cloudflare's canonical visitor IP (x-forwarded-for is the edge).
  const cf = req.headers.get("cf-connecting-ip");
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  return cf?.trim() || (forwarded ? forwarded.split(",")[0].trim() : realIp ?? "127.0.0.1");
}

function isPrivateOrLocal(ip: string): boolean {
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

// IPv4 "1.2.3.4" -> "4.3.2.1" (DNSBL query order). Returns null for non-IPv4.
function reverseV4(ip: string): string | null {
  const m = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return null;
  const parts = m.slice(1).map(Number);
  if (parts.some((n) => n > 255)) return null;
  return parts.slice().reverse().join(".");
}

async function checkZone(reversed: string, zone: string) {
  const host = `${reversed}.${zone}`;
  try {
    const a = await doh(host, "A");
    const aRecords = (a.Answer ?? []).filter((r) => r.type === 1); // A
    // No A record (NXDOMAIN / empty) means "not listed" — the normal, clean case.
    if (a.Status !== 0 || aRecords.length === 0) return { listed: false as const };

    let txt: string | undefined;
    try {
      const t = await doh(host, "TXT");
      txt = (t.Answer ?? [])
        .filter((r) => r.type === 16) // TXT
        .map((r) => r.data.replace(/^"|"$/g, ""))
        .join(" ") || undefined;
    } catch {
      /* TXT is best-effort */
    }
    return { listed: true, codes: aRecords.map((r) => r.data), txt };
  } catch {
    return { listed: false as const };
  }
}

export async function GET(req: NextRequest) {
  const param = req.nextUrl.searchParams.get("ip")?.trim();
  const ip = param || clientIp(req);

  if (isPrivateOrLocal(ip)) {
    return NextResponse.json(
      { ip, error: "local", message: "本地/私有 IP 无法查询黑名单 (Local/private IP cannot be checked)" },
      { status: 400 }
    );
  }

  const reversed = reverseV4(ip);
  if (!reversed) {
    return NextResponse.json(
      { ip, error: "ipv6", message: "暂仅支持 IPv4 黑名单查询 (Only IPv4 is supported)" },
      { status: 400 }
    );
  }

  try {
    const results = await Promise.all(
      ZONES.map(async ({ zone, name }) => {
        const r = await checkZone(reversed, zone);
        return { zone, name, listed: r.listed, txt: r.listed ? r.txt : undefined };
      })
    );
    const listedCount = results.filter((r) => r.listed).length;
    return NextResponse.json({ ip, results, listedCount, total: results.length });
  } catch {
    return NextResponse.json({ ip, error: "lookup_failed", message: "查询失败" }, { status: 500 });
  }
}
