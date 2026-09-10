import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { amapIntegration } from './server/amap.ts'

export default defineConfig(({ mode }) => {
  const amap = amapIntegration(mode)
  return {
    plugins: [react(), amap.plugin],
    server: { proxy: amap.proxies },
    preview: { proxy: amap.proxies },
  }
})
