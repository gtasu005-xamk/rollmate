import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/health": "http://localhost:3000",
      "/auth": "http://localhost:3000",
      "/sessions": "http://localhost:3000",
      "/themes": "http://localhost:3000",
      "/summary": "http://localhost:3000",
    },
  },
})
