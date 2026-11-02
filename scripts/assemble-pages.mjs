import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const outDir = path.join(root, 'pages-dist')

const sites = [
  { short: 'core', title: 'weimo-ui-core', desc: '基础组件与设计 token' },
  { short: 'template', title: 'weimo-ui-template', desc: '站点模板 SiteTemplate / MiniSiteTemplate' },
  { short: 'editor', title: 'weimo-ui-editor', desc: 'WdfCard 富文本卡片与编辑器' },
  { short: 'stats', title: 'weimo-ui-stats', desc: '热力图与统计大数字' },
  { short: 'tagtree', title: 'weimo-ui-tagtree', desc: '标签树与面包屑' },
  { short: 'image', title: 'weimo-ui-image', desc: '图片视图与上传' },
  { short: 'ocr', title: 'weimo-ui-ocr', desc: 'OCR 卡片/上传/校对' },
]

mkdirSync(outDir, { recursive: true })

for (const { short, title } of sites) {
  const dist = path.join(root, 'packages', title, 'site', 'dist')
  const index = path.join(dist, 'index.html')
  if (!existsSync(index)) {
    throw new Error(`缺少站点产物: ${title}/site/dist/index.html(先跑 pnpm -r build)`)
  }
  const target = path.join(outDir, short)
  cpSync(dist, target, { recursive: true })
  // SPA fallback:深链 404 时由最近目录的 404.html 回应用壳
  cpSync(index, path.join(target, '404.html'))
  console.log(`✓ ${short} <- packages/${title}/site/dist`)
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
      <p class="sub">七个独立 npm 包共享一个 Pages 站点,各站按路径收纳</p>
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
