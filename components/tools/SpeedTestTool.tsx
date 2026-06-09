"use client";
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function SpeedTestTool() {
  const { t } = useLang();
  const [mbps, setMbps] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true); setMbps(null); setProgress(0);
    const bytes = 10_000_000; // 10 MB
    const start = performance.now();
    try {
      const res = await fetch(`/api/speedtest?bytes=${bytes}&_=${Date.now()}`, { cache: "no-store" });
      const reader = res.body!.getReader();
      let received = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.length;
        setProgress(Math.round((received / bytes) * 100));
        const elapsed = (performance.now() - start) / 1000;
        if (elapsed > 0) setMbps(Number(((received * 8) / elapsed / 1_000_000).toFixed(1)));
      }
      const elapsed = (performance.now() - start) / 1000;
      setMbps(Number(((received * 8) / elapsed / 1_000_000).toFixed(1)));
    } catch { setMbps(null); }
    finally { setRunning(false); setProgress(100); }
  }

  return (
    <div>
      <div className="surface-2 border border-themed rounded-xl p-6 text-center mb-4">
        <p className="text-xs text-muted mb-1">{t("下载速度", "Download speed")}</p>
        <p className="text-4xl font-bold text-fg font-mono">
          {mbps !== null ? mbps : "—"} <span className="text-lg text-muted">Mbps</span>
        </p>
        {running && (
          <div className="h-1.5 surface rounded-full overflow-hidden mt-4">
            <div className="h-full accent-header rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      <button onClick={run} disabled={running} className="accent-header w-full px-4 py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
        {running ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} {running ? t("测速中…", "Testing…") : t("开始测速", "Start speed test")}
      </button>
      <p className="text-xs text-muted mt-3">{t("从本站服务器下载 10MB 数据测算吞吐量。本地开发环境测得的是回环速度。", "Measures throughput by downloading 10MB from this server. In local dev this reflects loopback speed.")}</p>
    </div>
  );
}
