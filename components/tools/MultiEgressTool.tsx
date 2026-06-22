"use client";
import { useState } from "react";
import { Loader2, Split, ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { fetchTrace } from "@/lib/trace";

const ROUNDS = 6;

export default function MultiEgressTool() {
  const { t } = useLang();
  const [ips, setIps] = useState<string[] | null>(null);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    setIps(null);
    const found = new Map<string, number>();
    try {
      const results = await Promise.all(
        Array.from({ length: ROUNDS }, () => fetchTrace().then((tr) => tr.ip).catch(() => undefined))
      );
      for (const ip of results) if (ip) found.set(ip, (found.get(ip) ?? 0) + 1);
    } catch { /* ignore */ }
    setIps([...found.keys()]);
    setRunning(false);
  }

  const multi = ips && ips.length > 1;

  return (
    <div className="space-y-3">
      <button onClick={run} disabled={running} className="accent-header w-full px-4 py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
        {running ? <Loader2 size={15} className="animate-spin" /> : <Split size={15} />} {running ? t("检测中…", "Probing…") : t(`并发探测出口 IP（${ROUNDS} 次）`, `Probe egress IP (${ROUNDS}×)`)}
      </button>

      {ips && (
        ips.length === 0 ? (
          <p className="text-muted text-sm">{t("未能获取出口 IP。", "Could not determine egress IP.")}</p>
        ) : (
          <>
            <div className={`flex items-center gap-3 p-3 rounded-xl border ${multi ? "bg-amber-500/10 border-amber-500/30" : "bg-emerald-500/10 border-emerald-500/30"}`}>
              {multi ? <Split size={18} className="text-amber-500 shrink-0" /> : <ShieldCheck size={18} className="text-emerald-500 shrink-0" />}
              <p className={`text-sm font-medium ${multi ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                {multi
                  ? t(`检测到 ${ips.length} 个出口 IP — 可能使用代理池 / 策略路由`, `${ips.length} egress IPs — possible proxy pool / policy routing`)
                  : t("单一出口 IP", "Single egress IP")}
              </p>
            </div>
            <div className="surface-2 border border-themed rounded-xl overflow-hidden divide-y divide-[var(--border)]">
              {ips.map((ip) => (
                <div key={ip} className="px-4 py-2.5 font-mono text-sm text-fg break-all">{ip}</div>
              ))}
            </div>
          </>
        )
      )}

      <p className="text-xs text-muted">{t("并发多次读取 /cdn-cgi/trace 的出口 IP；出现多个不同 IP 通常意味着负载均衡代理或分流策略。", "Reads /cdn-cgi/trace egress IP several times in parallel; multiple distinct IPs usually mean a load-balanced proxy or split routing.")}</p>
    </div>
  );
}
