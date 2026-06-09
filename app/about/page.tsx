import { Shield, Globe, Lock, Eye } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-[var(--accent)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield size={32} className="text-[var(--accent)]" />
        </div>
        <h1 className="text-3xl font-bold text-fg mb-3">关于 MyIP</h1>
        <p className="text-muted max-w-lg mx-auto">
          MyIP 是一个完全免费的隐私与网络诊断工具包，帮助你了解自己在互联网上留下的数字足迹。
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { icon: Globe, title: "网络透明", desc: "了解你的 IP 地址、ISP 和地理位置信息" },
          { icon: Lock, title: "安全检测", desc: "检测 VPN 泄漏、WebRTC 泄漏和 SSL 安全性" },
          { icon: Eye, title: "指纹分析", desc: "发现网站如何通过浏览器指纹追踪你" },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="surface border-themed rounded-xl p-5 text-center">
            <Icon size={24} className="text-[var(--accent)] mx-auto mb-2" />
            <h3 className="font-semibold text-fg mb-1">{title}</h3>
            <p className="text-xs text-muted">{desc}</p>
          </div>
        ))}
      </div>

      <div className="surface border-themed rounded-xl p-6 space-y-4 text-sm text-muted leading-relaxed">
        <h2 className="font-bold text-fg text-base">我们的承诺</h2>
        <p>
          MyIP 不收集、不存储、不出售任何用户数据。所有检测均在你的浏览器或即时服务器响应中完成，
          不会在我们的服务器上留下任何记录。
        </p>
        <p>
          我们提供的工具包括 IP 地理位置查询、WHOIS 查询、反向 DNS、HTTP 标头分析、User-Agent 解析、
          WebRTC 泄漏检测、SSL 证书检查、浏览器指纹评分以及综合隐私报告。
        </p>
        <p>
          所有功能均免费开放，无需注册账户。IP 地理位置数据由 <a href="http://ip-api.com" className="text-[var(--accent)] hover:underline" target="_blank" rel="noopener noreferrer">ip-api.com</a> 提供，
          WHOIS 数据通过 RDAP 协议获取。
        </p>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="inline-block accent-header px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity">
          开始使用工具
        </Link>
      </div>
    </div>
  );
}
