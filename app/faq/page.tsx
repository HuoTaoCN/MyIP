import { HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "这个网站会记录我的 IP 地址吗？",
    a: "不会。本网站不存储或记录任何用户数据。所有 IP 查询仅在你的浏览器会话中使用，不会被保存到服务器。",
  },
  {
    q: "为什么我的 IP 地理位置不准确？",
    a: "IP 地理位置是基于数据库估算的，并非精确的 GPS 定位。误差可能在城市级别，有时甚至在国家级别。使用 VPN 或代理时，显示的是服务器所在地，而非你的真实位置。",
  },
  {
    q: "什么是 WebRTC 泄漏？",
    a: "WebRTC 是浏览器用于实时通信（如视频通话）的技术。即使使用 VPN，WebRTC 也可能通过 STUN 服务器暴露你的真实本地 IP 或公网 IP。本工具帮助你检测这一潜在泄漏。",
  },
  {
    q: "什么是浏览器指纹？",
    a: "浏览器指纹是通过收集浏览器的各种特征（如 User-Agent、屏幕分辨率、安装的字体、Canvas 渲染等）生成的唯一标识符。即使不使用 Cookie，网站也可以通过指纹追踪用户。",
  },
  {
    q: "如何提高我的在线隐私？",
    a: "可以使用 VPN 隐藏真实 IP、使用隐私浏览器（如 Brave 或配置好的 Firefox）、安装 uBlock Origin 等广告拦截插件、禁用不必要的浏览器功能（如 WebRTC），以及定期清除 Cookie。",
  },
  {
    q: "WHOIS 查询有什么用？",
    a: "WHOIS/RDAP 查询可以获取域名的注册信息，包括注册商、注册时间、到期时间和 DNS 服务器。对于 IP 地址，可以获取该 IP 的所属组织和联系信息，常用于网络安全排查。",
  },
  {
    q: "SSL 证书检查工具能做什么？",
    a: "该工具可以检查任意域名的 SSL/TLS 证书是否有效，显示证书颁发机构、有效期、加密套件等信息，帮助你验证网站的安全性。",
  },
];

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
          <HelpCircle size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-fg">常见问题</h1>
          <p className="text-sm text-muted">关于隐私检测工具的常见疑问解答</p>
        </div>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="surface border-themed rounded-xl p-5">
            <h3 className="font-semibold text-fg mb-2 flex items-start gap-2">
              <span className="text-[var(--accent)] font-bold shrink-0">Q.</span>
              {faq.q}
            </h3>
            <p className="text-sm text-muted leading-relaxed pl-5">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
