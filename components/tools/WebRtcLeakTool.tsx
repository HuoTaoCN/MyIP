"use client";
import { useEffect, useRef, useState } from "react";
import { ShieldCheck, AlertTriangle, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";

interface LeakResult { publicIp: string; detectedIps: string[]; hasLeak: boolean; status: "checking" | "done" | "error"; }

function extractIps(candidate: string): string[] {
  const ipRegex = /([0-9]{1,3}(?:\.[0-9]{1,3}){3}|(?:[0-9a-fA-F]{1,4}:){2,}[0-9a-fA-F]{1,4})/g;
  return candidate.match(ipRegex) ?? [];
}
const isPrivate = (ip: string) =>
  ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.") || ip.startsWith("fe80") || ip.startsWith("::1") || ip === "127.0.0.1";

export default function WebRtcLeakTool() {
  const { t } = useLang();
  const [result, setResult] = useState<LeakResult>({ publicIp: "", detectedIps: [], hasLeak: false, status: "checking" });
  const doneRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const allIps = new Set<string>();
    function finish(publicIp: string) {
      if (doneRef.current || cancelled) return;
      doneRef.current = true;
      const detected = Array.from(allIps);
      const hasLeak = publicIp ? detected.some((ip) => ip !== publicIp && !isPrivate(ip)) : false;
      setResult({ publicIp, detectedIps: detected, hasLeak, status: "done" });
    }
    async function check() {
      let publicIp = "";
      try { const res = await fetch("/api/my-ip"); const d = await res.json(); publicIp = d.query ?? d.ip ?? ""; } catch { /* ignore */ }
      if (cancelled) return;
      try {
        const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
        pc.createDataChannel("");
        pc.onicecandidate = (e) => {
          if (e.candidate) {
            extractIps(e.candidate.candidate).forEach((ip) => { if (!ip.startsWith("0.") && ip !== "0.0.0.0") allIps.add(ip); });
          } else { pc.close(); finish(publicIp); }
        };
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        setTimeout(() => finish(publicIp), 5000);
      } catch { if (!cancelled) setResult({ publicIp, detectedIps: [], hasLeak: false, status: "error" }); }
    }
    check();
    return () => { cancelled = true; };
  }, []);

  if (result.status === "checking")
    return <div className="flex flex-col items-center gap-3 py-10"><Loader2 size={28} className="animate-spin text-[var(--accent)]" /><p className="text-muted text-sm">{t("正在检测 WebRTC 泄漏…", "Testing for WebRTC leaks…")}</p></div>;
  if (result.status === "error")
    return <div className="surface-2 border border-themed rounded-xl p-5 text-center text-muted">{t("浏览器不支持 WebRTC 或检测受限", "WebRTC unsupported or restricted")}</div>;

  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${result.hasLeak ? "bg-red-500/10 border-red-500/30" : "bg-emerald-500/10 border-emerald-500/30"}`}>
        {result.hasLeak ? <AlertTriangle size={24} className="text-red-500 shrink-0" /> : <ShieldCheck size={24} className="text-emerald-500 shrink-0" />}
        <div>
          <p className={`font-bold ${result.hasLeak ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {result.hasLeak ? t("警告：检测到 WebRTC IP 泄漏！", "Warning: WebRTC IP leak detected!") : t("安全：未检测到 WebRTC 泄漏", "Safe: no WebRTC leak detected")}
          </p>
          <p className="text-sm text-muted">
            {result.hasLeak ? t("WebRTC 暴露了与公网不同的 IP，可能泄露真实位置", "WebRTC exposed an IP different from your public IP") : t("WebRTC 未暴露额外的 IP 地址", "WebRTC did not expose extra IPs")}
          </p>
        </div>
      </div>
      <div className="surface-2 border border-themed rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-themed"><h4 className="font-semibold text-fg text-sm">{t("IP 地址对比", "IP comparison")}</h4></div>
        <div className="divide-y divide-[var(--border)]">
          <div className="flex items-center px-4 py-2.5 gap-4">
            <span className="text-sm text-muted w-40">{t("公网 IP（服务端）", "Public IP (server)")}</span>
            <span className="font-mono font-semibold text-[var(--accent)]">{result.publicIp || t("未知", "unknown")}</span>
          </div>
          {result.detectedIps.length === 0 ? (
            <div className="px-4 py-2.5 text-sm text-muted">{t("未通过 WebRTC 检测到任何 IP", "No IPs detected via WebRTC")}</div>
          ) : result.detectedIps.map((ip, i) => (
            <div key={i} className="flex items-center px-4 py-2.5 gap-4">
              <span className="text-sm text-muted w-40">{isPrivate(ip) ? t("内网 IP（WebRTC）", "Local IP (WebRTC)") : t("公网 IP（WebRTC）", "Public IP (WebRTC)")}</span>
              <span className={`font-mono font-semibold ${isPrivate(ip) ? "text-muted" : ip !== result.publicIp ? "text-red-500" : "text-emerald-500"}`}>{ip}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${isPrivate(ip) ? "surface text-muted" : ip !== result.publicIp ? "bg-red-500/15 text-red-500" : "bg-emerald-500/15 text-emerald-500"}`}>
                {isPrivate(ip) ? t("内网", "local") : ip !== result.publicIp ? t("泄漏", "leak") : t("匹配", "match")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
