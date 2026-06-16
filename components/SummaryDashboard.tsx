"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Check, Loader2, MapPin, Building2, ShieldCheck, AlertTriangle, Network } from "lucide-react";
import { useLang } from "@/lib/i18n";

interface IpData {
  query?: string; ip?: string; isp?: string; org?: string; as?: string; asname?: string;
  hosting?: boolean; mobile?: boolean; proxy?: boolean;
  country?: string; countryCode?: string; city?: string; regionName?: string;
}

// Two-letter country code -> flag emoji (regional indicator symbols).
function flag(cc?: string): string {
  if (!cc || cc.length !== 2) return "🏳️";
  const A = 0x1f1e6;
  return String.fromCodePoint(...[...cc.toUpperCase()].map((c) => A + c.charCodeAt(0) - 65));
}

// WebRTC can reveal IPs that bypass an HTTP proxy — used to surface the real /
// local address alongside the proxy address the server sees.
function extractIps(candidate: string): string[] {
  const re = /([0-9]{1,3}(?:\.[0-9]{1,3}){3}|(?:[0-9a-fA-F]{1,4}:){2,}[0-9a-fA-F]{1,4})/g;
  return candidate.match(re) ?? [];
}
const isPrivateIp = (ip: string) =>
  ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.") ||
  ip.startsWith("fe80") || ip.startsWith("::1") || ip === "127.0.0.1";
// mDNS-obfuscated candidates (e.g. "abcd.local") aren't useful to show.
const isRealIp = (ip: string) => /[.:]/.test(ip) && !ip.endsWith(".local") && !ip.startsWith("0.");

interface ScoreFactor { label: string; pts: number; on: boolean }

export default function SummaryDashboard() {
  const { t } = useLang();
  const [data, setData] = useState<IpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  // navigator-dependent flags are read after mount so the first client render
  // matches the server (both use the false baseline) — avoids hydration mismatch.
  const [clientFlags, setClientFlags] = useState({ dnt: false, cookiesOff: false });
  const [rtcIps, setRtcIps] = useState<string[]>([]);
  const rtcDone = useRef(false);

  useEffect(() => {
    fetch("/api/my-ip").then((r) => r.json()).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
    setClientFlags({
      dnt: navigator.doNotTrack === "1" || (navigator as unknown as { msDoNotTrack?: string }).msDoNotTrack === "1",
      cookiesOff: navigator.cookieEnabled === false,
    });

    // WebRTC probe — gathers local & public IPs that may bypass a proxy.
    const found = new Set<string>();
    let pc: RTCPeerConnection | null = null;
    try {
      pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      pc.createDataChannel("");
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          extractIps(e.candidate.candidate).forEach((ip) => { if (isRealIp(ip)) found.add(ip); });
        } else if (!rtcDone.current) {
          rtcDone.current = true;
          setRtcIps(Array.from(found));
          pc?.close();
        }
      };
      pc.createOffer().then((o) => pc?.setLocalDescription(o)).catch(() => {});
      const timer = setTimeout(() => {
        if (!rtcDone.current) { rtcDone.current = true; setRtcIps(Array.from(found)); pc?.close(); }
      }, 4000);
      return () => { clearTimeout(timer); rtcDone.current = true; pc?.close(); };
    } catch { /* WebRTC unsupported */ }
  }, []);

  const ip = data?.query ?? data?.ip;
  const isAnon = data?.proxy || data?.hosting;

  // Compare the server-seen IP with WebRTC-detected IPs to reveal proxy use.
  const localIp = rtcIps.find(isPrivateIp);
  const altPublicIp = rtcIps.find((x) => !isPrivateIp(x) && x !== ip);

  // Lightweight, explainable anonymity score. Higher = harder to identify.
  const { score, factors } = useMemo(() => {
    const f: ScoreFactor[] = [
      { label: t("使用 VPN / 代理 / 数据中心", "VPN / proxy / datacenter"), pts: 35, on: !!isAnon },
      { label: t("移动 / 共享网络", "Mobile / shared network"), pts: 10, on: !!data?.mobile },
      { label: t("已开启 Do Not Track", "Do Not Track enabled"), pts: 15, on: clientFlags.dnt },
      { label: t("已禁用 Cookie", "Cookies disabled"), pts: 15, on: clientFlags.cookiesOff },
    ];
    const s = Math.min(100, 25 + f.reduce((a, x) => a + (x.on ? x.pts : 0), 0));
    return { score: s, factors: f };
  }, [data, isAnon, clientFlags, t]);

  const grade = score >= 70
    ? { label: t("匿名性强", "Strong"), color: "#10b981" }
    : score >= 45
      ? { label: t("中等", "Moderate"), color: "#f59e0b" }
      : { label: t("易被识别", "Exposed"), color: "#ef4444" };

  function copy() {
    if (!ip) return;
    navigator.clipboard?.writeText(ip).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  // Ring geometry
  const R = 34, C = 2 * Math.PI * R;
  const dash = (score / 100) * C;

  return (
    <section className="surface border-themed rounded-3xl overflow-hidden shadow-sm">
      <div className="px-6 sm:px-8 py-7 grid gap-6 md:grid-cols-[minmax(0,1.4fr)_auto] md:items-center">
        {/* Left: IP + meta */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-muted">
              {altPublicIp
                ? t("公网 IP（网站所见）", "Public IP (as websites see you)", { ja: "公開IP（サイトが見るIP）", de: "Öffentliche IP (von Websites gesehen)", ko: "공개 IP (사이트가 보는 IP)" })
                : t("你的公网 IP", "Your public IP", { ja: "あなたの公開IP", de: "Ihre öffentliche IP", ko: "내 공개 IP" })}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold font-mono text-fg break-all tracking-tight">
              {loading ? <Loader2 size={28} className="animate-spin text-[var(--accent)]" /> : ip ?? "—"}
            </h1>
            {ip && (
              <button onClick={copy} className="p-2 rounded-lg text-muted hover:surface-2 shrink-0" aria-label="copy">
                {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
              </button>
            )}
          </div>

          {/* Proxy reveal: WebRTC found a public IP different from the server-seen one */}
          {(altPublicIp || localIp) && (
            <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-3 space-y-2">
              {altPublicIp && (
                <>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                    <AlertTriangle size={13} className="shrink-0" />
                    {t("检测到不同的公网 IP — 你可能正在使用代理 / VPN", "Different public IP detected — you may be using a proxy / VPN")}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-muted w-32 shrink-0">{t("真实公网 IP", "Real public IP", { ja: "実際の公開IP", de: "Echte öffentliche IP", ko: "실제 공개 IP" })}</span>
                    <span className="font-mono font-semibold text-amber-600 dark:text-amber-400 break-all">{altPublicIp}</span>
                    <span className="text-[10px] uppercase tracking-wide bg-amber-500/15 text-amber-500 rounded-full px-2 py-0.5 shrink-0">WebRTC</span>
                  </div>
                </>
              )}
              {localIp && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-xs text-muted w-32 shrink-0 flex items-center gap-1"><Network size={12} /> {t("本机内网 IP", "Local IP", { ja: "ローカルIP", de: "Lokale IP", ko: "로컬 IP" })}</span>
                  <span className="font-mono font-medium text-fg break-all">{localIp}</span>
                </div>
              )}
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-3">
            {/* Location */}
            <div className="surface-2 border border-themed rounded-xl px-3.5 py-3">
              <div className="flex items-center gap-1.5 text-xs text-muted mb-1"><MapPin size={13} /> {t("位置", "Location", { ja: "位置", de: "Standort", ko: "위치" })}</div>
              <div className="text-sm font-semibold text-fg truncate">
                <span className="mr-1">{flag(data?.countryCode)}</span>
                {data?.city ? `${data.city}, ${data.country}` : data?.country ?? "—"}
              </div>
            </div>
            {/* ISP / ASN */}
            <div className="surface-2 border border-themed rounded-xl px-3.5 py-3">
              <div className="flex items-center gap-1.5 text-xs text-muted mb-1"><Building2 size={13} /> {t("运营商", "ISP / ASN", { ja: "ISP / ASN", de: "ISP / ASN", ko: "ISP / ASN" })}</div>
              <div className="text-sm font-semibold text-fg truncate" title={data?.isp}>{data?.isp ?? "—"}</div>
              <div className="text-xs text-muted truncate">{data?.as ?? ""}</div>
            </div>
            {/* VPN status */}
            <div className="surface-2 border border-themed rounded-xl px-3.5 py-3">
              <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
                {isAnon ? <AlertTriangle size={13} className="text-amber-500" /> : <ShieldCheck size={13} className="text-emerald-500" />}
                {t("连接", "Connection", { ja: "接続", de: "Verbindung", ko: "연결" })}
              </div>
              <div className={`text-sm font-semibold ${isAnon ? "text-amber-500" : "text-emerald-500"}`}>
                {isAnon ? t("VPN / 代理", "VPN / Proxy") : t("直连", "Direct")}
              </div>
            </div>
          </div>
        </div>

        {/* Right: anonymity ring */}
        <div
          className="relative flex flex-col items-center justify-center md:border-l border-themed md:pl-6"
          onMouseEnter={() => setShowBreakdown(true)}
          onMouseLeave={() => setShowBreakdown(false)}
        >
          <svg width="92" height="92" viewBox="0 0 92 92">
            <circle cx="46" cy="46" r={R} fill="none" stroke="var(--border)" strokeWidth="8" />
            <circle
              cx="46" cy="46" r={R} fill="none" stroke={grade.color} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${dash} ${C}`} transform="rotate(-90 46 46)"
              style={{ transition: "stroke-dasharray 0.7s ease" }}
            />
            <text x="46" y="46" textAnchor="middle" dominantBaseline="central"
              fontSize="22" fontWeight="700" fill="var(--fg)">{loading ? "" : score}</text>
          </svg>
          <div className="text-xs text-muted mt-1.5">{t("匿名性评分", "Anonymity", { ja: "匿名性", de: "Anonymität", ko: "익명성" })}</div>
          <div className="text-sm font-semibold" style={{ color: grade.color }}>{grade.label}</div>

          {showBreakdown && !loading && (
            <div className="absolute top-full right-0 mt-2 z-30 w-60 surface border-themed rounded-xl px-3 py-2.5 shadow-xl text-left">
              <p className="text-xs text-muted mb-2">{t("评分构成（满分 100）", "Score factors (max 100)")}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs"><span className="text-muted">{t("基础分", "Baseline")}</span><span className="text-fg font-medium">25</span></div>
                {factors.map((f) => (
                  <div key={f.label} className="flex justify-between text-xs gap-2">
                    <span className={f.on ? "text-fg" : "text-muted line-through"}>{f.label}</span>
                    <span className={`font-medium shrink-0 ${f.on ? "text-emerald-500" : "text-muted"}`}>+{f.pts}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
