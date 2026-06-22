// Multi-source IP geolocation aggregator. Queries several public providers in
// parallel and normalizes their replies into one shape so the UI can show how
// different databases disagree about the same IP. All providers are queried
// server-side (no CORS concerns); any single failure is swallowed.

export interface IpSourceResult {
  source: string;
  ok: boolean;
  ip?: string;
  countryCode?: string;
  country?: string;
  region?: string;
  city?: string;
  isp?: string;
  asn?: string;
  org?: string;
}

async function getJson(url: string, init?: RequestInit): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(url, { cache: "no-store", ...init });
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

const s = (v: unknown): string | undefined => (typeof v === "string" && v ? v : typeof v === "number" ? String(v) : undefined);

// ip-api.com — same provider used elsewhere in the app.
async function fromIpApi(ip: string): Promise<IpSourceResult> {
  const fields = "status,country,countryCode,regionName,city,isp,org,as,query";
  const d = await getJson(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=${fields}`);
  if (!d || d.status !== "success") return { source: "ip-api.com", ok: false };
  return {
    source: "ip-api.com", ok: true, ip: s(d.query), countryCode: s(d.countryCode),
    country: s(d.country), region: s(d.regionName), city: s(d.city), isp: s(d.isp), asn: s(d.as), org: s(d.org),
  };
}

// ip.sb (Cloudflare-backed) — tends to align with international routing.
async function fromIpSb(ip: string): Promise<IpSourceResult> {
  const d = await getJson(`https://api.ip.sb/geoip/${encodeURIComponent(ip)}`);
  if (!d) return { source: "ip.sb", ok: false };
  const asn = d.asn ? `AS${s(d.asn)}${d.asn_organization ? " " + s(d.asn_organization) : ""}` : undefined;
  return {
    source: "ip.sb", ok: true, ip: s(d.ip), countryCode: s(d.country_code),
    country: s(d.country), region: s(d.region), city: s(d.city), isp: s(d.isp), asn, org: s(d.organization),
  };
}

// ipinfo.io — token-less endpoint (rate-limited; best-effort).
async function fromIpInfo(ip: string): Promise<IpSourceResult> {
  const d = await getJson(`https://ipinfo.io/${encodeURIComponent(ip)}/json`);
  if (!d || d.error) return { source: "ipinfo.io", ok: false };
  // org is like "AS15169 Google LLC"
  const org = s(d.org);
  return {
    source: "ipinfo.io", ok: true, ip: s(d.ip), countryCode: s(d.country),
    country: s(d.country), region: s(d.region), city: s(d.city),
    isp: org?.replace(/^AS\d+\s+/, ""), asn: org, org,
  };
}

// ipwho.is — sometimes slow/blocked; best-effort.
async function fromIpWhoIs(ip: string): Promise<IpSourceResult> {
  const d = await getJson(`https://ipwho.is/${encodeURIComponent(ip)}`);
  if (!d || d.success === false) return { source: "ipwho.is", ok: false };
  const conn = (d.connection ?? {}) as Record<string, unknown>;
  const asn = conn.asn ? `AS${s(conn.asn)}${conn.org ? " " + s(conn.org) : ""}` : undefined;
  return {
    source: "ipwho.is", ok: true, ip: s(d.ip), countryCode: s(d.country_code),
    country: s(d.country), region: s(d.region), city: s(d.city), isp: s(conn.isp), asn, org: s(conn.org),
  };
}

export async function aggregateSources(ip: string): Promise<IpSourceResult[]> {
  return Promise.all([fromIpApi(ip), fromIpSb(ip), fromIpInfo(ip), fromIpWhoIs(ip)]);
}
