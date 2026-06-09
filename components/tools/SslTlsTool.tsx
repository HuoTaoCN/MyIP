"use client";
import { useState } from "react";
import { Search, Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useLang } from "@/lib/i18n";

interface SslData {
  host: string; subject?: Record<string, string>; issuer?: Record<string, string>;
  validFrom?: string; validTo?: string; serialNumber?: string; fingerprint?: string; fingerprint256?: string;
  san?: string; protocol?: string; cipher?: { name: string; version: string };
  authorized?: boolean; authorizationError?: string; error?: string;
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2 border-b border-themed last:border-0">
      <span className="text-sm text-muted w-36 shrink-0">{label}</span>
      <span className="text-sm text-fg break-all font-mono">{value}</span>
    </div>
  );
}

export default function SslTlsTool() {
  const { t } = useLang();
  const [host, setHost] = useState("");
  const [data, setData] = useState<SslData | null>(null);
  const [loading, setLoading] = useState(false);

  async function check() {
    const h = host.trim().replace(/^https?:\/\//, "").split("/")[0];
    if (!h) return;
    setLoading(true); setData(null);
    try { const res = await fetch(`/api/ssl?host=${encodeURIComponent(h)}`); setData(await res.json()); }
    catch { setData({ host: h, error: t("请求失败", "Request failed") }); }
    finally { setLoading(false); }
  }

  const now = new Date();
  const validTo = data?.validTo ? new Date(data.validTo) : null;
  const daysLeft = validTo ? Math.floor((validTo.getTime() - now.getTime()) / 86400000) : null;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input value={host} onChange={(e) => setHost(e.target.value)} onKeyDown={(e) => e.key === "Enter" && check()}
          placeholder={t("输入域名（如 github.com）", "Enter a domain (e.g. github.com)")}
          className="flex-1 surface-2 border border-themed rounded-xl px-4 py-2.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40" />
        <button onClick={check} disabled={loading} className="accent-header px-4 py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 text-sm">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />} {t("检查", "Check")}
        </button>
      </div>
      {data?.error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-500 text-sm">{data.error}</div>}
      {data && !data.error && (
        <div className="space-y-3">
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${data.authorized ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"}`}>
            {data.authorized ? <CheckCircle size={18} className="text-emerald-500 shrink-0" /> : <XCircle size={18} className="text-red-500 shrink-0" />}
            <div>
              <p className={`font-semibold ${data.authorized ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{data.authorized ? t("证书有效", "Certificate valid") : t("证书无效", "Certificate invalid")}</p>
              {!data.authorized && data.authorizationError && <p className="text-sm text-muted">{data.authorizationError}</p>}
            </div>
            {daysLeft !== null && (
              <div className={`ml-auto text-sm font-semibold ${daysLeft < 30 ? "text-red-500" : daysLeft < 90 ? "text-amber-500" : "text-emerald-500"}`}>
                {daysLeft > 0 ? t(`${daysLeft} 天后到期`, `${daysLeft}d left`) : t("已过期", "expired")}
                {daysLeft < 30 && daysLeft > 0 && <AlertTriangle size={13} className="inline ml-1" />}
              </div>
            )}
          </div>
          <div className="surface-2 border border-themed rounded-xl px-4 py-3">
            <h4 className="font-semibold text-fg text-sm mb-2">{t("证书信息", "Certificate")}</h4>
            <Row label={t("域名", "Host")} value={data.host} />
            <Row label={t("颁发给", "Issued to")} value={data.subject?.CN ?? data.subject?.O} />
            <Row label={t("颁发机构", "Issuer")} value={data.issuer?.O ?? data.issuer?.CN} />
            <Row label={t("有效期自", "Valid from")} value={data.validFrom ? new Date(data.validFrom).toLocaleString() : undefined} />
            <Row label={t("有效期至", "Valid to")} value={data.validTo ? new Date(data.validTo).toLocaleString() : undefined} />
            <Row label={t("序列号", "Serial")} value={data.serialNumber} />
            <Row label="SHA-256" value={data.fingerprint256} />
            <Row label={t("TLS 版本", "TLS version")} value={data.protocol ?? undefined} />
            <Row label={t("加密套件", "Cipher")} value={data.cipher?.name} />
          </div>
          {data.san && (
            <div className="surface-2 border border-themed rounded-xl px-4 py-3">
              <h4 className="font-semibold text-fg text-sm mb-2">SAN</h4>
              <div className="flex flex-wrap gap-2">
                {data.san.split(", ").map((s, i) => <span key={i} className="surface text-muted text-xs px-2 py-1 rounded font-mono border border-themed">{s.replace("DNS:", "").replace("IP Address:", "IP:")}</span>)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
