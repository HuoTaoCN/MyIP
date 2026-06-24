"use client";
import { useEffect, useRef, useState } from "react";
import { ShieldCheck, AlertTriangle, Loader2, Wifi } from "lucide-react";
import { useLang } from "@/lib/i18n";

interface Cand { ip: string; type: string; proto: string; v4: boolean; }
interface LeakResult {
  publicIp: string;
  cands: Cand[];
  udp: boolean;
  hasLeak: boolean;
  status: "checking" | "done" | "error";
}

const IP_RE = /([0-9]{1,3}(?:\.[0-9]{1,3}){3}|(?:[0-9a-fA-F]{1,4}:){2,}[0-9a-fA-F]{1,4})/;
const isV4 = (ip: string) => /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
const isPrivate = (ip: string) =>
  ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.") ||
  ip.startsWith("fe80") || ip.startsWith("::1") || ip === "127.0.0.1";

// Parse an ICE candidate line: "candidate:... 1 udp <pri> <ip> <port> typ srflx ..."
function parseCandidate(c: string): Cand | null {
  const parts = c.split(" ");
  const ip = parts[4];
  if (!ip || !IP_RE.test(ip) || ip.endsWith(".local") || ip.startsWith("0.")) return null;
  const proto = (parts[2] || "").toLowerCase();
  const typIdx = parts.indexOf("typ");
  const type = typIdx >= 0 ? parts[typIdx + 1] : "?";
  return { ip, type, proto, v4: isV4(ip) };
}

export default function WebRtcLeakTool() {
  const { t } = useLang();
  const [result, setResult] = useState<LeakResult>({ publicIp: "", cands: [], udp: false, hasLeak: false, status: "checking" });
  const doneRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const byIp = new Map<string, Cand>();
    function finish(publicIp: string) {
      if (doneRef.current || cancelled) return;
      doneRef.current = true;
      const cands = Array.from(byIp.values());
      const udp = cands.some((c) => c.proto === "udp");
      const hasLeak = publicIp ? cands.some((c) => !isPrivate(c.ip) && c.ip !== publicIp && isV4(c.ip) === isV4(publicIp)) : false;
      setResult({ publicIp, cands, udp, hasLeak, status: "done" });
    }
    async function check() {
      let publicIp = "";
      try { const res = await fetch("/api/my-ip"); const d = await res.json(); publicIp = d.query ?? d.ip ?? ""; } catch { /* ignore */ }
      if (cancelled) return;
      try {
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:stun.cloudflare.com:3478"] }],
        });
        pc.createDataChannel("");
        pc.onicecandidate = (e) => {
          if (e.candidate) {
            const c = parseCandidate(e.candidate.candidate);
            if (c && !byIp.has(c.ip)) byIp.set(c.ip, c);
          } else { pc.close(); finish(publicIp); }
        };
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        setTimeout(() => finish(publicIp), 5000);
      } catch { if (!cancelled) setResult({ publicIp, cands: [], udp: false, hasLeak: false, status: "error" }); }
    }
    check();
    return () => { cancelled = true; };
  }, []);

  if (result.status === "checking")
    return <div className="flex flex-col items-center gap-3 py-10"><Loader2 size={28} className="animate-spin text-[var(--accent)]" /><p className="text-muted text-sm">{t("正在通过 STUN 收集 WebRTC 候选…", "Gathering WebRTC candidates via STUN…")}</p></div>;
  if (result.status === "error")
    return <div className="surface-2 border border-themed rounded-xl p-5 text-center text-muted">{t("浏览器不支持 WebRTC 或检测受限", "WebRTC unsupported or restricted")}</div>;

  const typeLabel = (ty: string) => ty === "srflx" ? t("公网(srflx)", "srflx") : ty === "host" ? t("本地(host)", "host") : ty === "relay" ? t("中继(relay)", "relay") : ty;

  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${result.hasLeak ? "bg-red-500/10 border-red-500/30" : "bg-emerald-500/10 border-emerald-500/30"}`}>
        {result.hasLeak ? <AlertTriangle size={24} className="text-red-500 shrink-0" /> : <ShieldCheck size={24} className="text-emerald-500 shrink-0" />}
        <div className="min-w-0">
          <p className={`font-bold ${result.hasLeak ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {result.hasLeak ? t("警告：检测到 WebRTC IP 泄漏！", "Warning: WebRTC IP leak detected!") : t("安全：未检测到 WebRTC 泄漏", "Safe: no WebRTC leak detected")}
          </p>
          <p className="text-sm text-muted">
            {result.hasLeak ? t("WebRTC 暴露了与公网不同的同族 IP", "WebRTC exposed a same-family IP different from your public IP") : t("WebRTC 未暴露与公网不同的 IP", "No public IP different from your server IP")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs surface-2 border border-themed rounded-xl px-3.5 py-2.5">
        <Wifi size={14} className={result.udp ? "text-emerald-500" : "text-muted"} />
        <span className="text-muted">{t("UDP STUN", "UDP STUN")}</span>
        <span className={`font-semibold ${result.udp ? "text-emerald-500" : "text-muted"}`}>{result.udp ? t("成功", "working") : t("未检出", "not detected")}</span>
        <span className="ml-auto text-muted">{t("公网 IP（服务端）", "Server IP")}: <span className="font-mono text-fg">{result.publicIp || "—"}</span></span>
      </div>

      <div className="surface-2 border border-themed rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-themed"><h4 className="font-semibold text-fg text-sm">{t("ICE 候选", "ICE candidates")}</h4></div>
        <div className="divide-y divide-[var(--border)]">
          {result.cands.length === 0 ? (
            <div className="px-4 py-2.5 text-sm text-muted">{t("未收集到候选（可能被浏览器屏蔽）", "No candidates (may be blocked by the browser)")}</div>
          ) : result.cands.map((c) => {
            const leak = !isPrivate(c.ip) && c.ip !== result.publicIp && isV4(c.ip) === isV4(result.publicIp);
            return (
              <div key={c.ip} className="flex items-center gap-2 px-4 py-2.5 flex-wrap">
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] shrink-0">{typeLabel(c.type)}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full surface text-muted shrink-0">{c.v4 ? "IPv4" : "IPv6"}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full surface text-muted shrink-0 uppercase">{c.proto}</span>
                <span className={`font-mono text-sm font-semibold break-all ${isPrivate(c.ip) ? "text-muted" : leak ? "text-red-500" : "text-emerald-500"}`}>{c.ip}</span>
                <span className={`ml-auto text-xs shrink-0 ${isPrivate(c.ip) ? "text-muted" : leak ? "text-red-500" : "text-emerald-500"}`}>
                  {isPrivate(c.ip) ? t("内网", "local") : leak ? t("泄漏", "leak") : t("匹配", "match")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-xs text-muted">{t("通过多个 STUN 服务器收集 ICE 候选：host=本机网卡地址，srflx=经 STUN 反射的公网地址。同族(同为 IPv4/IPv6)且与服务端不同的公网地址判为泄漏。", "Gathers ICE candidates via multiple STUN servers: host = local NIC address, srflx = STUN-reflexive public address. A same-family public address differing from the server IP is flagged as a leak.")}</p>
    </div>
  );
}
