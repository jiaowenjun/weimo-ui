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

function blockFor(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))

  assert.ok(match, `${selector} block must exist.`)

  return match[1]
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
const cardRegistry = JSON.parse(readProjectFile('registry/token-preview-card.json'))
const appCss = readProjectFile('src/App.css')
const previewBlock = blockFor(
  cardCss,
  '.token-preview-card > .token-preview-card__meta ~ *',
)
const transparentSurfaceBlock = blockFor(
  cardCss,
  '.token-preview-card .token-preview-card__surface',
)
const backgroundSampleBlock = blockFor(appCss, '.bg-color-preview__sample')
const borderSampleBlock = blockFor(appCss, '.border-color-preview__sample')

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

const cardRowBlock = blockFor(cardCss, '.token-preview-card__row')

assert.ok(
  cardCss.includes('.token-preview-card__meta {\n    display: grid;') &&
    cardSource.includes('<code className="token-preview-card__token">{row.token}</code>') &&
    cardSource.includes('<code className="token-preview-card__value">') &&
    cardSource.includes('className="token-preview-card__row"') &&
    !cardCss.includes('margin-left: auto;'),
  'TokenPreviewCard must place the label above one two-column token-name/value row.',
)
assert.ok(
  cardRowBlock.includes('display: grid;') &&
    cardRowBlock.includes('grid-template-columns: repeat(2, minmax(0, 1fr));') &&
    cardCss.includes('.token-preview-card__token {\n    text-align: left;') &&
    cardCss.includes('.token-preview-card__value {\n    text-align: right;'),
  'TokenPreviewCard must align the token name left and the value right on every row.',
)
assert.ok(
  cardSource.includes('export type TokenPreviewCardItem') &&
    cardSource.includes('items?: readonly TokenPreviewCardItem[]') &&
    cardSource.includes('rows.map((row) => (') &&
    cardSource.includes('key={row.token}') &&
    cardSource.includes(
      "items ?? (token === undefined || value === undefined ? [] : [{ darkValue, token, value }])",
    ) &&
    !cardCss.includes('grid-column:'),
  'TokenPreviewCard must support multi-token rows through items while keeping the single-token props, without component-level grid placement.',
)

const cardSwatchBlock = blockFor(cardCss, '.token-preview-card__value-swatch')

assert.ok(
  cardSource.includes('const colorValuePattern =') &&
    cardSource.includes("renderTokenValue(row.value, 'token-preview-card__value-swatch')") &&
    cardSource.includes("renderTokenValue(row.darkValue, 'token-preview-card__value-swatch')") &&
    cardSource.includes('background: `linear-gradient(${value}),') &&
    cardSource.includes('aria-hidden="true"') &&
    cardSwatchBlock.includes('display: inline-block;') &&
    cardSwatchBlock.includes('width: 12px;') &&
    cardSwatchBlock.includes('height: 12px;') &&
    cardSwatchBlock.includes('margin-left: 6px;'),
  'TokenPreviewCard must append a checkerboard-backed swatch to the right of every color token value in the single and light/dark branches.',
)

assert.ok(
  previewBlock.includes('min-height: 80px;') &&
    !previewBlock.includes('\n    height: 80px;') &&
    previewBlock.includes('overflow: hidden;') &&
    previewBlock.includes('isolation: isolate;') &&
    previewBlock.includes('border-radius: var(--radius-sm);') &&
    !previewBlock.includes('border:') &&
    !previewBlock.includes('background:') &&
    !cardSource.includes('token-preview-card__preview'),
  'TokenPreviewCard must let each direct preview child grow to its content height with an 80px floor, without a default border or background.',
)

assert.ok(
  !backgroundSampleBlock.includes('border:') &&
    !backgroundSampleBlock.includes('background:') &&
    borderSampleBlock.includes('border: 1px solid;') &&
    !borderSampleBlock.includes('background:'),
  'Background and border previews must leave their visible color to the token-specific utility class.',
)

assert.ok(
  cardCss.includes('.token-preview-card .token-preview-card__surface-backdrop {') &&
    cardCss.includes('.token-preview-card .token-preview-card__surface {') &&
    transparentSurfaceBlock.includes('inset: 10px 12px;') &&
    !transparentSurfaceBlock.includes('border:') &&
    !transparentSurfaceBlock.includes('background:'),
  'Transparent color and blur previews must share one TokenPreviewCard surface layout.',
)

for (const selector of [
  '.bg-color-preview__sample',
  '.border-radius-preview__sample',
  '.border-color-preview__sample',
  '.font-size-preview__sample',
  '.text-color-preview__sample',
  '.typography-preview__sample',
  '.pressable-preview__sample',
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
    manifestSource.includes("packageExport: './components/token-preview-card'") &&
    manifestSource.includes(
      "packageExport: './components/token-preview-card',\n    group: 'token-style',\n    docs: false,",
    ),
  'TokenPreviewCard must be listed in the Token / style component catalog as a registry-only entry.',
)
assert.ok(
  !existsSync(join(root, 'src/docs/component-definitions/token-preview-card.tsx')) &&
    !existsSync(join(root, 'src/docs/component-definitions/token-preview-card-demo.tsx')),
  'the TokenPreviewCard debug docs page must stay removed; each token group has its own detail page.',
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
  'bg-color',
  'border-color',
  'font-size',
]

const tokenPreviewWrappers = {
  'bg-color': 'bg-color-preview',
  'border-color': 'border-color-preview',
  'font-size': 'font-size-preview',
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

const bgColorDefinitionSource = readProjectFile('src/docs/component-definitions/bg-color.tsx')
const borderColorDefinitionSource = readProjectFile('src/docs/component-definitions/border-color.tsx')
const fontSizeDefinitionSource = readProjectFile('src/docs/component-definitions/font-size.tsx')

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
  !existsSync(join(root, 'src/docs/component-definitions/bg-blur.tsx')) &&
    bgColorDefinitionSource.includes('>背景模糊度</h2>') &&
    bgColorDefinitionSource.includes('bgBlurTones.map') &&
    bgColorDefinitionSource.includes('item.backgroundToken'),
  'BgBlur and BgColor docs must share the grouped Background detail page.',
)

assert.ok(
  !existsSync(join(root, 'src/docs/component-definitions/pressable.tsx')) &&
    !existsSync(join(root, 'src/docs/component-definitions/pressable-demo.tsx')) &&
    bgColorDefinitionSource.includes('pressableToneMap') &&
    bgColorDefinitionSource.includes('pressable-preview__sample'),
  'Pressable docs must stay merged into the BgColor detail page.',
)

assert.ok(
  !existsSync(join(root, 'src/docs/component-definitions/heat-color.tsx')) &&
    bgColorDefinitionSource.includes('heatColorLevels.map') &&
    bgColorDefinitionSource.includes('<TokenPreviewCard') &&
    bgColorDefinitionSource.includes('heat-color-preview__swatch') &&
    bgColorDefinitionSource.includes('label="热力图"'),
  'HeatColor docs must stay merged into the BgColor detail page under the grouped TokenPreviewCard.',
)

assert.ok(
  !existsSync(join(root, 'src/docs/component-definitions/text-color.tsx')) &&
    fontSizeDefinitionSource.includes('>字色</h2>') &&
    fontSizeDefinitionSource.includes('>字号</h2>') &&
    fontSizeDefinitionSource.includes('textColorToneMap') &&
    fontSizeDefinitionSource.includes('fontSizeScaleMap'),
  'TextColor and FontSize docs must share the grouped Font detail page.',
)

assert.ok(
  !existsSync(join(root, 'src/docs/component-definitions/border-radius.tsx')) &&
    borderColorDefinitionSource.includes('>圆角</h2>') &&
    borderColorDefinitionSource.includes('>边框色</h2>') &&
    borderColorDefinitionSource.includes('borderRadiusScaleMap') &&
    borderColorDefinitionSource.includes('borderColorToneMap'),
  'BorderRadius and BorderColor docs must share the grouped Border detail page.',
)
