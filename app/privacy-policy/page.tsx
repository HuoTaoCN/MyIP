export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-fg mb-2">隐私政策</h1>
      <p className="text-sm text-muted mb-8">最后更新：{new Date().toLocaleDateString("zh-CN")}</p>

      <div className="space-y-6 text-sm text-muted leading-relaxed">
        {[
          {
            title: "1. 我们收集的信息",
            content: "MyIP 不主动收集或存储任何个人信息。当你使用我们的工具时，我们的服务器会临时处理你的 IP 地址以提供服务，但不会将其持久化存储。所有客户端检测（浏览器指纹、屏幕信息等）均在你的设备上本地运行。",
          },
          {
            title: "2. 第三方服务",
            content: "我们使用 ip-api.com 提供 IP 地理位置数据，使用公共 RDAP 服务提供 WHOIS 查询，使用 OpenStreetMap/Leaflet 提供地图服务。这些服务有各自的隐私政策，我们建议你查阅。",
          },
          {
            title: "3. Cookie 和本地存储",
            content: "MyIP 不使用 Cookie 追踪用户。我们不在浏览器中存储任何持久化数据，也不使用任何第三方追踪或广告服务。",
          },
          {
            title: "4. 数据安全",
            content: "所有与我们服务器的通信均通过 HTTPS 加密。服务器端 API 调用（如 SSL 检查、反向 DNS）仅在请求时执行，结果不被缓存或存储。",
          },
          {
            title: "5. 儿童隐私",
            content: "本服务面向所有年龄段用户，不会故意收集 13 岁以下儿童的任何信息。",
          },
          {
            title: "6. 政策变更",
            content: "我们可能会不定期更新本隐私政策。重大变更时，我们将在页面顶部显示更新日期。继续使用本服务即表示你接受更新后的政策。",
          },
          {
            title: "7. 联系我们",
            content: "如果你对本隐私政策有任何疑问，欢迎通过「关于」页面的反馈渠道联系我们。",
          },
        ].map(({ title, content }) => (
          <div key={title} className="surface border-themed rounded-xl p-5">
            <h2 className="font-semibold text-fg mb-2">{title}</h2>
            <p>{content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
