"use client";
import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";

const TYPES = ["A", "AAAA", "CNAME", "MX", "TXT", "NS"];
const RECORD_TYPE_NAMES: Record<number, string> = {
  1: "A", 2: "NS", 5: "CNAME", 15: "MX", 16: "TXT", 28: "AAAA", 6: "SOA",
};

interface Answer { name: string; type: number; TTL: number; data: string; }

export default function DnsResolverTool() {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [type, setType] = useState("A");
  const [answers, setAnswers] = useState<Answer[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function resolve() {
    const domain = name.trim().replace(/^https?:\/\//, "").split("/")[0];
    if (!domain) return;
    setLoading(true); setError(""); setAnswers(null);
    try {
      const res = await fetch(`/api/dns?name=${encodeURIComponent(domain)}&type=${type}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setAnswers(json.Answer ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("查询失败", "Lookup failed"));
    } finally { setLoading(false); }
  }

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && resolve()}
          placeholder={t("输入域名（如 github.com）", "Enter a domain (e.g. github.com)")}
          className="flex-1 surface-2 border border-themed rounded-xl px-4 py-2.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40" />
        <button onClick={resolve} disabled={loading} className="accent-header px-4 py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 text-sm">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />} {t("解析", "Resolve")}
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {TYPES.map((tp) => (
          <button key={tp} onClick={() => setType(tp)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${type === tp ? "accent-header border-transparent" : "surface-2 border-themed text-muted hover:text-fg"}`}>
            {tp}
          </button>
        ))}
      </div>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      {answers && (
        answers.length > 0 ? (
          <div className="surface-2 border border-themed rounded-xl overflow-hidden divide-y divide-[var(--border)]">
            {answers.map((a, i) => (
              <div key={i} className="flex items-start px-4 py-2.5 gap-3">
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-[var(--accent)]/12 text-[var(--accent)] shrink-0">{RECORD_TYPE_NAMES[a.type] ?? a.type}</span>
                <span className="text-sm font-mono text-fg break-all flex-1">{a.data}</span>
                <span className="text-xs text-muted shrink-0">TTL {a.TTL}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-muted text-sm">{t("没有找到该类型的记录", "No records of this type")}</p>
      )}
    </div>
  );
}
