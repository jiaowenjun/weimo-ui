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
const cardSource = readProjectFile('src/docs/token-preview-card.tsx')
const cardCss = readProjectFile('src/docs/token-preview-card.css')
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
  "import { CardPanel } from '../components/coss/card'",
  'export type TokenPreviewCardProps',
  'export function TokenPreviewCard',
  'darkValue?: ReactNode',
  'className="token-preview-card__meta"',
  'className="token-preview-card__label"',
  'className="token-preview-card__token"',
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
  '.token-preview-card__value--dark',
  '.dark .token-preview-card__value--light',
]) {
  assert.ok(cardCss.includes(selector), `TokenPreviewCard styles must include ${selector}.`)
}

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
      definitionSource.includes("import { TokenPreviewCard } from '../token-preview-card'") &&
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
