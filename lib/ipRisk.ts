// Derive an IP "type" and a 0–100 risk score from the flags ip-api already
// returns (proxy / hosting / mobile). Datacenter & proxy IPs score high (more
// likely abused / less trusted); residential scores low.

export type IpTypeKey = "residential" | "datacenter" | "mobile" | "proxy";

export interface IpRisk {
  typeKey: IpTypeKey;
  score: number; // 0–100, higher = riskier / less trusted
  level: "low" | "medium" | "high";
}

export function assessIp(flags: { proxy?: boolean; hosting?: boolean; mobile?: boolean }): IpRisk {
  const { proxy, hosting, mobile } = flags;

  const typeKey: IpTypeKey = proxy ? "proxy" : hosting ? "datacenter" : mobile ? "mobile" : "residential";

  let score = 10;
  if (hosting) score += 40;
  if (proxy) score += 45;
  if (mobile) score += 5;
  score = Math.min(100, score);

  const level = score >= 60 ? "high" : score >= 30 ? "medium" : "low";
  return { typeKey, score, level };
}
