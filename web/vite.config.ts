import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    proxy: {
      "/health": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/auth": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/sessions": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/themes": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/tasks": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
})
