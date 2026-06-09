"use client";
import { useEffect, useState } from "react";
import InfoTable from "@/components/InfoTable";
import { useLang } from "@/lib/i18n";

export default function LanguageLocaleTool() {
  const { t } = useLang();
  const [info, setInfo] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions();
    const now = new Date();
    const dateTimeFormat = new Intl.DateTimeFormat(navigator.language, { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const numberFormat = new Intl.NumberFormat(navigator.language);
    const currencyFormat = new Intl.NumberFormat(navigator.language, { style: "currency", currency: "USD" });
    setInfo({
      language: navigator.language,
      languages: navigator.languages?.join(", ") ?? navigator.language,
      timezone: tz.timeZone,
      timezoneOffset: `UTC${now.getTimezoneOffset() <= 0 ? "+" : "-"}${Math.abs(now.getTimezoneOffset() / 60)}`,
      locale: tz.locale, calendar: tz.calendar, numberingSystem: tz.numberingSystem,
      dateExample: dateTimeFormat.format(now), numberExample: numberFormat.format(1234567.89), currencyExample: currencyFormat.format(1234.56),
    });
  }, []);

  const rows = info ? [
    { label: t("主要语言", "Primary language"), value: info.language, highlight: true },
    { label: t("首选语言", "Preferred languages"), value: info.languages },
    { label: t("时区", "Timezone"), value: info.timezone },
    { label: t("时区偏移", "UTC offset"), value: info.timezoneOffset },
    { label: t("区域设置", "Locale"), value: info.locale },
    { label: t("日历系统", "Calendar"), value: info.calendar },
    { label: t("数字系统", "Numbering"), value: info.numberingSystem },
    { label: t("日期格式示例", "Date example"), value: info.dateExample },
    { label: t("数字格式示例", "Number example"), value: info.numberExample },
    { label: t("货币格式示例", "Currency example"), value: info.currencyExample },
  ] : [];

  return info ? <InfoTable rows={rows} /> : <p className="text-muted py-5">{t("加载中…", "Loading…")}</p>;
}
