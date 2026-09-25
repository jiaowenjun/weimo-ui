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
const cardSource = readProjectFile('src/components/component-preview-card.tsx')
const cardCss = readProjectFile('src/components/component-preview-card.css')
const cardRegistry = JSON.parse(readProjectFile('registry/component-preview-card.json'))
const previewCardDefinitionSource = readProjectFile(
  'src/docs/component-definitions/component-preview-card.tsx',
)
const appCss = readProjectFile('src/App.css')
const previewBlock = blockFor(
  cardCss,
  '.component-preview-card .base-card__content',
)
const transparentSurfaceBlock = blockFor(
  cardCss,
  '.component-preview-card .component-preview-card__surface',
)
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
  "import { BaseCard } from './base-card'",
  'export type ComponentPreviewCardProps',
  'export function ComponentPreviewCard',
  'darkValue?: ReactNode',
  'title={label}',
  'actionSlot={action}',
  'className="component-preview-card__token"',
  'className="component-preview-card__value"',
  'className="component-preview-card__value--light"',
  'className="component-preview-card__value--dark"',
  '{children}',
]) {
  assert.ok(cardSource.includes(snippet), `ComponentPreviewCard must include ${snippet}.`)
}

for (const selector of [
  '.component-preview-card',
  '.component-preview-card .base-card__meta',
  '.component-preview-card .base-card__content',
  '.component-preview-card__token',
  '.component-preview-card__value',
  '.component-preview-card__value--dark',
  '.dark .component-preview-card__value--light',
]) {
  assert.ok(cardCss.includes(selector), `ComponentPreviewCard styles must include ${selector}.`)
}

const cardRowBlock = blockFor(cardCss, '.component-preview-card__row')

assert.ok(
  cardCss.includes('.component-preview-card .base-card__meta {\n    display: grid;') &&
    cardSource.includes('<code className="component-preview-card__token">{row.token}</code>') &&
    cardSource.includes('<code className="component-preview-card__value">') &&
    cardSource.includes('className="component-preview-card__row"') &&
    !cardCss.includes('margin-left: auto;'),
  'ComponentPreviewCard must place the label above one two-column token-name/value row.',
)
assert.ok(
  cardRowBlock.includes('display: grid;') &&
    cardRowBlock.includes(
      'grid-template-columns: minmax(min-content, max-content) minmax(max-content, 1fr);',
    ) &&
    cardRowBlock.includes('gap: 2em;') &&
    cardCss.includes('.component-preview-card__token {\n    text-align: left;') &&
    cardCss.includes('.component-preview-card__value {\n    text-align: right;'),
  'ComponentPreviewCard must align the token name left and the value right on every row, keeping the token name on one line whenever it fits beside the value with at least a 2em gap.',
)
assert.ok(
  cardSource.includes('export type ComponentPreviewCardItem') &&
    cardSource.includes('items?: readonly ComponentPreviewCardItem[]') &&
    cardSource.includes('rows.map((row) => (') &&
    cardSource.includes('key={row.token}') &&
    cardSource.includes(
      "items ?? (token === undefined || value === undefined ? [] : [{ darkValue, token, value }])",
    ) &&
    !cardCss.includes('grid-column:'),
  'ComponentPreviewCard must support multi-token rows through items while keeping the single-token props, without component-level grid placement.',
)
assert.ok(
  cardSource.includes('label: ReactNode') &&
    cardSource.includes('title={label}'),
  'ComponentPreviewCard must always render the label title bar: only the token rows are optional.',
)
assert.ok(
  cardSource.includes('action?: ReactNode') &&
    cardSource.includes('actionSlot={action}') &&
    cardSource.includes('meta={'),
  'ComponentPreviewCard must support an optional action slot on the right of the label title bar via the BaseCard header.',
)
assert.ok(
  cardSource.includes('footer?: ReactNode') &&
    cardSource.includes('footerSlot={footer}'),
  'ComponentPreviewCard must expose an optional footer mapped onto the BaseCard footer slot.',
)

const cardSwatchBlock = blockFor(cardCss, '.component-preview-card__value-swatch')

assert.ok(
  cardSource.includes('const colorValuePattern =') &&
    cardSource.includes('function colorValueHasAlpha(') &&
    cardSource.includes("renderTokenValue(row.value, 'component-preview-card__value-swatch')") &&
    cardSource.includes("renderTokenValue(row.darkValue, 'component-preview-card__value-swatch')") &&
    cardSource.includes('const background = colorValueHasAlpha(value.trim())') &&
    cardSource.includes(': `linear-gradient(${value})`') &&
    cardSource.includes('linear-gradient(#fff, #fff)`') &&
    cardSource.includes('aria-hidden="true"') &&
    cardSwatchBlock.includes('display: inline-block;') &&
    cardSwatchBlock.includes('width: 12px;') &&
    cardSwatchBlock.includes('height: 12px;') &&
    cardSwatchBlock.includes('margin-left: 6px;'),
  'ComponentPreviewCard must append a swatch to the right of every color token value in the single and light/dark branches: one opaque gradient layer for opaque colors, and a checkerboard over a gradient-written white base only for colors with alpha.',
)

assert.ok(
  previewBlock.includes('min-height: 80px;') &&
    !previewBlock.includes('\n    height: 80px;') &&
    previewBlock.includes('overflow: hidden;') &&
    previewBlock.includes('isolation: isolate;') &&
    previewBlock.includes('border-radius: var(--radius);') &&
    !previewBlock.includes('border:') &&
    !previewBlock.includes('background:') &&
    !cardSource.includes('component-preview-card__preview'),
  'ComponentPreviewCard must let each direct preview child grow to its content height with an 80px floor, without a default border or background.',
)

assert.ok(
  borderSampleBlock.includes('border: 1px solid;') &&
    !borderSampleBlock.includes('background:'),
  'Border previews must leave their visible color to the token-specific utility class.',
)

assert.ok(
  cardCss.includes('.component-preview-card .component-preview-card__surface-backdrop {') &&
    cardCss.includes('.component-preview-card .component-preview-card__surface {') &&
    transparentSurfaceBlock.includes('inset: 10px 12px;') &&
    !transparentSurfaceBlock.includes('border:') &&
    !transparentSurfaceBlock.includes('background:'),
  'Transparent color and blur previews must share one ComponentPreviewCard surface layout.',
)

for (const selector of ['.bg-color-preview__selection-sample']) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  assert.match(
    appCss,
    new RegExp(`${escapedSelector}\\s*\\{[^}]*height: 80px;`),
    `${selector} must define an 80px preview element height.`,
  )
}

assert.equal(
  packageJson.exports?.['./components/component-preview-card'],
  './src/components/component-preview-card.tsx',
  'ComponentPreviewCard must have a public package export.',
)
assert.ok(
  manifestSource.includes("id: 'component-preview-card'") &&
    manifestSource.includes("name: '预览卡片'") &&
    manifestSource.includes("exportName: 'ComponentPreviewCard'") &&
    manifestSource.includes("registryName: 'component-preview-card'") &&
    manifestSource.includes("packageExport: './components/component-preview-card'") &&
    manifestSource.includes(
      "packageExport: './components/component-preview-card',\n    group: 'content-markdown',\n    docs: true,",
    ),
  'ComponentPreviewCard must be listed in the 内容 / Markdown catalog as the preview card docs page.',
)
assert.ok(
  existsSync(join(root, 'src/docs/component-definitions/component-preview-card.tsx')) &&
    previewCardDefinitionSource.includes("import { ComponentPreviewCard } from '../../components/component-preview-card'") &&
    previewCardDefinitionSource.includes("from '../glass-preview-card'") &&
    previewCardDefinitionSource.includes('<GlassPreviewCard') &&
    previewCardDefinitionSource.includes("frame: 'plain',") &&
    !existsSync(join(root, 'src/docs/component-definitions/component-preview-card-demo.tsx')),
  'the preview card docs page must live in 内容 / Markdown and show both ComponentPreviewCard and the shared GlassPreviewCard.',
)
assert.equal(cardRegistry.name, 'component-preview-card')
assert.equal(cardRegistry.type, 'registry:ui')
assert.deepEqual(cardRegistry.registryDependencies, [
  '@weimo/style',
  '@weimo/utils',
  '@weimo/base-card',
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
  'background-tokens',
  'border-tokens',
  'text-tokens',
]

const tokenPreviewWrappers = {
  'background-tokens': 'bg-color-preview',
  'border-tokens': 'border-color-preview',
  'text-tokens': 'font-size-preview',
}

for (const componentId of semanticTokenDefinitions) {
  const definitionSource = readProjectFile(`src/docs/component-definitions/${componentId}.tsx`)

  assert.ok(
      definitionSource.includes("frame: 'plain',") &&
      definitionSource.includes('searchAliases:') &&
      definitionSource.includes("import { ComponentPreviewCard } from '../../components/component-preview-card'") &&
      definitionSource.includes('<ComponentPreviewCard') &&
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

const backgroundTokensDefinitionSource = readProjectFile('src/docs/component-definitions/background-tokens.tsx')
const borderTokensDefinitionSource = readProjectFile('src/docs/component-definitions/border-tokens.tsx')
const textTokensDefinitionSource = readProjectFile('src/docs/component-definitions/text-tokens.tsx')

assert.ok(
  !borderTokensDefinitionSource.includes('<TokenPreviewDetails') &&
    borderTokensDefinitionSource.includes('...contexts.flatMap'),
  'BorderColor must hide related-token prose while keeping those tokens searchable.',
)

const mdDefinitionSource = readProjectFile('src/docs/component-definitions/md.tsx')

assert.ok(
  mdDefinitionSource.includes("frame: 'plain',") &&
    mdDefinitionSource.includes('searchAliases:') &&
    mdDefinitionSource.includes('<ComponentPreviewCard') &&
    mdDefinitionSource.includes('<CardPanel className="md-style-preview__scene"') &&
    mdDefinitionSource.includes('<Md content={mdRenderSample} />') &&
    !mdDefinitionSource.includes('className="md-style-preview"') &&
    !appCss.includes('\n.md-style-preview {'),
  'Markdown token docs must remain token-first, searchable, and grounded in a real rendering sample.',
)

assert.ok(
  !existsSync(join(root, 'src/docs/component-definitions/bg-blur.tsx')) &&
    backgroundTokensDefinitionSource.includes('label="背景模糊度"') &&
    backgroundTokensDefinitionSource.includes('bgBlurTones.map') &&
    backgroundTokensDefinitionSource.includes('item.backgroundToken'),
  'BgBlur and BgColor docs must share the grouped Background detail page.',
)

assert.ok(
  !existsSync(join(root, 'src/docs/component-definitions/pressable.tsx')) &&
    !existsSync(join(root, 'src/docs/component-definitions/pressable-demo.tsx')) &&
    backgroundTokensDefinitionSource.includes('pressableToneMap') &&
    !backgroundTokensDefinitionSource.includes('pressable-preview__sample'),
  'Pressable docs must stay merged into the BgColor detail page as the plain solid sample.',
)

assert.ok(
  !existsSync(join(root, 'src/docs/component-definitions/heat-color.tsx')) &&
    backgroundTokensDefinitionSource.includes('heatColorLevels.map') &&
    backgroundTokensDefinitionSource.includes('<ComponentPreviewCard') &&
    backgroundTokensDefinitionSource.includes('heat-color-preview__swatch') &&
    backgroundTokensDefinitionSource.includes('label="热力图"'),
  'HeatColor docs must stay merged into the BgColor detail page under the grouped ComponentPreviewCard.',
)

assert.ok(
  !existsSync(join(root, 'src/docs/component-definitions/text-color.tsx')) &&
    textTokensDefinitionSource.includes('label="字色"') &&
    textTokensDefinitionSource.includes('label="字号"') &&
    textTokensDefinitionSource.includes('textColorToneMap') &&
    textTokensDefinitionSource.includes('fontSizeScaleMap'),
  'TextColor and FontSize docs must share the grouped Font detail page.',
)

assert.ok(
  !existsSync(join(root, 'src/docs/component-definitions/border-radius.tsx')) &&
    !borderTokensDefinitionSource.includes('component-preview-card-demo__category') &&
    borderTokensDefinitionSource.includes('label="圆角"') &&
    borderTokensDefinitionSource.includes('label="边框色"') &&
    borderTokensDefinitionSource.includes('borderRadiusScaleMap') &&
    borderTokensDefinitionSource.includes('borderColorToneMap'),
  'BorderRadius and BorderColor docs must share the grouped Border detail page.',
)
