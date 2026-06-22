"use client";
import { useEffect, useState } from "react";
import { Loader2, Network, Info } from "lucide-react";
import { useLang } from "@/lib/i18n";
import InfoTable from "@/components/InfoTable";

interface Data {
  resolverEgress?: string;
  ecs?: string;
  raw?: string[];
  error?: string;
}

export default function DnsEgressTool() {
  const { t } = useLang();
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setData(null);
    try {
      const res = await fetch("/api/dns-egress");
      setData(await res.json());
    } catch {
      setData({ error: "request" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin text-[var(--accent)]" /></div>;
  if (data?.error || !data) return <p className="text-muted text-sm py-2">{t("查询失败。", "Lookup failed.")}</p>;

  const rows = [
    { label: t("解析器出口 IP", "Resolver egress IP"), value: data.resolverEgress, highlight: true },
    { label: t("EDNS 客户端子网", "EDNS Client Subnet"), value: data.ecs },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3 rounded-xl surface-2 border border-themed">
        <span className="w-10 h-10 rounded-lg bg-[var(--accent)]/12 text-[var(--accent)] flex items-center justify-center shrink-0"><Network size={20} /></span>
        <div className="min-w-0">
          <p className="text-xs text-muted">{t("DNS 解析链路出口", "DNS resolver egress")}</p>
          <p className="font-bold text-fg font-mono break-all">{data.resolverEgress ?? "—"}</p>
        </div>
      </div>
      <InfoTable rows={rows} />
      <div className="flex gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
        <Info size={14} className="shrink-0 mt-0.5" />
        <span>{t(
          "此结果是「经公共解析器（Cloudflare/Google）的出口」，非你系统 DNS 的真实出口。完整的 DNS 泄漏检测需自建权威 DNS，后续支持。",
          "This is the egress of the public resolver (Cloudflare/Google) our query traverses — not your system DNS's real egress. A full DNS-leak test needs a self-hosted authoritative server (planned)."
        )}</span>
      </div>
    </div>
  );
}
