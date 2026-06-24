"use client";
import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { flag } from "@/lib/flag";

interface SourceRow {
  source: string;
  scope: "intl" | "domestic";
  ok: boolean;
  ip?: string;
  countryCode?: string;
  country?: string;
  region?: string;
  city?: string;
  isp?: string;
  asn?: string;
}
interface Data {
  ip: string;
  results?: Omit<SourceRow, "scope">[];
  error?: string;
}

// Domestic (China) IP library — CORS-enabled, returns the CALLER's IP, so it is
// only meaningful for "your own IP" and must be called client-side.
async function fetchIpip(): Promise<SourceRow> {
  const r = await fetch("https://myip.ipip.net/json", { cache: "no-store" });
  const d = await r.json();
  if (d?.ret !== "ok" || !d?.data) throw new Error("ipip failed");
  const loc: string[] = d.data.location ?? [];
  return {
    source: "ipip.net", scope: "domestic", ok: true, ip: d.data.ip,
    country: loc[0], region: loc[1], city: loc[2], isp: loc[4] || undefined,
  };
}

export default function IpSourcesTool() {
  const { t } = useLang();
  const [ip, setIp] = useState("");
  const [data, setData] = useState<Data | null>(null);
  const [domestic, setDomestic] = useState<SourceRow | null>(null);
  const [loading, setLoading] = useState(true);

  async function load(target?: string) {
    setLoading(true);
    setData(null);
    setDomestic(null);
    const isOwn = !target?.trim();
    try {
      const q = isOwn ? "" : `?ip=${encodeURIComponent(target!.trim())}`;
      const res = await fetch(`/api/ip-sources${q}`);
      setData(await res.json());
    } catch {
      setData({ ip: target ?? "", error: "request" });
    } finally {
      setLoading(false);
    }
    // Domestic library only applies to your own IP (returns the caller's IP).
    if (isOwn) fetchIpip().then(setDomestic).catch(() => setDomestic(null));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows: SourceRow[] = [
    ...(data?.results?.map((r) => ({ ...r, scope: "intl" as const })) ?? []),
    ...(domestic ? [domestic] : []),
  ];
  const ok = rows.filter((r) => r.ok);
  // Disagreement: international DBs differ in country, or domestic disagrees with intl.
  const intlCodes = new Set(ok.filter((r) => r.scope === "intl").map((r) => r.countryCode).filter(Boolean));
  const disagree = intlCodes.size > 1 || (!!domestic && domestic.ok && intlCodes.size > 0 && !codesMatchCountry(intlCodes, domestic.country));

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(ip)}
          placeholder={t("留空查本机 IP，或输入任意 IP", "Leave blank for your IP, or enter any IP")}
          className="flex-1 surface-2 border border-themed rounded-xl px-4 py-2.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 font-mono"
        />
        <button onClick={() => load(ip)} disabled={loading} className="accent-header px-4 py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 text-sm">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />} {t("对比", "Compare")}
        </button>
      </div>

      {loading && <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin text-[var(--accent)]" /></div>}

      {!loading && data?.results && (
        <>
          {disagree && (
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
              {t("各数据源对该 IP 的归属判断不一致（已高亮）。", "Sources disagree on this IP's location (highlighted below).")}
            </p>
          )}
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.source} className="surface-2 border border-themed rounded-xl px-3.5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-semibold text-fg">{r.source}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${r.scope === "domestic" ? "bg-rose-500/15 text-rose-500" : "bg-[var(--accent)]/15 text-[var(--accent)]"}`}>
                      {r.scope === "domestic" ? t("国内", "CN") : t("国际", "Intl")}
                    </span>
                  </div>
                  {r.ok ? (
                    r.scope === "intl" ? <span className="text-base">{flag(r.countryCode)}</span> : null
                  ) : (
                    <span className="text-xs text-muted">{t("无数据", "no data")}</span>
                  )}
                </div>
                {r.ok && (
                  <div className="text-sm text-fg">
                    <span className={disagree ? "font-semibold text-[var(--accent)]" : ""}>
                      {[r.city, r.region, r.country].filter(Boolean).join(", ") || "—"}
                    </span>
                    <div className="text-xs text-muted truncate mt-0.5">{r.isp || r.asn || ""}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <p className="text-xs text-muted">
        {t(
          `查询的 IP：${data?.ip ?? "—"} · 国际库（ip-api、ip.sb、ipinfo、ipwho.is）+ 国内库（ipip.net，仅本机 IP）。国内/国际库结果常有差异。`,
          `Queried IP: ${data?.ip ?? "—"} · International DBs (ip-api, ip.sb, ipinfo, ipwho.is) + domestic (ipip.net, own IP only). Domestic vs international DBs often differ.`
        )}
      </p>
    </div>
  );
}

// Rough check: does any intl country code correspond to the domestic country name?
function codesMatchCountry(codes: Set<string | undefined>, country?: string): boolean {
  if (!country) return true;
  const map: Record<string, string> = { CN: "中国", US: "美国", JP: "日本", HK: "香港", TW: "台湾", SG: "新加坡", KR: "韩国", GB: "英国", DE: "德国" };
  for (const c of codes) {
    if (c && map[c] && country.includes(map[c])) return true;
    if (c && !map[c]) return true; // unknown mapping — don't flag as disagreement
  }
  return false;
}
