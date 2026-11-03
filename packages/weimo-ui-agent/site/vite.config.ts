import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/weimo-ui/agent/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 4184,
    strictPort: true,
  },
})
