"use client";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Info, Copy, Check, ChevronDown, LucideIcon } from "lucide-react";

interface CardProps {
  id?: string;
  title: string;
  description?: string;
  info?: string;
  icon?: LucideIcon;
  accent?: boolean;
  copyValue?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function Card({
  id, title, description, info, icon: Icon, copyValue, defaultOpen = false, children,
}: CardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [showInfo, setShowInfo] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // Open + scroll to this card when its anchor (#id) is targeted, so links from
  // the navbar/footer reveal the collapsed card instead of landing on a header.
  useEffect(() => {
    if (!id) return;
    function syncToHash() {
      if (window.location.hash === `#${id}`) {
        setOpen(true);
        ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    syncToHash();
    window.addEventListener("hashchange", syncToHash);
    return () => window.removeEventListener("hashchange", syncToHash);
  }, [id]);

  function copy(e: React.MouseEvent) {
    e.stopPropagation();
    if (!copyValue) return;
    navigator.clipboard?.writeText(copyValue).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <section
      id={id}
      ref={ref}
      className="surface rounded-2xl overflow-hidden shadow-sm scroll-mt-20 border-themed"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="card-head w-full flex items-center gap-2.5 px-4 py-3 text-left border-b border-themed"
      >
        {Icon && (
          <span className="w-8 h-8 rounded-lg bg-[var(--accent)]/12 text-[var(--accent)] flex items-center justify-center shrink-0">
            <Icon size={16} />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="font-bold text-[15px] text-fg tracking-tight truncate">{title}</h3>
          {description && !open && (
            <p className="text-xs text-muted truncate">{description}</p>
          )}
        </div>

        {info && (
          <span
            className="relative text-muted hover:text-[var(--accent)] flex shrink-0"
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
            onClick={(e) => { e.stopPropagation(); setShowInfo((v) => !v); }}
            aria-label="info"
          >
            <Info size={14} />
            {showInfo && (
              <span className="absolute left-0 top-6 z-30 w-60 text-xs leading-relaxed font-normal surface border-themed text-fg rounded-lg px-3 py-2 shadow-xl">
                {info}
              </span>
            )}
          </span>
        )}

        <span className="ml-auto flex items-center gap-1 shrink-0">
          {copyValue && (
            <span onClick={copy} className="p-1.5 rounded-md text-muted hover:surface-2" aria-label="copy">
              {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
            </span>
          )}
          <ChevronDown size={16} className={`transition-transform duration-300 text-muted ${open ? "" : "-rotate-90"}`} />
        </span>
      </button>

      <div
        className="grid transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="p-4">{open && children}</div>
        </div>
      </div>
    </section>
  );
}
