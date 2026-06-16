"use client";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useLang, LANGS } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const current = LANGS.find((o) => o.value === lang)!;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg surface border-themed hover:opacity-80 text-sm text-fg"
      >
        <Globe size={15} />
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown size={13} className="text-muted" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-36 surface border-themed rounded-xl shadow-xl overflow-hidden z-50 py-1">
          {LANGS.map((o) => (
            <button
              key={o.value}
              onClick={() => { setLang(o.value); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-fg hover:surface-2 text-left"
            >
              <span className="flex-1">{o.label}</span>
              {lang === o.value && <Check size={14} className="text-[var(--accent)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
