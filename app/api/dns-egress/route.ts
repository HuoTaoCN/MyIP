import { NextResponse } from "next/server";
import { doh } from "@/lib/doh";

// Google's o-o.myaddr.l.google.com TXT echoes the *resolver's* egress IP (and,
// when present, the EDNS Client Subnet). Note: this reflects the egress of the
// public resolver our request traverses, NOT the visitor's own system DNS — a
// true DNS-egress/leak test needs an authoritative nameserver we control.
export async function GET() {
  try {
    const r = await doh("o-o.myaddr.l.google.com", "TXT");
    const txts = (r.Answer ?? [])
      .filter((a) => a.type === 16)
      .map((a) => a.data.replace(/^"|"$/g, "").trim());

    const ipRe = /^(\d{1,3}\.){3}\d{1,3}$|^[0-9a-fA-F:]+$/;
    const resolverEgress = txts.find((x) => ipRe.test(x));
    const ecsLine = txts.find((x) => x.toLowerCase().startsWith("edns0-client-subnet"));
    const ecs = ecsLine?.replace(/^edns0-client-subnet\s+/i, "");

    return NextResponse.json({ resolverEgress, ecs, raw: txts });
  } catch {
    return NextResponse.json({ error: "lookup_failed" }, { status: 500 });
  }
}
