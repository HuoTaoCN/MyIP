// Two-letter country code -> flag emoji (regional indicator symbols).
export function flag(cc?: string): string {
  if (!cc || cc.length !== 2 || !/^[a-zA-Z]{2}$/.test(cc)) return "🏳️";
  const A = 0x1f1e6;
  return String.fromCodePoint(...[...cc.toUpperCase()].map((c) => A + c.charCodeAt(0) - 65));
}
