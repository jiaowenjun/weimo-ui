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
  ['disable', '--color-border-disabled', 'border-color--disable', 'hsl(0 0% 92%)', 'hsl(0 0% 24%)'],
  ['divider', '--color-border-divider', 'border-color--divider', 'hsl(0 0% 88%)', 'hsl(0 0% 28%)'],
  ['default', '--color-border', 'border-color--default', 'hsl(0 0% 90%)', 'hsl(0 0% 20%)'],
  ['emphasis', '--color-border-emphasis', 'border-color--emphasis', 'hsl(0 0% 68%)', 'hsl(0 0% 50%)'],
  ['accent', '--color-border-accent', 'border-color--accent', 'hsl(0 0% 35%)', 'hsl(0 0% 75%)'],
  ['danger', '--color-border-danger', 'border-color--danger', 'hsl(4 77% 40%)', 'hsl(7 100% 74%)'],
]
const expectedToneOrder = expectedTones.map(([tone]) => tone)

const expectedBackgroundAwareDisableTokens = [
  ['color-border-disabled-on-light', 'hsl(0 0% 92%)'],
  ['color-border-disabled-on-dark', 'hsl(0 0% 24%)'],
]

const excludedTokens = [
  '--color-heat-0',
  '--color-heatmap-today-ring',
  '--color-text-primary',
  '--color-bg-card',
  '--color-bg-hover',
]

const packageJson = readJson('package.json')
const borderColorSource = readProjectFile('packages/weimo-ui-core/src/styles/variants/border/border-color.ts')
const borderColorCss = readProjectFile('packages/weimo-ui-core/src/styles/variants/border/border-color.css')
const cardSurfaceCss = readProjectFile('packages/weimo-ui-core/src/components/surfaces/card-surface/card-surface.css')
const popupSurfaceCss = readProjectFile('packages/weimo-ui-core/src/components/surfaces/popup-surface/popup-surface.css')
const breadcrumbCss = readProjectFile('packages/weimo-ui-tagtree/src/components/coss/breadcrumb.css')
const capsuleFrameCss = readProjectFile('packages/weimo-ui-core/src/components/controls/capsule/capsule-frame.css')
const cossButtonCss = readProjectFile('packages/weimo-ui-core/src/components/primitives/button.css')
const cossCardCss = readProjectFile('packages/weimo-ui-site/src/components/primitives/card.css')
const cossCommandCss = readProjectFile('packages/weimo-ui-site/src/components/primitives/command.css')
const cossDialogCss = readProjectFile('packages/weimo-ui-core/src/components/primitives/dialog.css')
const cossInputGroupCss = readProjectFile('packages/weimo-ui-tagtree/src/components/coss/input-group.css')
const cossTableCss = readProjectFile('packages/weimo-ui-core/src/components/primitives/table.css')
const cossTabsCss = readProjectFile('packages/weimo-ui-core/src/components/primitives/tabs.css')
const cossTooltipCss = readProjectFile('packages/weimo-ui-core/src/components/primitives/tooltip.css')
const frostedSurfaceCss = readProjectFile('packages/weimo-ui-core/src/components/surfaces/frosted-surface/frosted-surface.css')
const mdEditorCss = readProjectFile('packages/weimo-ui-markdown/src/components/md-editor/md-editor.css')
const markdownContentCss = readProjectFile('packages/weimo-ui-markdown/src/styles/markdown-content.css')
const menuCss = readProjectFile('packages/weimo-ui-core/src/components/composites/menu/menu.css')
const sidebarShellCss = readProjectFile('packages/weimo-ui-core/src/components/layout/sidebar/sidebar.css')
// 普通侧边栏经由 card-surface 继承无边框默认；抽屉变体不挂材质类，描边自持。
const sidebarDrawerBlock = blockFor(sidebarShellCss, '.weimo-sidebar--drawer')
const tagTreeCss = readProjectFile('packages/weimo-ui-tagtree/src/components/tag-tree/tag-tree.css')
const definitionsIndexSource = readProjectFile('packages/weimo-ui-site/src/docs/catalog/definitions.ts')
const docsDefinitionSource = readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/border-tokens.tsx')
const appCss = readProjectFile('packages/weimo-ui-site/src/app/app.css')
const tokensCss = readProjectFile('packages/weimo-ui-core/src/styles/tokens.css')
const rootRegistry = readJson('registry.json')
const styleRegistry = readJson('registry/style.json')
const standaloneRegistryItem = readJson('registry/border-color.json')
const rootStyleItem = rootRegistry.items.find((item) => item.name === 'style')
const registryItem = rootRegistry.items.find((item) => item.name === 'border-color')
const cossButtonFocusBlock = blockFor(cossButtonCss, '.coss-button:focus-visible')
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
const tagTreePreviewPanelBlock = firstBlockFor(appCss, '.tag-tree-preview__panel')
const tagBarPreviewPanelBlock = blockFor(appCss, '.tag-bar-preview__panel')
const sampleBlock = blockFor(appCss, '.border-color-preview__sample')
const samplesBlock = blockFor(appCss, '.border-color-preview__samples')
const frostedSampleBlock = blockFor(appCss, '.frosted-border-preview__sample')
const frostedRowBlock = blockFor(appCss, '.frosted-border-preview__row')
const frostedTileBlock = blockFor(appCss, '.frosted-border-preview__tile')
const frostedCanvasOverrideBlock = blockFor(
  appCss,
  '.frosted-border-preview .glass-preview-card__canvas',
)
const frostedProbeBlock = blockFor(appCss, '.frosted-border-preview__probe')

assert.equal(
  packageJson.exports?.['./components/border-color'],
  './packages/weimo-ui-core/src/styles/variants/border/border-color.ts',
  'package.json must expose the public border-color tone map.',
)
assert.equal(
  packageJson.exports?.['./styles/border-color.css'],
  './packages/weimo-ui-core/src/styles/variants/border/border-color.css',
  'package.json must expose the standalone border-color utility stylesheet.',
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
  'BorderColor tone map must keep its canonical order from weakest to strongest; the docs preview re-sorts by brightness.',
)

for (const [tone, token, className, lightValue, darkValue] of expectedTones) {
  assert.ok(
    (borderColorSource.includes(`${tone}: {`) || borderColorSource.includes(`'${tone}': {`)) &&
      borderColorSource.includes(`token: '${token}'`) &&
      borderColorSource.includes(`className: '${className}'`) &&
      borderColorSource.includes(`light: '${lightValue}'`) &&
      borderColorSource.includes(`dark: '${darkValue}'`) &&
      borderColorSource.includes('uiUsage:'),
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
    !(rootStyleItem && JSON.stringify(rootStyleItem.cssVars).includes('glass-border')),
  'Shared tokens must remove --glass-border and --glass-border-strong.',
)
assert.ok(
  borderColorSource.includes('TagTree guide line') &&
    borderColorSource.includes('Menu separator') &&
    borderColorSource.includes('Coss Card/Dialog/Command/Table divider') &&
    borderColorSource.includes('Markdown inline code/table outer/table cell/hr divider') &&
    borderColorSource.includes('Card/SideBar/docs preview surface'),
  'BorderColor detail usage copy must include guide-line and divider examples.',
)
assert.ok(
  borderColorSource.includes('neutral hover boundary') &&
    borderColorSource.includes('primary action/selected/keyboard focus') &&
    cossButtonCss.includes('.coss-button:hover') &&
    cossButtonCss.includes('border-color: var(--color-border-emphasis);') &&
    cossButtonCss.includes('.coss-button--default:hover,\n  .coss-button--default[data-popup-open] {\n    border-color: var(--color-border-accent);') &&
    cossButtonFocusBlock.includes('outline: 2px solid var(--color-border-accent);') &&
    cossInputGroupCss.includes('border-color: var(--color-border-accent);') &&
    cossInputGroupCss.includes('color-mix(in srgb, var(--color-border-accent) 18%, transparent)') &&
    cossTabsFocusBlock.includes('outline: 2px solid var(--color-border-accent);') &&
    mdEditorCss.includes('.md-editor__math-dialog-textarea:focus') &&
    mdEditorCss.includes('border-color: var(--color-border-accent);'),
  'Emphasis and accent BorderColor usage must separate neutral hover from action, selected, focus, and invalid states.',
)
assert.ok(
  tagTreeCss.includes('background: var(--color-border-divider);') &&
    menuCss.includes('--weimo-menu-separator-bg: var(--color-border-divider-menu);') &&
    menuCss.includes('--weimo-menu-separator-bg: var(--color-border-divider-menu-on-light);') &&
    menuCss.includes('--weimo-menu-separator-bg: var(--color-border-divider-menu-on-dark);') &&
    menuCss.includes('background: var(--weimo-menu-separator-bg);') &&
    !menuCss.includes('background: var(--frosted-surface-border);') &&
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
    !markdownContentCss.includes('--md-divider-color') &&
    markdownContentCss.includes('border-bottom: 1px solid var(--md-table-cell-border-color);') &&
    markdownContentCss.includes('border-left: 1px solid var(--md-table-cell-border-color);') &&
    markdownInlineCodeSurfaceBlock.includes('border: 1px solid var(--md-code-border-color);') &&
    markdownTableScrollBlock.includes('border: 1px solid var(--md-table-frame-border-color);') &&
    markdownEditorTableWrapperBlock.includes('border: 1px solid var(--md-table-frame-border-color);'),
  'Markdown dividers, inline code, and tables must use separate node-semantic border tokens.',
)
assert.ok(
    cardSurfaceCss.includes('border-color: var(--color-border);') &&
    popupSurfaceCss.includes('border-color: var(--color-border-divider);') &&
    !frostedSurfaceCss.includes('var(--color-border-divider)') &&
    !capsuleFrameCss.includes('var(--color-border-divider)') &&
    cossButtonCss.includes('border-color: var(--color-border);') &&
    sidebarDrawerBlock.includes('border: 1px solid var(--color-border);') &&
    demoBlockPanelBlock.includes('border: 1px solid var(--color-border);') &&
    tagTreePreviewPanelBlock.includes('border: 1px solid var(--color-border);') &&
    tagBarPreviewPanelBlock.includes('border: 1px solid var(--color-border);'),
  'Default BorderColor usage must cover surface/container outer borders and docs preview frames.',
)
assert.ok(
  frostedSurfaceCss.includes('border-color: var(--frosted-surface-border);') &&
    !frostedSurfaceCss.includes('border: 1px solid var(--color-border);'),
  'FrostedSurface must use its background-aware border token (on the opt-in --bordered modifier) instead of the fixed default BorderColor token.',
)

for (const [token, lightThemeValue, darkThemeValue] of [
  ['--frosted-surface-border', 'hsl(0 0% 80%)', 'hsl(0 0% 38%)'],
]) {
  assert.ok(
    borderColorSource.includes(`token: '${token}'`),
    `frostedSurfaceBorderColorMap must mirror the frosted material border token ${token}.`,
  )
  assert.ok(
    tokensCss.includes(`${token}: ${lightThemeValue};`) &&
      tokensCss.includes(`${token}: ${darkThemeValue};`),
    `tokens.css must keep ${token} aligned with the frostedSurfaceBorderColorMap mirror.`,
  )
}

assert.deepEqual(rootStyleItem, styleRegistry, 'Root registry style item must match registry/style.json.')
assert.ok(
  definitionsIndexSource.includes("import { borderTokensDefinition } from './packages/weimo-ui-core/border-tokens'") &&
    definitionsIndexSource.includes("'border-tokens': borderTokensDefinition"),
  'component definitions index must wire the 边框 (border-tokens) detail definition.',
)
assert.ok(
  docsDefinitionSource.includes("id: 'border-tokens'") &&
    docsDefinitionSource.includes("frame: 'plain',") &&
    docsDefinitionSource.includes("import { ComponentPreviewCard } from 'weimo-ui-card/components/component-preview-card'") &&
    docsDefinitionSource.includes("from 'weimo-ui-core/components/border-radius'") &&
    !docsDefinitionSource.includes('component-preview-card-demo__category') &&
    docsDefinitionSource.includes('borderRadiusScales.map') &&
    docsDefinitionSource.includes('const borderColorToneOrder = [') &&
    docsDefinitionSource.includes("'default',\n  'disable',\n  'divider',\n  'emphasis',\n  'accent',\n  'danger',") &&
    docsDefinitionSource.includes('borderColorToneOrder.map') &&
    docsDefinitionSource.includes('borderColorToneMap[tone]') &&
    docsDefinitionSource.includes('getBorderColorClassName(tone)') &&
    docsDefinitionSource.includes('getBorderColorToken(tone)') &&
    docsDefinitionSource.includes('<ComponentPreviewCard') &&
    docsDefinitionSource.includes('items={borderRadiusScales.map((scale) => ({') &&
    docsDefinitionSource.includes('token: getBorderRadiusToken(scale),') &&
    docsDefinitionSource.includes('value: getBorderRadiusValue(scale),') &&
    docsDefinitionSource.includes('label="圆角"') &&
    docsDefinitionSource.includes('className="border-radius-preview__samples"') &&
    docsDefinitionSource.includes('border-radius-preview__sample') &&
    docsDefinitionSource.includes('darkValue: borderColorToneMap[tone].value.dark,') &&
    docsDefinitionSource.includes('token: getBorderColorToken(tone),') &&
    docsDefinitionSource.includes('value: borderColorToneMap[tone].value.light,') &&
    docsDefinitionSource.includes('label="边框色"') &&
    docsDefinitionSource.includes('className="border-color-preview__samples"') &&
    docsDefinitionSource.includes('border-color-preview__sample') &&
    docsDefinitionSource.includes(
      'className={`border-color-preview__sample ${getBorderColorClassName(tone)}`}',
    ) &&
    docsDefinitionSource.includes('frostedSurfaceBorderColorMap') &&
    docsDefinitionSource.includes(
      'darkValue: liveBorderColor ?? frostedSurfaceBorderColorMap.default.value.dark,',
    ) &&
    docsDefinitionSource.includes(
      "  frostedSurfaceBorderAnchorMap,\n  interpolateFrostedBorderColor,\n} from 'weimo-ui-core/components/frosted-surface-model'",
    ) &&
    docsDefinitionSource.includes('...frostedBorderAnchorOrder.map((anchor) => ({') &&
    docsDefinitionSource.includes('label="磨砂材质边框色"') &&
    docsDefinitionSource.includes(
      "import { GlassPreviewCard } from '../../../previews/glass-preview-card'",
    ) &&
    docsDefinitionSource.includes(
      "  FrostedSurface,\n  useFrostedSurfaceBackgroundToneRef,\n} from 'weimo-ui-core/components/frosted-surface'",
    ) &&
    docsDefinitionSource.includes('interpolateFrostedBorderColor(backgroundLuminance)') &&
    docsDefinitionSource.includes(
      'value: liveBorderColor ?? frostedSurfaceBorderColorMap.default.value.light,',
    ) &&
    docsDefinitionSource.includes('className="frosted-border-preview__probe"') &&
    docsDefinitionSource.includes('aboveCanvas={') &&
    docsDefinitionSource.includes('className="frosted-border-preview"') &&
    docsDefinitionSource.includes('frostedBorderAnchorTokens.map((token) => (') &&
    docsDefinitionSource.includes('className="frosted-border-preview__row"') &&
    docsDefinitionSource.includes('style={{ borderColor: `var(${token})` }}') &&
    docsDefinitionSource.includes('className="frosted-border-preview__tile"') &&
    !docsDefinitionSource.includes('frosted-border-preview__samples') &&
    !docsDefinitionSource.includes('<TokenPreviewDetails') &&
    docsDefinitionSource.includes('--color-border-disabled-on-light') &&
    docsDefinitionSource.includes('--color-border-divider-menu-on-dark') &&
    docsDefinitionSource.includes("token: '--frosted-surface-border'") &&
    !docsDefinitionSource.includes('frosted-surface-border-on-') &&
    !docsDefinitionSource.includes('description={item.description}') &&
    !docsDefinitionSource.includes('uiUsage={item.uiUsage}') &&
    !docsDefinitionSource.includes('bijiUsage={item.bijiUsage}') &&
    !docsDefinitionSource.includes('summary:') &&
    !docsDefinitionSource.includes('border-color-preview__row') &&
    !docsDefinitionSource.includes('border-color-preview__description') &&
    !docsDefinitionSource.includes('border-color-preview__context-token'),
  'BorderColor docs definition must index background-aware tokens without rendering redundant prose.',
)
assert.ok(
  appCss.includes('.border-color-preview__sample') &&
    !appCss.includes('.border-color-preview__row') &&
    !appCss.includes('.border-color-preview__identity') &&
    !appCss.includes('.border-color-preview__description') &&
    !appCss.includes('.border-color-preview__value'),
  'App.css must include only the BorderColor-specific preview-effect styles.',
)
assert.ok(
  appCss.includes('.border-color-preview__samples {\n  display: flex;') &&
    samplesBlock.includes('flex-wrap: wrap;') &&
    samplesBlock.includes('align-content: center;') &&
    samplesBlock.includes('row-gap: 12px;') &&
    samplesBlock.includes('column-gap: clamp(12px, 4%, 24px);') &&
    sampleBlock.includes(
      'width: clamp(24px, calc((100% - 5 * clamp(12px, 4%, 24px)) / 6), 48px);',
    ) &&
    sampleBlock.includes('aspect-ratio: 1;') &&
    sampleBlock.includes('border: 1px solid;') &&
    sampleBlock.includes('border-radius: var(--radius-sm);') &&
    !sampleBlock.includes('height:') &&
    !sampleBlock.includes('background:') &&
    !sampleBlock.includes('box-shadow:'),
  'BorderColor preview samples must stay square via aspect-ratio 1 with a 24-48px fluid size and 12-24px gaps, one centered row while six squares fit.',
)

assert.ok(
  frostedProbeBlock.includes('display: grid;') &&
    frostedProbeBlock.includes(
      'width: clamp(24px, calc((100% - 3 * clamp(12px, 4%, 24px)) / 4), 48px);',
    ) &&
    !frostedProbeBlock.includes('background') &&
    !frostedProbeBlock.includes('border'),
  'The live border readout probe must be a fully transparent grid wrapper sized like the static squares, sharing the tile rect for sampling.',
)

assert.ok(
  frostedCanvasOverrideBlock.includes('flex: 1 1 auto;') &&
    frostedCanvasOverrideBlock.includes('min-height: 0;') &&
    frostedCanvasOverrideBlock.includes('border-radius: var(--radius-sm);'),
  'The frosted border card must override the shared striped canvas to fill the remaining content height (above the static row) with rounded corners.',
)

assert.ok(
  !appCss.includes('.frosted-border-preview__samples') &&
    frostedRowBlock.includes('width: 100%;') &&
    frostedRowBlock.includes('flex-wrap: wrap;') &&
    frostedRowBlock.includes('justify-content: center;') &&
    frostedRowBlock.includes('column-gap: clamp(12px, 4%, 24px);') &&
    frostedRowBlock.includes('padding: 24px 16px 12px;') &&
    frostedSampleBlock.includes(
      'width: clamp(24px, calc((100% - 3 * clamp(12px, 4%, 24px)) / 4), 48px);',
    ) &&
    frostedSampleBlock.includes('aspect-ratio: 1;') &&
    frostedSampleBlock.includes('border: 1px solid;') &&
    frostedSampleBlock.includes('border-radius: var(--radius-sm);') &&
    !frostedSampleBlock.includes('height:') &&
    !frostedSampleBlock.includes('background:') &&
    !frostedSampleBlock.includes('box-shadow:') &&
    !appCss.includes('frosted-border-preview__sample--') &&
    frostedTileBlock.includes('width: 100%;') &&
    frostedTileBlock.includes('aspect-ratio: 1;') &&
    frostedTileBlock.includes('border-radius: var(--radius-sm);') &&
    !frostedTileBlock.includes('height:'),
  'Frosted border preview must keep four static anchor squares above the striped canvas and one live square FrostedSurface tile inside it.',
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
    'packages/weimo-ui-core/src/styles/variants/border/border-color.ts',
    'packages/weimo-ui-core/src/styles/variants/border/border-color.css',
  ],
  'border-color registry item must ship the tone map and utility stylesheet.',
)
