"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "zh" | "en";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (zh: string, en: string) => string;
}

const Ctx = createContext<LangCtx>({ lang: "zh", setLang: () => {}, t: (zh) => zh });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("zh");

  useEffect(() => {
    const saved = (typeof localStorage !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    if (saved === "zh" || saved === "en") {
      setLangState(saved);
    } else if (typeof navigator !== "undefined" && !navigator.language.toLowerCase().startsWith("zh")) {
      setLangState("en");
    }
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
      document.documentElement.lang = l === "zh" ? "zh-CN" : "en";
    } catch { /* ignore */ }
  }

  const t = (zh: string, en: string) => (lang === "zh" ? zh : en);

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
