"use client";
import Link from "next/link";
import { Shield } from "lucide-react";
import { useLang, pick } from "@/lib/i18n";
import { TOOLS, CATEGORIES } from "@/components/toolsRegistry";

export default function Footer() {
  const { t, lang } = useLang();
  return (
    <footer className="border-t border-themed mt-12 surface">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Tools grouped by category */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 mb-8">
          {CATEGORIES.map((cat) => (
            <div key={cat.key}>
              <h4 className="text-sm font-semibold text-fg mb-3">{pick(lang, cat.title)}</h4>
              <ul className="space-y-1.5">
                {TOOLS.filter((tool) => tool.category === cat.key).map((tool) => (
                  <li key={tool.slug}>
                    <Link href={`/#${tool.slug}`} className="text-sm text-muted hover:text-fg">
                      {pick(lang, tool.title)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Site links */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted mb-6 pt-6 border-t border-themed">
          <Link href="/" className="hover:text-fg">{t("首页", "Home", { ja: "ホーム", de: "Start", ko: "홈" })}</Link>
          <Link href="/faq" className="hover:text-fg">{t("常见问题", "FAQ", { ja: "よくある質問", de: "FAQ", ko: "FAQ" })}</Link>
          <Link href="/about" className="hover:text-fg">{t("关于", "About", { ja: "概要", de: "Über", ko: "소개" })}</Link>
          <Link href="/privacy-policy" className="hover:text-fg">{t("隐私政策", "Privacy Policy", { ja: "プライバシーポリシー", de: "Datenschutz", ko: "개인정보 처리방침" })}</Link>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-fg font-bold">
            <Shield size={16} className="text-[var(--accent)]" />
            MyIP
          </div>
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} MyIP · {t("免费隐私与网络工具包", "Free Privacy & Network Toolkit", { ja: "無料プライバシー＆ネットワークツールキット", de: "Kostenloses Privatsphäre- & Netzwerk-Toolkit", ko: "무료 개인정보 및 네트워크 도구" })}
          </p>
        </div>
      </div>
    </footer>
  );
}
