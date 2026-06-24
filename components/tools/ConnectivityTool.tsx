"use client";
import { useState } from "react";
import { Loader2, Activity, CheckCircle, XCircle } from "lucide-react";
import { useLang } from "@/lib/i18n";

interface Site { name: string; url: string; }
const DOMESTIC: Site[] = [
  { name: "百度 Baidu", url: "https://www.baidu.com/favicon.ico" },
  { name: "淘宝 Taobao", url: "https://www.taobao.com/favicon.ico" },
  { name: "腾讯 QQ", url: "https://www.qq.com/favicon.ico" },
  { name: "哔哩哔哩 Bilibili", url: "https://www.bilibili.com/favicon.ico" },
  { name: "微博 Weibo", url: "https://weibo.com/favicon.ico" },
  { name: "京东 JD", url: "https://www.jd.com/favicon.ico" },
];
const INTERNATIONAL: Site[] = [
  { name: "Google", url: "https://www.google.com/generate_204" },
  { name: "GitHub", url: "https://github.com/favicon.ico" },
  { name: "Cloudflare", url: "https://www.cloudflare.com/favicon.ico" },
  { name: "Wikipedia", url: "https://www.wikipedia.org/favicon.ico" },
];
const STREAMING: Site[] = [
  { name: "YouTube", url: "https://www.youtube.com/favicon.ico" },
  { name: "Netflix", url: "https://www.netflix.com/favicon.ico" },
  { name: "Disney+", url: "https://www.disneyplus.com/favicon.ico" },
  { name: "ChatGPT", url: "https://chatgpt.com/favicon.ico" },
  { name: "Spotify", url: "https://open.spotify.com/favicon.ico" },
  { name: "TikTok", url: "https://www.tiktok.com/favicon.ico" },
];

interface Result { ok: boolean; ms: number | null; }

// Reachability + latency in one probe (min of a few no-cors fetches).
async function probe(url: string, timeout = 6000): Promise<Result> {
  const samples: number[] = [];
  let ok = false;
  for (let i = 0; i < 3; i++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    const start = performance.now();
    try {
      await fetch(`${url}?_=${Date.now()}-${i}`, { mode: "no-cors", cache: "no-store", signal: ctrl.signal });
      samples.push(performance.now() - start);
      ok = true;
    } catch { /* unreachable/timeout */ }
    clearTimeout(timer);
  }
  return { ok, ms: samples.length ? Math.round(Math.min(...samples)) : null };
}

function color(ms: number) {
  return ms < 80 ? "text-emerald-500" : ms < 200 ? "text-amber-500" : "text-red-500";
}

export default function ConnectivityTool() {
  const { t } = useLang();
  const [results, setResults] = useState<Record<string, Result | "loading">>({});
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    const all = [...DOMESTIC, ...INTERNATIONAL, ...STREAMING];
    setResults(Object.fromEntries(all.map((s) => [s.name, "loading" as const])));
    await Promise.all(all.map(async (s) => {
      const r = await probe(s.url);
      setResults((prev) => ({ ...prev, [s.name]: r }));
    }));
    setRunning(false);
  }

  function Group({ title, sites }: { title: string; sites: Site[] }) {
    return (
      <div>
        <h4 className="text-xs font-semibold text-muted mb-2">{title}</h4>
        <div className="grid grid-cols-2 gap-2">
          {sites.map((s) => {
            const r = results[s.name];
            return (
              <div key={s.name} className="surface-2 border border-themed rounded-xl px-3 py-2.5 flex items-center gap-2">
                {r === "loading" ? <Loader2 size={15} className="animate-spin text-muted shrink-0" />
                  : r === undefined ? <span className="w-[15px] h-[15px] rounded-full surface shrink-0" />
                  : r.ok ? <CheckCircle size={15} className="text-emerald-500 shrink-0" /> : <XCircle size={15} className="text-red-400 shrink-0" />}
                <span className="text-sm text-fg truncate flex-1">{s.name}</span>
                {r && r !== "loading" && (
                  r.ok && r.ms !== null
                    ? <span className={`font-mono text-xs font-semibold shrink-0 ${color(r.ms)}`}>{r.ms}ms</span>
                    : <span className="text-xs text-red-400 shrink-0">{t("不可达", "blocked")}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button onClick={run} disabled={running} className="accent-header w-full px-4 py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
        {running ? <Loader2 size={15} className="animate-spin" /> : <Activity size={15} />} {running ? t("检测中…", "Testing…") : t("开始连通性测试", "Start connectivity test")}
      </button>
      <Group title={t("国内站点", "Domestic")} sites={DOMESTIC} />
      <Group title={t("国际站点（探测封锁）", "International (block detection)")} sites={INTERNATIONAL} />
      <Group title={t("流媒体 / 服务", "Streaming / Services")} sites={STREAMING} />
      <p className="text-xs text-muted">{t("从你的浏览器直接探测各站点的可达性与延迟（取 3 次最小值）。仅能测可达性，非完整区域解锁；受 CORS 限制为近似值。", "Reachability + latency probed directly from your browser (min of 3). Reachability only — not full region-unlock; approximate due to CORS.")}</p>
    </div>
  );
}
