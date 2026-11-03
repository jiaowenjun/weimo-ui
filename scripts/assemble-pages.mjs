import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const outDir = path.join(root, 'pages-dist')

// GitHub Pages 只响应产物根部的 404.html(即落地页),子目录 404.html 一律忽略。
// 因此各站每条深链路由都要物化成 <route>/index.html 实体文件,否则 iframe、
// 直达、刷新都会被根部 404 拦到静态落地页;未知路径仍由落地页兜底。
const sites = [
  { short: 'core', title: 'weimo-ui-core', desc: '基础组件与设计 token' },
  { short: 'template', title: 'weimo-ui-template', desc: '站点模板 SiteTemplate / MiniSiteTemplate', extraRoutes: ['previews/site-template', 'previews/mini-site-template'] },
  { short: 'editor', title: 'weimo-ui-editor', desc: 'WdfCard 富文本卡片与编辑器', flatRoot: true },
  { short: 'stats', title: 'weimo-ui-stats', desc: '热力图与统计大数字', flatRoot: true },
  { short: 'tagtree', title: 'weimo-ui-tagtree', desc: '标签树与面包屑', flatRoot: true },
  { short: 'image', title: 'weimo-ui-image', desc: '图片视图与上传' },
  { short: 'ocr', title: 'weimo-ui-ocr', desc: 'OCR 卡片/上传/校对' },
  { short: 'agent', title: 'weimo-ui-agent', desc: 'Agent 会话输入框', flatRoot: true },
]

mkdirSync(outDir, { recursive: true })

/** 从站点 catalog manifest 提取组件页路由,与 componentHref 同源,免手工同步。
    manifest 只含类型导入和可擦除语法,依赖 Node ≥23.6 的原生 TS 类型剥离。 */
async function catalogRoutes(siteDir) {
  const catalogDir = path.join(siteDir, 'src', 'docs', 'catalog', 'packages')
  if (!existsSync(catalogDir)) return []

  const routes = []
  for (const entry of readdirSync(catalogDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue

    const manifestPath = path.join(catalogDir, entry.name, 'manifest.ts')
    if (!existsSync(manifestPath)) continue

    const mod = await import(pathToFileURL(manifestPath).href)
    const catalog = Object.values(mod).find((value) => value && Array.isArray(value.pages))
    if (!catalog) {
      throw new Error(`catalog 缺少 pages 数组: ${manifestPath}`)
    }

    // 顶层 page 才参与路由;嵌套 components 的 docs:false,由所属页面承载
    for (const page of catalog.pages) {
      routes.push(`components/${encodeURIComponent(page.id)}`)
    }
  }
  return routes
}

for (const { short, title, extraRoutes = [], flatRoot = false } of sites) {
  const siteDir = path.join(root, 'packages', title, 'site')
  const dist = path.join(siteDir, 'dist')
  const index = path.join(dist, 'index.html')
  if (!existsSync(index)) {
    throw new Error(`缺少站点产物: ${title}/site/dist/index.html(先跑 pnpm -r build)`)
  }

  // 先清空目标目录,避免改名/下线的路由残留幽灵页面
  const target = path.join(outDir, short)
  rmSync(target, { recursive: true, force: true })
  cpSync(dist, target, { recursive: true })

  // flatRoot:单页站(MiniSiteTemplate + 唯一演示页)内容直出根路径,无深链可物化
  const routes = flatRoot
    ? extraRoutes
    : [...(await catalogRoutes(siteDir)), ...extraRoutes]
  if (!flatRoot && routes.length === 0) {
    throw new Error(`${title} 未物化出任何深链路由`)
  }
  for (const route of routes) {
    const routeIndex = path.join(target, ...route.split('/'), 'index.html')
    mkdirSync(path.dirname(routeIndex), { recursive: true })
    cpSync(index, routeIndex)
  }
  const routeNote = flatRoot ? '根路径直出' : `${routes.length} 条深链路由`
  console.log(`✓ ${short} <- packages/${title}/site/dist(${routeNote})`)
}

const items = sites
  .map(
    ({ short, title, desc }) => `      <li>
        <a href="/weimo-ui/${short}/"><strong>${title}</strong></a>
        <span>${desc}</span>
      </li>`,
  )
  .join('\n')

const landing = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>weimo-ui · 组件家族文档站</title>
    <style>
      :root { color-scheme: light dark; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: system-ui, -apple-system, sans-serif;
        background: hsl(40 16% 96%);
        color: hsl(0 0% 9%);
      }
      @media (prefers-color-scheme: dark) {
        body { background: hsl(0 0% 7%); color: hsl(0 0% 95%); }
      }
      main { max-width: 640px; padding: 48px 24px; }
      h1 { font-size: 1.6rem; margin: 0 0 8px; }
      p.sub { margin: 0 0 32px; opacity: 0.65; font-size: 0.95rem; }
      ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
      li { display: flex; flex-wrap: wrap; align-items: baseline; gap: 10px; }
      a { color: inherit; }
      a strong { font-size: 1.02rem; }
      li span { opacity: 0.6; font-size: 0.88rem; }
      a:hover strong { text-decoration: underline; }
    </style>
  </head>
  <body>
    <main>
      <h1>weimo-ui</h1>
      <p class="sub">八个独立 npm 包共享一个 Pages 站点,各站按路径收纳</p>
      <ul>
${items}
      </ul>
    </main>
  </body>
</html>
`

writeFileSync(path.join(outDir, 'index.html'), landing)
cpSync(path.join(outDir, 'index.html'), path.join(outDir, '404.html'))
console.log('✓ 落地页 index.html / 404.html')
