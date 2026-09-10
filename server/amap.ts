import { loadEnv, type Plugin, type ProxyOptions } from 'vite'

export function amapIntegration(mode: string) {
  const credentials = () => {
    const env = loadEnv(mode, process.cwd(), '')
    return { key: env.AMAP_JS_KEY?.trim() ?? '', secret: env.AMAP_SECURITY_JS_CODE?.trim() ?? '' }
  }
  const proxy = (target: string): ProxyOptions => ({
    target,
    changeOrigin: true,
    secure: true,
    rewrite(path) {
      const url = new URL(path.replace(/^\/_AMapService/, ''), target)
      const { key, secret } = credentials()
      url.searchParams.set('key', key)
      url.searchParams.set('jscode', secret)
      return url.pathname + url.search
    },
  })
  const proxies = {
    '/_AMapService/v4/map/styles': proxy('https://webapi.amap.com'),
    '/_AMapService/': proxy('https://restapi.amap.com'),
  }
  const plugin: Plugin = {
    name: 'amap-local-config',
    configureServer(server) {
      server.middlewares.use('/api/maps/config', (_req, res) => {
        const { key, secret } = credentials()
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Cache-Control', 'no-store')
        res.end(JSON.stringify({ configured: !!(key && secret), key: key && secret ? key : '' }))
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/maps/config', (_req, res) => {
        const { key, secret } = credentials()
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Cache-Control', 'no-store')
        res.end(JSON.stringify({ configured: !!(key && secret), key: key && secret ? key : '' }))
      })
    },
  }
  return { plugin, proxies }
}
