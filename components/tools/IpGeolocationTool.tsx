"use client";
import { useState } from "react";
import InfoTable from "@/components/InfoTable";
import { Search, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useLang } from "@/lib/i18n";

const IpMap = dynamic(() => import("@/components/IpMap"), { ssr: false });

interface GeoData {
  query: string; country: string; countryCode: string; regionName: string; region: string;
  city: string; zip: string; lat: number; lon: number; timezone: string; isp: string; org: string;
  as: string; asname: string; proxy: boolean; hosting: boolean; mobile: boolean; status: string; message?: string;
}

export default function IpGeolocationTool() {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [data, setData] = useState<GeoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function lookup(ip?: string) {
    const target = ip ?? query.trim();
    if (!target) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/geoip?ip=${encodeURIComponent(target)}`);
      const json = await res.json();
      if (json.status === "fail") throw new Error(json.message ?? t("查询失败", "Lookup failed"));
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("查询失败", "Lookup failed"));
    } finally { setLoading(false); }
  }

  async function lookupMyIp() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/my-ip");
      const json = await res.json();
      setQuery(json.query ?? json.ip ?? "");
      setData(json);
    } catch { setError(t("无法获取当前 IP", "Could not fetch your IP")); }
    finally { setLoading(false); }
  }

  const rows = data ? [
    { label: t("IP 地址", "IP Address"), value: data.query, highlight: true },
    { label: t("国家", "Country"), value: data.country ? `${data.country} (${data.countryCode})` : undefined },
    { label: t("省/州", "Region"), value: data.regionName ? `${data.regionName} (${data.region})` : undefined },
    { label: t("城市", "City"), value: data.city },
    { label: t("邮政编码", "ZIP"), value: data.zip },
    { label: t("经纬度", "Lat/Long"), value: data.lat ? `${data.lat}, ${data.lon}` : undefined },
    { label: t("时区", "Timezone"), value: data.timezone },
    { label: "ISP", value: data.isp },
    { label: t("组织", "Org"), value: data.org },
    { label: "AS", value: data.as },
    { label: t("代理/VPN", "Proxy/VPN"), value: data.proxy ? t("是", "Yes") : t("否", "No") },
    { label: t("数据中心", "Datacenter"), value: data.hosting ? t("是", "Yes") : t("否", "No") },
  ] : [];

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && lookup()}
          placeholder={t("输入 IP 地址（如 8.8.8.8）", "Enter an IP (e.g. 8.8.8.8)")}
          className="flex-1 surface-2 border border-themed rounded-xl px-4 py-2.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40" />
        <button onClick={() => lookup()} disabled={loading}
          className="accent-header px-4 py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 text-sm">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />} {t("查询", "Lookup")}
        </button>
      </div>
      <button onClick={lookupMyIp} className="text-sm text-[var(--accent)] hover:underline mb-4 block">{t("查询我的 IP", "Look up my IP")}</button>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      {data && (
        <div className="space-y-3">
          {data.lat && data.lon && (
            <div className="rounded-xl overflow-hidden h-56 border border-themed">
              <IpMap lat={data.lat} lon={data.lon} label={`${data.city}, ${data.country}`} />
            </div>
          )}
          <InfoTable rows={rows} />
        </div>
      )}
    </div>
  );
}
