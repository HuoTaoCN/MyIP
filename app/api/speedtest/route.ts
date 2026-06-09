import { NextRequest, NextResponse } from "next/server";

// Streams `bytes` of random-ish data so the client can measure download throughput.
// Capped to avoid abuse. Used by the Speed Test tool.
export async function GET(req: NextRequest) {
  const requested = Number(req.nextUrl.searchParams.get("bytes") ?? 5_000_000);
  const bytes = Math.min(Math.max(requested, 0), 50_000_000); // cap 50 MB

  const chunkSize = 65536;
  const chunk = new Uint8Array(chunkSize);
  for (let i = 0; i < chunkSize; i++) chunk[i] = i & 0xff;

  let remaining = bytes;
  const stream = new ReadableStream({
    pull(controller) {
      if (remaining <= 0) {
        controller.close();
        return;
      }
      const size = Math.min(chunkSize, remaining);
      controller.enqueue(size === chunkSize ? chunk : chunk.subarray(0, size));
      remaining -= size;
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(bytes),
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
