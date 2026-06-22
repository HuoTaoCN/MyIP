// Helpers for reading Cloudflare's same-origin /cdn-cgi/trace endpoint from the
// browser. It returns key=value lines including the visitor IP and the edge PoP
// (colo) that served the request.

export interface TraceData {
  ip?: string;
  colo?: string;
  loc?: string;
  http?: string;
  tls?: string;
  warp?: string;
  [k: string]: string | undefined;
}

export async function fetchTrace(): Promise<TraceData> {
  const res = await fetch(`/cdn-cgi/trace?_=${Date.now()}`, { cache: "no-store" });
  const text = await res.text();
  const out: TraceData = {};
  for (const line of text.trim().split("\n")) {
    const i = line.indexOf("=");
    if (i > 0) out[line.slice(0, i)] = line.slice(i + 1);
  }
  return out;
}

// Cloudflare colo (IATA airport) code -> readable city. Falls back to the raw
// code when unknown.
const COLO_CITY: Record<string, { zh: string; en: string }> = {
  LAX: { zh: "洛杉矶", en: "Los Angeles" }, SJC: { zh: "圣何塞", en: "San Jose" },
  SEA: { zh: "西雅图", en: "Seattle" }, ORD: { zh: "芝加哥", en: "Chicago" },
  EWR: { zh: "纽瓦克", en: "Newark" }, IAD: { zh: "华盛顿", en: "Washington" },
  DFW: { zh: "达拉斯", en: "Dallas" }, MIA: { zh: "迈阿密", en: "Miami" },
  HKG: { zh: "香港", en: "Hong Kong" }, NRT: { zh: "东京", en: "Tokyo" },
  KIX: { zh: "大阪", en: "Osaka" }, ICN: { zh: "首尔", en: "Seoul" },
  SIN: { zh: "新加坡", en: "Singapore" }, TPE: { zh: "台北", en: "Taipei" },
  SGN: { zh: "胡志明市", en: "Ho Chi Minh City" }, BKK: { zh: "曼谷", en: "Bangkok" },
  KUL: { zh: "吉隆坡", en: "Kuala Lumpur" }, BOM: { zh: "孟买", en: "Mumbai" },
  FRA: { zh: "法兰克福", en: "Frankfurt" }, LHR: { zh: "伦敦", en: "London" },
  AMS: { zh: "阿姆斯特丹", en: "Amsterdam" }, CDG: { zh: "巴黎", en: "Paris" },
  SOF: { zh: "索菲亚", en: "Sofia" }, MRS: { zh: "马赛", en: "Marseille" },
  SYD: { zh: "悉尼", en: "Sydney" }, MEL: { zh: "墨尔本", en: "Melbourne" },
  GRU: { zh: "圣保罗", en: "São Paulo" }, JNB: { zh: "约翰内斯堡", en: "Johannesburg" },
  DXB: { zh: "迪拜", en: "Dubai" },
};

export function coloCity(colo: string | undefined, zh: boolean): string | undefined {
  if (!colo) return undefined;
  const c = COLO_CITY[colo.toUpperCase()];
  return c ? (zh ? c.zh : c.en) : undefined;
}
