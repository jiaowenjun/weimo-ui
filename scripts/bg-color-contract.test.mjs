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

function readJson(relativePath) {
  return JSON.parse(readProjectFile(relativePath))
}

function blockFor(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const matches = Array.from(source.matchAll(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, 'g')))
  const match = matches.at(-1)

  assert.ok(match, `${selector} block must exist.`)

  return match[1]
}

function firstBlockFor(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))

  assert.ok(match, `${selector} block must exist.`)

  return match[1]
}

function cssVarsIncludeToken(item, token) {
  const key = token.slice(2)

  return ['theme', 'light', 'dark'].some((group) => key in (item.cssVars?.[group] ?? {}))
}

const expectedTones = [
  ['page', '--color-bg-page', 'bg-color--page', 'hsl(40 16% 96%)', 'hsl(0 0% 7%)'],
  ['card', '--color-bg-card', 'bg-color--card', 'hsl(0 0% 100%)', 'hsl(0 0% 12%)'],
  ['raised', '--color-bg-raised', 'bg-color--raised', 'hsl(40 10% 93%)', 'hsl(0 0% 17%)'],
  ['primary', '--color-bg-primary', 'bg-color--primary', 'hsl(0 0% 15%)', 'hsl(0 0% 96%)'],
  ['hover', '--color-bg-hover', 'bg-color--hover', 'hsl(40 12% 90%)', 'hsl(0 0% 21%)'],
  ['hover-on-hover', '--color-bg-nested-hover', 'bg-color--hover-on-hover', 'hsl(40 12% 88%)', 'hsl(0 0% 28%)'],
  ['selected', '--color-bg-selected', 'bg-color--selected', 'hsl(40 10% 94%)', 'hsl(0 0% 15%)'],
  ['chip', '--color-bg-chip', 'bg-color--chip', 'hsl(40 12% 92%)', 'hsl(0 0% 19%)'],
  ['selection', '--color-bg-selection', 'bg-color--selection', 'hsl(0 0% 15% / 0.2)', 'hsl(0 0% 96% / 0.2)'],
]

const expectedSwatchTones = [
  'page',
  'card',
  'selected',
  'raised',
  'chip',
  'hover',
  'hover-on-hover',
  'primary',
]

const excludedTokens = [
  '--color-heat-0',
  '--color-heat-1',
  '--color-bg-backdrop',
  '--color-border-divider',
  '--color-text-danger',
]

const opaqueFeedbackTokens = new Set([
  '--color-bg-hover',
  '--color-bg-nested-hover',
  '--color-bg-chip',
])

const expectedOpaqueFeedbackTokenValues = new Map([
  ['--color-bg-hover', ['hsl(40 12% 90%)', 'hsl(0 0% 21%)']],
  ['--color-bg-nested-hover', ['hsl(40 12% 88%)', 'hsl(0 0% 28%)']],
  ['--color-bg-chip', ['hsl(40 12% 92%)', 'hsl(0 0% 19%)']],
])

function assertOpaqueValue(value, token) {
  assert.ok(
    !value.includes('rgba(') &&
      !value.includes('hsla(') &&
      !/\/\s*(?:0?\.\d+|[1-9]\d?%)/.test(value) &&
      value !== 'var(--color-bg-hover)',
    `${token} must use an opaque concrete value instead of alpha or an indirect hover alias.`,
  )
}

function tokenValuesForSource(source, token) {
  const key = token.slice(2)
  const cssMatches = Array.from(source.matchAll(new RegExp(`${token}:\\s*([^;]+);`, 'g'))).map(
    (match) => match[1],
  )
  const jsonMatches = Array.from(source.matchAll(new RegExp(`"${key}":\\s*"([^"]+)"`, 'g'))).map(
    (match) => match[1],
  )

  return [...cssMatches, ...jsonMatches]
}

const packageJson = readJson('package.json')
const bgColorSource = readProjectFile('src/components/bg-color.ts')
const bgColorCss = readProjectFile('src/components/bg-color.css')
const manifestSource = readProjectFile('src/docs/components-manifest.ts')
const definitionsIndexSource = readProjectFile('src/docs/component-definitions/index.ts')
const docsDefinitionSource = readProjectFile('src/docs/component-definitions/background-tokens.tsx')
const textDocsSource = readProjectFile('src/docs/component-definitions/text-tokens.tsx')
const appCss = readProjectFile('src/App.css')
const tokenPreviewCardCss = readProjectFile('src/components/component-preview-card.css')
const tokensCss = readProjectFile('src/styles/tokens.css')
const dialogCss = readProjectFile('src/components/coss/dialog.css')
const commandCss = readProjectFile('src/components/coss/command.css')
const sidebarShellCss = readProjectFile('src/components/sidebar/sidebar-shell.css')
const rootRegistry = readJson('registry.json')
const styleRegistry = readJson('registry/style.json')
const standaloneRegistryItem = readJson('registry/bg-color.json')
const rootStyleItem = rootRegistry.items.find((item) => item.name === 'style')
const registryItem = rootRegistry.items.find((item) => item.name === 'bg-color')
const surfaceBackdropBlock = firstBlockFor(
  tokenPreviewCardCss,
  '.component-preview-card .component-preview-card__surface-backdrop',
)
const surfaceBlock = firstBlockFor(
  tokenPreviewCardCss,
  '.component-preview-card .component-preview-card__surface',
)

assert.equal(
  packageJson.exports?.['./components/bg-color'],
  './src/components/bg-color.ts',
  'package.json must expose the public bg-color tone map.',
)
assert.equal(
  packageJson.exports?.['./styles/bg-color.css'],
  './src/components/bg-color.css',
  'package.json must expose the standalone bg-color utility stylesheet.',
)
assert.ok(
  packageJson.scripts?.test?.includes('scripts/bg-color-contract.test.mjs'),
  'package.json test script must run bg-color-contract.test.mjs.',
)

assert.ok(
  bgColorSource.includes("import './bg-color.css'"),
  'bg-color tone map module must import its utility stylesheet.',
)
assert.ok(
  bgColorSource.includes('export const bgColorToneMap') &&
    bgColorSource.includes('export const bgColorTones') &&
    bgColorSource.includes('export type BgColorTone') &&
    bgColorSource.includes('export function getBgColorClassName') &&
    bgColorSource.includes('export function getBgColorToken'),
  'bg-color module must expose its tone map, ordered tones, type, and helpers.',
)

for (const [tone, token, className, lightValue, darkValue] of expectedTones) {
  assert.ok(
    (bgColorSource.includes(`${tone}: {`) || bgColorSource.includes(`'${tone}': {`)) &&
      bgColorSource.includes(`token: '${token}'`) &&
      bgColorSource.includes(`light: '${lightValue}'`) &&
      bgColorSource.includes(`dark: '${darkValue}'`) &&
      bgColorSource.includes(`className: '${className}'`) &&
      bgColorSource.includes('uiUsage:'),
    `bgColorToneMap must include ${tone} -> ${token} -> ${className} with concrete light/dark values and usage notes.`,
  )

  assert.ok(
    bgColorCss.includes(`.${className}`) &&
      bgColorCss.includes(`background: var(${token});`),
    `bg-color.css must define ${className} using ${token}.`,
  )

  if (opaqueFeedbackTokens.has(token)) {
    assertOpaqueValue(lightValue, `${token} light tone map value`)
    assertOpaqueValue(darkValue, `${token} dark tone map value`)
  }

  assert.ok(tokensCss.includes(token), `shared UI tokens must define ${token}.`)
  assert.ok(
    cssVarsIncludeToken(styleRegistry, token),
    `registry/style.json cssVars must export ${token}.`,
  )
  assert.ok(rootStyleItem && cssVarsIncludeToken(rootStyleItem, token), `registry.json style item must export ${token}.`)
}

for (const [sourceName, source] of [
  ['src/styles/tokens.css', tokensCss],
  ['registry/style.json', JSON.stringify(styleRegistry)],
  ['registry.json', JSON.stringify(rootStyleItem)],
]) {
  for (const token of opaqueFeedbackTokens) {
    const values = tokenValuesForSource(source, token)
    const expectedValues = expectedOpaqueFeedbackTokenValues.get(token) ?? []

    assert.ok(values.length > 0, `${sourceName} must include ${token}.`)

    for (const value of values) {
      assertOpaqueValue(value, `${sourceName} ${token}`)
    }

    for (const expectedValue of expectedValues) {
      assert.ok(
        values.includes(expectedValue),
        `${sourceName} must include ${token} as ${expectedValue}.`,
      )
    }
  }
}

for (const token of excludedTokens) {
  assert.ok(
    !bgColorSource.includes(`token: '${token}'`) && !bgColorCss.includes(`var(${token})`),
    `BgColor must not absorb ${token}; it belongs to a more specific token family.`,
  )
}

for (const forbidden of [
  "'md-math-hover'",
  '"md-math-hover"',
  '--color-bg-md-math-hover',
  'bg-color--md-math-hover',
]) {
  assert.ok(
    !bgColorSource.includes(forbidden) &&
      !bgColorCss.includes(forbidden) &&
      !tokensCss.includes(forbidden) &&
      !docsDefinitionSource.includes(forbidden) &&
      !JSON.stringify(styleRegistry).includes(forbidden) &&
      !JSON.stringify(rootStyleItem).includes(forbidden),
    `BgColor and shared token registry must not keep removed math hover background surface ${forbidden}.`,
  )
}

for (const removedShareCardToken of [
  'share-card',
  '--color-bg-share-card',
  'bg-color--share-card',
]) {
  assert.ok(
    !bgColorSource.includes(removedShareCardToken) &&
      !bgColorCss.includes(removedShareCardToken) &&
      !tokensCss.includes(removedShareCardToken) &&
      !docsDefinitionSource.includes(removedShareCardToken) &&
      !JSON.stringify(styleRegistry).includes(removedShareCardToken) &&
      !JSON.stringify(rootStyleItem).includes(removedShareCardToken),
    `BgColor and shared tokens must not keep removed ShareCard token ${removedShareCardToken}.`,
  )
}

assert.ok(
  !bgColorSource.includes("'brand-subtle'") &&
    !bgColorSource.includes('bg-color--brand-subtle') &&
    !bgColorCss.includes('.bg-color--brand-subtle') &&
    !docsDefinitionSource.includes("'brand-subtle'"),
  'BgColor public tone/class names must use selected instead of the old brand-subtle naming.',
)

for (const oldMdTokenName of [
  "'markdown-math-hover'",
  '"markdown-math-hover"',
  '--color-bg-markdown-math-hover',
  'bg-color--markdown-math-hover',
]) {
  assert.ok(
    !bgColorSource.includes(oldMdTokenName) &&
      !bgColorCss.includes(oldMdTokenName) &&
      !docsDefinitionSource.includes(oldMdTokenName) &&
      !tokensCss.includes(oldMdTokenName) &&
      !JSON.stringify(styleRegistry).includes(oldMdTokenName) &&
      !JSON.stringify(rootStyleItem).includes(oldMdTokenName),
    `BgColor and shared tokens must not keep old Markdown token name ${oldMdTokenName}.`,
  )
}

for (const oldPressableName of [
  'pressable-overlay',
  'pressable-hover',
  'pressable-hover-strong',
  'pressable-hover-inverse',
  'pressable-active-inverse',
  '--color-bg-pressable-overlay',
  '--color-bg-pressable-hover',
  '--color-bg-pressable-hover-strong',
  '--color-bg-pressable-hover-inverse',
  '--color-bg-pressable-active-inverse',
  'bg-color--pressable-overlay',
  'bg-color--pressable-hover',
  'bg-color--pressable-hover-strong',
  'bg-color--pressable-hover-inverse',
  'bg-color--pressable-active-inverse',
]) {
  assert.ok(
    !bgColorSource.includes(oldPressableName) &&
      !bgColorCss.includes(oldPressableName) &&
      !tokensCss.includes(oldPressableName) &&
      !JSON.stringify(styleRegistry).includes(oldPressableName) &&
      !JSON.stringify(rootStyleItem).includes(oldPressableName),
    `BgColor pressable simplification must remove the old ${oldPressableName} public/runtime name.`,
  )
}

for (const oldBackdropName of [
  '--color-bg-overlay',
  '--color-bg-drawer',
  'bg-color--overlay',
  'bg-color--drawer',
]) {
  assert.ok(
    !bgColorSource.includes(oldBackdropName) &&
      !bgColorCss.includes(oldBackdropName) &&
      !tokensCss.includes(oldBackdropName) &&
      !dialogCss.includes(oldBackdropName) &&
      !commandCss.includes(oldBackdropName) &&
      !sidebarShellCss.includes(oldBackdropName) &&
      !JSON.stringify(styleRegistry).includes(oldBackdropName) &&
      !JSON.stringify(rootRegistry).includes(oldBackdropName),
    `BgColor backdrop merge must remove the old ${oldBackdropName} public/runtime name.`,
  )
}

assert.ok(
  !bgColorSource.includes('  overlay: {') &&
    !bgColorSource.includes('  drawer: {') &&
    !bgColorSource.includes('  backdrop: {') &&
    !bgColorSource.includes("token: '--color-bg-backdrop'") &&
    !bgColorCss.includes('.bg-color--backdrop') &&
    !docsDefinitionSource.includes("'backdrop'") &&
    !docsDefinitionSource.includes("title: '覆层遮罩'") &&
    !docsDefinitionSource.includes("'overlay'") &&
    !docsDefinitionSource.includes("'drawer'"),
  'BgColor public tone names must delegate backdrop to BgBlur instead of duplicating overlay/drawer/backdrop tones.',
)

for (const [source, selector] of [
  [dialogCss, '.coss-dialog__backdrop'],
  [commandCss, '.coss-command__backdrop'],
  [sidebarShellCss, '.weimo-sidebar-drawer__backdrop'],
]) {
  assert.ok(
    blockFor(source, selector).includes('background: var(--color-bg-backdrop);'),
    `${selector} must use the shared backdrop background token.`,
  )
}

assert.deepEqual(rootStyleItem, styleRegistry, 'Root registry style item must match registry/style.json.')

assert.ok(
  manifestSource.includes("id: 'background-tokens'") &&
    manifestSource.includes("name: '背景'") &&
    manifestSource.includes("registryName: 'bg-color'") &&
    manifestSource.includes("packageExport: './components/bg-color'"),
  'component manifest must list BgColor as a public registry-backed utility.',
)
assert.ok(
  definitionsIndexSource.includes("import { backgroundTokensDefinition } from './background-tokens'") &&
    definitionsIndexSource.includes("'background-tokens': backgroundTokensDefinition"),
  'component definitions index must wire the 背景 (background-tokens) detail definition.',
)
assert.ok(
  docsDefinitionSource.includes("id: 'background-tokens'") &&
    docsDefinitionSource.includes("frame: 'plain',") &&
    docsDefinitionSource.includes("import { ComponentPreviewCard } from '../../components/component-preview-card'") &&
    docsDefinitionSource.includes("import { pressableToneMap, pressableTones } from '../../components/pressable'") &&
    docsDefinitionSource.includes("from '../../components/bg-blur'") &&
    docsDefinitionSource.includes('bgColorSwatchTones') &&
    docsDefinitionSource.includes('swatchTones.map') &&
    docsDefinitionSource.includes('useIsDarkTheme()') &&
    docsDefinitionSource.includes(
      '[bgColorSwatchTones[1], bgColorSwatchTones[0], ...bgColorSwatchTones.slice(2)]',
    ) &&
    docsDefinitionSource.includes('bgColorToneMap[tone]') &&
    docsDefinitionSource.includes('getBgColorClassName(tone)') &&
    docsDefinitionSource.includes('getBgColorToken(tone)') &&
    docsDefinitionSource.includes('<ComponentPreviewCard') &&
    docsDefinitionSource.includes('label="背景色"') &&
    docsDefinitionSource.includes('bg-color-preview__swatch-canvas') &&
    docsDefinitionSource.includes('bg-color-preview__swatch-group') &&
    docsDefinitionSource.includes('bg-color-preview__swatch') &&
    docsDefinitionSource.includes(
      'className={`bg-color-preview__swatch ${getBgColorClassName(tone)}`}',
    ) &&
    docsDefinitionSource.includes('darkValue: item.value.dark') &&
    docsDefinitionSource.includes('token: getBgColorToken(tone)') &&
    docsDefinitionSource.includes('value: item.value.light') &&
    !docsDefinitionSource.includes('bgColorPreviewTones') &&
    !docsDefinitionSource.includes('bgColorStateTones') &&
    !docsDefinitionSource.includes('orderedSwatchTones') &&
    !docsDefinitionSource.includes('orderedStateTones') &&
    !docsDefinitionSource.includes('sortByThemeLightness') &&
    !docsDefinitionSource.includes('hasTransparentBgColorValue') &&
    !docsDefinitionSource.includes('bg-color-preview__sample') &&
    !docsDefinitionSource.includes('pressable-preview__sample') &&
    !docsDefinitionSource.includes('pressableFeedback') &&
    docsDefinitionSource.includes('bgBlurTones.map') &&
    !docsDefinitionSource.includes('背景模糊度</h2>') &&
    !docsDefinitionSource.includes('<TokenPreviewDetails') &&
    !docsDefinitionSource.includes('summary:') &&
    !docsDefinitionSource.includes('bg-color-preview__group') &&
    !docsDefinitionSource.includes('bg-color-preview__description'),
  'BgColor docs definition must merge all eight tones into the single fixed-order swatch card.',
)

const previewTonesSource = docsDefinitionSource.slice(
  docsDefinitionSource.indexOf('const bgColorSwatchTones'),
  docsDefinitionSource.indexOf('function BgColorPreview'),
)

assert.deepEqual(
  [...previewTonesSource.matchAll(/'([a-z-]+)'/g)].map((match) => match[1]),
  expectedSwatchTones,
  'BgColor docs must merge all eight tones into one card in the fixed semantic order.',
)
assert.ok(
  docsDefinitionSource.includes('pressableToneMap[tone]') &&
    docsDefinitionSource.includes('pressableTones.flatMap') &&
    !docsDefinitionSource.includes("'pressable-hover'") &&
    !docsDefinitionSource.includes("'pressable-hover-strong'") &&
    !docsDefinitionSource.includes("'pressable-hover-inverse'") &&
    !docsDefinitionSource.includes("'pressable-active-inverse'") &&
    !docsDefinitionSource.includes("'pressable-overlay'"),
  'BgColor detail page must absorb Pressable metadata without restoring removed tones.',
)

assert.ok(
  appCss.includes('.bg-color-preview__swatch-group') &&
    !appCss.includes('.bg-color-preview__sample') &&
    !appCss.includes('.bg-color-preview__sample-fill') &&
    !appCss.includes('.bg-color-preview__sample-backdrop') &&
    !appCss.includes('.bg-color-preview__sample-fill--framed') &&
    !appCss.includes('.bg-color-preview__group') &&
    !appCss.includes('.bg-color-preview__row') &&
    !appCss.includes('.bg-color-preview__identity') &&
    !appCss.includes('.bg-color-preview__description') &&
    !appCss.includes('.bg-color-preview__value'),
  'App.css must include only the BgColor-specific preview-effect styles.',
)
assert.ok(
  firstBlockFor(appCss, '.bg-color-preview__swatch.bg-color--card').includes(
    'border: 1px solid var(--color-border);',
  ),
  'The card-tone swatch must stay visible against the same-material canvas via a token border.',
)
assert.ok(
  firstBlockFor(appCss, '.bg-color-preview__swatch-canvas').includes('container-type: inline-size;') &&
    firstBlockFor(appCss, '.bg-color-preview__swatch-group').includes('grid-template-columns: repeat(8, 42px);') &&
    firstBlockFor(appCss, '.bg-color-preview__swatch-group').includes('gap: clamp(12px, 2vw, 36px);') &&
    firstBlockFor(appCss, '.bg-color-preview__swatch-group').includes('padding-inline: 16px;') &&
    firstBlockFor(appCss, '@container (width < 620px)').includes(
      'grid-template-columns: repeat(4, minmax(42px, 48px));',
    ),
  'The merged swatch grid must stay 8-per-row on wide canvases and fall back to two clamped rows of 4 (42-48px, 12-36px gap) below the 620px threshold.',
)
const selectionSampleBlock = blockFor(appCss, '.bg-color-preview__selection-sample')
const selectionHighlightBlock = blockFor(appCss, '.bg-color-preview__selection-highlight')
const selectionPseudoBlock = blockFor(appCss, '.bg-color-preview__selection-sample ::selection')
assert.ok(
  textDocsSource.includes("from '../../components/bg-color'") &&
    textDocsSource.includes('bgColorToneMap.selection') &&
    textDocsSource.includes('bg-color-preview__selection-sample') &&
    textDocsSource.includes('bg-color-preview__selection-copy') &&
    textDocsSource.includes('bg-color-preview__selection-highlight') &&
    textDocsSource.includes(
      "className={`bg-color-preview__selection-highlight ${getBgColorClassName('selection')}`}",
    ) &&
    !docsDefinitionSource.includes("tone === 'selection'") &&
    !docsDefinitionSource.includes('bg-color-preview__selection') &&
    !docsDefinitionSource.includes('内容高亮'),
  'The selection tone must preview the real selected-text rendering on the Font docs page instead of a generic translucent swatch on the BgColor page.',
)
assert.ok(
  selectionPseudoBlock.includes('background: var(--color-bg-selection);'),
  'The selected-text sample must support live drag selection with the real token.',
)
assert.ok(
  selectionSampleBlock.includes('height: 80px;') &&
    selectionSampleBlock.includes('color: var(--color-text-primary);') &&
    selectionSampleBlock.includes('user-select: text;') &&
    selectionHighlightBlock.includes('padding-block: 0.4em;') &&
    !selectionHighlightBlock.includes('border-radius:'),
  'The selection sample must render real text with a full-line-height highlight band and no rounded corners.',
)
assert.ok(
  surfaceBlock.includes('inset: 10px 12px;') &&
    surfaceBlock.includes('border-radius: var(--radius-sm);') &&
    !surfaceBlock.includes('border:') &&
    !surfaceBlock.includes('background:'),
  'Transparent BgColor samples must use the shared ComponentPreviewCard surface geometry.',
)
assert.ok(
  surfaceBackdropBlock.includes('position: absolute;') &&
    surfaceBackdropBlock.includes('inset: -16px;') &&
    surfaceBackdropBlock.includes('z-index: 0;') &&
    surfaceBackdropBlock.includes('repeating-linear-gradient') &&
    surfaceBackdropBlock.includes('hsl(0 0% 100% / 0.68) 0 14px') &&
    surfaceBackdropBlock.includes('hsl(0 0% 100% / 0.16) 14px 28px'),
  'Transparent BgColor samples must use the shared ComponentPreviewCard backdrop.',
)
assert.ok(
  !docsDefinitionSource.includes('bg-color-preview__sample-text') &&
    !docsDefinitionSource.includes('>text</span>') &&
    !appCss.includes('.bg-color-preview__sample-text'),
  'BgColor transparency preview must use the striped backdrop instead of the old text-underlay sample.',
)

assert.ok(registryItem, 'registry.json must include the bg-color registry item.')
assert.deepEqual(
  standaloneRegistryItem,
  registryItem,
  'registry/bg-color.json must match registry.json payload.',
)
assert.deepEqual(
  registryItem.files.map((file) => file.path),
  [
    'src/components/bg-color.ts',
    'src/components/bg-color.css',
  ],
  'bg-color registry item must ship the tone map and utility stylesheet.',
)
