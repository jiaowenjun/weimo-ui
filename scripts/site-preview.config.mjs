import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// 本地复现 GitHub Pages 合并部署:/weimo-ui/ 前缀 + pages-dist 组装产物。
// vite preview 按 base 挂载 outDir,无需软链;未知路径回退落地页(近似
// Pages 的 404.html 兜底,差异是状态码 200 vs 404)。依赖各 site 自带的
// vite,经根 package.json 的 site:preview 从 core 站点目录启动。
export default {
  base: '/weimo-ui/',
  build: {
    outDir: path.join(root, 'pages-dist'),
    emptyOutDir: false,
  },
  preview: {
    port: 4180,
    strictPort: true,
  },
}
