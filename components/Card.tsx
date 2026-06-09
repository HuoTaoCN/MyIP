"use client";
import { ReactNode, useState } from "react";
import { Info, Copy, Check, ChevronDown, LucideIcon } from "lucide-react";

interface CardProps {
  id?: string;
  title: string;
  info?: string;
  icon?: LucideIcon;
  accent?: boolean;
  copyValue?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function Card({
  id, title, info, icon: Icon, copyValue, defaultOpen = true, children,
}: CardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [showInfo, setShowInfo] = useState(false);
  const [copied, setCopied] = useState(false);

  function copy() {
    if (!copyValue) return;
    navigator.clipboard?.writeText(copyValue).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <section
      id={id}
      className="surface rounded-2xl overflow-hidden shadow-sm scroll-mt-24 border-themed"
    >
      <header className="card-head flex items-center gap-2.5 px-4 py-3 border-b border-themed">
        {Icon && (
          <span className="w-8 h-8 rounded-lg bg-[var(--accent)]/12 text-[var(--accent)] flex items-center justify-center shrink-0">
            <Icon size={16} />
          </span>
        )}
        <h3 className="font-semibold text-[15px] text-fg">{title}</h3>

        {info && (
          <div className="relative">
            <button
              onMouseEnter={() => setShowInfo(true)}
              onMouseLeave={() => setShowInfo(false)}
              onClick={() => setShowInfo((v) => !v)}
              className="text-muted hover:text-[var(--accent)] flex"
              aria-label="info"
            >
              <Info size={14} />
            </button>
            {showInfo && (
              <div className="absolute left-0 top-6 z-30 w-60 text-xs leading-relaxed surface border-themed text-fg rounded-lg px-3 py-2 shadow-xl">
                {info}
              </div>
            )}
          </div>
        )}

        <div className="ml-auto flex items-center gap-1">
          {copyValue && (
            <button onClick={copy} className="p-1.5 rounded-md text-muted hover:surface-2" aria-label="copy">
              {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
            </button>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="p-1.5 rounded-md text-muted hover:surface-2"
            aria-label="toggle"
          >
            <ChevronDown size={16} className={`transition-transform duration-300 ${open ? "" : "-rotate-90"}`} />
          </button>
        </div>
      </header>

      <div
        className="grid transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="p-4">{children}</div>
        </div>
      </div>
    </section>
  );
}
