"use client";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { Sun, Moon, Monitor, Check, ChevronDown } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useLang();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const options = [
    { value: "system", label: t("跟随系统", "System", { ja: "システム", de: "System", ko: "시스템" }), icon: Monitor },
    { value: "light", label: t("浅色", "Light", { ja: "ライト", de: "Hell", ko: "라이트" }), icon: Sun },
    { value: "dark", label: t("深色", "Dark", { ja: "ダーク", de: "Dunkel", ko: "다크" }), icon: Moon },
  ];

  const current = options.find((o) => o.value === theme) ?? options[0];
  const CurrentIcon = mounted ? current.icon : Monitor;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg surface border-themed hover:opacity-80 text-sm text-fg"
        aria-label={t("切换主题", "Toggle theme")}
      >
        <CurrentIcon size={16} />
        <ChevronDown size={13} className="text-muted" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 surface border-themed rounded-xl shadow-xl overflow-hidden z-50 py-1">
          {options.map((o) => {
            const Icon = o.icon;
            const active = mounted && theme === o.value;
            return (
              <button
                key={o.value}
                onClick={() => { setTheme(o.value); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-fg hover:surface-2 text-left"
              >
                <Icon size={15} className="text-muted" />
                <span className="flex-1">{o.label}</span>
                {active && <Check size={14} className="text-[var(--accent)]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
