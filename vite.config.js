import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
  ],
  base: '/',
  build: { outDir: 'dist' },
  server: {
    proxy: {
      '/api': 'http://localhost:3001' // Proxy para API local
    }
  }
})
