import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const result: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    result[key] = value;
  });
  return NextResponse.json(result);
}
