"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function HttpHeadersTool() {
  const { t } = useLang();
  const [headers, setHeaders] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/headers").then((r) => r.json()).then(setHeaders).finally(() => setLoading(false));
  }, []);

  const sensitive = ["cookie", "authorization"];
  const important = ["user-agent", "accept-language", "accept", "referer", "origin", "host", "x-forwarded-for", "x-real-ip"];
  const entries = headers ? Object.entries(headers) : [];

  if (loading) return <div className="flex items-center justify-center py-8"><Loader2 size={22} className="animate-spin text-[var(--accent)]" /></div>;

  return (
    <div>
      <p className="text-sm text-muted mb-3">{t(`共检测到 ${entries.length} 个请求头`, `${entries.length} headers detected`)}</p>
      <div className="surface-2 border border-themed rounded-xl overflow-hidden divide-y divide-[var(--border)]">
        {entries.map(([key, value]) => {
          const isImportant = important.includes(key.toLowerCase());
          const isSensitive = sensitive.includes(key.toLowerCase());
          return (
            <div key={key} className="flex items-start px-4 py-2.5 gap-4">
              <span className={`font-mono text-xs w-44 shrink-0 pt-0.5 ${isImportant ? "text-[var(--accent)] font-semibold" : "text-muted"}`}>{key}</span>
              <span className={`font-mono text-xs break-all ${isSensitive ? "text-red-400" : "text-fg"}`}>{isSensitive ? t("***（已脱敏）", "*** (redacted)") : value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
