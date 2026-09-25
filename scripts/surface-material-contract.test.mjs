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
const manifestSource = readProjectFile('src/docs/components-manifest.ts')
const definitionsIndexSource = readProjectFile('src/docs/component-definitions/index.ts')
const appCss = readProjectFile('src/App.css')

const cardSurfaceSource = readProjectFile('src/components/card-surface.tsx')
const cardSurfaceCss = readProjectFile('src/components/card-surface.css')
const surfaceDefinitionSource = readProjectFile('src/docs/component-definitions/surface.tsx')
const popupSurfaceSource = readProjectFile('src/components/popup-surface.tsx')
const popupSurfaceCss = readProjectFile('src/components/popup-surface.css')

const cardResolverSource = readProjectFile('src/components/card-resolvers.tsx')
const sharedCardCss = readProjectFile('src/components/card.css')
const cossCardSource = readProjectFile('src/components/coss/card.tsx')
const cossCardCss = readProjectFile('src/components/coss/card.css')
const sidebarSource = readProjectFile('src/components/sidebar/sidebar-shell.tsx')
const sidebarCss = readProjectFile('src/components/sidebar/sidebar-shell.css')
const dialogSource = readProjectFile('src/components/coss/dialog.tsx')
const dialogCss = readProjectFile('src/components/coss/dialog.css')
const commandSource = readProjectFile('src/components/coss/command.tsx')
const commandCss = readProjectFile('src/components/coss/command.css')
const tooltipSource = readProjectFile('src/components/coss/tooltip.tsx')
const tooltipCss = readProjectFile('src/components/coss/tooltip.css')

assert.equal(
  packageJson.exports['./components/card-surface'],
  './src/components/card-surface.tsx',
  'package.json must expose CardSurface.',
)
assert.equal(
  packageJson.exports['./components/popup-surface'],
  './src/components/popup-surface.tsx',
  'package.json must expose PopupSurface.',
)
assert.ok(
  packageJson.scripts?.test?.includes('scripts/surface-material-contract.test.mjs'),
  'package.json test script must run surface-material-contract.test.mjs.',
)

for (const snippet of [
  "id: 'surface'",
  "name: '材质'",
  "registryName: 'card-surface'",
  "packageExport: './components/card-surface'",
  "group: 'surface-material'",
  "id: 'frosted-surface'",
  "id: 'popup-surface'",
  "registryName: 'popup-surface'",
  "packageExport: './components/popup-surface'",
]) {
  assert.ok(manifestSource.includes(snippet), `components-manifest.ts must include ${snippet}.`)
}
assert.ok(
  manifestSource.indexOf("id: 'frosted-surface'") < manifestSource.indexOf("id: 'popup-surface'") &&
    manifestSource.indexOf("id: 'popup-surface'") < manifestSource.indexOf("id: 'surface'"),
  'Surface / 材质 manifest entries must stay sorted by component name.',
)

for (const snippet of [
  "import { surfaceDefinition } from './surface'",
  'surface: surfaceDefinition',
]) {
  assert.ok(definitionsIndexSource.includes(snippet), `component definitions index must include ${snippet}.`)
}

for (const snippet of [
  "import type { ClassValue } from 'clsx'",
  "import { cn } from './lib/utils'",
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
  "import { CardSurface } from '../../components/card-surface'",
  "import { PopupSurface } from '../../components/popup-surface'",
  "import { ComponentPreviewCard } from '../../components/component-preview-card'",
  "import { SurfaceBorderToggle } from '../preview-toggle'",
  "id: 'surface'",
  '亮主题细微阴影，暗主题边框描边',
  'function CardSurfacePreview()',
  'label="卡片材质"',
  '<div aria-hidden="true" className="card-surface-preview">',
  '<CardSurface className="card-surface-preview__tile">',
  '<FrostedSurface bordered={bordered} className="frosted-surface-preview__tile">',
  'function PopupSurfacePreview()',
  'label="浮层材质"',
  '<PopupSurface className="popup-surface-preview__tile">',
  '亮主题抬升投影，暗主题边框描边',
  '<SurfaceBorderToggle bordered={bordered} onBorderedChange={setBordered} />',
  "frame: 'plain',",
]) {
  assert.ok(surfaceDefinitionSource.includes(snippet), `Surface docs definition must include ${snippet}.`)
}

// 标题栏开关（可见状态标签 + Switch）抽到 docs 共享组件：材质页三张卡的边框开关
// 与按钮页启用/模式开关共用，契约锁共享文件。
const previewToggleSource = readProjectFile('src/docs/preview-toggle.tsx')

for (const snippet of [
  "import { Switch } from '../components/coss/switch'",
  'export function PreviewToggle(',
  'ariaLabel: string',
  'label: ReactNode',
  'aria-label={ariaLabel}',
  'checked={checked}',
  'onCheckedChange={onCheckedChange}',
  'export function SurfaceBorderToggle(',
  'ariaLabel="显示边框"',
  "label={bordered ? '有边框' : '无边框'}",
]) {
  assert.ok(previewToggleSource.includes(snippet), `PreviewToggle shared component must include ${snippet}.`)
}
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
    '.component-preview-card:has(.card-surface-preview, .popup-surface-preview, .internal-bottom-preview, .liquid-glass-preview, .liquid-glass-toolbar-preview) .base-card__content {\n  overflow: visible;\n',
  ),
  'Card and popup surface demos (plus the bottom-bar canvas on CardSurface, the liquid glass canvas, and the toolbar canvases) must opt out of the preview-window clip so real shadows (--shadow-card / --shadow-overlay / the liquid glass drop shadow) render into the card padding.',
)

for (const snippet of [
  "from './card-surface'",
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
  "from '../card-surface'",
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
  cossCardCss.includes("import '../card-surface.css';"),
  'coss Card CSS must import CardSurface material CSS for registry-installed consumers.',
)

assert.ok(
  sidebarSource.includes("from '../card-surface'") &&
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
  "import { cn } from './lib/utils'",
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
assert.ok(
  !popupSurfaceCss.includes('backdrop-filter') && !popupSurfaceBlock.includes('padding:'),
  'PopupSurface must own popup material only, not backdrop blur or layout padding.',
)
assert.ok(
  dialogSource.includes("from '../popup-surface'") &&
    dialogSource.includes("getPopupSurfaceClassName('modal', 'coss-dialog__popup', className)"),
  'coss Dialog popup must compose PopupSurface.',
)
assert.ok(
  commandSource.includes("from '../popup-surface'") &&
    commandSource.includes("getPopupSurfaceClassName('modal', 'coss-command__popup', className)"),
  'coss Command popup must compose PopupSurface.',
)
assert.ok(
  tooltipSource.includes("from '../popup-surface'") &&
    tooltipSource.includes("getPopupSurfaceClassName('tooltip', 'coss-tooltip__popup', className)"),
  'coss Tooltip popup must compose PopupSurface.',
)
for (const [source, selector, name] of [
  [dialogCss, '.coss-dialog__popup', 'Dialog'],
  [commandCss, '.coss-command__popup', 'Command'],
  [tooltipCss, '.coss-tooltip__popup', 'Tooltip'],
]) {
  const block = blockFor(source, selector)
  assert.ok(
    !block.includes('background: var(--color-bg-card);') &&
      !block.includes('box-shadow: var(--shadow-overlay);') &&
      !block.includes('box-shadow: var(--shadow-tooltip);'),
    `${name} popup CSS must delegate raised material to PopupSurface.`,
  )
  assert.ok(
    source.includes("import '../popup-surface.css';"),
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
  new Set(['src/components/card-surface.tsx', 'src/components/card-surface.css']),
  'CardSurface registry item must ship only its component and CSS.',
)
assert.deepEqual(
  registryFiles(rootItemsByName.get('popup-surface')),
  new Set(['src/components/popup-surface.tsx', 'src/components/popup-surface.css']),
  'PopupSurface registry item must ship only its component and CSS.',
)

for (const name of ['card', 'sidebar']) {
  const files = registryFiles(rootItemsByName.get(name))

  assert.ok(files.has('src/components/card-surface.tsx'), `${name} registry item must ship CardSurface source.`)
  assert.ok(files.has('src/components/card-surface.css'), `${name} registry item must ship CardSurface CSS.`)
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

  assert.ok(files.has('src/components/popup-surface.tsx'), `${name} registry item must ship PopupSurface source.`)
  assert.ok(files.has('src/components/popup-surface.css'), `${name} registry item must ship PopupSurface CSS.`)
}
