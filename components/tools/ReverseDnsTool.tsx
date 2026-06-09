"use client";
import { useState } from "react";
import { Search, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function ReverseDnsTool() {
  const { t } = useLang();
  const [ip, setIp] = useState("");
  const [result, setResult] = useState<{ hostnames: string[]; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookup(target?: string) {
    const q = (target ?? ip).trim();
    if (!q) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch(`/api/rdns?ip=${encodeURIComponent(q)}`);
      setResult(await res.json());
    } catch { setResult({ hostnames: [], error: t("请求失败", "Request failed") }); }
    finally { setLoading(false); }
  }

  async function lookupMyIp() {
    try {
      const res = await fetch("/api/my-ip");
      const d = await res.json();
      const myIp = d.query ?? d.ip;
      if (myIp) { setIp(myIp); lookup(myIp); }
    } catch { setResult({ hostnames: [], error: t("无法获取当前 IP", "Could not fetch your IP") }); }
  }

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input value={ip} onChange={(e) => setIp(e.target.value)} onKeyDown={(e) => e.key === "Enter" && lookup()}
          placeholder={t("输入 IP 地址（如 8.8.8.8）", "Enter an IP (e.g. 8.8.8.8)")}
          className="flex-1 surface-2 border border-themed rounded-xl px-4 py-2.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40" />
        <button onClick={() => lookup()} disabled={loading} className="accent-header px-4 py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 text-sm">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />} {t("查询", "Lookup")}
        </button>
      </div>
      <button onClick={lookupMyIp} className="text-sm text-[var(--accent)] hover:underline mb-4 block">{t("查询我的 IP", "Look up my IP")}</button>
      {result && (
        <div className="surface-2 border border-themed rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-themed flex items-center gap-2">
            {result.hostnames?.length > 0 ? <CheckCircle size={15} className="text-emerald-500" /> : <XCircle size={15} className="text-red-400" />}
            <span className="font-semibold text-fg text-sm">
              {result.hostnames?.length > 0 ? t(`找到 ${result.hostnames.length} 条记录`, `${result.hostnames.length} record(s) found`) : t("未找到 PTR 记录", "No PTR record found")}
            </span>
          </div>
          <div className="px-4 py-3">
            {result.error && <p className="text-red-500 text-sm">{result.error}</p>}
            {result.hostnames?.length > 0 ? (
              <ul className="space-y-2">{result.hostnames.map((h, i) => <li key={i} className="font-mono text-sm text-fg surface px-3 py-2 rounded-lg border border-themed">{h}</li>)}</ul>
            ) : !result.error ? <p className="text-muted text-sm">{t("该 IP 没有配置反向 DNS 记录（PTR）", "This IP has no reverse DNS (PTR) record")}</p> : null}
          </div>
        </div>
      )}
      <div className="mt-4 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-xl p-3 text-sm text-fg">
        <strong>{t("什么是反向 DNS？", "What is reverse DNS?")}</strong> {t("正向 DNS 将域名解析为 IP，反向 DNS（PTR）则将 IP 解析回主机名，常用于邮件服务器验证。", "Forward DNS maps a name to an IP; reverse DNS (PTR) maps an IP back to a hostname, often used for mail-server verification.")}
      </div>
    </div>
  );
}
