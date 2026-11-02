import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

// 站点契约:断言文档站消费模板公开 API 与既定结构,防演示复刻/壳层结构回归。
// 2026-10-31 按现行结构重写:旧版断言的复刻式预览(site-template-preview.tsx,
// 视口开关/宽度滑块直挂卡片)自 e8b0e87「实底 iframe 预览扶正」起已不存在,
// 脚本 ENOENT 恒红;现断言对象=单页双卡 + iframe 直出 + 实底跟随缩放体系。

const shellSource = await readFile(
  new URL('../site/src/docs/shell/docs-shell.tsx', import.meta.url),
  'utf8',
)
const layoutPage = await readFile(
  new URL('../site/src/docs/pages/layout-example-page.tsx', import.meta.url),
  'utf8',
)
const siteDemo = await readFile(
  new URL('../site/src/docs/examples/site-template-demo.tsx', import.meta.url),
  'utf8',
)
const miniDemo = await readFile(
  new URL('../site/src/docs/examples/mini-site-template-demo.tsx', import.meta.url),
  'utf8',
)
const followFrame = await readFile(
  new URL('../site/src/docs/preview/solid-follow-preview-frame.tsx', import.meta.url),
  'utf8',
)
const sitePreviewPage = await readFile(
  new URL('../site/src/docs/previews/site-template-preview-page.tsx', import.meta.url),
  'utf8',
)
const miniPreviewPage = await readFile(
  new URL('../site/src/docs/previews/mini-site-template-preview-page.tsx', import.meta.url),
  'utf8',
)
const routesModule = await readFile(
  new URL('../site/src/docs/routes.ts', import.meta.url),
  'utf8',
)
const globalStyles = await readFile(
  new URL('../site/src/styles/global.css', import.meta.url),
  'utf8',
)
const templateBaseStyles = await readFile(
  new URL('../src/styles/base.css', import.meta.url),
  'utf8',
)
const mainEntry = await readFile(
  new URL('../site/src/main.tsx', import.meta.url),
  'utf8',
)
const siteHtml = await readFile(
  new URL('../site/index.html', import.meta.url),
  'utf8',
)
const sitePackage = JSON.parse(
  await readFile(new URL('../site/package.json', import.meta.url), 'utf8'),
)

// 文档站壳:消费公开 MiniSiteTemplate API,顶栏双按钮(返回主页/GitHub)为既定终态,
// 站内不再放主题切换(组件契约默认跟随系统)。
assert.match(
  shellSource,
  /from 'weimo-ui-template\/components\/mini-site-template'/,
  'the site shell must consume the public MiniSiteTemplate API',
)
assert.match(
  shellSource,
  /showThemeToggle=\{false\}/,
  'the shell must not duplicate the theme toggle (system-following is the contract)',
)
assert.match(shellSource, /aria-label="返回主页"/, 'the top bar must keep the back-to-home button')
assert.match(shellSource, /aria-label="GitHub 仓库"/, 'the top bar must keep the GitHub button')

// 布局示例页:单页双卡,完整版与 mini 演示并列。
assert.match(
  layoutPage,
  /<SiteTemplateDemo \/>[\s\S]*<MiniSiteTemplateDemo \/>/,
  'the layout page must render both template demos side by side',
)

// 演示卡:真实组件经 iframe 直出,卡片本体只负责壳与滑块。
for (const [name, demo, hrefFactory] of [
  ['SiteTemplate demo', siteDemo, 'siteTemplatePreviewHref'],
  ['MiniSiteTemplate demo', miniDemo, 'miniSiteTemplatePreviewHref'],
]) {
  assert.match(
    demo,
    /from 'weimo-ui-core\/components\/component-preview-card'/,
    `the ${name} must use the standard ComponentPreviewCard`,
  )
  assert.match(
    demo,
    /from '\.\.\/routes'/,
    `the ${name} must derive its iframe href from the shared routes module`,
  )
  assert.match(
    demo,
    new RegExp(hrefFactory),
    `the ${name} must link its preview iframe through ${hrefFactory}`,
  )
  assert.match(
    demo,
    /from '\.\.\/preview\/solid-follow-preview-frame'/,
    `the ${name} must render through the SolidFollowPreviewFrame`,
  )
  assert.match(
    demo,
    /from 'weimo-ui-core\/components\/slider'/,
    `the ${name} width control must use the core Slider`,
  )
  assert.match(demo, /ariaLabel="调整预览宽度百分比"/, `the ${name} slider must be labelled`)
  assert.match(demo, /aria-label="重置预览宽度百分比"/, `the ${name} must keep a reset control`)
}

// 实底跟随预览壳:缩放倍率由 BASE_WIDTH ÷ maxLayoutWidth 派生且恒定,
// 卡片装不下基准时右端点动态收紧——比例恒定语义是这套预览的地基。
assert.match(
  followFrame,
  /const BASE_WIDTH = 672/,
  'the follow frame must keep the fixed scale base width',
)
assert.match(
  followFrame,
  /const zoomFactor = maxLayoutWidth \/ BASE_WIDTH/,
  'the zoom factor must derive from the base width',
)
assert.match(
  followFrame,
  /const scale = 1 \/ zoomFactor/,
  'the scale must stay constant per card regardless of slider position',
)

// iframe 直出页:两壳各自消费对应公开 API,演示的是真实组件而非复刻。
assert.match(
  sitePreviewPage,
  /from 'weimo-ui-template\/components\/site-template'/,
  'the preview page must consume the public SiteTemplate API',
)
assert.match(
  miniPreviewPage,
  /from 'weimo-ui-template\/components\/mini-site-template'/,
  'the preview page must consume the public MiniSiteTemplate API',
)
assert.match(
  routesModule,
  /export function siteTemplatePreviewHref\(\)/,
  'routes must expose the SiteTemplate preview href factory',
)
assert.match(
  routesModule,
  /export function miniSiteTemplatePreviewHref\(\)/,
  'routes must expose the MiniSiteTemplate preview href factory',
)

assert.match(
  globalStyles,
  /@import "weimo-ui-template\/styles\/base\.css";/,
  'the site must consume the public template base stylesheet',
)
assert.match(
  templateBaseStyles,
  /button,[\s\S]*?::file-selector-button[\s\S]*?\{[\s\S]*?background-color:\s*transparent;/,
  'base.css must reset form control backgrounds (Tailwind preflight parity) so consumers without Tailwind never see the UA ButtonFace gray',
)
assert.match(
  siteHtml,
  /html\s*{[^}]*background-color:\s*hsl\(40 16% 96%\);[^}]*}/s,
  'the document must provide the light page background before site CSS loads',
)
assert.match(
  siteHtml,
  /html\.dark\s*{[^}]*background-color:\s*hsl\(0 0% 7%\);[^}]*color-scheme:\s*dark;[^}]*}/s,
  'the document must provide the dark page background before site CSS loads',
)
assert.match(
  siteHtml,
  /document\.documentElement\.classList\.toggle\(\s*'dark',\s*window\.matchMedia\('\(prefers-color-scheme: dark\)'\)\.matches,?\s*\)/s,
  'the document must resolve the system theme before React mounts',
)
assert.ok(
  siteHtml.indexOf("window.matchMedia('(prefers-color-scheme: dark)')") <
    siteHtml.indexOf('<script type="module" src="./src/main.tsx"></script>'),
  'theme initialization must run before the application module',
)
assert.ok(
  mainEntry.indexOf("import './styles/global.css'") <
    mainEntry.indexOf("import App from './app/app'"),
  'global styles must load before App so Tailwind establishes cascade layer order before component CSS',
)
assert.match(
  sitePackage.dependencies['react-router'],
  /^\d+\.\d+\.\d+$/,
  'the site must pin an exact React Router version (family-shared, no loose range)',
)
assert.equal(
  sitePackage.dependencies['weimo-ui-template'],
  'workspace:*',
  'the self-hosted site must consume the workspace package',
)
assert.equal(
  sitePackage.engines,
  undefined,
  'the site must not declare its own Node engine range',
)

console.log('site contract passed')
