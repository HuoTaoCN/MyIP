"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "zh" | "en" | "de" | "fr" | "es" | "ja" | "ko" | "ru" | "vi" | "pt";

export const LANGS: { value: Lang; label: string; flag: string }[] = [
  { value: "zh", label: "简体中文", flag: "🇨🇳" },
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "de", label: "Deutsch", flag: "🇩🇪" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "es", label: "Español", flag: "🇪🇸" },
  { value: "ja", label: "日本語", flag: "🇯🇵" },
  { value: "ko", label: "한국어", flag: "🇰🇷" },
  { value: "ru", label: "Русский", flag: "🇷🇺" },
  { value: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { value: "pt", label: "Português", flag: "🇵🇹" },
];

// A multilingual string: zh + en are required, others optional (fall back to en).
export type ML = { zh: string; en: string } & Partial<Record<Lang, string>>;

export function pick(lang: Lang, obj: ML): string {
  return obj[lang] ?? obj.en;
}

type Extra = Partial<Record<Lang, string>>;

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  // t(zh, en, extra?) — zh/en required; ja/de/ko fall back to en unless given in `extra`.
  t: (zh: string, en: string, extra?: Extra) => string;
}

const Ctx = createContext<LangCtx>({ lang: "zh", setLang: () => {}, t: (zh) => zh });

function detectLang(): Lang {
  if (typeof navigator === "undefined") return "zh";
  const l = navigator.language.toLowerCase();
  if (l.startsWith("zh")) return "zh";
  if (l.startsWith("ja")) return "ja";
  if (l.startsWith("de")) return "de";
  if (l.startsWith("ko")) return "ko";
  if (l.startsWith("fr")) return "fr";
  if (l.startsWith("es")) return "es";
  if (l.startsWith("ru")) return "ru";
  if (l.startsWith("vi")) return "vi";
  if (l.startsWith("pt")) return "pt";
  return "en";
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("zh");

  useEffect(() => {
    const saved = (typeof localStorage !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    if (saved && LANGS.some((l) => l.value === saved)) setLangState(saved);
    else setLangState(detectLang());
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
      document.documentElement.lang = l === "zh" ? "zh-CN" : l;
    } catch { /* ignore */ }
  }

  const t = (zh: string, en: string, extra?: Extra) => {
    if (extra && extra[lang]) return extra[lang]!;
    if (lang === "zh") return zh;
    return en;
  };

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
