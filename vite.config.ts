import path from 'path'
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
// GitHub Pages 部署时由 CI 注入 DEPLOY_BASE=/weimo-ui/,自建部署保持默认 /ui/
export default defineConfig({
  base: process.env.DEPLOY_BASE ?? '/ui/',
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  server: {
    port: 5176,
    strictPort: true,
  },
})
