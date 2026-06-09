"use client";
import { useEffect, useState } from "react";
import { Shield, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";

interface Check { label: string; status: "pass" | "warn" | "fail" | "loading"; detail: string; }

export default function PrivacyAssessmentTool() {
  const { t } = useLang();
  const [checks, setChecks] = useState<Check[]>([
    { label: t("公网 IP 检测", "Public IP"), status: "loading", detail: t("检测中…", "Checking…") },
    { label: t("VPN / 代理检测", "VPN / Proxy"), status: "loading", detail: t("检测中…", "Checking…") },
    { label: t("WebRTC 泄漏", "WebRTC leak"), status: "loading", detail: t("检测中…", "Checking…") },
    { label: t("数据中心 IP", "Datacenter IP"), status: "loading", detail: t("检测中…", "Checking…") },
    { label: t("IPv6 泄漏", "IPv6 leak"), status: "loading", detail: t("检测中…", "Checking…") },
    { label: t("反向 DNS", "Reverse DNS"), status: "loading", detail: t("检测中…", "Checking…") },
    { label: t("Do Not Track", "Do Not Track"), status: "loading", detail: t("检测中…", "Checking…") },
    { label: t("Cookie 支持", "Cookies"), status: "loading", detail: t("检测中…", "Checking…") },
  ]);

  function updateCheck(index: number, update: Partial<Check>) {
    setChecks((prev) => prev.map((c, i) => (i === index ? { ...c, ...update } : c)));
  }

  useEffect(() => {
    fetch("/api/my-ip").then((r) => r.json()).then((d) => {
      updateCheck(0, { status: "pass", detail: t(`你的公网 IP：${d.query ?? d.ip ?? "未知"}`, `Your public IP: ${d.query ?? d.ip ?? "unknown"}`) });
      updateCheck(1, d.proxy || d.hosting ? { status: "warn", detail: t("检测到 VPN/代理/数据中心 IP", "VPN/proxy/datacenter IP detected") } : { status: "pass", detail: t("未检测到 VPN 或代理", "No VPN/proxy detected") });
      updateCheck(3, d.hosting ? { status: "warn", detail: t("当前 IP 属于数据中心", "IP belongs to a datacenter") } : { status: "pass", detail: t("当前 IP 不属于数据中心", "Not a datacenter IP") });
      const ip = d.query ?? d.ip;
      if (ip) {
        fetch(`/api/rdns?ip=${encodeURIComponent(ip)}`).then((r) => r.json()).then((rd) => {
          updateCheck(5, rd.hostnames?.length > 0 ? { status: "pass", detail: t(`反向 DNS：${rd.hostnames[0]}`, `Reverse DNS: ${rd.hostnames[0]}`) } : { status: "warn", detail: t("IP 没有配置 PTR 记录", "No PTR record") });
        }).catch(() => updateCheck(5, { status: "warn", detail: t("无法检测反向 DNS", "Could not check reverse DNS") }));
      }
    }).catch(() => { updateCheck(0, { status: "fail", detail: t("无法获取 IP 信息", "Could not fetch IP") }); });

    try {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      pc.createDataChannel("");
      const webrtcIps: string[] = [];
      pc.onicecandidate = (e) => {
        if (e.candidate) { const m = e.candidate.candidate.match(/([0-9]{1,3}(?:\.[0-9]{1,3}){3})/g); if (m) webrtcIps.push(...m); }
        else {
          pc.close();
          const publicIps = webrtcIps.filter((ip) => !ip.startsWith("192.168.") && !ip.startsWith("10.") && !ip.startsWith("172.") && ip !== "0.0.0.0");
          updateCheck(2, publicIps.length > 0 ? { status: "warn", detail: t(`WebRTC 暴露了 IP：${publicIps.join(", ")}`, `WebRTC exposed: ${publicIps.join(", ")}`) } : { status: "pass", detail: t("WebRTC 未泄漏公网 IP", "No public IP leaked") });
          const ipv6 = webrtcIps.filter((ip) => ip.includes(":"));
          updateCheck(4, ipv6.length > 0 ? { status: "warn", detail: t(`检测到 IPv6：${ipv6[0]}`, `IPv6 detected: ${ipv6[0]}`) } : { status: "pass", detail: t("未检测到 IPv6 泄漏", "No IPv6 leak") });
        }
      };
      pc.createOffer().then((o) => pc.setLocalDescription(o));
      setTimeout(() => {
        setChecks((prev) => prev.map((c, i) => (i === 2 && c.status === "loading" ? { ...c, status: "pass", detail: t("未发现泄漏", "No leak found") } : i === 4 && c.status === "loading" ? { ...c, status: "pass", detail: t("未检测到 IPv6", "No IPv6") } : c)));
      }, 5000);
    } catch { updateCheck(2, { status: "warn", detail: t("不支持 WebRTC 检测", "WebRTC unsupported") }); updateCheck(4, { status: "pass", detail: "—" }); }

    updateCheck(6, navigator.doNotTrack === "1" ? { status: "pass", detail: t("已开启 Do Not Track", "Do Not Track enabled") } : { status: "warn", detail: t("未开启 Do Not Track", "Do Not Track disabled") });
    updateCheck(7, navigator.cookieEnabled ? { status: "warn", detail: t("Cookie 已启用，可被用于追踪", "Cookies enabled (trackable)") } : { status: "pass", detail: t("Cookie 已禁用", "Cookies disabled") });
  }, [t]);

  const done = checks.filter((c) => c.status !== "loading").length;
  const passed = checks.filter((c) => c.status === "pass").length;
  const score = Math.round((passed / checks.length) * 100);
  const scoreColor = score >= 75 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-red-500";
  const scoreLabel = score >= 75 ? t("良好", "Good") : score >= 50 ? t("一般", "Fair") : t("需要改进", "Needs work");

  const icons = {
    pass: <CheckCircle size={17} className="text-emerald-500 shrink-0" />,
    warn: <AlertTriangle size={17} className="text-amber-500 shrink-0" />,
    fail: <XCircle size={17} className="text-red-500 shrink-0" />,
    loading: <Loader2 size={17} className="animate-spin text-muted shrink-0" />,
  };

  return (
    <div>
      <div className="surface-2 border border-themed rounded-xl p-4 mb-3 flex items-center gap-5">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--border)" strokeWidth="2.5" />
            <circle cx="18" cy="18" r="15.9155" fill="none" stroke={score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444"} strokeWidth="2.5" strokeDasharray={`${score} ${100 - score}`} strokeLinecap="round" />
          </svg>
          <span className={`absolute text-base font-bold ${scoreColor}`}>{done < checks.length ? "…" : score}</span>
        </div>
        <div>
          <p className="text-2xl font-bold text-fg">{done < checks.length ? t("检测中", "Scanning") : t(`${score}分`, `${score}`)}</p>
          <p className={`font-semibold text-sm ${scoreColor}`}>{done < checks.length ? `${done}/${checks.length}` : scoreLabel}</p>
          <p className="text-xs text-muted">{t(`${passed} 项通过 · ${checks.length - passed} 项需关注`, `${passed} passed · ${checks.length - passed} to review`)}</p>
        </div>
        <Shield size={40} className="ml-auto text-[var(--border)]" />
      </div>
      <div className="space-y-2">
        {checks.map((check, i) => (
          <div key={i} className="surface-2 border border-themed rounded-xl px-4 py-3 flex items-start gap-3">
            {icons[check.status]}
            <div className="min-w-0"><p className="font-medium text-fg text-sm">{check.label}</p><p className="text-xs text-muted mt-0.5 break-all">{check.detail}</p></div>
            <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${check.status === "pass" ? "bg-emerald-500/15 text-emerald-500" : check.status === "warn" ? "bg-amber-500/15 text-amber-500" : check.status === "fail" ? "bg-red-500/15 text-red-500" : "surface text-muted"}`}>
              {check.status === "pass" ? t("通过", "Pass") : check.status === "warn" ? t("警告", "Warn") : check.status === "fail" ? t("失败", "Fail") : "…"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
