import { NextRequest, NextResponse } from "next/server";
import tls from "tls";

export async function GET(req: NextRequest) {
  const host = req.nextUrl.searchParams.get("host")?.trim().replace(/^https?:\/\//, "").split("/")[0] ?? "";
  if (!host) return NextResponse.json({ error: "缺少 host 参数" }, { status: 400 });

  return new Promise<NextResponse>((resolve) => {
    const socket = tls.connect({ host, port: 443, servername: host, timeout: 8000 }, () => {
      const cert = socket.getPeerCertificate(true);
      socket.destroy();

      if (!cert || !cert.subject) {
        resolve(NextResponse.json({ error: "无法获取证书" }, { status: 500 }));
        return;
      }

      resolve(NextResponse.json({
        host,
        subject: cert.subject,
        issuer: cert.issuer,
        validFrom: cert.valid_from,
        validTo: cert.valid_to,
        serialNumber: cert.serialNumber,
        fingerprint: cert.fingerprint,
        fingerprint256: cert.fingerprint256,
        san: cert.subjectaltname ?? "",
        protocol: socket.getProtocol(),
        cipher: socket.getCipher(),
        authorized: socket.authorized,
        authorizationError: socket.authorizationError,
      }));
    });

    socket.on("error", (err) => {
      resolve(NextResponse.json({ error: err.message }, { status: 500 }));
    });

    socket.setTimeout(8000, () => {
      socket.destroy();
      resolve(NextResponse.json({ error: "连接超时" }, { status: 504 }));
    });
  });
}
