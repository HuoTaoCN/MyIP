"use client";
import { useEffect, useState } from "react";
import InfoTable from "@/components/InfoTable";
import { Search, Loader2, RefreshCw } from "lucide-react";
import { useLang } from "@/lib/i18n";

interface UaData {
  raw: string;
  browser: { name?: string; version?: string };
  os: { name?: string; version?: string };
  device: { type?: string; vendor?: string; model?: string };
  engine: { name?: string; version?: string };
  cpu: { architecture?: string };
}

export default function UserAgentTool() {
  const { t } = useLang();
  const [data, setData] = useState<UaData | null>(null);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchUa(ua?: string) {
    setLoading(true);
    try {
      const url = ua ? `/api/ua?ua=${encodeURIComponent(ua)}` : "/api/ua";
      const res = await fetch(url);
      setData(await res.json());
    } finally { setLoading(false); }
  }
  useEffect(() => { fetchUa(); }, []);

  const rows = data ? [
    { label: t("浏览器", "Browser"), value: [data.browser.name, data.browser.version].filter(Boolean).join(" ") },
    { label: t("操作系统", "OS"), value: [data.os.name, data.os.version].filter(Boolean).join(" ") },
    { label: t("设备类型", "Device"), value: data.device.type ?? t("桌面端", "Desktop") },
    { label: t("设备厂商", "Vendor"), value: data.device.vendor },
    { label: t("设备型号", "Model"), value: data.device.model },
    { label: t("渲染引擎", "Engine"), value: [data.engine.name, data.engine.version].filter(Boolean).join(" ") },
    { label: t("CPU 架构", "CPU arch"), value: data.cpu.architecture },
  ] : [];

  return (
    <div>
      {data && <div className="code-block font-mono text-xs p-3 rounded-xl mb-4 break-all leading-relaxed">{data.raw}</div>}
      {loading ? <div className="flex justify-center py-6"><Loader2 size={22} className="animate-spin text-[var(--accent)]" /></div> : <InfoTable rows={rows} />}
      <div className="mt-4">
        <h4 className="font-semibold text-fg mb-2 text-sm">{t("自定义 UA 测试", "Test a custom UA")}</h4>
        <div className="flex gap-2">
          <input value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchUa(custom)}
            placeholder={t("粘贴任意 User-Agent 字符串…", "Paste any User-Agent string…")}
            className="flex-1 surface-2 border border-themed rounded-xl px-3 py-2 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 font-mono" />
          <button onClick={() => fetchUa(custom)} disabled={loading} className="accent-header px-3 py-2 rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 text-sm"><Search size={14} /> {t("解析", "Parse")}</button>
          <button onClick={() => { setCustom(""); fetchUa(); }} className="surface-2 border border-themed px-3 py-2 rounded-xl text-fg" title={t("重置", "Reset")}><RefreshCw size={14} /></button>
        </div>
      </div>
    </div>
  );
}
