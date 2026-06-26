"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Check, Loader2, MapPin, Building2, ShieldCheck, AlertTriangle, Network, Server, Terminal } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { flag } from "@/lib/flag";
import { assessIp, type IpTypeKey } from "@/lib/ipRisk";
import { fetchTrace, coloCity } from "@/lib/trace";

interface IpData {
  query?: string; ip?: string; isp?: string; org?: string; as?: string; asname?: string;
  hosting?: boolean; mobile?: boolean; proxy?: boolean;
  country?: string; countryCode?: string; city?: string; regionName?: string;
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
  const { t, lang } = useLang();
  const [data, setData] = useState<IpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  // navigator-dependent flags are read after mount so the first client render
  // matches the server (both use the false baseline) — avoids hydration mismatch.
  const [clientFlags, setClientFlags] = useState({ dnt: false, cookiesOff: false });
  const [rtcIps, setRtcIps] = useState<string[]>([]);
  const [colo, setColo] = useState<string | null>(null);
  const [cmdCopied, setCmdCopied] = useState(false);
  const rtcDone = useRef(false);

  useEffect(() => {
    fetch("/api/my-ip").then((r) => r.json()).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
    fetchTrace().then((tr) => setColo(tr.colo ?? null)).catch(() => setColo(null));
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

  const isV4 = (x?: string | null) => !!x && /^(\d{1,3}\.){3}\d{1,3}$/.test(x);
  const connIp = data?.query ?? data?.ip; // the IP that connected (what sites see)
  const rtcPublic = rtcIps.filter((x) => !isPrivateIp(x));
  // Prefer IPv4 for display: on an IPv6 connection (common on mobile/dual-stack),
  // surface the public IPv4 found via WebRTC — fully self-hosted, no third-party
  // endpoint and no IPv4-only subdomain (not possible on Cloudflare's proxy).
  const ip = isV4(connIp) ? connIp : (rtcPublic.find(isV4) ?? connIp);
  const isAnon = data?.proxy || data?.hosting;

  const localIp = rtcIps.find(isPrivateIp);
  // Proxy/VPN leak = a public WebRTC IP of the SAME family as the connection IP
  // but a different value. A cross-family v4/v6 pair is normal, not a leak.
  const altPublicIp = rtcPublic.find((x) => x !== connIp && isV4(x) === isV4(connIp));

  // Lightweight, explainable anonymity score. Higher = harder to identify.
  const { score, factors } = useMemo(() => {
    const f: ScoreFactor[] = [
      { label: t("使用 VPN / 代理 / 数据中心", "VPN / proxy / datacenter", { fr: "VPN / proxy / centre de données", es: "VPN / proxy / centro de datos", ru: "VPN / прокси / дата-центр", vi: "VPN / proxy / trung tâm dữ liệu", pt: "VPN / proxy / data center" }), pts: 35, on: !!isAnon },
      { label: t("移动 / 共享网络", "Mobile / shared network", { fr: "Mobile / réseau partagé", es: "Móvil / red compartida", ru: "Мобильная / общая сеть", vi: "Di động / mạng dùng chung", pt: "Móvel / rede compartilhada" }), pts: 10, on: !!data?.mobile },
      { label: t("已开启 Do Not Track", "Do Not Track enabled", { fr: "Do Not Track activé", es: "Do Not Track activado", ru: "Do Not Track включён", vi: "Đã bật Do Not Track", pt: "Do Not Track ativado" }), pts: 15, on: clientFlags.dnt },
      { label: t("已禁用 Cookie", "Cookies disabled", { fr: "Cookies désactivés", es: "Cookies desactivadas", ru: "Cookie отключены", vi: "Đã tắt Cookie", pt: "Cookies desativados" }), pts: 15, on: clientFlags.cookiesOff },
    ];
    const s = Math.min(100, 25 + f.reduce((a, x) => a + (x.on ? x.pts : 0), 0));
    return { score: s, factors: f };
  }, [data, isAnon, clientFlags, t]);

  const grade = score >= 70
    ? { label: t("匿名性强", "Strong", { fr: "Fort", es: "Fuerte", ru: "Высокая", vi: "Mạnh", pt: "Forte" }), color: "#10b981" }
    : score >= 45
      ? { label: t("中等", "Moderate", { fr: "Modéré", es: "Moderado", ru: "Средняя", vi: "Trung bình", pt: "Moderado" }), color: "#f59e0b" }
      : { label: t("易被识别", "Exposed", { fr: "Exposé", es: "Expuesto", ru: "Уязвимая", vi: "Dễ nhận diện", pt: "Exposto" }), color: "#ef4444" };

  // IP type + risk score (from ip-api proxy/hosting/mobile flags).
  const risk = data ? assessIp(data) : null;
  const typeLabel: Record<IpTypeKey, string> = {
    residential: t("住宅宽带", "Residential", { fr: "Résidentiel", es: "Residencial", ru: "Домашний", vi: "Dân cư", pt: "Residencial" }),
    datacenter: t("数据中心/机房", "Datacenter", { fr: "Centre de données", es: "Centro de datos", ru: "Дата-центр", vi: "Trung tâm dữ liệu", pt: "Data center" }),
    mobile: t("移动网络", "Mobile", { fr: "Mobile", es: "Móvil", ru: "Мобильный", vi: "Di động", pt: "Móvel" }),
    proxy: t("代理 / VPN", "Proxy / VPN"),
  };
  const riskColor = risk?.level === "high" ? "text-red-500" : risk?.level === "medium" ? "text-amber-500" : "text-emerald-500";

  function copy() {
    if (!ip) return;
    navigator.clipboard?.writeText(ip).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const curlCmd = "curl ip.huotao.com/ip";
  function copyCmd() {
    navigator.clipboard?.writeText(curlCmd).then(() => {
      setCmdCopied(true);
      setTimeout(() => setCmdCopied(false), 1500);
    });
  }

  // Ring geometry
  const R = 34, C = 2 * Math.PI * R;
  const dash = (score / 100) * C;

  return (
    <section className="surface border-themed rounded-3xl overflow-hidden shadow-sm">
      <div className="px-5 sm:px-8 py-6 sm:py-7">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.4fr)_auto] md:items-center">
        {/* Left: IP + meta */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-muted">
              {altPublicIp
                ? t("公网 IP（网站所见）", "Public IP (as websites see you)", { ja: "公開IP（サイトが見るIP）", de: "Öffentliche IP (von Websites gesehen)", ko: "공개 IP (사이트가 보는 IP)", fr: "IP publique (vue par les sites)", es: "IP pública (como te ven los sitios)", ru: "Публичный IP (как видят сайты)", vi: "IP công khai (như các trang web thấy)", pt: "IP público (como os sites veem)" })
                : t("你的公网 IP", "Your public IP", { ja: "あなたの公開IP", de: "Ihre öffentliche IP", ko: "내 공개 IP", fr: "Votre IP publique", es: "Tu IP pública", ru: "Ваш публичный IP", vi: "IP công khai của bạn", pt: "Seu IP público" })}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-2xl sm:text-4xl font-bold font-mono text-fg break-all tracking-tight">
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
                    {t("检测到不同的公网 IP — 你可能正在使用代理 / VPN", "Different public IP detected — you may be using a proxy / VPN", { fr: "IP publique différente détectée — vous utilisez peut-être un proxy / VPN", es: "IP pública diferente detectada — puede que uses un proxy / VPN", ru: "Обнаружен другой публичный IP — возможно, вы используете прокси / VPN", vi: "Phát hiện IP công khai khác — bạn có thể đang dùng proxy / VPN", pt: "IP público diferente detectado — você pode estar usando um proxy / VPN" })}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-muted w-32 shrink-0">{t("真实公网 IP", "Real public IP", { ja: "実際の公開IP", de: "Echte öffentliche IP", ko: "실제 공개 IP", fr: "IP publique réelle", es: "IP pública real", ru: "Реальный публичный IP", vi: "IP công khai thật", pt: "IP público real" })}</span>
                    <span className="font-mono font-semibold text-amber-600 dark:text-amber-400 break-all">{altPublicIp}</span>
                    <span className="text-[10px] uppercase tracking-wide bg-amber-500/15 text-amber-500 rounded-full px-2 py-0.5 shrink-0">WebRTC</span>
                  </div>
                </>
              )}
              {localIp && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-xs text-muted w-32 shrink-0 flex items-center gap-1"><Network size={12} /> {t("本机内网 IP", "Local IP", { ja: "ローカルIP", de: "Lokale IP", ko: "로컬 IP", fr: "IP locale", es: "IP local", ru: "Локальный IP", vi: "IP nội bộ", pt: "IP local" })}</span>
                  <span className="font-mono font-medium text-fg break-all">{localIp}</span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Location */}
            <div className="surface-2 border border-themed rounded-xl px-3.5 py-3">
              <div className="flex items-center gap-1.5 text-xs text-muted mb-1"><MapPin size={13} /> {t("位置", "Location", { ja: "位置", de: "Standort", ko: "위치", fr: "Emplacement", es: "Ubicación", ru: "Местоположение", vi: "Vị trí", pt: "Localização" })}</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl leading-none shrink-0">{flag(data?.countryCode)}</span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-fg truncate">{data?.country ?? "—"}</div>
                  <div className="text-xs text-muted truncate">{[data?.city, data?.regionName].filter(Boolean).join(", ") || "—"}</div>
                </div>
              </div>
            </div>
            {/* ISP / ASN */}
            <div className="surface-2 border border-themed rounded-xl px-3.5 py-3">
              <div className="flex items-center gap-1.5 text-xs text-muted mb-1"><Building2 size={13} /> {t("运营商", "ISP / ASN", { ja: "ISP / ASN", de: "ISP / ASN", ko: "ISP / ASN" })}</div>
              <div className="text-sm font-semibold text-fg truncate" title={data?.isp}>{data?.isp ?? "—"}</div>
              <div className="text-xs text-muted truncate">{data?.as ?? ""}</div>
            </div>
            {/* IP type + risk score */}
            <div className="surface-2 border border-themed rounded-xl px-3.5 py-3">
              <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
                {isAnon ? <AlertTriangle size={13} className="text-amber-500" /> : <ShieldCheck size={13} className="text-emerald-500" />}
                {t("IP 类型 · 风险", "IP type · risk", { ja: "IPタイプ・リスク", de: "IP-Typ · Risiko", ko: "IP 유형 · 위험", fr: "Type IP · risque", es: "Tipo IP · riesgo", ru: "Тип IP · риск", vi: "Loại IP · rủi ro", pt: "Tipo IP · risco" })}
              </div>
              <div className={`text-sm font-semibold truncate ${riskColor}`}>{risk ? typeLabel[risk.typeKey] : "—"}</div>
              {risk && <div className="text-xs text-muted">{t("风险", "Risk", { fr: "Risque", es: "Riesgo", ru: "Риск", vi: "Rủi ro", pt: "Risco" })} {risk.score}/100</div>}
            </div>
            {/* CDN edge node */}
            <div className="surface-2 border border-themed rounded-xl px-3.5 py-3">
              <div className="flex items-center gap-1.5 text-xs text-muted mb-1"><Server size={13} /> {t("CDN 节点", "CDN node", { ja: "CDNノード", de: "CDN-Knoten", ko: "CDN 노드", fr: "Nœud CDN", es: "Nodo CDN", ru: "Узел CDN", vi: "Nút CDN", pt: "Nó CDN" })}</div>
              <div className="text-sm font-semibold text-fg truncate">{colo ?? "—"}</div>
              {colo && coloCity(colo, lang === "zh") && <div className="text-xs text-muted truncate">{coloCity(colo, lang === "zh")}</div>}
            </div>
          </div>

        </div>

        {/* Right: anonymity ring */}
        <div
          className="relative flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-themed pt-5 md:pt-0 md:pl-6"
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
          <div className="text-xs text-muted mt-1.5">{t("匿名性评分", "Anonymity", { ja: "匿名性", de: "Anonymität", ko: "익명성", fr: "Anonymat", es: "Anonimato", ru: "Анонимность", vi: "Ẩn danh", pt: "Anonimato" })}</div>
          <div className="text-sm font-semibold" style={{ color: grade.color }}>{grade.label}</div>

          {showBreakdown && !loading && (
            <div className="absolute top-full right-0 mt-2 z-30 w-60 surface border-themed rounded-xl px-3 py-2.5 shadow-xl text-left">
              <p className="text-xs text-muted mb-2">{t("评分构成（满分 100）", "Score factors (max 100)", { fr: "Composition du score (max 100)", es: "Factores de puntuación (máx. 100)", ru: "Состав оценки (макс. 100)", vi: "Thành phần điểm (tối đa 100)", pt: "Fatores da pontuação (máx. 100)" })}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs"><span className="text-muted">{t("基础分", "Baseline", { fr: "Base", es: "Base", ru: "База", vi: "Cơ bản", pt: "Base" })}</span><span className="text-fg font-medium">25</span></div>
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

        {/* Terminal one-liner — placed below, full width */}
        <div className="mt-5 flex items-center gap-2 surface-2 border border-themed rounded-xl px-3.5 py-2.5">
          <Terminal size={14} className="text-[var(--accent)] shrink-0" />
          <code className="text-sm font-mono text-fg truncate flex-1">{curlCmd}</code>
          <button onClick={copyCmd} className="p-1.5 rounded-md text-muted hover:surface shrink-0" aria-label="copy command">
            {cmdCopied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
          </button>
        </div>
      </div>
    </section>
  );
}
