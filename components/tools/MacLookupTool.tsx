"use client";
import { useState } from "react";
import { Search, Loader2, Cpu } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function MacLookupTool() {
  const { t } = useLang();
  const [mac, setMac] = useState("");
  const [result, setResult] = useState<{ vendor: string | null; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookup() {
    if (!mac.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch(`/api/mac?addr=${encodeURIComponent(mac.trim())}`);
      setResult(await res.json());
    } catch { setResult({ vendor: null, error: t("请求失败", "Request failed") }); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input value={mac} onChange={(e) => setMac(e.target.value)} onKeyDown={(e) => e.key === "Enter" && lookup()}
          placeholder={t("输入 MAC 地址（如 00:1A:2B:3C:4D:5E）", "Enter a MAC (e.g. 00:1A:2B:3C:4D:5E)")}
          className="flex-1 surface-2 border border-themed rounded-xl px-4 py-2.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 font-mono" />
        <button onClick={lookup} disabled={loading} className="accent-header px-4 py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 text-sm">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />} {t("查询", "Lookup")}
        </button>
      </div>
      {result && (
        result.vendor ? (
          <div className="surface-2 border border-themed rounded-xl p-4 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-[var(--accent)]/12 text-[var(--accent)] flex items-center justify-center shrink-0"><Cpu size={20} /></span>
            <div>
              <p className="text-xs text-muted">{t("设备厂商", "Vendor")}</p>
              <p className="font-semibold text-fg">{result.vendor}</p>
            </div>
          </div>
        ) : <p className="text-muted text-sm">{result.error ?? t("未找到厂商信息", "No vendor found")}</p>
      )}
      <p className="text-xs text-muted mt-3">{t("MAC 地址前 3 字节（OUI）由 IEEE 分配给硬件厂商，可据此识别设备制造商。", "The first 3 bytes (OUI) of a MAC are assigned by IEEE to hardware vendors, identifying the maker.")}</p>
    </div>
  );
}
