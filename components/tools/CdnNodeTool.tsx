"use client";
import { useEffect, useState } from "react";
import { Loader2, Server, RefreshCw } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { fetchTrace, coloCity, type TraceData } from "@/lib/trace";
import InfoTable from "@/components/InfoTable";

export default function CdnNodeTool() {
  const { t, lang } = useLang();
  const [trace, setTrace] = useState<TraceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  async function load() {
    setLoading(true); setErr(false);
    try {
      setTrace(await fetchTrace());
    } catch {
      setErr(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin text-[var(--accent)]" /></div>;
  if (err || !trace) return <p className="text-muted text-sm py-2">{t("无法读取 CDN 节点信息（可能未经 Cloudflare 代理）。", "Could not read CDN node info (maybe not served via Cloudflare).")}</p>;

  const city = coloCity(trace.colo, lang === "zh");
  const rows = [
    { label: t("边缘节点", "Edge node (PoP)"), value: trace.colo ? `${trace.colo}${city ? ` · ${city}` : ""}` : undefined, highlight: true },
    { label: t("节点地区", "Node region"), value: trace.loc },
    { label: t("你的 IP", "Your IP"), value: trace.ip },
    { label: t("HTTP 协议", "HTTP"), value: trace.http },
    { label: t("TLS 版本", "TLS"), value: trace.tls },
    { label: "WARP", value: trace.warp },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3 rounded-xl surface-2 border border-themed">
        <span className="w-10 h-10 rounded-lg bg-[var(--accent)]/12 text-[var(--accent)] flex items-center justify-center shrink-0"><Server size={20} /></span>
        <div className="min-w-0">
          <p className="text-xs text-muted">{t("你命中的 Cloudflare 节点", "Your Cloudflare edge node")}</p>
          <p className="font-bold text-fg text-lg">{trace.colo ?? "—"}{city ? <span className="text-sm font-normal text-muted ml-2">{city}</span> : null}</p>
        </div>
        <button onClick={load} className="ml-auto p-2 rounded-lg text-muted hover:surface" aria-label="refresh"><RefreshCw size={16} /></button>
      </div>
      <InfoTable rows={rows} />
      <p className="text-xs text-muted">{t("数据来自同源 /cdn-cgi/trace，反映你实际连接的 Cloudflare 边缘机房。", "From same-origin /cdn-cgi/trace — the Cloudflare edge PoP your connection actually reached.")}</p>
    </div>
  );
}
