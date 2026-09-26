import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/weimo-ui-tagtree/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5177,
    strictPort: true,
  },
})
