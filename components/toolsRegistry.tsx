import {
  Globe, MapPin, Search, RotateCcw, List, Monitor, Languages,
  Smartphone, Wifi, Radio, Lock, Fingerprint, ShieldCheck, ShieldAlert, LucideIcon,
  Network, Boxes, Gauge, Download, Cpu, Layers, Server, Activity, Split, Route,
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
import SpeedTestTool from "@/components/tools/SpeedTestTool";
import MacLookupTool from "@/components/tools/MacLookupTool";
import IpReputationTool from "@/components/tools/IpReputationTool";
import IpSourcesTool from "@/components/tools/IpSourcesTool";
import CdnNodeTool from "@/components/tools/CdnNodeTool";
import DnsEgressTool from "@/components/tools/DnsEgressTool";
import MultiEgressTool from "@/components/tools/MultiEgressTool";
import ConnectivityTool from "@/components/tools/ConnectivityTool";

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
    title: { zh: "IP 与网络", en: "IP & Network", ja: "IP とネットワーク", de: "IP & Netzwerk", ko: "IP 및 네트워크", fr: "IP et réseau", es: "IP y red", ru: "IP и сеть", vi: "IP & Mạng", pt: "IP e rede" },
    description: { zh: "你的公网身份与归属信息", en: "Your public identity and ownership info", ja: "公開アイデンティティと所属情報", de: "Öffentliche Identität & Zuordnung", ko: "공개 신원 및 소속 정보", fr: "Votre identité publique et son attribution", es: "Tu identidad pública e información de propiedad", ru: "Ваша публичная идентичность и принадлежность", vi: "Danh tính công khai và thông tin sở hữu của bạn", pt: "Sua identidade pública e informações de propriedade" },
  },
  {
    key: "privacy-security", icon: ShieldCheck,
    title: { zh: "隐私与安全", en: "Privacy & Security", ja: "プライバシーとセキュリティ", de: "Datenschutz & Sicherheit", ko: "개인정보 및 보안", fr: "Confidentialité et sécurité", es: "Privacidad y seguridad", ru: "Конфиденциальность и безопасность", vi: "Quyền riêng tư & Bảo mật", pt: "Privacidade e segurança" },
    description: { zh: "泄漏、指纹与声誉风险检测", en: "Leaks, fingerprinting & reputation risks", ja: "漏洩・フィンガープリント・評価リスク", de: "Leaks, Fingerprinting & Reputationsrisiken", ko: "누출·지문·평판 위험", fr: "Fuites, empreinte numérique et risques de réputation", es: "Fugas, huella digital y riesgos de reputación", ru: "Утечки, цифровой отпечаток и репутационные риски", vi: "Rò rỉ, vân tay số & rủi ro danh tiếng", pt: "Vazamentos, impressão digital e riscos de reputação" },
  },
  {
    key: "browser-device", icon: Monitor,
    title: { zh: "浏览器与设备", en: "Browser & Device", ja: "ブラウザとデバイス", de: "Browser & Gerät", ko: "브라우저 및 기기", fr: "Navigateur et appareil", es: "Navegador y dispositivo", ru: "Браузер и устройство", vi: "Trình duyệt & Thiết bị", pt: "Navegador e dispositivo" },
    description: { zh: "浏览器、系统与硬件暴露的信息", en: "What your browser, OS & hardware reveal", ja: "ブラウザ・OS・ハードウェアが明かす情報", de: "Was Browser, OS & Hardware preisgeben", ko: "브라우저·OS·하드웨어가 드러내는 정보", fr: "Ce que révèlent votre navigateur, OS et matériel", es: "Lo que revelan tu navegador, SO y hardware", ru: "Что раскрывают браузер, ОС и оборудование", vi: "Những gì trình duyệt, HĐH & phần cứng tiết lộ", pt: "O que seu navegador, SO e hardware revelam" },
  },
  {
    key: "diagnostics", icon: Gauge,
    title: { zh: "网络诊断", en: "Network Diagnostics", ja: "ネットワーク診断", de: "Netzwerkdiagnose", ko: "네트워크 진단", fr: "Diagnostic réseau", es: "Diagnóstico de red", ru: "Сетевая диагностика", vi: "Chẩn đoán mạng", pt: "Diagnóstico de rede" },
    description: { zh: "解析、延迟、速度与可达性", en: "Resolution, latency, speed & reachability", ja: "解決・遅延・速度・到達性", de: "Auflösung, Latenz, Tempo & Erreichbarkeit", ko: "해석·지연·속도·도달성", fr: "Résolution, latence, débit et accessibilité", es: "Resolución, latencia, velocidad y accesibilidad", ru: "Разрешение, задержка, скорость и доступность", vi: "Phân giải, độ trễ, tốc độ & khả năng truy cập", pt: "Resolução, latência, velocidade e acessibilidade" },
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
    title: { zh: "IP 地址", en: "IP Address", ja: "IPアドレス", de: "IP-Adresse", ko: "IP 주소", fr: "Adresse IP", es: "Dirección IP", ru: "IP-адрес", vi: "Địa chỉ IP", pt: "Endereço IP" },
    description: { zh: "公网 IP、ISP、ASN 及 VPN/代理检测", en: "Public IP, ISP, ASN & VPN/proxy detection", fr: "IP publique, FAI, ASN et détection VPN/proxy", es: "IP pública, ISP, ASN y detección de VPN/proxy", ru: "Публичный IP, провайдер, ASN и обнаружение VPN/прокси", vi: "IP công khai, ISP, ASN và phát hiện VPN/proxy", pt: "IP público, ISP, ASN e detecção de VPN/proxy" },
    info: { zh: "显示你当前的公网 IP 地址，以及所属的 ISP、自治系统(ASN)和是否经过 VPN/代理/数据中心。这是网站识别你的首要标识。", en: "Shows your current public IP address, ISP, autonomous system (ASN), and whether it routes through a VPN/proxy/datacenter — the primary way sites identify you." },
    Component: MyIpTool,
  },
  {
    slug: "ip-geolocation", category: "ip-network", icon: MapPin,
    title: { zh: "IP 地理位置", en: "Geolocation", ja: "IP位置情報", de: "IP-Standort", ko: "IP 위치", fr: "Géolocalisation", es: "Geolocalización", ru: "Геолокация", vi: "Định vị địa lý", pt: "Geolocalização" },
    description: { zh: "在地图上定位任意 IP", en: "Locate any IP on the map", fr: "Localiser n'importe quelle IP sur la carte", es: "Localiza cualquier IP en el mapa", ru: "Найдите любой IP на карте", vi: "Định vị bất kỳ IP nào trên bản đồ", pt: "Localize qualquer IP no mapa" },
    info: { zh: "根据 IP 地址估算其大致地理位置（国家、城市、经纬度）并在地图上展示。精度通常到城市级别，并非精确住址。", en: "Estimates the approximate geographic location (country, city, lat/long) of any IP and plots it on a map. Accuracy is city-level, not your exact address." },
    Component: IpGeolocationTool,
  },
  {
    slug: "whois", category: "ip-network", icon: Search,
    title: { zh: "WHOIS 查询", en: "WHOIS Lookup", ja: "WHOIS検索", de: "WHOIS-Abfrage", ko: "WHOIS 조회", fr: "Recherche WHOIS", es: "Consulta WHOIS", ru: "WHOIS-запрос", vi: "Tra cứu WHOIS", pt: "Consulta WHOIS" },
    description: { zh: "域名/IP 注册与归属信息", en: "Domain/IP registration & ownership", fr: "Enregistrement et propriété de domaine/IP", es: "Registro y propiedad de dominio/IP", ru: "Регистрация и владелец домена/IP", vi: "Đăng ký và chủ sở hữu tên miền/IP", pt: "Registro e propriedade de domínio/IP" },
    info: { zh: "查询域名或 IP 的注册信息：注册商、注册/到期日期、Name Server、归属组织及网络分配范围（基于 RDAP 协议）。", en: "Look up registration details of a domain or IP: registrar, registration/expiry dates, name servers, owning organization and network allocation (via RDAP)." },
    Component: WhoisTool,
  },
  {
    slug: "reverse-dns", category: "ip-network", icon: RotateCcw,
    title: { zh: "反向 DNS", en: "Reverse DNS", ja: "逆引きDNS", de: "Reverse DNS", ko: "역방향 DNS", fr: "DNS inversé", es: "DNS inverso", ru: "Обратный DNS", vi: "DNS ngược", pt: "DNS reverso" },
    description: { zh: "IP 反向解析为主机名 (PTR)", en: "Resolve an IP back to hostname (PTR)", fr: "Résoudre une IP en nom d'hôte (PTR)", es: "Resolver una IP a nombre de host (PTR)", ru: "Преобразование IP в имя хоста (PTR)", vi: "Phân giải IP thành tên máy chủ (PTR)", pt: "Resolver um IP para nome de host (PTR)" },
    info: { zh: "通过 PTR 记录将 IP 地址反向解析为主机名，常用于邮件服务器验证和网络溯源。许多住宅 IP 没有配置。", en: "Resolves an IP back to a hostname via its PTR record — used for mail-server verification and network tracing. Many residential IPs have none." },
    Component: ReverseDnsTool,
  },
  {
    slug: "dual-stack", category: "ip-network", icon: Boxes,
    title: { zh: "IPv4 / IPv6 双栈", en: "IPv4 / IPv6 Dual-stack", ja: "IPv4 / IPv6 デュアルスタック", de: "IPv4 / IPv6 Dual-Stack", ko: "IPv4 / IPv6 듀얼스택", fr: "Double pile IPv4 / IPv6", es: "Doble pila IPv4 / IPv6", ru: "Двойной стек IPv4 / IPv6", vi: "Ngăn xếp kép IPv4 / IPv6", pt: "Pilha dupla IPv4 / IPv6" },
    description: { zh: "检测你的网络是否同时支持 IPv4 与 IPv6", en: "Check if your network supports both IPv4 and IPv6", fr: "Vérifie si votre réseau prend en charge IPv4 et IPv6", es: "Comprueba si tu red admite IPv4 e IPv6", ru: "Проверка поддержки IPv4 и IPv6 в вашей сети", vi: "Kiểm tra mạng của bạn có hỗ trợ cả IPv4 và IPv6 không", pt: "Verifica se sua rede suporta IPv4 e IPv6" },
    info: { zh: "分别通过仅 IPv4 与仅 IPv6 的端点检测你的公网地址，判断网络是否为双栈。IPv6 普及程度反映网络现代化水平。", en: "Detects your public address over IPv4-only and IPv6-only endpoints to determine dual-stack support. IPv6 availability reflects network modernization." },
    Component: DualStackTool,
  },
  {
    slug: "mac-lookup", category: "ip-network", icon: Cpu,
    title: { zh: "MAC 厂商查询", en: "MAC Lookup", ja: "MACベンダー検索", de: "MAC-Hersteller", ko: "MAC 제조사 조회", fr: "Recherche MAC", es: "Búsqueda MAC", ru: "Поиск MAC", vi: "Tra cứu MAC", pt: "Consulta MAC" },
    description: { zh: "根据 MAC 地址识别设备厂商", en: "Identify device vendor from a MAC address", fr: "Identifier le fabricant à partir d'une adresse MAC", es: "Identifica el fabricante a partir de una dirección MAC", ru: "Определение производителя по MAC-адресу", vi: "Xác định nhà sản xuất từ địa chỉ MAC", pt: "Identifique o fabricante a partir de um endereço MAC" },
    info: { zh: "MAC 地址前 3 字节（OUI）由 IEEE 分配给硬件厂商。输入 MAC 地址即可查询其对应的设备制造商。", en: "The first 3 bytes (OUI) of a MAC are assigned by IEEE to vendors. Enter a MAC to look up its hardware manufacturer." },
    Component: MacLookupTool,
  },
  {
    slug: "ip-sources", category: "ip-network", icon: Layers,
    title: { zh: "多来源 IP 对比", en: "Multi-source Compare", ja: "マルチソース比較", de: "Multi-Quellen-Vergleich", ko: "다중 소스 비교", fr: "Comparaison multi-sources", es: "Comparación multifuente", ru: "Сравнение источников", vi: "So sánh đa nguồn", pt: "Comparação multifonte" },
    description: { zh: "并列多个数据源对同一 IP 的归属判断", en: "Compare how multiple databases locate one IP", fr: "Comparez la localisation d'une IP selon plusieurs bases", es: "Compara cómo varias bases ubican una IP", ru: "Сравните, как разные базы определяют один IP", vi: "So sánh cách nhiều cơ sở dữ liệu định vị một IP", pt: "Compare como várias bases localizam um IP" },
    info: { zh: "同时向多个公共 IP 库（ip-api、ip.sb、ipinfo、ipwho.is）查询同一个 IP，并列展示各自的归属与运营商判断。不同库结果常有差异，尤其国内/国际库对中国相关 IP。", en: "Queries several public IP databases (ip-api, ip.sb, ipinfo, ipwho.is) for the same IP and shows their location/ISP verdicts side by side. Databases often disagree, especially domestic vs international ones." },
    Component: IpSourcesTool,
  },

  // ───────────────────────── ② 隐私与安全 ─────────────────────────
  {
    slug: "privacy-assessment", category: "privacy-security", icon: ShieldCheck, accent: true,
    title: { zh: "隐私与跟踪", en: "Privacy & Tracking", ja: "プライバシーと追跡", de: "Datenschutz & Tracking", ko: "개인정보 및 추적", fr: "Confidentialité et suivi", es: "Privacidad y rastreo", ru: "Конфиденциальность и отслеживание", vi: "Quyền riêng tư & Theo dõi", pt: "Privacidade e rastreamento" },
    description: { zh: "综合隐私体检与评分", en: "Overall privacy checkup & score", fr: "Bilan de confidentialité et score global", es: "Chequeo y puntuación de privacidad global", ru: "Общая проверка приватности и оценка", vi: "Kiểm tra & chấm điểm quyền riêng tư tổng thể", pt: "Verificação e pontuação geral de privacidade" },
    info: { zh: "汇总 IP、VPN、WebRTC、IPv6、DNS、DNT、Cookie 等多项检测，生成一份综合隐私评分报告，并指出需要关注的风险点。", en: "Aggregates IP, VPN, WebRTC, IPv6, DNS, DNT and Cookie checks into one privacy score report, highlighting the risks worth your attention." },
    Component: PrivacyAssessmentTool,
  },
  {
    slug: "browser-fingerprint", category: "privacy-security", icon: Fingerprint, accent: true,
    title: { zh: "指纹评分", en: "Fingerprint Score", ja: "フィンガープリント評価", de: "Fingerprint-Score", ko: "지문 점수", fr: "Score d'empreinte", es: "Puntuación de huella", ru: "Оценка отпечатка", vi: "Điểm vân tay", pt: "Pontuação de impressão digital" },
    description: { zh: "生成浏览器指纹并评估匿名性", en: "Generate a fingerprint & rate anonymity", fr: "Génère une empreinte et évalue l'anonymat", es: "Genera una huella y evalúa el anonimato", ru: "Создаёт отпечаток и оценивает анонимность", vi: "Tạo vân tay và đánh giá tính ẩn danh", pt: "Gera uma impressão digital e avalia o anonimato" },
    info: { zh: "综合 Canvas、WebGL、字体、音频等数十项特征生成唯一的浏览器指纹 ID，并给出匿名性评分。指纹越独特，越容易被跨站追踪。", en: "Combines dozens of traits (Canvas, WebGL, fonts, audio…) into a unique fingerprint ID and an anonymity score. The more unique, the easier you are to track across sites." },
    Component: BrowserFingerprintTool,
  },
  {
    slug: "webrtc-leak", category: "privacy-security", icon: Radio,
    title: { zh: "WebRTC 泄漏测试", en: "WebRTC Leak Test", ja: "WebRTC漏洩テスト", de: "WebRTC-Leak-Test", ko: "WebRTC 누출 테스트", fr: "Test de fuite WebRTC", es: "Prueba de fuga WebRTC", ru: "Тест утечки WebRTC", vi: "Kiểm tra rò rỉ WebRTC", pt: "Teste de vazamento WebRTC" },
    description: { zh: "检测 WebRTC 是否暴露真实 IP", en: "Detect if WebRTC exposes your real IP", fr: "Détecte si WebRTC expose votre vraie IP", es: "Detecta si WebRTC expone tu IP real", ru: "Определяет, раскрывает ли WebRTC ваш реальный IP", vi: "Phát hiện WebRTC có lộ IP thật của bạn không", pt: "Detecta se o WebRTC expõe seu IP real" },
    info: { zh: "WebRTC 可能绕过 VPN 直接暴露你的真实 IP。此工具通过 ICE candidate 收集本地与公网 IP，并与服务端 IP 对比判断是否泄漏。", en: "WebRTC can bypass a VPN and leak your real IP. This tool gathers ICE candidates and compares them against your server-side IP to detect leaks." },
    Component: WebRtcLeakTool,
  },
  {
    slug: "ssl-tls", category: "privacy-security", icon: Lock,
    title: { zh: "SSL 与 TLS", en: "SSL & TLS", ja: "SSL / TLS", de: "SSL & TLS", ko: "SSL / TLS", fr: "SSL et TLS", es: "SSL y TLS", ru: "SSL и TLS", vi: "SSL & TLS", pt: "SSL e TLS" },
    description: { zh: "查询域名证书与加密信息", en: "Inspect domain certificate & encryption", fr: "Inspecter le certificat et le chiffrement d'un domaine", es: "Inspecciona el certificado y cifrado de un dominio", ru: "Проверка сертификата и шифрования домена", vi: "Kiểm tra chứng chỉ và mã hóa của tên miền", pt: "Inspecione o certificado e a criptografia de um domínio" },
    info: { zh: "通过证书透明（CT）日志查询任意域名的证书：颁发机构、有效期、序列号与 SAN，帮助判断证书是否有效、即将到期。数据来自公开 CT 日志，不含实时 TLS 版本/加密套件。", en: "Looks up a domain's certificate via Certificate Transparency (CT) logs: issuer, validity, serial and SANs — to judge whether the cert is valid or expiring. Data comes from public CT logs, without live TLS version/cipher." },
    Component: SslTlsTool,
  },
  {
    slug: "ip-reputation", category: "privacy-security", icon: ShieldAlert,
    title: { zh: "IP 黑名单/声誉", en: "IP Reputation", ja: "IP評価 / ブラックリスト", de: "IP-Reputation", ko: "IP 평판/블랙리스트", fr: "Réputation IP", es: "Reputación de IP", ru: "Репутация IP", vi: "Danh tiếng IP", pt: "Reputação de IP" },
    description: { zh: "检测你的 IP 是否被列入垃圾/滥用黑名单", en: "Check if your IP is on spam/abuse blacklists", fr: "Vérifie si votre IP est sur des listes noires de spam/abus", es: "Comprueba si tu IP está en listas negras de spam/abuso", ru: "Проверка IP в чёрных списках спама/злоупотреблений", vi: "Kiểm tra IP của bạn có trong danh sách đen spam/lạm dụng không", pt: "Verifica se seu IP está em listas negras de spam/abuso" },
    info: { zh: "通过多个公共 DNSBL（如 Spamhaus、SpamCop、Barracuda）检测你的公网 IP 是否被列入垃圾邮件或滥用黑名单。被列入可能导致邮件被拒或访问受限。", en: "Checks your public IP against several public DNSBLs (Spamhaus, SpamCop, Barracuda…) to see if it's on a spam or abuse blacklist. Being listed can cause mail rejection or restricted access." },
    Component: IpReputationTool,
  },

  // ───────────────────────── ③ 浏览器与设备 ─────────────────────────
  {
    slug: "user-agent", category: "browser-device", icon: Monitor, accent: true,
    title: { zh: "User-Agent", en: "User-Agent", ja: "ユーザーエージェント", de: "User-Agent", ko: "사용자 에이전트", fr: "User-Agent", es: "User-Agent", ru: "User-Agent", vi: "User-Agent", pt: "User-Agent" },
    description: { zh: "识别浏览器、系统与设备", en: "Detect browser, OS & device", fr: "Détecter le navigateur, l'OS et l'appareil", es: "Detecta navegador, SO y dispositivo", ru: "Определение браузера, ОС и устройства", vi: "Phát hiện trình duyệt, HĐH & thiết bị", pt: "Detecta navegador, SO e dispositivo" },
    info: { zh: "解析 User-Agent 字符串，识别你的浏览器、版本、操作系统、渲染引擎和设备类型。可粘贴自定义 UA 进行测试。", en: "Parses your User-Agent string to identify browser, version, OS, rendering engine and device type. You can paste a custom UA to test." },
    Component: UserAgentTool,
  },
  {
    slug: "screen-device", category: "browser-device", icon: Smartphone, accent: true,
    title: { zh: "屏幕和设备", en: "Screen & Device", ja: "画面とデバイス", de: "Bildschirm & Gerät", ko: "화면 및 기기", fr: "Écran et appareil", es: "Pantalla y dispositivo", ru: "Экран и устройство", vi: "Màn hình & Thiết bị", pt: "Tela e dispositivo" },
    description: { zh: "分辨率、GPU、内存等硬件特征", en: "Resolution, GPU, memory & hardware", fr: "Résolution, GPU, mémoire et matériel", es: "Resolución, GPU, memoria y hardware", ru: "Разрешение, GPU, память и оборудование", vi: "Độ phân giải, GPU, bộ nhớ & phần cứng", pt: "Resolução, GPU, memória e hardware" },
    info: { zh: "采集屏幕分辨率、像素比、颜色深度、CPU 核心、内存、GPU 渲染器及 Canvas 特征等硬件信息，是浏览器指纹的重要组成。", en: "Collects screen resolution, pixel ratio, color depth, CPU cores, memory, GPU renderer and Canvas traits — key components of your browser fingerprint." },
    Component: ScreenDeviceTool,
  },
  {
    slug: "language-locale", category: "browser-device", icon: Languages,
    title: { zh: "语言与区域", en: "Language & Locale", ja: "言語と地域", de: "Sprache & Region", ko: "언어 및 지역", fr: "Langue et région", es: "Idioma y región", ru: "Язык и регион", vi: "Ngôn ngữ & Vùng", pt: "Idioma e região" },
    description: { zh: "语言、时区与区域格式偏好", en: "Language, timezone & locale formats", fr: "Langue, fuseau horaire et formats régionaux", es: "Idioma, zona horaria y formatos regionales", ru: "Язык, часовой пояс и региональные форматы", vi: "Ngôn ngữ, múi giờ & định dạng vùng", pt: "Idioma, fuso horário e formatos regionais" },
    info: { zh: "展示浏览器报告的语言偏好、时区、日历与数字/货币格式。时区与语言常被用于交叉验证你的真实位置。", en: "Shows your browser's reported language preferences, timezone, calendar and number/currency formats. Timezone & language often cross-check your real location." },
    Component: LanguageLocaleTool,
  },
  {
    slug: "http-headers", category: "browser-device", icon: List,
    title: { zh: "HTTP 标头", en: "HTTP Headers", ja: "HTTPヘッダー", de: "HTTP-Header", ko: "HTTP 헤더", fr: "En-têtes HTTP", es: "Encabezados HTTP", ru: "HTTP-заголовки", vi: "Tiêu đề HTTP", pt: "Cabeçalhos HTTP" },
    description: { zh: "浏览器发送的全部请求头", en: "All request headers your browser sends", fr: "Tous les en-têtes envoyés par votre navigateur", es: "Todos los encabezados que envía tu navegador", ru: "Все заголовки, отправляемые вашим браузером", vi: "Tất cả tiêu đề mà trình duyệt của bạn gửi", pt: "Todos os cabeçalhos que seu navegador envia" },
    info: { zh: "列出你的浏览器在每次请求中发送的所有 HTTP 标头，包括 User-Agent、Accept-Language、Referer 等。这些可被用于追踪。", en: "Lists every HTTP header your browser sends on each request — User-Agent, Accept-Language, Referer and more, all of which can aid tracking." },
    Component: HttpHeadersTool,
  },
  {
    slug: "connection-info", category: "browser-device", icon: Wifi,
    title: { zh: "连接信息", en: "Connection", ja: "接続情報", de: "Verbindung", ko: "연결 정보", fr: "Connexion", es: "Conexión", ru: "Соединение", vi: "Kết nối", pt: "Conexão" },
    description: { zh: "网络类型、速度与协议版本", en: "Network type, speed & protocol", fr: "Type de réseau, débit et protocole", es: "Tipo de red, velocidad y protocolo", ru: "Тип сети, скорость и протокол", vi: "Loại mạng, tốc độ & giao thức", pt: "Tipo de rede, velocidade e protocolo" },
    info: { zh: "显示连接类型、估算带宽与延迟、HTTP 协议版本及是否使用 HTTPS。部分数据依赖 Network Information API，并非所有浏览器支持。", en: "Shows connection type, estimated bandwidth & latency, HTTP protocol version and HTTPS status. Some data relies on the Network Information API, unsupported in some browsers." },
    Component: ConnectionInfoTool,
  },

  // ───────────────────────── ④ 网络诊断 ─────────────────────────
  {
    slug: "dns-resolver", category: "diagnostics", icon: Network,
    title: { zh: "DNS 解析", en: "DNS Resolver", ja: "DNS解決", de: "DNS-Auflösung", ko: "DNS 조회", fr: "Résolveur DNS", es: "Resolutor DNS", ru: "DNS-резолвер", vi: "Trình phân giải DNS", pt: "Resolvedor DNS" },
    description: { zh: "查询域名的 A/AAAA/MX/TXT 等记录", en: "Query A/AAAA/MX/TXT records of a domain", fr: "Interroger les enregistrements A/AAAA/MX/TXT d'un domaine", es: "Consulta registros A/AAAA/MX/TXT de un dominio", ru: "Запрос записей A/AAAA/MX/TXT домена", vi: "Truy vấn bản ghi A/AAAA/MX/TXT của tên miền", pt: "Consulte registros A/AAAA/MX/TXT de um domínio" },
    info: { zh: "通过 DNS-over-HTTPS（Cloudflare）解析任意域名的各类记录（A、AAAA、CNAME、MX、TXT、NS），用于排查域名配置与邮件设置。", en: "Resolves any domain's records (A, AAAA, CNAME, MX, TXT, NS) via DNS-over-HTTPS (Cloudflare) — useful for debugging domain and mail config." },
    Component: DnsResolverTool,
  },
  {
    slug: "connectivity", category: "diagnostics", icon: Activity,
    title: { zh: "连通性与延迟", en: "Connectivity & Latency", ja: "接続性とレイテンシ", de: "Konnektivität & Latenz", ko: "연결성 및 지연", fr: "Connectivité et latence", es: "Conectividad y latencia", ru: "Связность и задержка", vi: "Kết nối & Độ trễ", pt: "Conectividade e latência" },
    description: { zh: "国内/国际站点的可达性与延迟一览", en: "Reachability + latency for domestic & global sites", fr: "Accessibilité et latence des sites nationaux et mondiaux", es: "Accesibilidad y latencia de sitios nacionales y globales", ru: "Доступность и задержка для местных и мировых сайтов", vi: "Khả năng truy cập & độ trễ cho các trang trong nước và quốc tế", pt: "Acessibilidade e latência de sites nacionais e globais" },
    info: { zh: "从你的浏览器直接探测一批国内与国际站点的可达性与往返延迟，按地区分组展示。国际站点不可达可粗略反映网络封锁，延迟为近似值（受 CORS 限制）。", en: "Probes reachability and round-trip latency to a set of domestic and international sites directly from your browser, grouped by region. Unreachable international sites roughly indicate blocking; latency is approximate (CORS-limited)." },
    Component: ConnectivityTool,
  },
  {
    slug: "speed-test", category: "diagnostics", icon: Download,
    title: { zh: "网络测速", en: "Speed Test", ja: "速度テスト", de: "Geschwindigkeitstest", ko: "속도 테스트", fr: "Test de vitesse", es: "Prueba de velocidad", ru: "Тест скорости", vi: "Kiểm tra tốc độ", pt: "Teste de velocidade" },
    description: { zh: "测算当前网络的下载吞吐量", en: "Measure your download throughput", fr: "Mesurez votre débit de téléchargement", es: "Mide tu velocidad de descarga", ru: "Измерьте скорость загрузки", vi: "Đo thông lượng tải xuống của bạn", pt: "Meça sua taxa de download" },
    info: { zh: "从公共 CDN 下载数据实时测算下载速度（Mbps）：国内自动走 jsDelivr，国外走 Cloudflare 公共测速端点，均不消耗本站流量。结果受所选源与网络状况影响。", en: "Estimates download speed (Mbps) in real time from a public CDN: jsDelivr for China, the Cloudflare public speed endpoint elsewhere — never our own bandwidth. Results depend on the source and network." },
    Component: SpeedTestTool,
  },
  {
    slug: "cdn-node", category: "diagnostics", icon: Server,
    title: { zh: "CDN 边缘节点", en: "CDN Edge Node", ja: "CDNエッジノード", de: "CDN-Edge-Knoten", ko: "CDN 엣지 노드", fr: "Nœud de périphérie CDN", es: "Nodo perimetral CDN", ru: "Пограничный узел CDN", vi: "Nút biên CDN", pt: "Nó de borda CDN" },
    description: { zh: "你命中的 Cloudflare 边缘机房", en: "Which Cloudflare PoP serves you", fr: "Quel PoP Cloudflare vous dessert", es: "Qué PoP de Cloudflare te atiende", ru: "Какой узел Cloudflare вас обслуживает", vi: "Điểm hiện diện Cloudflare nào phục vụ bạn", pt: "Qual PoP da Cloudflare atende você" },
    info: { zh: "读取同源 /cdn-cgi/trace，显示你实际连接到的 Cloudflare 边缘节点（colo/机场码，映射到城市）、节点地区、HTTP 与 TLS 版本。可据此判断就近接入质量。", en: "Reads same-origin /cdn-cgi/trace to show the Cloudflare edge node (colo/airport code, mapped to a city) your connection actually reached, plus node region, HTTP and TLS versions." },
    Component: CdnNodeTool,
  },
  {
    slug: "multi-egress", category: "diagnostics", icon: Split,
    title: { zh: "多出口 IP 检测", en: "Multi-egress IP", ja: "マルチ出口IP", de: "Multi-Egress-IP", ko: "다중 출구 IP", fr: "IP multi-sortie", es: "IP de salida múltiple", ru: "Несколько выходных IP", vi: "IP đa lối ra", pt: "IP de múltiplas saídas" },
    description: { zh: "检测流量是否从多个 IP 出去", en: "Detect if traffic exits via multiple IPs", fr: "Détecte si le trafic sort via plusieurs IP", es: "Detecta si el tráfico sale por varias IP", ru: "Определяет, выходит ли трафик через несколько IP", vi: "Phát hiện lưu lượng có thoát qua nhiều IP không", pt: "Detecta se o tráfego sai por vários IPs" },
    info: { zh: "并发多次读取你的出口 IP；若出现多个不同 IP，通常意味着你在使用负载均衡代理池或按策略分流的网络。", en: "Reads your egress IP several times in parallel; multiple distinct IPs usually mean a load-balanced proxy pool or policy-based split routing." },
    Component: MultiEgressTool,
  },
  {
    slug: "dns-egress", category: "diagnostics", icon: Route,
    title: { zh: "DNS 出口查询", en: "DNS Egress", ja: "DNS出口", de: "DNS-Egress", ko: "DNS 출구", fr: "Sortie DNS", es: "Salida DNS", ru: "Выход DNS", vi: "Lối ra DNS", pt: "Saída DNS" },
    description: { zh: "解析链路的出口 IP 与 ECS", en: "Resolver egress IP & EDNS client subnet", fr: "IP de sortie du résolveur et sous-réseau client EDNS", es: "IP de salida del resolutor y subred de cliente EDNS", ru: "Выходной IP резолвера и клиентская подсеть EDNS", vi: "IP lối ra của trình phân giải & mạng con khách EDNS", pt: "IP de saída do resolvedor e sub-rede de cliente EDNS" },
    info: { zh: "通过特殊 DNS 记录查询解析链路的出口 IP 与 EDNS 客户端子网（ECS）。注意：此结果反映的是经公共解析器（Cloudflare/Google）的出口，并非你系统 DNS 的真实出口；完整 DNS 泄漏检测需自建权威 DNS。", en: "Queries a special DNS record for the resolver chain's egress IP and EDNS Client Subnet (ECS). Note: this reflects the egress of the public resolver (Cloudflare/Google) our query traverses, not your system DNS's real egress; a full DNS-leak test needs a self-hosted authoritative server." },
    Component: DnsEgressTool,
  },
];
