"use client";
import { useEffect, useState } from "react";
import { Shield, Lock, Eye, Zap } from "lucide-react";
import Card from "@/components/Card";
import { TOOLS } from "@/components/toolsRegistry";
import { useLang } from "@/lib/i18n";

export default function HomeContent() {
  const { t, lang } = useLang();
  const [ip, setIp] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/my-ip")
      .then((r) => r.json())
      .then((d) => setIp(d.query ?? d.ip ?? null))
      .catch(() => setIp(null));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 pt-14 pb-8 text-center">
        <div className="inline-flex items-center gap-2 surface border-themed px-3 py-1 rounded-full text-xs text-[var(--accent)] mb-5">
          <Shield size={13} /> {t("免费 · 无需注册 · 不记录数据", "Free · No signup · No logging")}
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight text-fg">
          {t("隐私与网络工具包", "Privacy & Network Toolkit")}
        </h1>
        <p className="text-lg text-muted mb-7 max-w-xl mx-auto">
          {t(
            "一站式检查你的数字足迹 —— IP、浏览器指纹、WebRTC 泄漏、地理位置、SSL 证书等隐私信息。",
            "Check your entire digital footprint in one place — IP, browser fingerprint, WebRTC leaks, geolocation, SSL and more."
          )}
        </p>

        <div className="inline-flex items-center gap-3 surface border-themed rounded-2xl px-6 py-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-muted">{t("你的 IP", "Your IP")}</span>
          <span className="font-mono font-bold text-fg text-lg">{ip ?? t("检测中…", "Detecting…")}</span>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-7 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5"><Zap size={15} className="text-[var(--accent)]" /> {t("即时检测", "Instant")}</span>
          <span className="inline-flex items-center gap-1.5"><Lock size={15} className="text-emerald-500" /> {t("本地运行", "Runs locally")}</span>
          <span className="inline-flex items-center gap-1.5"><Eye size={15} className="text-[var(--accent-2)]" /> {t("隐私优先", "Privacy-first")}</span>
        </div>
      </section>

      {/* Masonry grid of tool cards */}
      <section className="max-w-7xl mx-auto px-4 pb-6 masonry columns-1 md:columns-2 xl:columns-3">
        {TOOLS.map((tool) => {
          const Tool = tool.Component;
          return (
            <Card
              key={tool.slug}
              id={tool.slug}
              icon={tool.icon}
              accent={tool.accent}
              title={lang === "zh" ? tool.title.zh : tool.title.en}
              info={lang === "zh" ? tool.info.zh : tool.info.en}
            >
              <Tool />
            </Card>
          );
        })}
      </section>

      <p className="text-center text-xs text-muted pb-10">
        {t(
          "数据由 ip-api.com 与公共 RDAP 服务提供 · 所有浏览器检测均在你的设备本地完成",
          "Data via ip-api.com & public RDAP services · All browser checks run locally on your device"
        )}
      </p>
    </div>
  );
}
