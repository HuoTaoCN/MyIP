"use client";
import Card from "@/components/Card";
import SummaryDashboard from "@/components/SummaryDashboard";
import { TOOLS, CATEGORIES } from "@/components/toolsRegistry";
import { useLang, pick } from "@/lib/i18n";

export default function HomeContent() {
  const { t, lang } = useLang();

  return (
    <div className="max-w-6xl mx-auto px-4 pt-8 pb-6 space-y-10">
      {/* Primary content — shown immediately */}
      <SummaryDashboard />

      {/* Secondary content — grouped, collapsed, expand on click */}
      {CATEGORIES.map((cat, i) => {
        const tools = TOOLS.filter((tool) => tool.category === cat.key);
        const Icon = cat.icon;
        return (
          <section key={cat.key} className="scroll-mt-20">
            <div className="accent-header flex items-center gap-3.5 rounded-2xl px-4 sm:px-5 py-3.5 mb-5 shadow-sm">
              <span className="w-11 h-11 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
                <Icon size={22} />
              </span>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
                  <span className="opacity-60 font-bold mr-2">{String(i + 1).padStart(2, "0")}</span>
                  {pick(lang, cat.title)}
                </h2>
                <p className="text-xs sm:text-sm text-white/80 truncate">{pick(lang, cat.description)}</p>
              </div>
              <span className="ml-auto shrink-0 text-sm font-semibold text-white bg-white/20 rounded-full px-3 py-1">
                {tools.length}
              </span>
            </div>

            <div className="masonry columns-1 md:columns-2">
              {tools.map((tool) => {
                const Tool = tool.Component;
                return (
                  <Card
                    key={tool.slug}
                    id={tool.slug}
                    icon={tool.icon}
                    accent={tool.accent}
                    title={pick(lang, tool.title)}
                    description={pick(lang, tool.description)}
                    info={pick(lang, tool.info)}
                  >
                    <Tool />
                  </Card>
                );
              })}
            </div>
          </section>
        );
      })}

      <p className="text-center text-xs text-muted pt-2">
        {t(
          "数据由 ip-api.com 与公共 RDAP / DNSBL 服务提供 · 所有浏览器检测均在你的设备本地完成",
          "Data via ip-api.com & public RDAP / DNSBL services · All browser checks run locally on your device",
          {
            ja: "データは ip-api.com と公開 RDAP / DNSBL サービスより · ブラウザ検査はすべて端末上で実行",
            de: "Daten via ip-api.com & öffentliche RDAP / DNSBL-Dienste · Alle Browser-Checks laufen lokal",
            ko: "데이터 제공: ip-api.com 및 공개 RDAP / DNSBL · 모든 브라우저 검사는 기기에서 로컬 실행",
            fr: "Données via ip-api.com et services publics RDAP / DNSBL · Toutes les vérifications du navigateur s'exécutent localement",
            es: "Datos vía ip-api.com y servicios públicos RDAP / DNSBL · Todas las comprobaciones del navegador se ejecutan localmente",
            ru: "Данные через ip-api.com и публичные сервисы RDAP / DNSBL · Все проверки браузера выполняются локально",
            vi: "Dữ liệu qua ip-api.com và dịch vụ công khai RDAP / DNSBL · Mọi kiểm tra trình duyệt chạy cục bộ trên thiết bị của bạn",
            pt: "Dados via ip-api.com e serviços públicos RDAP / DNSBL · Todas as verificações do navegador são feitas localmente",
          }
        )}
      </p>
    </div>
  );
}
