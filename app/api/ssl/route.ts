import { NextRequest, NextResponse } from "next/server";

// crt.sh Certificate Transparency log entry shape (fields we use).
interface CrtEntry {
  issuer_name: string;
  common_name: string;
  name_value: string; // newline-separated SANs
  not_before: string;
  not_after: string;
  serial_number: string;
}

// Parse a "C=US, O=Let's Encrypt, CN=R3" distinguished name into parts.
function parseDN(dn: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of dn.split(/,\s*/)) {
    const eq = part.indexOf("=");
    if (eq > 0) out[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
  }
  return out;
}

function names(e: CrtEntry): string[] {
  return [e.common_name, ...e.name_value.split(/\n/)].map((n) => n.trim().toLowerCase()).filter(Boolean);
}

// Does this cert cover the requested host (exact or matching wildcard)?
function covers(e: CrtEntry, host: string): boolean {
  return names(e).some((n) => {
    if (n === host) return true;
    if (n.startsWith("*.")) {
      const base = n.slice(2);
      return host.endsWith(`.${base}`) && host.split(".").length === n.split(".").length;
    }
    return false;
  });
}

export async function GET(req: NextRequest) {
  const host = req.nextUrl.searchParams.get("host")?.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0] ?? "";
  if (!host) return NextResponse.json({ error: "缺少 host 参数" }, { status: 400 });

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const url = `https://crt.sh/?q=${encodeURIComponent(host)}&output=json&exclude=expired`;
    const res = await fetch(url, { signal: ctrl.signal, cache: "no-store", headers: { "User-Agent": "MyIP-SSL-Tool" } });
    clearTimeout(timer);
    if (!res.ok) return NextResponse.json({ host, error: `crt.sh 返回 ${res.status}` }, { status: 502 });

    const entries: CrtEntry[] = await res.json().catch(() => []);
    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ host, error: "未在证书透明日志中找到该域名的证书" }, { status: 404 });
    }

    // Prefer certs that actually cover the host; pick the one valid the longest.
    const matching = entries.filter((e) => covers(e, host));
    const pool = matching.length ? matching : entries;
    const cert = pool.reduce((a, b) => (new Date(b.not_after) > new Date(a.not_after) ? b : a));

    const issuer = parseDN(cert.issuer_name);
    const allNames = Array.from(new Set(pool.flatMap(names))).sort();
    const now = new Date();

    return NextResponse.json({
      host,
      subject: { CN: cert.common_name },
      issuer: { O: issuer.O, CN: issuer.CN },
      validFrom: cert.not_before,
      validTo: cert.not_after,
      serialNumber: cert.serial_number,
      san: allNames.map((n) => `DNS:${n}`).join(", "),
      authorized: new Date(cert.not_after) > now && new Date(cert.not_before) <= now,
      source: "crt.sh",
    });
  } catch (e: unknown) {
    clearTimeout(timer);
    const msg = e instanceof Error && e.name === "AbortError" ? "查询超时（crt.sh 响应慢，请重试）" : e instanceof Error ? e.message : String(e);
    return NextResponse.json({ host, error: msg }, { status: 504 });
  }
}
