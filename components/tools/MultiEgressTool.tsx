"use client";
import { useState } from "react";
import { Loader2, Split, ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { fetchTrace } from "@/lib/trace";

const isV4 = (x?: string) => !!x && /^(\d{1,3}\.){3}\d{1,3}$/.test(x);

interface Probe { name: string; scope: string; run: () => Promise<string | undefined> }

const PROBES: Probe[] = [
  { name: "Cloudflare (本站)", scope: "intl", run: () => fetchTrace().then((tr) => tr.ip) },
  { name: "icanhazip v4", scope: "intl", run: () => echo("https://ipv4.icanhazip.com") },
  { name: "icanhazip v6", scope: "intl", run: () => echo("https://ipv6.icanhazip.com") },
  { name: "ipip.net (国内)", scope: "domestic", run: () => ipip() },
];

async function echo(url: string): Promise<string | undefined> {
  try {
    const r = await fetch(`${url}?_=${Date.now()}`, { cache: "no-store" });
    return (await r.text()).trim() || undefined;
  } catch { return undefined; }
}
async function ipip(): Promise<string | undefined> {
  try {
    const r = await fetch("https://myip.ipip.net/json", { cache: "no-store" });
    const d = await r.json();
    return d?.data?.ip || undefined;
  } catch { return undefined; }
}

interface Result { name: string; scope: string; ip?: string }

export default function MultiEgressTool() {
  const { t } = useLang();
  const [results, setResults] = useState<Result[] | null>(null);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    setResults(null);
    const out = await Promise.all(
      PROBES.map(async (p) => ({ name: p.name, scope: p.scope, ip: await p.run().catch(() => undefined) }))
    );
    setResults(out);
    setRunning(false);
  }

  const v4s = new Set(results?.map((r) => r.ip).filter(isV4));
  const v6s = new Set(results?.map((r) => r.ip).filter((x) => x && !isV4(x)));
  const multi = v4s.size > 1;

  return (
    <div className="space-y-3">
      <button onClick={run} disabled={running} className="accent-header w-full px-4 py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
        {running ? <Loader2 size={15} className="animate-spin" /> : <Split size={15} />} {running ? t("检测中…", "Probing…") : t("查询多端点出口 IP", "Probe egress across endpoints")}
      </button>

      {results && (
        <>
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${multi ? "bg-amber-500/10 border-amber-500/30" : "bg-emerald-500/10 border-emerald-500/30"}`}>
            {multi ? <Split size={18} className="text-amber-500 shrink-0" /> : <ShieldCheck size={18} className="text-emerald-500 shrink-0" />}
            <p className={`text-sm font-medium ${multi ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {multi
                ? t(`检测到 ${v4s.size} 个 IPv4 出口 — 可能存在策略路由 / 分流`, `${v4s.size} IPv4 egress IPs — possible policy routing / split tunnel`)
                : t("各端点出口 IP 一致（单一出口）", "Same egress IP across endpoints (single egress)")}
            </p>
          </div>

          <div className="surface-2 border border-themed rounded-xl overflow-hidden divide-y divide-[var(--border)]">
            {results.map((r) => (
              <div key={r.name} className="flex items-center gap-3 px-4 py-2.5">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${r.scope === "domestic" ? "bg-rose-500/15 text-rose-500" : "bg-[var(--accent)]/15 text-[var(--accent)]"}`}>
                  {r.scope === "domestic" ? t("国内", "CN") : t("国际", "Intl")}
                </span>
                <span className="text-sm text-fg flex-1 truncate">{r.name}</span>
                <span className="font-mono text-xs font-semibold text-fg break-all">{r.ip ?? <span className="text-muted">—</span>}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 text-xs text-muted">
            <span>IPv4: <span className="font-mono text-fg">{v4s.size || 0}</span></span>
            <span>·</span>
            <span>IPv6: <span className="font-mono text-fg">{v6s.size || 0}</span></span>
          </div>
        </>
      )}

      <p className="text-xs text-muted">
        {t(
          "查询你的 IP 在多个回显端点看到的值（分 IPv4/IPv6）。多数公共端点经 Cloudflare anycast，通常一致；出现多个 IPv4 出口才提示分流。真实跨网分流检测需自建多地端点。",
          "Shows the IP that several echo endpoints see (split by IPv4/IPv6). Most public endpoints are Cloudflare anycast and usually agree; multiple IPv4 egress IPs indicate split routing. True cross-network split detection needs self-hosted multi-region endpoints.")}
      </p>
    </div>
  );
}
