import { test } from 'node:test'
import assert from 'node:assert/strict'
import { amapIntegration } from '../server/amap.ts'

test('高德配置只公开JS Key，安全密钥由固定目标代理注入', () => {
  const before = { key: process.env.AMAP_JS_KEY, secret: process.env.AMAP_SECURITY_JS_CODE }
  try {
    process.env.AMAP_JS_KEY = 'test-public-key'
    process.env.AMAP_SECURITY_JS_CODE = 'test-private-code'
    const { plugin, proxies } = amapIntegration('test')
    let handle
    plugin.configureServer({ middlewares: { use(path, callback) { assert.equal(path, '/api/maps/config'); handle = callback } } })
    let body
    handle({}, { setHeader() {}, end(value) { body = JSON.parse(value) } })
    assert.deepEqual(body, { configured: true, key: 'test-public-key' })
    const rewritten = new URL(proxies['/_AMapService/'].rewrite('/_AMapService/v3/place/around?location=116,39&key=wrong&jscode=wrong'), 'https://restapi.amap.com')
    assert.equal(rewritten.searchParams.get('jscode'), 'test-private-code')
    assert.equal(rewritten.searchParams.get('key'), 'test-public-key')
    assert.equal(rewritten.searchParams.get('location'), '116,39')
    assert.equal(proxies['/_AMapService/'].target, 'https://restapi.amap.com')
    assert.equal(proxies['/_AMapService/v4/map/styles'].target, 'https://webapi.amap.com')
    process.env.AMAP_SECURITY_JS_CODE = ''
    handle({}, { setHeader() {}, end(value) { body = JSON.parse(value) } })
    assert.deepEqual(body, { configured: false, key: '' })
  } finally {
    if (before.key === undefined) delete process.env.AMAP_JS_KEY
    else process.env.AMAP_JS_KEY = before.key
    if (before.secret === undefined) delete process.env.AMAP_SECURITY_JS_CODE
    else process.env.AMAP_SECURITY_JS_CODE = before.secret
  }
})
