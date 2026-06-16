import {
  Globe, MapPin, Search, RotateCcw, List, Monitor, Languages,
  Smartphone, Wifi, Radio, Lock, Fingerprint, ShieldCheck, ShieldAlert, LucideIcon,
  Network, Boxes, Gauge, Download, Globe2, Cpu,
} from "lucide-react";
import type { ComponentType } from "react";
import type { ML } from "@/lib/i18n";

import MyIpTool from "@/components/tools/MyIpTool";
import IpGeolocationTool from "@/components/tools/IpGeolocationTool";
import WhoisTool from "@/components/tools/WhoisTool";
import ReverseDnsTool from "@/components/tools/ReverseDnsTool";
import HttpHeadersTool from "@/components/tools/HttpHeadersTool";
import UserAgentTool from "@/components/tools/UserAgentTool";
import LanguageLocaleTool from "@/components/tools/LanguageLocaleTool";
import ScreenDeviceTool from "@/components/tools/ScreenDeviceTool";
import ConnectionInfoTool from "@/components/tools/ConnectionInfoTool";
import WebRtcLeakTool from "@/components/tools/WebRtcLeakTool";
import SslTlsTool from "@/components/tools/SslTlsTool";
import BrowserFingerprintTool from "@/components/tools/BrowserFingerprintTool";
import PrivacyAssessmentTool from "@/components/tools/PrivacyAssessmentTool";
import DnsResolverTool from "@/components/tools/DnsResolverTool";
import DualStackTool from "@/components/tools/DualStackTool";
import LatencyTool from "@/components/tools/LatencyTool";
import SpeedTestTool from "@/components/tools/SpeedTestTool";
import AvailabilityTool from "@/components/tools/AvailabilityTool";
import MacLookupTool from "@/components/tools/MacLookupTool";
import IpReputationTool from "@/components/tools/IpReputationTool";

export type CategoryKey = "ip-network" | "privacy-security" | "browser-device" | "diagnostics";

export interface CategoryDef {
  key: CategoryKey;
  icon: LucideIcon;
  title: ML;
  description: ML;
}

export const CATEGORIES: CategoryDef[] = [
  {
    key: "ip-network", icon: Globe,
    title: { zh: "IP 与网络", en: "IP & Network", ja: "IP とネットワーク", de: "IP & Netzwerk", ko: "IP 및 네트워크" },
    description: { zh: "你的公网身份与归属信息", en: "Your public identity and ownership info", ja: "公開アイデンティティと所属情報", de: "Öffentliche Identität & Zuordnung", ko: "공개 신원 및 소속 정보" },
  },
  {
    key: "privacy-security", icon: ShieldCheck,
    title: { zh: "隐私与安全", en: "Privacy & Security", ja: "プライバシーとセキュリティ", de: "Datenschutz & Sicherheit", ko: "개인정보 및 보안" },
    description: { zh: "泄漏、指纹与声誉风险检测", en: "Leaks, fingerprinting & reputation risks", ja: "漏洩・フィンガープリント・評価リスク", de: "Leaks, Fingerprinting & Reputationsrisiken", ko: "누출·지문·평판 위험" },
  },
  {
    key: "browser-device", icon: Monitor,
    title: { zh: "浏览器与设备", en: "Browser & Device", ja: "ブラウザとデバイス", de: "Browser & Gerät", ko: "브라우저 및 기기" },
    description: { zh: "浏览器、系统与硬件暴露的信息", en: "What your browser, OS & hardware reveal", ja: "ブラウザ・OS・ハードウェアが明かす情報", de: "Was Browser, OS & Hardware preisgeben", ko: "브라우저·OS·하드웨어가 드러내는 정보" },
  },
  {
    key: "diagnostics", icon: Gauge,
    title: { zh: "网络诊断", en: "Network Diagnostics", ja: "ネットワーク診断", de: "Netzwerkdiagnose", ko: "네트워크 진단" },
    description: { zh: "解析、延迟、速度与可达性", en: "Resolution, latency, speed & reachability", ja: "解決・遅延・速度・到達性", de: "Auflösung, Latenz, Tempo & Erreichbarkeit", ko: "해석·지연·속도·도달성" },
  },
];

export interface ToolDef {
  slug: string;
  category: CategoryKey;
  icon: LucideIcon;
  title: ML;
  description: ML;
  info: ML;
  accent?: boolean;
  Component: ComponentType;
}

export const TOOLS: ToolDef[] = [
  // ───────────────────────── ① IP 与网络 ─────────────────────────
  {
    slug: "my-ip", category: "ip-network", icon: Globe, accent: true,
    title: { zh: "IP 地址", en: "IP Address", ja: "IPアドレス", de: "IP-Adresse", ko: "IP 주소" },
    description: { zh: "公网 IP、ISP、ASN 及 VPN/代理检测", en: "Public IP, ISP, ASN & VPN/proxy detection" },
    info: { zh: "显示你当前的公网 IP 地址，以及所属的 ISP、自治系统(ASN)和是否经过 VPN/代理/数据中心。这是网站识别你的首要标识。", en: "Shows your current public IP address, ISP, autonomous system (ASN), and whether it routes through a VPN/proxy/datacenter — the primary way sites identify you." },
    Component: MyIpTool,
  },
  {
    slug: "ip-geolocation", category: "ip-network", icon: MapPin,
    title: { zh: "IP 地理位置", en: "Geolocation", ja: "IP位置情報", de: "IP-Standort", ko: "IP 위치" },
    description: { zh: "在地图上定位任意 IP", en: "Locate any IP on the map" },
    info: { zh: "根据 IP 地址估算其大致地理位置（国家、城市、经纬度）并在地图上展示。精度通常到城市级别，并非精确住址。", en: "Estimates the approximate geographic location (country, city, lat/long) of any IP and plots it on a map. Accuracy is city-level, not your exact address." },
    Component: IpGeolocationTool,
  },
  {
    slug: "whois", category: "ip-network", icon: Search,
    title: { zh: "WHOIS 查询", en: "WHOIS Lookup", ja: "WHOIS検索", de: "WHOIS-Abfrage", ko: "WHOIS 조회" },
    description: { zh: "域名/IP 注册与归属信息", en: "Domain/IP registration & ownership" },
    info: { zh: "查询域名或 IP 的注册信息：注册商、注册/到期日期、Name Server、归属组织及网络分配范围（基于 RDAP 协议）。", en: "Look up registration details of a domain or IP: registrar, registration/expiry dates, name servers, owning organization and network allocation (via RDAP)." },
    Component: WhoisTool,
  },
  {
    slug: "reverse-dns", category: "ip-network", icon: RotateCcw,
    title: { zh: "反向 DNS", en: "Reverse DNS", ja: "逆引きDNS", de: "Reverse DNS", ko: "역방향 DNS" },
    description: { zh: "IP 反向解析为主机名 (PTR)", en: "Resolve an IP back to hostname (PTR)" },
    info: { zh: "通过 PTR 记录将 IP 地址反向解析为主机名，常用于邮件服务器验证和网络溯源。许多住宅 IP 没有配置。", en: "Resolves an IP back to a hostname via its PTR record — used for mail-server verification and network tracing. Many residential IPs have none." },
    Component: ReverseDnsTool,
  },
  {
    slug: "dual-stack", category: "ip-network", icon: Boxes,
    title: { zh: "IPv4 / IPv6 双栈", en: "IPv4 / IPv6 Dual-stack", ja: "IPv4 / IPv6 デュアルスタック", de: "IPv4 / IPv6 Dual-Stack", ko: "IPv4 / IPv6 듀얼스택" },
    description: { zh: "检测你的网络是否同时支持 IPv4 与 IPv6", en: "Check if your network supports both IPv4 and IPv6" },
    info: { zh: "分别通过仅 IPv4 与仅 IPv6 的端点检测你的公网地址，判断网络是否为双栈。IPv6 普及程度反映网络现代化水平。", en: "Detects your public address over IPv4-only and IPv6-only endpoints to determine dual-stack support. IPv6 availability reflects network modernization." },
    Component: DualStackTool,
  },
  {
    slug: "mac-lookup", category: "ip-network", icon: Cpu,
    title: { zh: "MAC 厂商查询", en: "MAC Lookup", ja: "MACベンダー検索", de: "MAC-Hersteller", ko: "MAC 제조사 조회" },
    description: { zh: "根据 MAC 地址识别设备厂商", en: "Identify device vendor from a MAC address" },
    info: { zh: "MAC 地址前 3 字节（OUI）由 IEEE 分配给硬件厂商。输入 MAC 地址即可查询其对应的设备制造商。", en: "The first 3 bytes (OUI) of a MAC are assigned by IEEE to vendors. Enter a MAC to look up its hardware manufacturer." },
    Component: MacLookupTool,
  },

  // ───────────────────────── ② 隐私与安全 ─────────────────────────
  {
    slug: "privacy-assessment", category: "privacy-security", icon: ShieldCheck, accent: true,
    title: { zh: "隐私与跟踪", en: "Privacy & Tracking", ja: "プライバシーと追跡", de: "Datenschutz & Tracking", ko: "개인정보 및 추적" },
    description: { zh: "综合隐私体检与评分", en: "Overall privacy checkup & score" },
    info: { zh: "汇总 IP、VPN、WebRTC、IPv6、DNS、DNT、Cookie 等多项检测，生成一份综合隐私评分报告，并指出需要关注的风险点。", en: "Aggregates IP, VPN, WebRTC, IPv6, DNS, DNT and Cookie checks into one privacy score report, highlighting the risks worth your attention." },
    Component: PrivacyAssessmentTool,
  },
  {
    slug: "browser-fingerprint", category: "privacy-security", icon: Fingerprint, accent: true,
    title: { zh: "指纹评分", en: "Fingerprint Score", ja: "フィンガープリント評価", de: "Fingerprint-Score", ko: "지문 점수" },
    description: { zh: "生成浏览器指纹并评估匿名性", en: "Generate a fingerprint & rate anonymity" },
    info: { zh: "综合 Canvas、WebGL、字体、音频等数十项特征生成唯一的浏览器指纹 ID，并给出匿名性评分。指纹越独特，越容易被跨站追踪。", en: "Combines dozens of traits (Canvas, WebGL, fonts, audio…) into a unique fingerprint ID and an anonymity score. The more unique, the easier you are to track across sites." },
    Component: BrowserFingerprintTool,
  },
  {
    slug: "webrtc-leak", category: "privacy-security", icon: Radio,
    title: { zh: "WebRTC 泄漏测试", en: "WebRTC Leak Test", ja: "WebRTC漏洩テスト", de: "WebRTC-Leak-Test", ko: "WebRTC 누출 테스트" },
    description: { zh: "检测 WebRTC 是否暴露真实 IP", en: "Detect if WebRTC exposes your real IP" },
    info: { zh: "WebRTC 可能绕过 VPN 直接暴露你的真实 IP。此工具通过 ICE candidate 收集本地与公网 IP，并与服务端 IP 对比判断是否泄漏。", en: "WebRTC can bypass a VPN and leak your real IP. This tool gathers ICE candidates and compares them against your server-side IP to detect leaks." },
    Component: WebRtcLeakTool,
  },
  {
    slug: "ssl-tls", category: "privacy-security", icon: Lock,
    title: { zh: "SSL 与 TLS", en: "SSL & TLS", ja: "SSL / TLS", de: "SSL & TLS", ko: "SSL / TLS" },
    description: { zh: "查询域名证书与加密信息", en: "Inspect domain certificate & encryption" },
    info: { zh: "通过证书透明（CT）日志查询任意域名的证书：颁发机构、有效期、序列号与 SAN，帮助判断证书是否有效、即将到期。数据来自公开 CT 日志，不含实时 TLS 版本/加密套件。", en: "Looks up a domain's certificate via Certificate Transparency (CT) logs: issuer, validity, serial and SANs — to judge whether the cert is valid or expiring. Data comes from public CT logs, without live TLS version/cipher." },
    Component: SslTlsTool,
  },
  {
    slug: "ip-reputation", category: "privacy-security", icon: ShieldAlert,
    title: { zh: "IP 黑名单/声誉", en: "IP Reputation", ja: "IP評価 / ブラックリスト", de: "IP-Reputation", ko: "IP 평판/블랙리스트" },
    description: { zh: "检测你的 IP 是否被列入垃圾/滥用黑名单", en: "Check if your IP is on spam/abuse blacklists" },
    info: { zh: "通过多个公共 DNSBL（如 Spamhaus、SpamCop、Barracuda）检测你的公网 IP 是否被列入垃圾邮件或滥用黑名单。被列入可能导致邮件被拒或访问受限。", en: "Checks your public IP against several public DNSBLs (Spamhaus, SpamCop, Barracuda…) to see if it's on a spam or abuse blacklist. Being listed can cause mail rejection or restricted access." },
    Component: IpReputationTool,
  },

  // ───────────────────────── ③ 浏览器与设备 ─────────────────────────
  {
    slug: "user-agent", category: "browser-device", icon: Monitor, accent: true,
    title: { zh: "User-Agent", en: "User-Agent", ja: "ユーザーエージェント", de: "User-Agent", ko: "사용자 에이전트" },
    description: { zh: "识别浏览器、系统与设备", en: "Detect browser, OS & device" },
    info: { zh: "解析 User-Agent 字符串，识别你的浏览器、版本、操作系统、渲染引擎和设备类型。可粘贴自定义 UA 进行测试。", en: "Parses your User-Agent string to identify browser, version, OS, rendering engine and device type. You can paste a custom UA to test." },
    Component: UserAgentTool,
  },
  {
    slug: "screen-device", category: "browser-device", icon: Smartphone, accent: true,
    title: { zh: "屏幕和设备", en: "Screen & Device", ja: "画面とデバイス", de: "Bildschirm & Gerät", ko: "화면 및 기기" },
    description: { zh: "分辨率、GPU、内存等硬件特征", en: "Resolution, GPU, memory & hardware" },
    info: { zh: "采集屏幕分辨率、像素比、颜色深度、CPU 核心、内存、GPU 渲染器及 Canvas 特征等硬件信息，是浏览器指纹的重要组成。", en: "Collects screen resolution, pixel ratio, color depth, CPU cores, memory, GPU renderer and Canvas traits — key components of your browser fingerprint." },
    Component: ScreenDeviceTool,
  },
  {
    slug: "language-locale", category: "browser-device", icon: Languages,
    title: { zh: "语言与区域", en: "Language & Locale", ja: "言語と地域", de: "Sprache & Region", ko: "언어 및 지역" },
    description: { zh: "语言、时区与区域格式偏好", en: "Language, timezone & locale formats" },
    info: { zh: "展示浏览器报告的语言偏好、时区、日历与数字/货币格式。时区与语言常被用于交叉验证你的真实位置。", en: "Shows your browser's reported language preferences, timezone, calendar and number/currency formats. Timezone & language often cross-check your real location." },
    Component: LanguageLocaleTool,
  },
  {
    slug: "http-headers", category: "browser-device", icon: List,
    title: { zh: "HTTP 标头", en: "HTTP Headers", ja: "HTTPヘッダー", de: "HTTP-Header", ko: "HTTP 헤더" },
    description: { zh: "浏览器发送的全部请求头", en: "All request headers your browser sends" },
    info: { zh: "列出你的浏览器在每次请求中发送的所有 HTTP 标头，包括 User-Agent、Accept-Language、Referer 等。这些可被用于追踪。", en: "Lists every HTTP header your browser sends on each request — User-Agent, Accept-Language, Referer and more, all of which can aid tracking." },
    Component: HttpHeadersTool,
  },
  {
    slug: "connection-info", category: "browser-device", icon: Wifi,
    title: { zh: "连接信息", en: "Connection", ja: "接続情報", de: "Verbindung", ko: "연결 정보" },
    description: { zh: "网络类型、速度与协议版本", en: "Network type, speed & protocol" },
    info: { zh: "显示连接类型、估算带宽与延迟、HTTP 协议版本及是否使用 HTTPS。部分数据依赖 Network Information API，并非所有浏览器支持。", en: "Shows connection type, estimated bandwidth & latency, HTTP protocol version and HTTPS status. Some data relies on the Network Information API, unsupported in some browsers." },
    Component: ConnectionInfoTool,
  },

  // ───────────────────────── ④ 网络诊断 ─────────────────────────
  {
    slug: "dns-resolver", category: "diagnostics", icon: Network,
    title: { zh: "DNS 解析", en: "DNS Resolver", ja: "DNS解決", de: "DNS-Auflösung", ko: "DNS 조회" },
    description: { zh: "查询域名的 A/AAAA/MX/TXT 等记录", en: "Query A/AAAA/MX/TXT records of a domain" },
    info: { zh: "通过 DNS-over-HTTPS（Cloudflare）解析任意域名的各类记录（A、AAAA、CNAME、MX、TXT、NS），用于排查域名配置与邮件设置。", en: "Resolves any domain's records (A, AAAA, CNAME, MX, TXT, NS) via DNS-over-HTTPS (Cloudflare) — useful for debugging domain and mail config." },
    Component: DnsResolverTool,
  },
  {
    slug: "latency", category: "diagnostics", icon: Gauge,
    title: { zh: "延迟测试", en: "Latency Test", ja: "レイテンシテスト", de: "Latenztest", ko: "지연 시간 테스트" },
    description: { zh: "测量到全球主流站点的网络延迟", en: "Measure latency to major global sites" },
    info: { zh: "测量你的浏览器到 Cloudflare、Google、GitHub 等站点的往返延迟（RTT），帮助评估网络质量与就近程度。", en: "Measures round-trip latency from your browser to Cloudflare, Google, GitHub and others to gauge network quality and proximity." },
    Component: LatencyTool,
  },
  {
    slug: "speed-test", category: "diagnostics", icon: Download,
    title: { zh: "网络测速", en: "Speed Test", ja: "速度テスト", de: "Geschwindigkeitstest", ko: "속도 테스트" },
    description: { zh: "测算当前网络的下载吞吐量", en: "Measure your download throughput" },
    info: { zh: "从公共 CDN 下载数据实时测算下载速度（Mbps）：国内自动走 jsDelivr，国外走 Cloudflare 公共测速端点，均不消耗本站流量。结果受所选源与网络状况影响。", en: "Estimates download speed (Mbps) in real time from a public CDN: jsDelivr for China, the Cloudflare public speed endpoint elsewhere — never our own bandwidth. Results depend on the source and network." },
    Component: SpeedTestTool,
  },
  {
    slug: "availability", category: "diagnostics", icon: Globe2,
    title: { zh: "网站可达性", en: "Site Availability", ja: "サイト到達性", de: "Website-Erreichbarkeit", ko: "사이트 접근성" },
    description: { zh: "检测主流网站是否可访问", en: "Check if major sites are reachable" },
    info: { zh: "从你的浏览器直接探测 Google、GitHub、YouTube、ChatGPT 等站点是否可达，可用于粗略判断网络封锁或审查状况。", en: "Probes whether Google, GitHub, YouTube, ChatGPT and others are reachable from your browser — a rough check for network blocking or censorship." },
    Component: AvailabilityTool,
  },
];
