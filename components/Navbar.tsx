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
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
        {/* Left: theme switcher (per request) + logo */}
        <ThemeSwitcher />
        <Link href="/" className="flex items-center gap-2 font-bold text-fg">
          <span className="w-7 h-7 rounded-lg accent-header flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </span>
          <span className="hidden sm:inline">MyIP</span>
        </Link>

        <nav className="ml-auto flex items-center gap-3">
          <Link href="/" className="hidden md:inline text-sm text-muted hover:text-fg">
            {t("首页", "Home")}
          </Link>
          <Link href="/faq" className="hidden md:inline text-sm text-muted hover:text-fg">
            {t("常见问题", "FAQ")}
          </Link>
          <Link href="/about" className="hidden md:inline text-sm text-muted hover:text-fg">
            {t("关于", "About")}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
