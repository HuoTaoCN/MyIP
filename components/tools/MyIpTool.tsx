"use client";
import { useEffect, useState } from "react";
import InfoTable from "@/components/InfoTable";
import { Shield, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { assessIp, type IpTypeKey } from "@/lib/ipRisk";
import { flag } from "@/lib/flag";

interface IpData {
  query?: string; ip?: string; isp?: string; org?: string; as?: string; asname?: string;
  hosting?: boolean; mobile?: boolean; proxy?: boolean; country?: string; countryCode?: string;
  regionName?: string; region?: string; city?: string; zip?: string; timezone?: string; lat?: number; lon?: number;
}

export default function MyIpTool() {
  const { t } = useLang();
  const [data, setData] = useState<IpData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/my-ip").then((r) => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin text-[var(--accent)]" /></div>;
  }

  const isAnonymous = data?.proxy || data?.hosting;
  const ip = data?.query ?? data?.ip;

  const networkRows = [
    { label: t("IP 地址", "IP Address"), value: ip, highlight: true },
    { label: t("ISP / 运营商", "ISP"), value: data?.isp },
    { label: t("组织", "Organization"), value: data?.org },
    { label: t("AS 号码", "AS Number"), value: data?.as },
    { label: t("AS 名称", "AS Name"), value: data?.asname },
    { label: t("主机类型", "Host type"), value: data?.hosting ? t("数据中心/托管", "Datacenter") : data?.mobile ? t("移动网络", "Mobile") : t("固定宽带", "Broadband") },
  ];
  const locationRows = [
    { label: t("国家", "Country"), value: data?.country ? `${flag(data.countryCode)} ${data.country} (${data.countryCode})` : undefined },
    { label: t("省/州", "Region"), value: data?.regionName ? `${data.regionName} (${data.region})` : undefined },
    { label: t("城市", "City"), value: data?.city },
    { label: t("邮政编码", "ZIP"), value: data?.zip },
    { label: t("时区", "Timezone"), value: data?.timezone },
    { label: t("经纬度", "Lat/Long"), value: data?.lat ? `${data.lat}, ${data.lon}` : undefined },
  ];
  const risk = data ? assessIp(data) : null;
  const typeLabel: Record<IpTypeKey, string> = {
    residential: t("住宅宽带", "Residential"),
    datacenter: t("数据中心/机房", "Datacenter"),
    mobile: t("移动网络", "Mobile"),
    proxy: t("代理 / VPN", "Proxy / VPN"),
  };
  const privacyRows = [
    { label: t("IP 类型", "IP type"), value: risk ? typeLabel[risk.typeKey] : undefined, highlight: true },
    { label: t("风险评分", "Risk score"), value: risk ? `${risk.score} / 100` : undefined },
    { label: t("VPN / 代理", "VPN / Proxy"), value: data?.proxy ? t("检测到", "Detected") : t("未检测到", "Not detected") },
    { label: t("数据中心/托管", "Datacenter"), value: data?.hosting ? t("是", "Yes") : t("否", "No") },
    { label: t("移动网络", "Mobile"), value: data?.mobile ? t("是", "Yes") : t("否", "No") },
  ];

  return (
    <div className="space-y-3">
      <div className="text-center py-2">
        <p className="text-3xl font-bold font-mono text-fg break-all">{ip}</p>
      </div>
      <div className={`flex items-center gap-3 p-3 rounded-xl border ${isAnonymous ? "bg-amber-500/10 border-amber-500/30" : "bg-emerald-500/10 border-emerald-500/30"}`}>
        {isAnonymous ? <AlertTriangle size={18} className="text-amber-500 shrink-0" /> : <CheckCircle size={18} className="text-emerald-500 shrink-0" />}
        <p className={`text-sm font-medium ${isAnonymous ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
          {isAnonymous ? t("检测到 VPN / 代理 / 数据中心 IP", "VPN / proxy / datacenter IP detected") : t("正常连接（未检测到 VPN 或代理）", "Normal connection (no VPN/proxy)")}
        </p>
        <Shield size={16} className="ml-auto shrink-0 text-muted" />
      </div>
      <InfoTable title={t("网络信息", "Network")} rows={networkRows} />
      <InfoTable title={t("地理位置", "Location")} rows={locationRows} />
      <InfoTable title={t("隐私检测", "Privacy")} rows={privacyRows} />
    </div>
  );
}
