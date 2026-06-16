"use client";
import { useEffect, useState } from "react";
import { Search, Loader2, ShieldCheck, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import { useLang } from "@/lib/i18n";

interface ZoneResult {
  zone: string;
  name: string;
  listed: boolean;
  txt?: string;
}
interface BlacklistData {
  ip: string;
  results?: ZoneResult[];
  listedCount?: number;
  total?: number;
  error?: string;
  message?: string;
}

export default function IpReputationTool() {
  const { t } = useLang();
  const [ip, setIp] = useState("");
  const [data, setData] = useState<BlacklistData | null>(null);
  const [loading, setLoading] = useState(true);

  async function check(target?: string) {
    setLoading(true);
    setData(null);
    try {
      const q = target?.trim() ? `?ip=${encodeURIComponent(target.trim())}` : "";
      const res = await fetch(`/api/blacklist${q}`);
      setData(await res.json());
    } catch {
      setData({ ip: target ?? "", error: "request", message: t("请求失败", "Request failed") });
    } finally {
      setLoading(false);
    }
  }

  // Auto-check the visitor's own IP on first render.
  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clean = data?.results && (data.listedCount ?? 0) === 0;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && check(ip)}
          placeholder={t("留空检测本机 IP，或输入 IPv4 地址", "Leave blank for your IP, or enter an IPv4")}
          className="flex-1 surface-2 border border-themed rounded-xl px-4 py-2.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 font-mono"
        />
        <button
          onClick={() => check(ip)}
          disabled={loading}
          className="accent-header px-4 py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 text-sm"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />} {t("检测", "Check")}
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 size={22} className="animate-spin text-[var(--accent)]" />
        </div>
      )}

      {!loading && data?.error && (
        <p className="text-muted text-sm py-2">{data.message ?? t("查询失败", "Lookup failed")}</p>
      )}

      {!loading && data?.results && (
        <>
          <div
            className={`flex items-center gap-3 p-3 rounded-xl border ${
              clean ? "bg-emerald-500/10 border-emerald-500/30" : "bg-amber-500/10 border-amber-500/30"
            }`}
          >
            {clean ? (
              <ShieldCheck size={18} className="text-emerald-500 shrink-0" />
            ) : (
              <ShieldAlert size={18} className="text-amber-500 shrink-0" />
            )}
            <div className="min-w-0">
              <p className={`text-sm font-medium ${clean ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                {clean
                  ? t("声誉良好，未被任何黑名单收录", "Clean — not on any blacklist")
                  : t(`被 ${data.listedCount}/${data.total} 个黑名单收录`, `Listed on ${data.listedCount}/${data.total} blacklists`)}
              </p>
              <p className="text-xs text-muted font-mono break-all">{data.ip}</p>
            </div>
          </div>

          <div className="surface-2 rounded-xl overflow-hidden border border-themed divide-y divide-[var(--border)]">
            {data.results.map((r) => (
              <div key={r.zone} className="flex items-center gap-3 px-4 py-2.5">
                {r.listed ? (
                  <XCircle size={16} className="text-amber-500 shrink-0" />
                ) : (
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-fg">{r.name}</p>
                  <p className="text-xs text-muted font-mono break-all">{r.zone}</p>
                </div>
                <span className={`text-xs font-medium shrink-0 ${r.listed ? "text-amber-500" : "text-emerald-500"}`}>
                  {r.listed ? t("已列入", "Listed") : t("干净", "Clean")}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="text-xs text-muted">
        {t(
          "查询公共 DNSBL（Spamhaus、SpamCop、Barracuda、DroneBL）。被列入可能导致邮件被拒或访问受限，住宅 IP 偶因共享地址被误列。",
          "Queries public DNSBLs (Spamhaus, SpamCop, Barracuda, DroneBL). Being listed can cause mail rejection or access limits; shared residential IPs are sometimes flagged by mistake."
        )}
      </p>
    </div>
  );
}
