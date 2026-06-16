// Shared DNS-over-HTTPS helper. Tries Cloudflare first, then Google as a
// fallback — both return the same JSON shape. Edge-safe (no node:dns), and the
// fallback adds resilience on networks where one resolver is flaky/blocked.

export interface DohAnswer {
  name: string;
  type: number;
  data: string;
  TTL?: number;
}
export interface DohResponse {
  Status: number;
  Answer?: DohAnswer[];
}

const RESOLVERS = [
  (n: string, t: string) => `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(n)}&type=${t}`,
  (n: string, t: string) => `https://dns.google/resolve?name=${encodeURIComponent(n)}&type=${t}`,
];

export async function doh(name: string, type: string): Promise<DohResponse> {
  let lastErr: unknown;
  for (const make of RESOLVERS) {
    try {
      const res = await fetch(make(name, type), {
        headers: { Accept: "application/dns-json" },
        cache: "no-store",
      });
      if (!res.ok) {
        lastErr = new Error(`DoH ${res.status}`);
        continue;
      }
      return (await res.json()) as DohResponse;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("DoH request failed");
}
