import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Constellation from "@/components/Constellation";

export const metadata: Metadata = {
  title: "MyIP · 隐私与网络工具包",
  description: "一站式检查你的 IP 地址、浏览器指纹、WebRTC 泄漏、地理位置、SSL 证书等数字足迹与隐私信息。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col relative">
        <Providers>
          <Constellation />
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
