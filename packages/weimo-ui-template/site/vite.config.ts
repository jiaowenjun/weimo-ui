import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/weimo-ui/template/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 4179,
    strictPort: true,
  },
})
