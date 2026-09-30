import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const apiUrl = env.VITE_API_URL || 'http://localhost:3000/api'
  const apiOrigin = apiUrl.replace(/\/api\/?$/, '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        // Uploaded files are served by the API under /uploads. Proxying them in
        // development avoids a cross-origin <img> request (and CORP blocking).
        '/uploads': {
          target: apiOrigin,
          changeOrigin: true,
        },
      },
    },
  }
})
