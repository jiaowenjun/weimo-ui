import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const bijiRoot = join(root, '../weimo-biji/frontend/web')

function readProjectFile(relativePath) {
  const absolutePath = join(root, relativePath)

  assert.ok(existsSync(absolutePath), `${relativePath} must exist.`)

  return readFileSync(absolutePath, 'utf8')
}

function readBijiFile(relativePath) {
  const absolutePath = join(bijiRoot, relativePath)

  assert.ok(existsSync(absolutePath), `biji-react/${relativePath} must exist.`)

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
  const matches = Array.from(source.matchAll(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, 'g')))
  const match = matches.at(0)

  assert.ok(match, `${selector} block must exist.`)

  return match[1]
}

function cssVarsIncludeToken(item, token) {
  const key = token.slice(2)

  return ['theme', 'light', 'dark'].some((group) => key in (item.cssVars?.[group] ?? {}))
}

const expectedTones = [
  ['disable', '--color-border-disable', 'border-color--disable', 'hsl(0 0% 92%)', 'hsl(0 0% 24%)'],
  ['divider', '--color-border-divider', 'border-color--divider', 'hsl(0 0% 88%)', 'hsl(0 0% 28%)'],
  ['default', '--color-border', 'border-color--default', 'hsl(0 0% 90%)', 'hsl(0 0% 20%)'],
  ['emphasis', '--color-border-emphasis', 'border-color--emphasis', 'hsl(0 0% 68%)', 'hsl(0 0% 50%)'],
  ['accent', '--color-border-accent', 'border-color--accent', 'hsl(0 0% 35%)', 'hsl(0 0% 75%)'],
  ['danger', '--color-border-danger', 'border-color--danger', '#b42318', '#ff8a7a'],
]
const expectedToneOrder = expectedTones.map(([tone]) => tone)

const expectedBackgroundAwareDisableTokens = [
  ['color-border-disable-on-light', 'hsl(0 0% 92%)'],
  ['color-border-disable-on-dark', 'hsl(0 0% 24%)'],
]

const excludedTokens = [
  '--color-heat-0',
  '--color-heatmap-today-ring',
  '--color-text-primary',
  '--color-bg-card',
  '--color-bg-hover',
]

const packageJson = readJson('package.json')
const borderColorSource = readProjectFile('src/components/border-color.ts')
const borderColorCss = readProjectFile('src/components/border-color.css')
const cardSurfaceCss = readProjectFile('src/components/card-surface.css')
const popupSurfaceCss = readProjectFile('src/components/popup-surface.css')
const breadcrumbCss = readProjectFile('src/components/coss/breadcrumb.css')
const chipSurfaceCss = readProjectFile('src/components/chip-surface.css')
const cossButtonCss = readProjectFile('src/components/coss/button.css')
const cossCardCss = readProjectFile('src/components/coss/card.css')
const cossCommandCss = readProjectFile('src/components/coss/command.css')
const cossDialogCss = readProjectFile('src/components/coss/dialog.css')
const cossInputGroupCss = readProjectFile('src/components/coss/input-group.css')
const cossTableCss = readProjectFile('src/components/coss/table.css')
const cossTabsCss = readProjectFile('src/components/coss/tabs.css')
const cossTooltipCss = readProjectFile('src/components/coss/tooltip.css')
const glassSurfaceCss = readProjectFile('src/components/glass-surface.css')
const mdEditorCss = readProjectFile('src/components/md-editor/md-editor.css')
const markdownContentCss = readProjectFile('src/components/markdown-content.css')
const menuCss = readProjectFile('src/components/menu.css')
const sidebarShellCss = readProjectFile('src/components/sidebar/sidebar-shell.css')
const tagTreeCss = readProjectFile('src/components/tag-tree/tag-tree.css')
const manifestSource = readProjectFile('src/docs/components-manifest.ts')
const definitionsIndexSource = readProjectFile('src/docs/component-definitions/index.ts')
const docsDefinitionSource = readProjectFile('src/docs/component-definitions/border-color.tsx')
const appCss = readProjectFile('src/App.css')
const tokensCss = readProjectFile('src/styles/tokens.css')
const rootRegistry = readJson('registry.json')
const styleRegistry = readJson('registry/style.json')
const standaloneRegistryItem = readJson('registry/border-color.json')
const rootStyleItem = rootRegistry.items.find((item) => item.name === 'style')
const registryItem = rootRegistry.items.find((item) => item.name === 'border-color')
const bijiIndexCss = readBijiFile('src/index.css')
const bijiFormControlsCss = readBijiFile('src/components/ui/form-controls.css')
const bijiAuthCss = readBijiFile('src/features/auth/auth.css')
const cossButtonFocusBlock = blockFor(cossButtonCss, '.coss-button:focus-visible')
const cossCardInteractiveBlock = blockFor(
  cossCardCss,
  '.coss-card--interactive:hover,\n  .coss-card--interactive:focus-within',
)
const cossTabsFocusBlock = blockFor(cossTabsCss, '.coss-tabs__tab:focus-visible')
const markdownInlineCodeSurfaceBlock = blockFor(
  markdownContentCss,
  '.weimo-markdown-content :not(pre) > :where(.weimo-card-markdown__code, code)',
)
const markdownTableScrollBlock = blockFor(markdownContentCss, '.weimo-card-markdown__scroll-block')
const markdownEditorTableWrapperBlock = blockFor(
  markdownContentCss,
  '.md-editor__content.weimo-markdown-content .tableWrapper',
)
const demoBlockPanelBlock = blockFor(appCss, '.demo-block__panel')
const mdViewDocsPreviewFrameBlock = blockFor(appCss, '.md-view-docs-preview__frame')
const tagTreePreviewPanelBlock = firstBlockFor(appCss, '.tag-tree-preview__panel')
const borderColorPreviewRowBlock = firstBlockFor(appCss, '.border-color-preview__row')
const tagBarPreviewPanelBlock = blockFor(appCss, '.tag-bar-preview__panel')
const sampleBlock = blockFor(appCss, '.border-color-preview__sample')
const descriptionBlock = blockFor(appCss, '.border-color-preview__description')
const contextTokensBlock = blockFor(appCss, '.border-color-preview__context-tokens')

assert.equal(
  packageJson.exports?.['./components/border-color'],
  './src/components/border-color.ts',
  'package.json must expose the public border-color tone map.',
)
assert.equal(
  packageJson.exports?.['./styles/border-color.css'],
  './src/components/border-color.css',
  'package.json must expose the standalone border-color utility stylesheet.',
)
assert.ok(
  packageJson.scripts?.test?.includes('scripts/border-color-contract.test.mjs'),
  'package.json test script must run border-color-contract.test.mjs.',
)

assert.ok(
  borderColorSource.includes("import './border-color.css'"),
  'border-color tone map module must import its utility stylesheet.',
)
assert.ok(
  borderColorSource.includes('export const borderColorToneMap') &&
    borderColorSource.includes('export const borderColorTones') &&
    borderColorSource.includes('export type BorderColorTone') &&
    borderColorSource.includes('export function getBorderColorClassName') &&
    borderColorSource.includes('export function getBorderColorToken'),
  'border-color module must expose its tone map, ordered tones, type, and helpers.',
)
const actualToneOrder = expectedToneOrder
  .map((tone) => ({
    tone,
    position: borderColorSource.includes(`${tone}: {`)
      ? borderColorSource.indexOf(`${tone}: {`)
      : borderColorSource.indexOf(`'${tone}': {`),
  }))
  .sort((a, b) => a.position - b.position)
  .map(({ tone }) => tone)
assert.deepEqual(
  actualToneOrder,
  expectedToneOrder,
  'BorderColor detail page must list border tones from weakest to strongest.',
)

for (const [tone, token, className, lightValue, darkValue] of expectedTones) {
  assert.ok(
    (borderColorSource.includes(`${tone}: {`) || borderColorSource.includes(`'${tone}': {`)) &&
      borderColorSource.includes(`token: '${token}'`) &&
      borderColorSource.includes(`className: '${className}'`) &&
      borderColorSource.includes(`light: '${lightValue}'`) &&
      borderColorSource.includes(`dark: '${darkValue}'`) &&
      borderColorSource.includes('uiUsage:') &&
      borderColorSource.includes('bijiUsage:'),
    `borderColorToneMap must include ${tone} -> ${token} -> ${className} with values and usage notes.`,
  )

  assert.ok(
    borderColorCss.includes(`.${className}`) &&
      borderColorCss.includes(`border-color: var(${token});`),
    `border-color.css must define ${className} using ${token}.`,
  )

  assert.ok(tokensCss.includes(token), `shared UI tokens must define ${token}.`)
  assert.ok(
    cssVarsIncludeToken(styleRegistry, token),
    `registry/style.json cssVars must export ${token}.`,
  )
  assert.ok(
    rootStyleItem && cssVarsIncludeToken(rootStyleItem, token),
    `registry.json style item must export ${token}.`,
  )
}

for (const [tokenName, tokenValue] of expectedBackgroundAwareDisableTokens) {
  assert.ok(
    tokensCss.includes(`--${tokenName}: ${tokenValue};`),
    `shared UI tokens must define --${tokenName} with a concrete background-aware disabled border value.`,
  )
  assert.equal(
    styleRegistry.cssVars.light[tokenName],
    tokenValue,
    `registry/style.json must mirror the light --${tokenName} value.`,
  )
  assert.equal(
    styleRegistry.cssVars.dark[tokenName],
    tokenValue,
    `registry/style.json must mirror the dark --${tokenName} value.`,
  )
  assert.equal(
    rootStyleItem?.cssVars.light[tokenName],
    tokenValue,
    `registry.json style item must mirror the light --${tokenName} value.`,
  )
  assert.equal(
    rootStyleItem?.cssVars.dark[tokenName],
    tokenValue,
    `registry.json style item must mirror the dark --${tokenName} value.`,
  )
  assert.ok(
    !tokenValue.includes('/') && !tokenValue.includes('rgba('),
    `--${tokenName} must use an opaque color value.`,
  )
}

for (const token of excludedTokens) {
  assert.ok(
    !borderColorSource.includes(`token: '${token}'`) &&
      !borderColorCss.includes(`var(${token})`),
    `BorderColor must not absorb ${token}; it belongs to a more specific token family.`,
  )
}

assert.ok(
  !borderColorSource.includes("token: '--color-text-danger'") &&
    !borderColorCss.includes('var(--color-text-danger)'),
  'BorderColor danger tone must use --color-border-danger instead of the text danger token.',
)
assert.ok(
  !borderColorSource.includes("token: '--color-primary'") &&
    !borderColorCss.includes('var(--color-primary)'),
  'BorderColor accent tone must use --color-border-accent instead of the generic primary token.',
)
assert.ok(
  !tokensCss.includes('--color-border: hsl(var(--border));') &&
    !tokensCss.includes('--color-border-accent: var(--color-primary);') &&
    !JSON.stringify(styleRegistry.cssVars).includes('hsl(var(--border))') &&
    !JSON.stringify(styleRegistry.cssVars).includes('var(--color-primary)') &&
    rootStyleItem &&
    !JSON.stringify(rootStyleItem.cssVars).includes('hsl(var(--border))') &&
    !JSON.stringify(rootStyleItem.cssVars).includes('var(--color-primary)'),
  'Border tokens must use concrete light/dark values instead of aliasing --border or --color-primary.',
)
assert.ok(
  !borderColorSource.includes("token: '--color-border-subtle'") &&
    !borderColorSource.includes("token: '--color-border-strong'") &&
    !borderColorSource.includes("token: '--color-border-highlight'") &&
    !borderColorCss.includes('var(--color-border-subtle)') &&
    !borderColorCss.includes('var(--color-border-strong)') &&
    !borderColorCss.includes('var(--color-border-highlight)') &&
    !borderColorCss.includes('.border-color--subtle') &&
    !borderColorCss.includes('.border-color--strong') &&
    !borderColorCss.includes('.border-color--highlight') &&
    !tokensCss.includes('--color-border-subtle') &&
    !tokensCss.includes('--color-border-strong') &&
    !tokensCss.includes('--color-border-highlight') &&
    !JSON.stringify(styleRegistry.cssVars).includes('color-border-subtle') &&
    !JSON.stringify(styleRegistry.cssVars).includes('color-border-strong') &&
    !JSON.stringify(styleRegistry.cssVars).includes('color-border-highlight') &&
    !(rootStyleItem && JSON.stringify(rootStyleItem.cssVars).includes('color-border-subtle')) &&
    !(rootStyleItem && JSON.stringify(rootStyleItem.cssVars).includes('color-border-strong')) &&
    !(rootStyleItem && JSON.stringify(rootStyleItem.cssVars).includes('color-border-highlight')),
  'BorderColor must rename subtle/strong/highlight public tokens and utility classes to divider/emphasis/accent.',
)
assert.ok(
  !borderColorSource.includes("token: '--color-border-primary'") &&
    !borderColorCss.includes('var(--color-border-primary)') &&
    !borderColorCss.includes('.border-color--primary') &&
    !tokensCss.includes('--color-border-primary') &&
    !JSON.stringify(styleRegistry.cssVars).includes('color-border-primary') &&
    !(rootStyleItem && JSON.stringify(rootStyleItem.cssVars).includes('color-border-primary')),
  'BorderColor must rename --color-border-primary and border-color--primary to the highlight tone.',
)
assert.ok(
  !borderColorSource.includes("'focus-ring'") &&
    !borderColorSource.includes("token: '--color-border-focus-ring'") &&
    !borderColorCss.includes('var(--color-border-focus-ring)') &&
    !borderColorCss.includes('.border-color--focus-ring') &&
    !tokensCss.includes('--color-border-focus-ring') &&
    !JSON.stringify(styleRegistry.cssVars).includes('color-border-focus-ring') &&
    !(rootStyleItem && JSON.stringify(rootStyleItem.cssVars).includes('color-border-focus-ring')),
  'BorderColor must remove the derived focus-ring tone and --color-border-focus-ring token.',
)
assert.ok(
  breadcrumbCss.includes('outline: 2px solid var(--color-border-accent);') &&
    mdEditorCss.includes('outline: 2px solid var(--color-border-accent);') &&
    !breadcrumbCss.includes('var(--color-border-focus-ring)') &&
    !mdEditorCss.includes('var(--color-border-focus-ring)'),
  'Focus outlines must use --color-border-accent instead of the removed focus-ring token.',
)
assert.ok(
  !borderColorSource.includes("token: '--color-brand-focus-ring'") &&
    !borderColorCss.includes('var(--color-brand-focus-ring)'),
  'BorderColor must not restore the removed brand focus ring token.',
)
assert.ok(
  !tokensCss.includes('--color-brand-focus-ring') &&
    !JSON.stringify(styleRegistry.cssVars).includes('color-brand-focus-ring') &&
    !(rootStyleItem && JSON.stringify(rootStyleItem.cssVars).includes('color-brand-focus-ring')),
  'Shared border tokens must remove --color-brand-focus-ring after renaming it to --color-border-focus-ring.',
)
assert.ok(
  !borderColorSource.includes("token: '--glass-border'") &&
    !borderColorSource.includes("token: '--glass-border-strong'") &&
    !borderColorCss.includes('var(--glass-border)') &&
    !borderColorCss.includes('var(--glass-border-strong)') &&
    !borderColorCss.includes('.border-color--glass') &&
    !borderColorCss.includes('.border-color--glass-strong'),
  'BorderColor must not keep glass border tones that duplicate the border token ramp.',
)
assert.ok(
  !tokensCss.includes('--glass-border') &&
    !JSON.stringify(styleRegistry.cssVars).includes('glass-border') &&
    !(rootStyleItem && JSON.stringify(rootStyleItem.cssVars).includes('glass-border')) &&
    !bijiIndexCss.includes('--glass-border'),
  'Shared and app tokens must remove --glass-border and --glass-border-strong.',
)
assert.ok(
  borderColorSource.includes('TagTree guide line') &&
    borderColorSource.includes('Menu separator') &&
    borderColorSource.includes('Coss Card/Dialog/Command/Table divider') &&
    borderColorSource.includes('Markdown inline code/table outer/table cell/hr divider') &&
    borderColorSource.includes('Card/Dialog/Tooltip/SideBar/docs preview surface'),
  'BorderColor detail usage copy must include guide-line and divider examples.',
)
assert.ok(
  docsDefinitionSource.includes('borderColorMenuSeparatorTokens') &&
    docsDefinitionSource.includes("token: '--color-border-divider-menu'") &&
    docsDefinitionSource.includes("token: '--color-border-divider-menu-on-light'") &&
    docsDefinitionSource.includes("token: '--color-border-divider-menu-on-dark'") &&
    docsDefinitionSource.includes('Menu separator 背景感知 divider token') &&
    docsDefinitionSource.includes('亮背景 / Menu:') &&
    docsDefinitionSource.includes('borderColorToneMap.divider.value.light'),
  'BorderColor detail usage copy must show that Menu separator follows its own background-aware divider tokens.',
)
assert.ok(
  borderColorSource.includes('neutral hover boundary') &&
    borderColorSource.includes('primary action/selected/keyboard focus') &&
    cossCardInteractiveBlock.includes('border-color: var(--color-border-emphasis);') &&
    cossButtonCss.includes('.coss-button:hover') &&
    cossButtonCss.includes('border-color: var(--color-border-emphasis);') &&
    cossButtonCss.includes('.coss-button--default:hover,\n  .coss-button--default[data-popup-open] {\n    border-color: var(--color-border-accent);') &&
    cossButtonFocusBlock.includes('outline: 2px solid var(--color-border-accent);') &&
    cossInputGroupCss.includes('border-color: var(--color-border-accent);') &&
    cossInputGroupCss.includes('color-mix(in srgb, var(--color-border-accent) 18%, transparent)') &&
    cossTabsFocusBlock.includes('outline: 2px solid var(--color-border-accent);') &&
    mdEditorCss.includes('.md-editor__math-dialog-textarea:focus') &&
    mdEditorCss.includes('border-color: var(--color-border-accent);') &&
    bijiFormControlsCss.includes('outline: 2px solid var(--color-border-accent);') &&
    bijiFormControlsCss.includes("border-color: var(--color-border-danger);"),
  'Emphasis and accent BorderColor usage must separate neutral hover from action, selected, focus, and invalid states.',
)
assert.ok(
  tagTreeCss.includes('background: var(--color-border-divider);') &&
    menuCss.includes('--weimo-menu-separator-bg: var(--color-border-divider-menu);') &&
    menuCss.includes('--weimo-menu-separator-bg: var(--color-border-divider-menu-on-light);') &&
    menuCss.includes('--weimo-menu-separator-bg: var(--color-border-divider-menu-on-dark);') &&
    menuCss.includes('background: var(--weimo-menu-separator-bg);') &&
    !menuCss.includes('background: var(--glass-surface-border);') &&
    !menuCss.includes('background: var(--color-border-divider);') &&
    cossCardCss.includes('border-bottom: 1px solid var(--color-border-divider, var(--color-border));') &&
    cossCommandCss.includes('border-bottom: 1px solid var(--color-border-divider, var(--color-border));') &&
    cossCommandCss.includes('border-top: 1px solid var(--color-border-divider, var(--color-border));') &&
    cossDialogCss.includes('border-bottom: 1px solid var(--color-border-divider, var(--color-border));') &&
    cossDialogCss.includes('border-top: 1px solid var(--color-border-divider, var(--color-border));') &&
    cossTableCss.includes('border-bottom: 1px solid var(--color-border-divider, var(--color-border));'),
  'Divider BorderColor usage must cover TagTree guide lines, menu separators, and Coss section dividers.',
)
assert.ok(
    markdownContentCss.includes('border-top: 1px solid var(--color-border-divider);') &&
    markdownContentCss.includes('border-bottom: 1px solid var(--color-border-divider);') &&
    markdownContentCss.includes('border-left: 1px solid var(--color-border-divider);') &&
    markdownInlineCodeSurfaceBlock.includes('border: 1px solid var(--color-border-divider);') &&
    markdownTableScrollBlock.includes('border: 1px solid var(--color-border-divider);') &&
    markdownEditorTableWrapperBlock.includes('border: 1px solid var(--color-border-divider);'),
  'Divider BorderColor usage must cover Markdown hr/table divider lines, inline code, and table outer borders.',
)
assert.ok(
    cardSurfaceCss.includes('border: 1px solid var(--color-border);') &&
    popupSurfaceCss.includes('border: 1px solid var(--color-border);') &&
    chipSurfaceCss.includes('border-color: var(--color-border);') &&
    !glassSurfaceCss.includes('var(--color-border-divider)') &&
    !chipSurfaceCss.includes('var(--color-border-divider)') &&
    cossButtonCss.includes('border-color: var(--color-border);') &&
    sidebarShellCss.includes('border: 1px solid var(--color-border);') &&
    sidebarShellCss.includes('border-color: var(--color-border);') &&
    demoBlockPanelBlock.includes('border: 1px solid var(--color-border);') &&
    mdViewDocsPreviewFrameBlock.includes('border: 1px solid var(--color-border);') &&
    tagTreePreviewPanelBlock.includes('border: 1px solid var(--color-border);') &&
    borderColorPreviewRowBlock.includes('border: 1px solid var(--color-border);') &&
    tagBarPreviewPanelBlock.includes('border: 1px solid var(--color-border);'),
  'Default BorderColor usage must cover surface/container outer borders and docs preview frames.',
)
assert.ok(
  glassSurfaceCss.includes('border: 1px solid var(--glass-surface-border);') &&
    !glassSurfaceCss.includes('border: 1px solid var(--color-border);'),
  'GlassSurface must use its background-aware border token instead of the fixed default BorderColor token.',
)

assert.deepEqual(rootStyleItem, styleRegistry, 'Root registry style item must match registry/style.json.')

assert.ok(
  manifestSource.includes("id: 'border-color'") &&
    manifestSource.includes("name: 'BorderColor'") &&
    manifestSource.includes("registryName: 'border-color'") &&
    manifestSource.includes("packageExport: './components/border-color'"),
  'component manifest must list BorderColor as a public registry-backed utility.',
)
assert.ok(
  definitionsIndexSource.includes("import { borderColorDefinition } from './border-color'") &&
    definitionsIndexSource.includes("'border-color': borderColorDefinition"),
  'component definitions index must wire the BorderColor detail definition.',
)
assert.ok(
    docsDefinitionSource.includes("id: 'border-color'") &&
    docsDefinitionSource.includes('borderColorTones.map') &&
    docsDefinitionSource.includes('borderColorToneMap[tone]') &&
    docsDefinitionSource.includes('borderColorDisableContextTokens') &&
    docsDefinitionSource.includes("defaultValue: \"['disable', 'divider', 'default', 'emphasis', 'accent', ...]\"") &&
    docsDefinitionSource.includes('getBorderColorClassName(tone)') &&
    docsDefinitionSource.includes('getBorderColorToken(tone)') &&
    docsDefinitionSource.includes('value: { light; dark }') &&
    docsDefinitionSource.includes('border-color-preview__sample') &&
    docsDefinitionSource.includes('border-color-preview__context-tokens') &&
    docsDefinitionSource.includes('--color-border-disable-on-light') &&
    docsDefinitionSource.includes('--color-border-disable-on-dark') &&
    docsDefinitionSource.includes('value: borderColorToneMap.disable.value.light') &&
    docsDefinitionSource.includes('value: borderColorToneMap.disable.value.dark') &&
    docsDefinitionSource.includes('亮背景:') &&
    docsDefinitionSource.includes('暗背景:') &&
    docsDefinitionSource.includes('ui: {item.uiUsage}') &&
    docsDefinitionSource.includes('border-color-preview__value') &&
    docsDefinitionSource.includes('亮: {item.value.light}') &&
    docsDefinitionSource.includes('暗: {item.value.dark}') &&
    docsDefinitionSource.includes('biji-react: {item.bijiUsage}'),
  'BorderColor docs definition must render the border color tone map preview, concrete values, and usage summary.',
)
assert.ok(
  appCss.includes('.border-color-preview') &&
    appCss.includes('.border-color-preview__row') &&
    appCss.includes('.border-color-preview__sample') &&
    appCss.includes('.border-color-preview__identity') &&
    appCss.includes('.border-color-preview__token') &&
    appCss.includes('.border-color-preview__value') &&
    appCss.includes('.border-color-preview__context-tokens') &&
    appCss.includes('.border-color-preview__description') &&
    appCss.includes('grid-template-columns: minmax(120px, 0.5fr) minmax(220px, 0.9fr) minmax(0, 1.45fr);'),
  'App.css must include scoped BorderColor detail-page preview styles.',
)
assert.ok(
  sampleBlock.includes('border: 1px solid') &&
    !sampleBlock.includes('background:') &&
    !sampleBlock.includes('box-shadow:'),
  'BorderColor preview samples must show the applied border color without background or shadow decoration.',
)
assert.ok(
  descriptionBlock.includes('min-width: 0;') &&
    descriptionBlock.includes('overflow-wrap: anywhere;'),
  'BorderColor detail usage column must shrink and wrap instead of overflowing.',
)
assert.ok(
  contextTokensBlock.includes('display: grid;') &&
    contextTokensBlock.includes('overflow-wrap: anywhere;'),
  'BorderColor detail background-aware token list must stack and wrap instead of overflowing.',
)

assert.ok(
  bijiIndexCss.includes('--border: 0 0% 80%;') &&
    bijiIndexCss.includes('--border: 0 0% 38%;'),
  'biji-react runtime CSS must customize shared border inputs through inherited separated border steps.',
)
assert.ok(
  bijiFormControlsCss.includes('border: 1px solid var(--color-border);') &&
    bijiFormControlsCss.includes('border-color: var(--color-border-emphasis);') &&
    bijiFormControlsCss.includes('border-color: var(--color-border-accent);') &&
    bijiFormControlsCss.includes('color-mix(in srgb, var(--color-border-accent) 18%, transparent)'),
  'biji-react form controls must consume default, emphasis, and accent border tones.',
)
assert.ok(
  bijiAuthCss.includes('color-mix(in srgb, var(--color-border-danger) 24%, transparent)'),
  'biji-react Auth surfaces must consume danger-derived border tones.',
)

assert.ok(registryItem, 'registry.json must include the border-color registry item.')
assert.deepEqual(
  standaloneRegistryItem,
  registryItem,
  'registry/border-color.json must match registry.json payload.',
)
assert.deepEqual(
  registryItem.files.map((file) => file.path),
  [
    'src/components/border-color.ts',
    'src/components/border-color.css',
  ],
  'border-color registry item must ship the tone map and utility stylesheet.',
)
