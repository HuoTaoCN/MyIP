"use client";
import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-2 border border-themed rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-themed"><h4 className="font-semibold text-fg text-sm">{title}</h4></div>
      <div className="px-4 py-3 text-sm">{children}</div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="flex gap-3 py-0.5">
      <span className="text-muted w-32 shrink-0 text-sm">{label}</span>
      <span className="text-fg text-sm break-all">{value || "—"}</span>
    </div>
  );
}

export default function WhoisTool() {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function lookup(q?: string) {
    const target = (q ?? query).trim();
    if (!target) return;
    setLoading(true); setError(""); setData(null);
    try {
      const res = await fetch(`/api/whois?q=${encodeURIComponent(target)}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("查询失败", "Lookup failed"));
    } finally { setLoading(false); }
  }

  async function lookupMyIp() {
    try {
      const res = await fetch("/api/my-ip");
      const d = await res.json();
      const ip = d.query ?? d.ip;
      if (ip) { setQuery(ip); lookup(ip); }
    } catch { setError(t("无法获取当前 IP", "Could not fetch your IP")); }
  }

  const rdap = data;
  const nameservers: string[] = rdap?.nameservers ? (rdap.nameservers as Array<{ ldhName?: string }>).map((n) => n.ldhName ?? "").filter(Boolean) : [];
  const events: Array<{ eventAction: string; eventDate: string }> = rdap?.events ? (rdap.events as Array<{ eventAction: string; eventDate: string }>) : [];
  const status: string[] = rdap?.status ? (rdap.status as string[]) : [];

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && lookup()}
          placeholder={t("域名（google.com）或 IP（8.8.8.8）", "Domain (google.com) or IP (8.8.8.8)")}
          className="flex-1 surface-2 border border-themed rounded-xl px-4 py-2.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40" />
        <button onClick={() => lookup()} disabled={loading} className="accent-header px-4 py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 text-sm">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />} {t("查询", "Lookup")}
        </button>
      </div>
      <button onClick={lookupMyIp} className="text-sm text-[var(--accent)] hover:underline mb-4 block">{t("查询我的 IP", "Look up my IP")}</button>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      {rdap && (
        <div className="space-y-3">
          <Section title={t("基本信息", "Basics")}>
            <Row label={t("类型", "Type")} value={rdap.objectClassName as string} />
            <Row label={t("句柄", "Handle")} value={rdap.handle as string} />
            <Row label={t("名称", "Name")} value={(rdap.ldhName ?? rdap.name ?? rdap.handle) as string} />
            <Row label={t("状态", "Status")} value={status.join(", ")} />
          </Section>
          {events.length > 0 && (
            <Section title={t("重要日期", "Key dates")}>
              {events.map((e, i) => <Row key={i} label={e.eventAction} value={e.eventDate ? new Date(e.eventDate).toLocaleString() : ""} />)}
            </Section>
          )}
          {nameservers.length > 0 && (
            <Section title="Name Servers">
              {nameservers.map((ns, i) => <p key={i} className="text-fg font-mono text-sm">{ns}</p>)}
            </Section>
          )}
          <details className="surface-2 border border-themed rounded-xl overflow-hidden">
            <summary className="px-4 py-2.5 cursor-pointer font-semibold text-fg text-sm">{t("原始 RDAP 数据", "Raw RDAP data")}</summary>
            <pre className="px-4 py-3 text-xs text-muted overflow-x-auto whitespace-pre-wrap">{JSON.stringify(rdap, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}
