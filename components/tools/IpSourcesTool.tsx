"use client";
import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { flag } from "@/lib/flag";

interface SourceRow {
  source: string;
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
  results?: SourceRow[];
  error?: string;
}

export default function IpSourcesTool() {
  const { t } = useLang();
  const [ip, setIp] = useState("");
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  async function load(target?: string) {
    setLoading(true);
    setData(null);
    try {
      const q = target?.trim() ? `?ip=${encodeURIComponent(target.trim())}` : "";
      const res = await fetch(`/api/ip-sources${q}`);
      setData(await res.json());
    } catch {
      setData({ ip: target ?? "", error: "request" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ok = data?.results?.filter((r) => r.ok) ?? [];
  // Highlight disagreement: more than one distinct country among sources.
  const countries = new Set(ok.map((r) => r.countryCode).filter(Boolean));
  const disagree = countries.size > 1;

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
            {data.results.map((r) => (
              <div key={r.source} className="surface-2 border border-themed rounded-xl px-3.5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-fg">{r.source}</span>
                  {r.ok ? (
                    <span className="text-base">{flag(r.countryCode)}</span>
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
          `查询的 IP：${data?.ip ?? "—"} · 数据源为国际 IP 库（ip-api、ip.sb、ipinfo、ipwho.is），国内库结果可能不同。`,
          `Queried IP: ${data?.ip ?? "—"} · Sources are international DBs (ip-api, ip.sb, ipinfo, ipwho.is); domestic DBs may differ.`
        )}
      </p>
    </div>
  );
}
