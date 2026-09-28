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
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))

  assert.ok(match, `${selector} block must exist.`)

  return match[1]
}

function registryFiles(item) {
  return new Set((item?.files ?? []).map((file) => file.path))
}

const packageJson = readJson('package.json')
const rootRegistry = readJson('registry.json')
const rootItemsByName = new Map(rootRegistry.items.map((item) => [item.name, item]))
const definitionsIndexSource = readProjectFile('packages/weimo-ui-site/src/docs/catalog/definitions.ts')
const appCss = readProjectFile('packages/weimo-ui-site/src/app/app.css')

const cardSurfaceSource = readProjectFile('packages/weimo-ui-core/src/components/surfaces/card-surface/card-surface.tsx')
const cardSurfaceCss = readProjectFile('packages/weimo-ui-core/src/components/surfaces/card-surface/card-surface.css')
const surfaceDefinitionSource = readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/surface.tsx')
const popupSurfaceSource = readProjectFile('packages/weimo-ui-core/src/components/surfaces/popup-surface/popup-surface.tsx')
const popupSurfaceCss = readProjectFile('packages/weimo-ui-core/src/components/surfaces/popup-surface/popup-surface.css')

const cardResolverSource = readProjectFile('packages/weimo-ui-card/src/components/card/card-resolvers.tsx')
const sharedCardCss = readProjectFile('packages/weimo-ui-card/src/components/card/card.css')
const cossCardSource = readProjectFile('packages/weimo-ui-site/src/components/primitives/card.tsx')
const cossCardCss = readProjectFile('packages/weimo-ui-site/src/components/primitives/card.css')
const sidebarSource = readProjectFile('packages/weimo-ui-core/src/components/layout/sidebar/sidebar.tsx')
const sidebarCss = readProjectFile('packages/weimo-ui-core/src/components/layout/sidebar/sidebar.css')
const dialogSource = readProjectFile('packages/weimo-ui-core/src/components/primitives/dialog.tsx')
const dialogCss = readProjectFile('packages/weimo-ui-core/src/components/primitives/dialog.css')
const commandSource = readProjectFile('packages/weimo-ui-site/src/components/primitives/command.tsx')
const commandCss = readProjectFile('packages/weimo-ui-site/src/components/primitives/command.css')
const tooltipSource = readProjectFile('packages/weimo-ui-core/src/components/primitives/tooltip.tsx')
const tooltipCss = readProjectFile('packages/weimo-ui-core/src/components/primitives/tooltip.css')

assert.equal(
  packageJson.exports['./components/card-surface'],
  './packages/weimo-ui-core/src/components/surfaces/card-surface/card-surface.tsx',
  'package.json must expose CardSurface.',
)
assert.equal(
  packageJson.exports['./components/popup-surface'],
  './packages/weimo-ui-core/src/components/surfaces/popup-surface/popup-surface.tsx',
  'package.json must expose PopupSurface.',
)

for (const snippet of [
  "import { surfaceDefinition } from './packages/weimo-ui-core/surface'",
  'surface: surfaceDefinition',
]) {
  assert.ok(definitionsIndexSource.includes(snippet), `component definitions index must include ${snippet}.`)
}

for (const snippet of [
  "import type { ClassValue } from 'clsx'",
  "import { cn } from 'weimo-ui-core/lib/utils'",
  "import './card-surface.css'",
  'export type CardSurfaceProps',
  'export function getCardSurfaceClassName(...className: ClassValue[])',
  "return cn('card-surface', className)",
  'export function CardSurface',
]) {
  assert.ok(cardSurfaceSource.includes(snippet), `CardSurface source must include ${snippet}.`)
}
// 卡片材质固定双态,不提供边框变体:亮主题细微阴影无边框,暗主题边框无阴影。
assert.ok(
  !cardSurfaceSource.includes('bordered'),
  'CardSurface must not expose a bordered variant; the material is fixed per theme.',
)
const cardSurfaceBlock = blockFor(cardSurfaceCss, '.card-surface')
for (const snippet of [
  'box-sizing: border-box;',
  'color: var(--color-text-primary);',
  'border: 1px solid transparent;',
  'border-radius: var(--radius);',
  'background: var(--color-bg-card);',
  'box-shadow: var(--shadow-card);',
]) {
  assert.ok(cardSurfaceBlock.includes(snippet), `CardSurface CSS must include ${snippet}.`)
}
assert.ok(
  !cardSurfaceBlock.includes('padding:') && !cardSurfaceCss.includes('backdrop-filter'),
  'CardSurface must own material only, not layout padding or blur.',
)
assert.ok(
  !cardSurfaceCss.includes('card-surface--bordered') &&
    !cardSurfaceCss.includes('card-surface--borderless') &&
    !cardSurfaceCss.includes('.card-surface .card-surface') &&
    !cardSurfaceCss.includes('border: none') &&
    !cardSurfaceCss.includes('border-width: 0'),
  'CardSurface must drop every border variant modifier and the nested auto-stroke; only the theme-fixed stroke may color the border.',
)
// 暗主题以描边代阴影:深底上阴影不可见(--shadow-card 暗主题为 none),
// 取默认边框 token 划出卡片轮廓;亮主题保持细微阴影分层、无边框。
assert.ok(
  blockFor(cardSurfaceCss, '.dark .card-surface').includes('border-color: var(--color-border);'),
  'Dark theme must stroke card surfaces with the default border token instead of the invisible shadow.',
)

for (const snippet of [
  "import { CardSurface } from 'weimo-ui-core/components/card-surface'",
  "import { PopupSurface } from 'weimo-ui-core/components/popup-surface'",
  "import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'",
  "id: 'surface'",
  '亮主题细微阴影，暗主题边框描边',
  'function CardSurfacePreview()',
  'label="卡片材质"',
  '<div aria-hidden="true" className="card-surface-preview">',
  '<CardSurface className="card-surface-preview__tile">',
  '<FrostedSurface bordered className="frosted-surface-preview__tile">',
  'function PopupSurfacePreview()',
  'label="浮层材质"',
  '<PopupSurface className="popup-surface-preview__tile">',
  '亮主题抬升投影，暗主题边框描边',
  
  "frame: 'plain',",
]) {
  assert.ok(surfaceDefinitionSource.includes(snippet), `Surface docs definition must include ${snippet}.`)
}

// 标题栏开关机制已下沉为 core 正式组件 LabeledSwitch
// （packages/weimo-ui-core/src/components/controls/labeled-switch/），
// 契约迁移至 scripts/labeled-switch-contract.test.mjs。
assert.ok(
  !surfaceDefinitionSource.includes('items=') && !surfaceDefinitionSource.includes('surface-backdrop'),
  'Surface docs definition must keep the label title bar without token rows or preview backdrop.',
)
assert.ok(
  !surfaceDefinitionSource.includes('level="tooltip"') &&
    !appCss.includes('.popup-surface-preview__tile[data-level="tooltip"]'),
  'PopupSurface demo must render only the modal tile; the tooltip level stays a component feature, not a docs sample.',
)
const frostedSurfaceTileOnlyBlock = blockFor(appCss, '.frosted-surface-preview__tile')
assert.ok(
  appCss.includes(
    '.card-surface-preview__tile,\n.frosted-surface-preview__tile,\n.popup-surface-preview__tile {\n  display: grid;\n  gap: 6px;\n  width: 260px;\n  max-width: 100%;\n  padding: 18px;\n  justify-items: center;\n  text-align: center;\n}',
  ) &&
    !frostedSurfaceTileOnlyBlock.includes('min-height') &&
    !frostedSurfaceTileOnlyBlock.includes('align-content'),
  'All three Surface demo tiles must share one size box: no glass-only min-height, identical padding and caption line heights.',
)
assert.ok(
  !appCss.includes('.card-surface-preview,\n.popup-surface-preview {') &&
    !appCss.includes('.frosted-surface-preview {') &&
    !appCss.includes('\n  height: 180px;'),
  'Surface page demo canvases must drop the fixed 180px height and custom canvas padding, inheriting the ComponentPreviewCard default rhythm.',
)
assert.ok(
  surfaceDefinitionSource.includes('align="center"'),
  'Surface page card/popup canvases must center tiles through the shared align="center" modifier instead of custom flex layout.',
)
assert.ok(
  appCss.includes(
    '.component-preview-card:has(.card-surface-preview, .popup-surface-preview, .frosted-surface-preview__tile, .frosted-border-preview__tile, .icon-preview__row, .internal-bottom-preview, .liquid-glass-preview, .liquid-glass-toolbar-preview, .liquid-glass-icon-preview, .liquid-glass-chip-preview, .capsule-slot-preview, .liquid-glass-label-preview) .base-card__content {\n  overflow: visible;\n',
  ),
  'Card and popup surface demos (plus both frosted tiles — material page and border page, the frosted icon button rows, the bottom-bar canvas on CardSurface and every liquid glass canvas — material, toolbars, icon buttons, chips, capsule slots, labels) must opt out of the preview-window clip so real shadows (--shadow-card / --shadow-overlay / the tone-aligned liquid glass and frosted drop shadows) render into the card padding.',
)

for (const snippet of [
  "from 'weimo-ui-core/components/card-surface'",
  "className: getCardSurfaceClassName('weimo-card weimo-card-editable', className)",
]) {
  assert.ok(cardResolverSource.includes(snippet), `Card resolver must include ${snippet}.`)
}
assert.ok(
  !blockFor(sharedCardCss, '.weimo-card').includes('background: var(--color-bg-card);') &&
    !blockFor(sharedCardCss, '.weimo-card').includes('box-shadow: var(--shadow-card);'),
  'Card CSS must delegate static card material to CardSurface.',
)

for (const snippet of [
  "from 'weimo-ui-core/components/card-surface'",
  "getCardSurfaceClassName(cardVariants({ variant }), className)",
  "getCardSurfaceClassName('coss-card-frame', className)",
]) {
  assert.ok(cossCardSource.includes(snippet), `coss Card must include ${snippet}.`)
}
assert.ok(
  !cossCardCss.includes('background: var(--color-bg-card);') &&
    !cossCardCss.includes('box-shadow: var(--shadow-card);'),
  'coss Card CSS must delegate static card material to CardSurface.',
)
assert.ok(
  cossCardCss.includes("import 'weimo-ui-core/styles/card-surface.css';"),
  'coss Card CSS must import CardSurface material CSS for registry-installed consumers.',
)

assert.ok(
  sidebarSource.includes("from 'weimo-ui-core/components/card-surface'") &&
    sidebarSource.includes("getCardSurfaceClassName('weimo-sidebar--normal', className)"),
  'SideBar normal panel must compose CardSurface.',
)
assert.ok(
  !blockFor(sidebarCss, '.weimo-sidebar--normal').includes('background: var(--color-bg-card);') &&
    !blockFor(sidebarCss, '.weimo-sidebar--normal').includes('box-shadow: var(--shadow-card);'),
  'SideBar normal CSS must delegate static card material to CardSurface.',
)

for (const snippet of [
  "import type { ClassValue } from 'clsx'",
  "import { cn } from 'weimo-ui-core/lib/utils'",
  "import './popup-surface.css'",
  "export type PopupSurfaceLevel = 'modal' | 'tooltip'",
  'export type PopupSurfaceProps',
  'export function getPopupSurfaceClassName(',
  "return cn('popup-surface', className)",
  'export function PopupSurface',
  "data-level={level === 'modal' ? undefined : level}",
]) {
  assert.ok(popupSurfaceSource.includes(snippet), `PopupSurface source must include ${snippet}.`)
}
// 浮层材质固定双态,不提供边框变体:亮主题抬升阴影无边框,暗主题边框无阴影。
assert.ok(
  !popupSurfaceSource.includes('bordered'),
  'PopupSurface must not expose a bordered variant; the material is fixed per theme.',
)
const popupSurfaceBlock = blockFor(popupSurfaceCss, '.popup-surface')
for (const snippet of [
  'color: var(--color-text-primary);',
  'border: 1px solid transparent;',
  'border-radius: var(--radius);',
  'background: var(--color-bg-card);',
  'box-shadow: var(--shadow-overlay);',
]) {
  assert.ok(popupSurfaceBlock.includes(snippet), `PopupSurface CSS must include ${snippet}.`)
}
const tooltipSurfaceBlock = blockFor(popupSurfaceCss, '.popup-surface[data-level="tooltip"]')
assert.ok(
  tooltipSurfaceBlock.includes('border-radius: var(--radius-sm);') &&
    tooltipSurfaceBlock.includes('box-shadow: var(--shadow-tooltip);'),
  'PopupSurface tooltip level must use tooltip radius and shadow.',
)
assert.ok(
  !popupSurfaceCss.includes('popup-surface--bordered') &&
    !popupSurfaceCss.includes('border: none') &&
    !popupSurfaceCss.includes('border-width: 0'),
  'PopupSurface must drop the border variant modifier while the base keeps the 1px transparent border geometry.',
)
// 暗主题以描边代阴影:阴影 token 在暗主题置 none,浮层轮廓取分割线边框 token
// (比卡片材质的默认边框亮一档,层级更高的浮层在深底上仍可辨)。
assert.ok(
  blockFor(popupSurfaceCss, '.dark .popup-surface').includes('border-color: var(--color-border-divider);'),
  'Dark theme must stroke popup surfaces with the divider border token instead of the invisible shadow.',
)
// 亮主题浮层投影与液态玻璃库投影「数值对齐、定义互不引用」:token 字面量手抄
// 库内默认分支的投影(偏移 12px、模糊 40px、黑 25%),任一侧改动须手动同步
// 四处镜像(tokens.css + 两份 registry + 库字面量);库不引用 token,token 不进库。
const tokensCss = readProjectFile('packages/weimo-ui-core/src/styles/tokens.css')
const liquidGlassEngineSource = readProjectFile(
  'packages/weimo-ui-core/src/components/surfaces/liquid-glass/liquid-glass-react/index.tsx',
)
const registryJsonText = readProjectFile('registry.json')
const styleRegistryText = readProjectFile('registry/style.json')
assert.ok(
  tokensCss.includes('--shadow-overlay: 0 12px 40px hsl(0 0% 0% / 0.25);') &&
    liquidGlassEngineSource.includes('"0px 12px 40px rgba(0, 0, 0, 0.25)"'),
  'Light-theme --shadow-overlay must stay value-aligned with the liquid glass drop shadow literal (same offset, blur and alpha, hand-copied).',
)
assert.ok(
  !liquidGlassEngineSource.includes('--shadow-overlay'),
  'The vendored liquid glass engine must keep its own shadow literal instead of referencing the overlay token.',
)
assert.ok(
  registryJsonText.includes('"shadow-overlay": "0 12px 40px hsl(0 0% 0% / 0.25)"') &&
    styleRegistryText.includes('"shadow-overlay": "0 12px 40px hsl(0 0% 0% / 0.25)"'),
  'Both registry mirrors must carry the value-aligned overlay shadow.',
)
assert.ok(
  !popupSurfaceCss.includes('backdrop-filter') && !popupSurfaceBlock.includes('padding:'),
  'PopupSurface must own popup material only, not backdrop blur or layout padding.',
)
assert.ok(
  dialogSource.includes("from 'weimo-ui-core/components/popup-surface'") &&
    dialogSource.includes("getPopupSurfaceClassName('modal', 'coss-dialog__popup', className)"),
  'coss Dialog popup must compose PopupSurface.',
)
assert.ok(
  commandSource.includes("from 'weimo-ui-core/components/popup-surface'") &&
    commandSource.includes("getPopupSurfaceClassName('modal', 'coss-command__popup', className)"),
  'coss Command popup must compose PopupSurface.',
)
assert.ok(
  tooltipSource.includes("from 'weimo-ui-core/components/popup-surface'") &&
    tooltipSource.includes("getPopupSurfaceClassName('tooltip', 'coss-tooltip__popup', className)"),
  'coss Tooltip popup must compose PopupSurface.',
)
for (const [source, selector, name, materialImport] of [
  [dialogCss, '.coss-dialog__popup', 'Dialog', "import 'weimo-ui-core/styles/popup-surface.css';"],
  [commandCss, '.coss-command__popup', 'Command', "import 'weimo-ui-core/styles/popup-surface.css';"],
  [tooltipCss, '.coss-tooltip__popup', 'Tooltip', "import 'weimo-ui-core/styles/popup-surface.css';"],
]) {
  const block = blockFor(source, selector)
  assert.ok(
    !block.includes('background: var(--color-bg-card);') &&
      !block.includes('box-shadow: var(--shadow-overlay);') &&
      !block.includes('box-shadow: var(--shadow-tooltip);'),
    `${name} popup CSS must delegate raised material to PopupSurface.`,
  )
  assert.ok(
    source.includes(materialImport),
    `${name} CSS must import PopupSurface CSS for registry-installed consumers.`,
  )
}

for (const name of ['card-surface', 'popup-surface']) {
  const rootItem = rootItemsByName.get(name)
  const standaloneItem = readJson(`registry/${name}.json`)

  assert.ok(rootItem, `Root registry must include @weimo/${name}.`)
  assert.deepEqual(standaloneItem, rootItem, `registry/${name}.json must match registry.json.`)
}

assert.deepEqual(
  registryFiles(rootItemsByName.get('card-surface')),
  new Set(['packages/weimo-ui-core/src/components/surfaces/card-surface/card-surface.tsx', 'packages/weimo-ui-core/src/components/surfaces/card-surface/card-surface.css']),
  'CardSurface registry item must ship only its component and CSS.',
)
assert.deepEqual(
  registryFiles(rootItemsByName.get('popup-surface')),
  new Set(['packages/weimo-ui-core/src/components/surfaces/popup-surface/popup-surface.tsx', 'packages/weimo-ui-core/src/components/surfaces/popup-surface/popup-surface.css']),
  'PopupSurface registry item must ship only its component and CSS.',
)

for (const name of ['card', 'sidebar']) {
  const files = registryFiles(rootItemsByName.get(name))

  assert.ok(files.has('packages/weimo-ui-core/src/components/surfaces/card-surface/card-surface.tsx'), `${name} registry item must ship CardSurface source.`)
  assert.ok(files.has('packages/weimo-ui-core/src/components/surfaces/card-surface/card-surface.css'), `${name} registry item must ship CardSurface CSS.`)
}
for (const name of [
  'action-dialog',
  'card',
  'heatmap',
  'math-editor',
  'md-editor',
  'tag-picker',
]) {
  const files = registryFiles(rootItemsByName.get(name))

  assert.ok(files.has('packages/weimo-ui-core/src/components/surfaces/popup-surface/popup-surface.tsx'), `${name} registry item must ship PopupSurface source.`)
  assert.ok(files.has('packages/weimo-ui-core/src/components/surfaces/popup-surface/popup-surface.css'), `${name} registry item must ship PopupSurface CSS.`)
}
