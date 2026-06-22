import { NextRequest } from "next/server";
import { clientIp } from "@/lib/clientIp";

// Plain-text IP echo for terminals: `curl ip.huotao.com/ip`
export async function GET(req: NextRequest) {
  return new Response(clientIp(req) + "\n", {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
    },
  });
}
