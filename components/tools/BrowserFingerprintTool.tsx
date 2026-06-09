"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";

interface FpData { visitorId: string; components: Record<string, { value: unknown; duration: number }>; }

function ScoreBar({ label, score, max = 10 }: { label: string; score: number; max?: number }) {
  const pct = (score / max) * 100;
  const color = pct > 66 ? "bg-red-400" : pct > 33 ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted"><span>{label}</span><span className="font-medium text-fg">{score}/{max}</span></div>
      <div className="h-2 surface-2 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export default function BrowserFingerprintTool() {
  const { t } = useLang();
  const [fp, setFp] = useState<FpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [webrtcLeak, setWebrtcLeak] = useState<boolean | null>(null);

  useEffect(() => {
    import("@fingerprintjs/fingerprintjs").then(async (FingerprintJS) => {
      const fpLib = await FingerprintJS.load();
      const result = await fpLib.get();
      setFp({ visitorId: result.visitorId, components: result.components as Record<string, { value: unknown; duration: number }> });
      setLoading(false);
    });
    try {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      pc.createDataChannel("");
      let found = false;
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          const m = e.candidate.candidate.match(/([0-9]{1,3}(?:\.[0-9]{1,3}){3})/);
          if (m && !m[1].startsWith("192.168.") && !m[1].startsWith("10.") && !m[1].startsWith("172.")) found = true;
        } else { setWebrtcLeak(found); pc.close(); }
      };
      pc.createOffer().then((o) => pc.setLocalDescription(o));
    } catch { setWebrtcLeak(false); }
  }, []);

  const c = fp?.components;
  const scores = [
    { label: t("Canvas 指纹", "Canvas"), score: c?.canvas != null ? 8 : 2 },
    { label: t("WebGL 指纹", "WebGL"), score: c?.webGlBasics != null ? 7 : 2 },
    { label: t("字体检测", "Fonts"), score: c?.fonts != null ? 6 : 1 },
    { label: t("音频指纹", "Audio"), score: c?.audio != null ? 5 : 1 },
    { label: t("屏幕分辨率", "Screen"), score: c?.screenResolution != null ? 4 : 1 },
    { label: t("时区信息", "Timezone"), score: c?.timezone != null ? 3 : 1 },
    { label: t("WebRTC 泄漏", "WebRTC leak"), score: webrtcLeak === true ? 9 : webrtcLeak === false ? 1 : 0 },
  ];
  const totalScore = scores.reduce((a, b) => a + b.score, 0);
  const maxScore = scores.length * 10;
  const privacyScore = Math.max(0, 100 - Math.round((totalScore / maxScore) * 100));
  const privacyLabel = privacyScore >= 80 ? t("优秀", "Excellent") : privacyScore >= 60 ? t("良好", "Good") : privacyScore >= 40 ? t("一般", "Fair") : t("较差", "Poor");
  const privacyColor = privacyScore >= 80 ? "text-emerald-500" : privacyScore >= 60 ? "text-amber-500" : privacyScore >= 40 ? "text-orange-500" : "text-red-500";

  const componentList = fp ? Object.entries(fp.components).map(([key, val]) => ({
    key, value: typeof val.value === "string" ? val.value : String(JSON.stringify(val.value) ?? "—").slice(0, 80),
  })) : [];

  if (loading) return <div className="flex flex-col items-center gap-3 py-10"><Loader2 size={28} className="animate-spin text-[var(--accent)]" /><p className="text-muted text-sm">{t("正在生成浏览器指纹…", "Generating fingerprint…")}</p></div>;

  return (
    <div className="space-y-3">
      <div className="surface-2 border border-themed rounded-xl p-4">
        <p className="text-xs text-muted mb-1">{t("浏览器指纹 ID", "Fingerprint ID")}</p>
        <p className="font-mono text-lg font-bold text-[var(--accent)] break-all">{fp?.visitorId}</p>
        <p className="text-xs text-muted mt-1.5">{t("此 Hash 在同一浏览器中保持一致，可用于跨会话追踪", "This hash is stable per browser and can track you across sessions")}</p>
      </div>
      <div className="surface-2 border border-themed rounded-xl p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h4 className="font-semibold text-fg">{t("匿名性评分", "Anonymity score")}</h4>
          <span className={`text-xl font-bold ${privacyColor}`}>{privacyScore} / 100 · {privacyLabel}</span>
        </div>
        <div className="space-y-2.5">{scores.map((s) => <ScoreBar key={s.label} label={s.label} score={s.score} />)}</div>
      </div>
      <details className="surface-2 border border-themed rounded-xl overflow-hidden">
        <summary className="px-4 py-2.5 cursor-pointer font-semibold text-fg text-sm">{t(`查看所有指纹组件（${componentList.length} 项）`, `All fingerprint components (${componentList.length})`)}</summary>
        <div className="divide-y divide-[var(--border)]">
          {componentList.map(({ key, value }) => (
            <div key={key} className="flex items-start px-4 py-2 gap-4">
              <span className="text-xs text-muted w-40 shrink-0 font-mono">{key}</span>
              <span className="text-xs text-fg break-all font-mono">{value}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
