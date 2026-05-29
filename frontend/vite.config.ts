import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/run': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // SSE requires selfHandleResponse so data isn't buffered
        selfHandleResponse: true,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Forward headers
            Object.entries(proxyRes.headers).forEach(([key, value]) => {
              if (value) res.setHeader(key, value)
            })
            res.setHeader('Cache-Control', 'no-cache')
            res.setHeader('X-Accel-Buffering', 'no')
            res.statusCode = proxyRes.statusCode || 200
            // Pipe without buffering
            proxyRes.pipe(res, { end: true })
          })
        }
      }
    }
  }
})
