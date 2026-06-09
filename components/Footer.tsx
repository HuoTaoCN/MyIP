"use client";
import Link from "next/link";
import { Shield } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { TOOLS } from "@/components/toolsRegistry";

export default function Footer() {
  const { t, lang } = useLang();
  return (
    <footer className="border-t border-themed mt-12 surface">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted mb-6">
          <Link href="/" className="hover:text-fg">{t("首页", "Home")}</Link>
          {TOOLS.map((tool) => (
            <Link key={tool.slug} href={`/#${tool.slug}`} className="hover:text-fg">
              {lang === "zh" ? tool.title.zh : tool.title.en}
            </Link>
          ))}
          <Link href="/faq" className="hover:text-fg">{t("常见问题", "FAQ")}</Link>
          <Link href="/about" className="hover:text-fg">{t("关于", "About")}</Link>
          <Link href="/privacy-policy" className="hover:text-fg">{t("隐私政策", "Privacy Policy")}</Link>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-themed">
          <div className="flex items-center gap-2 text-fg font-bold">
            <Shield size={16} className="text-[var(--accent)]" />
            MyIP
          </div>
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} MyIP · {t("免费隐私与网络工具包", "Free Privacy & Network Toolkit")}
          </p>
        </div>
      </div>
    </footer>
  );
}
