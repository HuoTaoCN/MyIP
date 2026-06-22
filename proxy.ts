import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Make `curl ip.huotao.com` (bare root) return the plain-text IP, like ipin.io.
// Browsers get the normal page; CLI clients get rewritten to /api/ip.
const CLI_UA = /\b(curl|wget|httpie|HTTPie|powershell|python-requests|libwww-perl|Go-http-client)\b/i;

export function proxy(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  if (CLI_UA.test(ua)) {
    return NextResponse.rewrite(new URL("/api/ip", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Only intercept the root path; everything else is untouched.
  matcher: "/",
};
