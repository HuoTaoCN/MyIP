"use client";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function DualStackTool() {
  const { t } = useLang();
  const [v4, setV4] = useState<string | null | undefined>(undefined);
  const [v6, setV6] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    // Fetch with a timeout so an IPv6-less network doesn't leave a hanging request.
    function fetchWithTimeout(url: string, ms = 6000) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), ms);
      return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
    }
    fetchWithTimeout("https://api.ipify.org?format=json").then((r) => r.json()).then((d) => setV4(d.ip)).catch(() => setV4(null));
    fetchWithTimeout("https://api6.ipify.org?format=json").then((r) => r.json()).then((d) => setV6(d.ip)).catch(() => setV6(null));
  }, []);

  function Row({ label, value, hint }: { label: string; value: string | null | undefined; hint: string }) {
    return (
      <div className="surface-2 border border-themed rounded-xl px-4 py-3 flex items-center gap-3">
        {value === undefined ? <Loader2 size={18} className="animate-spin text-muted shrink-0" />
          : value ? <CheckCircle size={18} className="text-emerald-500 shrink-0" /> : <XCircle size={18} className="text-red-400 shrink-0" />}
        <div className="min-w-0">
          <p className="text-xs text-muted">{label}</p>
          <p className="font-mono font-semibold text-fg break-all">{value === undefined ? t("检测中…", "Detecting…") : value ?? t("不可用", "Unavailable")}</p>
        </div>
        <span className="ml-auto text-xs text-muted shrink-0">{hint}</span>
      </div>
    );
  }

  const dualStack = v4 && v6;

  return (
    <div className="space-y-3">
      <Row label={t("IPv4 地址", "IPv4 address")} value={v4} hint={t("传统", "Legacy")} />
      <Row label={t("IPv6 地址", "IPv6 address")} value={v6} hint={t("新一代", "Modern")} />
      {(v4 !== undefined && v6 !== undefined) && (
        <div className={`rounded-xl p-3 text-sm border ${dualStack ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"}`}>
          {dualStack ? t("✓ 你的网络同时支持 IPv4 与 IPv6（双栈）", "✓ Your network supports both IPv4 and IPv6 (dual-stack)")
            : v6 ? t("仅 IPv6 可用", "IPv6 only") : t("仅 IPv4 可用 —— 你的网络尚未启用 IPv6", "IPv4 only — IPv6 is not enabled on your network")}
        </div>
      )}
    </div>
  );
}
