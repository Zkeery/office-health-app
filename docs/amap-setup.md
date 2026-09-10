# 高德地图接入

入口：今日 / 出餐 → 高德地图，或 `http://127.0.0.1:5173/map`。

## 配置

在高德开放平台 https://console.amap.com/dev/key/app 创建应用，添加 Key 时选择 **Web端（JS API）**，获取该 Key 及对应的安全密钥 securityJsCode。不是“Web服务”类型的 Key。

本地配置文件 `/Users/zoe/office-health-app/.env.local` 已准备好：

```dotenv
AMAP_JS_KEY=填写Web端JS_API_Key
AMAP_SECURITY_JS_CODE=填写该Key对应的安全密钥
```

配置后刷新地图页或点击“重新连接地图”。本地配置服务每次读取文件，无需把密钥粘贴到聊天或网页。`.env.local` 已由现有 `*.local` Git 忽略规则保护。安全密钥只在 Vite 服务端代理中注入，不打包进前端；浏览器公开的 JS Key 属于 JS API 正常使用方式。在高德控制台按其域名设置规则配置实际使用的本地域名。

## 功能与边界

- 高德 JS API 2.0 在线地图，支持拖动缩放。
- 默认全国视野，不伪装成用户位置；点击“定位我的位置”才调用定位，遵循浏览器授权。定位精度和时间可见，不持续跟踪、不写入个人档案。
- 搜索城市、地址、地点；放大到街区后可查询地图中心周边1.5公里餐饮地点。
- 地点结果来自查询时的高德服务，显示名称、地址与查询时间；点击结果在地图中查看。
- “实时”是在线查询高德数据，不承诺商家营业、菜品库存或价格实时准确，不自动验证预算或饮食要求。现有模拟餐单保留明确标注。
- 配置缺失、鉴权失败、网络失败、查询无结果、定位拒绝各有反馈，不以模拟数据兜底冒充真实数据。

## 服务

`/api/maps/config` 仅返回配置状态与公开 JS Key。
`/_AMapService/` 固定代理到高德 REST 域名；样式请求固定代理到高德 webapi 域名；安全密钥由服务端加入。
开发 `npm run dev` 与本地 `npm run preview` 均提供配置与代理。只上传 dist 到静态主机不够，需要同样配置服务端代理；本次未部署外网。

## 官方文档

- https://lbs.amap.com/api/javascript-api-v2/prerequisites
- https://lbs.amap.com/api/javascript-api-v2/guide/abc/jscode
- https://lbs.amap.com/api/javascript-api-v2/guide/services/geolocation
- https://lbs.amap.com/api/javascript-api-v2/guide/services/autocomplete

## 验证状态

2026-09-10 已配置「工位行动本地地图」Web端 Key 及对应安全密钥，本地域名为 `127.0.0.1`。Chrome 实测地图底图、道路与地名正常显示；搜索「上海静安寺」返回 10 个真实地点；点击静安寺结果后查询周边 1.5 公里，返回 10 个餐饮地点，包含蜜雪冰城（静安寺店）、无味舒食（静安寺店）等，并显示地图标记与查询时间。

构建、原业务回归和代理配置测试已通过。浏览器定位尚未实测，需要用户点击定位并自行授权；本次没有修改定位权限。没有验证长期额度或外网部署。
