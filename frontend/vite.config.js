import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const proxyTarget = 'http://localhost' 

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    host: 'localhost',
    open: true,
    proxy: {
      '/register': { target: proxyTarget, changeOrigin: true },
      '/login': { target: proxyTarget, changeOrigin: true },
      '/api/': { target: proxyTarget, changeOrigin: true },
      '/health': { target: proxyTarget, changeOrigin: true },
    },
  },
})