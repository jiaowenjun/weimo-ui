import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

function readProjectFile(relativePath) {
  const absolutePath = join(root, relativePath)

  assert.ok(existsSync(absolutePath), `${relativePath} must exist.`)

  return readFileSync(absolutePath, 'utf8')
}

const packageJson = JSON.parse(readProjectFile('package.json'))
const readmeSource = readProjectFile('README.md')
const manifestSource = readProjectFile('src/docs/components-manifest.ts')
const componentDocsSource = readProjectFile('src/docs/component-docs.tsx')
const detailPageSource = readProjectFile('src/docs/pages/component-detail-page.tsx')
const docsShellSource = readProjectFile('src/docs/docs-shell.tsx')
const searchSource = readProjectFile('src/docs/search-component-docs.ts')
const colorSource = readProjectFile('src/docs/token-preview-color.ts')
const cardSource = readProjectFile('src/components/token-preview-card.tsx')
const cardCss = readProjectFile('src/components/token-preview-card.css')
const cardDefinitionSource = readProjectFile(
  'src/docs/component-definitions/token-preview-card.tsx',
)
const cardDemoSource = readProjectFile(
  'src/docs/component-definitions/token-preview-card-demo.tsx',
)
const cardRegistry = JSON.parse(readProjectFile('registry/token-preview-card.json'))
const appCss = readProjectFile('src/App.css')

assert.ok(
  packageJson.scripts?.test?.includes('scripts/token-style-detail-contract.test.mjs'),
  'package.json test script must run the Token / style detail-page contract.',
)

for (const snippet of [
  '## Token / 样式 详情页规范',
  'Token / 样式 分组下的组件详情页只用于展示底层 token 值。',
  '页面主轴必须是 token 名称、亮/暗值、utility/helper 映射和最小必要说明。',
  '不要把 Token / 样式 详情页写成组件 API、业务用法或 selector 行为文档。',
]) {
  assert.ok(readmeSource.includes(snippet), `README must keep the token detail-page rule: ${snippet}`)
}

assert.ok(
  manifestSource.includes("group: 'token-style'") &&
    manifestSource.includes("exportName: 'Md'"),
  'the manifest must keep token grouping while separating the Md display and export names.',
)

assert.ok(
  componentDocsSource.includes('searchAliases: definition.searchAliases ?? []') &&
    searchSource.includes('doc.exportName') &&
    searchSource.includes('doc.registryName') &&
    searchSource.includes('doc.packageExport') &&
    searchSource.includes('...doc.searchAliases'),
  'docs search must index stable component identity and token aliases independently of summaries.',
)

assert.ok(
  !existsSync(join(root, 'src/docs/token-preview-details.tsx')) &&
    !appCss.includes('.token-preview-details'),
  'unused token preview detail markup and styles must stay removed.',
)

for (const snippet of [
  "import { CardSurface } from './card-surface'",
  'export type TokenPreviewCardProps',
  'export function TokenPreviewCard',
  'darkValue?: ReactNode',
  'className="token-preview-card__meta"',
  'className="token-preview-card__label"',
  'className="token-preview-card__token"',
  'className="token-preview-card__value"',
  'className="token-preview-card__value--light"',
  'className="token-preview-card__value--dark"',
  '{children}',
]) {
  assert.ok(cardSource.includes(snippet), `TokenPreviewCard must include ${snippet}.`)
}

for (const selector of [
  '.token-preview-card',
  '.token-preview-card__meta',
  '.token-preview-card__label',
  '.token-preview-card__token',
  '.token-preview-card__value',
  '.token-preview-card__value--dark',
  '.dark .token-preview-card__value--light',
]) {
  assert.ok(cardCss.includes(selector), `TokenPreviewCard styles must include ${selector}.`)
}

assert.ok(
  cardCss.includes('.token-preview-card__meta {\n    display: grid;') &&
    cardSource.includes('<code className="token-preview-card__token">{token}</code>') &&
    cardSource.includes('<code className="token-preview-card__value">') &&
    !cardCss.includes('margin-left: auto;'),
  'TokenPreviewCard must place the label, token identity, and value on dedicated rows.',
)

assert.ok(
  cardCss.includes('.token-preview-card > .token-preview-card__meta ~ * {') &&
    cardCss.includes('height: 80px;') &&
    cardCss.includes('min-height: 80px;') &&
    cardCss.includes('overflow: hidden;') &&
    cardCss.includes('isolation: isolate;') &&
    cardCss.includes('border: 1px solid var(--color-border);') &&
    cardCss.includes('border-radius: var(--radius-sm);') &&
    cardCss.includes('background: var(--color-bg-raised);') &&
    !cardSource.includes('token-preview-card__preview'),
  'TokenPreviewCard must own the shared size and surface styles for each direct preview child.',
)

assert.ok(
  cardCss.includes('.token-preview-card .token-preview-card__surface-backdrop {') &&
    cardCss.includes('.token-preview-card .token-preview-card__surface {') &&
    cardCss.includes('inset: 10px 12px;') &&
    cardDemoSource.match(/className="token-preview-card__surface-preview"/g)?.length === 2 &&
    cardDemoSource.match(/className="token-preview-card__surface-backdrop"/g)?.length === 2 &&
    cardDemoSource.includes(
      "className={`token-preview-card__surface ${getBgColorClassName('selection')}`}",
    ) &&
    cardDemoSource.includes(
      "className={`token-preview-card__surface ${getBgBlurClassName('backdrop')}`}",
    ),
  'Transparent color and blur demos must share one TokenPreviewCard surface layout.',
)

for (const selector of [
  '.bg-color-preview__sample',
  '.border-radius-preview__sample',
  '.border-color-preview__sample',
  '.font-size-preview__sample',
  '.text-color-preview__sample',
  '.typography-preview__sample',
  '.heat-color-preview__sample',
  '.pressable-preview__sample',
  '.md-style-preview__effect',
]) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  assert.match(
    appCss,
    new RegExp(`${escapedSelector}\\s*\\{[^}]*height: 80px;`),
    `${selector} must define an 80px preview element height.`,
  )
}

assert.equal(
  packageJson.exports?.['./components/token-preview-card'],
  './src/components/token-preview-card.tsx',
  'TokenPreviewCard must have a public package export.',
)
assert.ok(
  manifestSource.includes("id: 'token-preview-card'") &&
    manifestSource.includes("name: 'TokenPreviewCard'") &&
    manifestSource.includes("registryName: 'token-preview-card'") &&
    manifestSource.includes("packageExport: './components/token-preview-card'"),
  'TokenPreviewCard must be listed in the Token / style component catalog.',
)
assert.ok(
    cardDefinitionSource.includes("id: 'token-preview-card'") &&
    cardDefinitionSource.includes("frame: 'plain',") &&
    cardDefinitionSource.includes("'交互'") &&
    !cardDefinitionSource.includes("'自定义内容'") &&
    cardDefinitionSource.includes('<TokenPreviewCardDemo') &&
    cardDemoSource.includes('<TokenPreviewCard') &&
    cardDemoSource.includes('token-preview-card-demo__category') &&
    cardDemoSource.includes('非透明背景色') &&
    cardDemoSource.includes('bgColorToneMap.primary') &&
    cardDemoSource.includes("getBgColorClassName('primary')") &&
    cardDemoSource.includes('透明背景色') &&
    cardDemoSource.includes('背景模糊度') &&
    cardDemoSource.includes('边框圆角') &&
    cardDemoSource.includes('边框色') &&
    cardDemoSource.includes('字号') &&
    cardDemoSource.includes('字色') &&
    cardDemoSource.includes('字体') &&
    cardDemoSource.includes("token: '--font-mono'") &&
    cardDemoSource.includes('typography-preview__sample--font-family') &&
    cardDemoSource.includes('行高') &&
    cardDemoSource.includes("token: '--font-line-height-reading'") &&
    cardDemoSource.includes('typography-preview__sample--line-height') &&
    appCss.includes('font-family: var(--font-mono);') &&
    appCss.includes('line-height: var(--font-line-height-reading);') &&
    !cardDefinitionSource.includes("'热力色'") &&
    !cardDemoSource.includes('热力色') &&
    cardDemoSource.includes(
      '<h2 className="token-preview-card-demo__category">交互</h2>',
    ) &&
    cardDemoSource.includes('按压反馈') &&
    !cardDemoSource.includes('状态与自定义内容') &&
    !cardDemoSource.includes('自定义内容') &&
    appCss.includes('.token-preview-card-demo__category'),
  'TokenPreviewCard docs must categorize every supported preview effect.',
)
assert.equal(cardRegistry.name, 'token-preview-card')
assert.equal(cardRegistry.type, 'registry:ui')
assert.deepEqual(cardRegistry.registryDependencies, [
  '@weimo/style',
  '@weimo/utils',
  '@weimo/card-surface',
])

for (const snippet of [
  'useSyncExternalStore',
  'parseColorLightness',
  'effectiveColorLightness',
  'sortByThemeLightness',
  'useIsDarkTheme',
]) {
  assert.ok(colorSource.includes(snippet), `shared token color behavior must include ${snippet}.`)
}

const semanticTokenDefinitions = [
  'bg-blur',
  'bg-color',
  'border-color',
  'border-radius',
  'font-size',
  'heat-color',
  'pressable',
  'text-color',
]

const tokenPreviewWrappers = {
  'bg-blur': 'bg-blur-preview',
  'bg-color': 'bg-color-preview',
  'border-color': 'border-color-preview',
  'border-radius': 'border-radius-preview',
  'font-size': 'font-size-preview',
  'heat-color': 'heat-color-preview',
  pressable: 'pressable-preview',
  'text-color': 'text-color-preview',
}

for (const componentId of semanticTokenDefinitions) {
  const definitionSource = readProjectFile(`src/docs/component-definitions/${componentId}.tsx`)

  assert.ok(
      definitionSource.includes("frame: 'plain',") &&
      definitionSource.includes('searchAliases:') &&
      definitionSource.includes("import { TokenPreviewCard } from '../../components/token-preview-card'") &&
      definitionSource.includes('<TokenPreviewCard') &&
      !definitionSource.includes('description={item.description}') &&
      !definitionSource.includes('uiUsage={item.uiUsage}') &&
      !definitionSource.includes('bijiUsage={item.bijiUsage}') &&
      !definitionSource.includes(`className="${tokenPreviewWrappers[componentId]}"`) &&
      !appCss.includes(`\n.${tokenPreviewWrappers[componentId]} {`),
    `${componentId} must render searchable cards directly without a preview wrapper or redundant prose.`,
  )
}

assert.ok(
  docsShellSource.includes("const tokenPreview = selected?.group === 'token-style'") &&
    docsShellSource.includes("'app-shell__content app-shell__content--token-grid'") &&
    docsShellSource.includes('data-component-id={selected?.id}') &&
    detailPageSource.includes("if (selected.frame === 'plain')") &&
    detailPageSource.includes('return selected.preview(previewContext)') &&
    appCss.includes('.app-shell__content--token-grid'),
  'token cards must be direct app-shell__content children and use the content-level grid.',
)

const bgBlurDefinitionSource = readProjectFile('src/docs/component-definitions/bg-blur.tsx')
const borderColorDefinitionSource = readProjectFile('src/docs/component-definitions/border-color.tsx')

assert.ok(
  !bgBlurDefinitionSource.includes('<TokenPreviewDetails') &&
    bgBlurDefinitionSource.includes('item.backgroundToken'),
  'BgBlur must hide related-token prose while keeping the background token searchable.',
)

assert.ok(
  !borderColorDefinitionSource.includes('<TokenPreviewDetails') &&
    borderColorDefinitionSource.includes('...contexts.flatMap'),
  'BorderColor must hide related-token prose while keeping those tokens searchable.',
)

const mdDefinitionSource = readProjectFile('src/docs/component-definitions/md.tsx')

assert.ok(
  mdDefinitionSource.includes("frame: 'plain',") &&
    mdDefinitionSource.includes('searchAliases:') &&
    mdDefinitionSource.includes('<TokenPreviewCard') &&
    mdDefinitionSource.includes('<CardPanel className="md-style-preview__scene"') &&
    mdDefinitionSource.includes('<Md content={mdRenderSample} />') &&
    !mdDefinitionSource.includes('className="md-style-preview"') &&
    !appCss.includes('\n.md-style-preview {'),
  'Markdown token docs must remain token-first, searchable, and grounded in a real rendering sample.',
)

assert.ok(
  !existsSync(join(root, 'src/docs/component-definitions/pressable-demo.tsx')),
  'the removed standalone Pressable demo must not be reintroduced.',
)
