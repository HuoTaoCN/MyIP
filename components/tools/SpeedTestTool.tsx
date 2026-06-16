"use client";
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";

// Region-aware download sources (must be CORS-enabled to read the byte stream).
// We never serve the payload from our own Worker — avoids consuming its bandwidth.
const CN_URL = "https://cdn.jsdelivr.net/npm/typescript@5.4.5/lib/typescript.js"; // ~9.1 MB, CORS *
const INTL_BYTES = 10_000_000;
const intlUrl = (b: number) => `https://speed.cloudflare.com/__down?bytes=${b}`;

export default function SpeedTestTool() {
  const { t } = useLang();
  const [mbps, setMbps] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [source, setSource] = useState<string | null>(null);

  async function run() {
    setRunning(true); setMbps(null); setProgress(0); setSource(null);

    // Pick the source by region: domestic CDN for CN, Cloudflare endpoint otherwise.
    let isCN = false;
    try {
      const geo = await fetch("/api/my-ip").then((r) => r.json());
      isCN = geo?.countryCode === "CN";
    } catch { /* default to intl */ }
    const url = isCN ? `${CN_URL}?_=${Date.now()}` : intlUrl(INTL_BYTES);
    setSource(isCN ? "jsDelivr CDN" : "speed.cloudflare.com");

    const start = performance.now();
    try {
      const res = await fetch(url, { cache: "no-store" });
      const total = Number(res.headers.get("content-length")) || (isCN ? 9_141_067 : INTL_BYTES);
      const reader = res.body!.getReader();
      let received = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.length;
        setProgress(Math.min(100, Math.round((received / total) * 100)));
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
        {source && <p className="text-xs text-muted mt-2">{t("测速源", "Source")}: {source}</p>}
      </div>
      <button onClick={run} disabled={running} className="accent-header w-full px-4 py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
        {running ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} {running ? t("测速中…", "Testing…") : t("开始测速", "Start speed test")}
      </button>
      <p className="text-xs text-muted mt-3">
        {t(
          "从公共 CDN 下载数据测算下载吞吐量：国内走 jsDelivr，国外走 Cloudflare 公共测速端点（均非本站流量）。结果受所选源与网络状况影响。",
          "Measures download throughput from a public CDN: jsDelivr for China, the Cloudflare public speed endpoint elsewhere (never our own traffic). Results depend on the source and network conditions.",
        )}
      </p>
    </div>
  );
}
