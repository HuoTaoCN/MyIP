"use client";
import Link from "next/link";
import { Shield } from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLang } from "@/lib/i18n";

export default function Navbar() {
  const { t } = useLang();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b border-themed bg-[var(--bg)]/70">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Left: logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-fg shrink-0">
          <span className="w-7 h-7 rounded-lg accent-header flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </span>
          <span>MyIP</span>
        </Link>

        {/* Right: nav links + controls, all vertically centered */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link href="/" className="hidden md:inline text-sm text-muted hover:text-fg">
            {t("首页", "Home", { ja: "ホーム", de: "Start", ko: "홈", fr: "Accueil", es: "Inicio", ru: "Главная", vi: "Trang chủ", pt: "Início" })}
          </Link>
          <Link href="/faq" className="hidden md:inline text-sm text-muted hover:text-fg">
            {t("常见问题", "FAQ", { ja: "よくある質問", de: "FAQ", ko: "FAQ" })}
          </Link>
          <Link href="/about" className="hidden md:inline text-sm text-muted hover:text-fg">
            {t("关于", "About", { ja: "概要", de: "Über", ko: "소개", fr: "À propos", es: "Acerca de", ru: "О сайте", vi: "Giới thiệu", pt: "Sobre" })}
          </Link>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}
