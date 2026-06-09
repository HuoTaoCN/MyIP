"use client";
import { useEffect, useState } from "react";
import InfoTable from "@/components/InfoTable";
import { useLang } from "@/lib/i18n";

interface NetworkConnection { type?: string; effectiveType?: string; downlink?: number; downlinkMax?: number; rtt?: number; saveData?: boolean; }

export default function ConnectionInfoTool() {
  const { t } = useLang();
  const [info, setInfo] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const nav = navigator as Navigator & { connection?: NetworkConnection; mozConnection?: NetworkConnection; webkitConnection?: NetworkConnection };
    const conn = nav.connection ?? nav.mozConnection ?? nav.webkitConnection;
    const data: Record<string, string> = {
      onlineStatus: navigator.onLine ? t("在线", "Online") : t("离线", "Offline"),
      connectionType: conn?.type ?? "N/A", effectiveType: conn?.effectiveType ?? "N/A",
      downlink: conn?.downlink != null ? `${conn.downlink} Mbps` : "N/A",
      rtt: conn?.rtt != null ? `${conn.rtt} ms` : "N/A",
      saveData: conn?.saveData != null ? (conn.saveData ? t("开启", "On") : t("关闭", "Off")) : "N/A",
      secure: typeof window !== "undefined" && window.location.protocol === "https:" ? t("安全 (HTTPS)", "Secure (HTTPS)") : "HTTP",
    };
    try {
      const entries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
      if (entries.length > 0) data.nextHopProtocol = (entries[0] as PerformanceNavigationTiming & { nextHopProtocol?: string }).nextHopProtocol ?? "N/A";
    } catch { data.nextHopProtocol = "N/A"; }
    setInfo(data);
    fetch("/api/my-ip").then((r) => r.json()).then((d) => {
      setInfo((prev) => ({ ...prev!, publicIp: d.query ?? d.ip ?? "N/A", isp: d.isp ?? "N/A", country: d.country ?? "N/A" }));
    });
  }, [t]);

  const rows = info ? [
    { label: t("在线状态", "Status"), value: info.onlineStatus, highlight: true },
    { label: t("公网 IP", "Public IP"), value: info.publicIp },
    { label: "ISP", value: info.isp },
    { label: t("国家", "Country"), value: info.country },
    { label: t("连接安全", "Security"), value: info.secure },
    { label: t("HTTP 协议", "HTTP protocol"), value: info.nextHopProtocol },
    { label: t("连接类型", "Connection type"), value: info.connectionType },
    { label: t("有效连接类型", "Effective type"), value: info.effectiveType },
    { label: t("下行速度", "Downlink"), value: info.downlink },
    { label: t("往返延迟 (RTT)", "RTT"), value: info.rtt },
    { label: t("省流模式", "Save data"), value: info.saveData },
  ] : [];

  return (
    <div>
      {info ? <InfoTable rows={rows} /> : <p className="text-muted py-5">{t("检测中…", "Detecting…")}</p>}
      <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-sm text-fg">
        <strong>{t("注意：", "Note: ")}</strong>{t("连接速度数据由 Network Information API 提供（估算值），Firefox/Safari 不支持。", "Speed data comes from the Network Information API (estimates); Firefox/Safari don't support it.")}
      </div>
    </div>
  );
}
