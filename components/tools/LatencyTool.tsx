"use client";
import { useState } from "react";
import { Gauge, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";

interface Target { name: string; url: string; }
const TARGETS: Target[] = [
  { name: "百度 Baidu", url: "https://www.baidu.com/favicon.ico" },
  { name: "腾讯 QQ", url: "https://www.qq.com/favicon.ico" },
  { name: "淘宝 Taobao", url: "https://www.taobao.com/favicon.ico" },
  { name: "哔哩哔哩 Bilibili", url: "https://www.bilibili.com/favicon.ico" },
  { name: "京东 JD", url: "https://www.jd.com/favicon.ico" },
  { name: "Google", url: "https://www.google.com/generate_204" },
];

async function ping(url: string): Promise<number | null> {
  const samples: number[] = [];
  for (let i = 0; i < 3; i++) {
    const start = performance.now();
    try {
      await fetch(`${url}?_=${Date.now()}-${i}`, { mode: "no-cors", cache: "no-store" });
      samples.push(performance.now() - start);
    } catch { /* ignore */ }
  }
  if (samples.length === 0) return null;
  return Math.round(Math.min(...samples));
}

export default function LatencyTool() {
  const { t } = useLang();
  const [results, setResults] = useState<Record<string, number | null | "loading">>({});
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    setResults(Object.fromEntries(TARGETS.map((tg) => [tg.name, "loading" as const])));
    for (const tg of TARGETS) {
      const ms = await ping(tg.url);
      setResults((prev) => ({ ...prev, [tg.name]: ms }));
    }
    setRunning(false);
  }

  function color(ms: number) {
    return ms < 80 ? "text-emerald-500" : ms < 200 ? "text-amber-500" : "text-red-500";
  }

  return (
    <div>
      <button onClick={run} disabled={running} className="accent-header w-full px-4 py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 text-sm mb-4">
        {running ? <Loader2 size={15} className="animate-spin" /> : <Gauge size={15} />} {running ? t("测试中…", "Testing…") : t("开始延迟测试", "Start latency test")}
      </button>
      <div className="surface-2 border border-themed rounded-xl overflow-hidden divide-y divide-[var(--border)]">
        {TARGETS.map((tg) => {
          const r = results[tg.name];
          return (
            <div key={tg.name} className="flex items-center px-4 py-2.5 gap-3">
              <span className="text-sm text-fg flex-1">{tg.name}</span>
              {r === "loading" ? <Loader2 size={15} className="animate-spin text-muted" />
                : r === undefined ? <span className="text-xs text-muted">—</span>
                : r === null ? <span className="text-xs text-red-400">{t("超时", "timeout")}</span>
                : <span className={`font-mono font-semibold ${color(r)}`}>{r} ms</span>}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted mt-3">{t("延迟为浏览器到各站点的往返时间（取 3 次最小值），受 CORS 限制为近似值。", "Round-trip time from your browser to each site (min of 3); approximate due to CORS.")}</p>
    </div>
  );
}
