import { NextRequest, NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";

export async function GET(req: NextRequest) {
  const uaStr = req.nextUrl.searchParams.get("ua") ?? req.headers.get("user-agent") ?? "";
  const parser = new UAParser(uaStr);
  return NextResponse.json({
    raw: uaStr,
    browser: parser.getBrowser(),
    os: parser.getOS(),
    device: parser.getDevice(),
    engine: parser.getEngine(),
    cpu: parser.getCPU(),
  });
}
