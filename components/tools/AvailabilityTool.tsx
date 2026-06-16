"use client";
import { useState } from "react";
import { Globe2, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useLang } from "@/lib/i18n";

interface Site { name: string; url: string; }
const SITES: Site[] = [
  // 国内流行站点（通常可达）
  { name: "百度 Baidu", url: "https://www.baidu.com/favicon.ico" },
  { name: "淘宝 Taobao", url: "https://www.taobao.com/favicon.ico" },
  { name: "腾讯 QQ", url: "https://www.qq.com/favicon.ico" },
  { name: "哔哩哔哩 Bilibili", url: "https://www.bilibili.com/favicon.ico" },
  { name: "微博 Weibo", url: "https://weibo.com/favicon.ico" },
  { name: "京东 JD", url: "https://www.jd.com/favicon.ico" },
  // 国外站点（用于探测网络封锁）
  { name: "Google", url: "https://www.google.com/generate_204" },
  { name: "YouTube", url: "https://www.youtube.com/favicon.ico" },
  { name: "GitHub", url: "https://github.com/favicon.ico" },
];

async function check(url: string, timeout = 6000): Promise<boolean> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    await fetch(`${url}?_=${Date.now()}`, { mode: "no-cors", cache: "no-store", signal: ctrl.signal });
    clearTimeout(timer);
    return true;
  } catch { clearTimeout(timer); return false; }
}

export default function AvailabilityTool() {
  const { t } = useLang();
  const [results, setResults] = useState<Record<string, boolean | "loading">>({});
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    setResults(Object.fromEntries(SITES.map((s) => [s.name, "loading" as const])));
    await Promise.all(SITES.map(async (s) => {
      const ok = await check(s.url);
      setResults((prev) => ({ ...prev, [s.name]: ok }));
    }));
    setRunning(false);
  }

  return (
    <div>
      <button onClick={run} disabled={running} className="accent-header w-full px-4 py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 text-sm mb-4">
        {running ? <Loader2 size={15} className="animate-spin" /> : <Globe2 size={15} />} {running ? t("检测中…", "Checking…") : t("开始可达性检测", "Check availability")}
      </button>
      <div className="grid grid-cols-2 gap-2">
        {SITES.map((s) => {
          const r = results[s.name];
          return (
            <div key={s.name} className="surface-2 border border-themed rounded-xl px-3 py-2.5 flex items-center gap-2">
              {r === "loading" ? <Loader2 size={15} className="animate-spin text-muted shrink-0" />
                : r === undefined ? <span className="w-[15px] h-[15px] rounded-full surface shrink-0" />
                : r ? <CheckCircle size={15} className="text-emerald-500 shrink-0" /> : <XCircle size={15} className="text-red-400 shrink-0" />}
              <span className="text-sm text-fg truncate">{s.name}</span>
              {r === false && <span className="ml-auto text-xs text-red-400 shrink-0">{t("不可达", "blocked")}</span>}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted mt-3">{t("通过浏览器直接请求判断站点是否可达，可用于粗略检测网络封锁。", "Reachability is probed directly from your browser — a rough indicator of network blocking.")}</p>
    </div>
  );
}
