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

const cardSurfaceSource = readProjectFile('src/components/card-surface.tsx')
const cardSurfaceCss = readProjectFile('src/components/card-surface.css')
const cardDefinitionSource = readProjectFile('src/docs/component-definitions/card-surface.tsx')
const popupSurfaceSource = readProjectFile('src/components/popup-surface.tsx')
const popupSurfaceCss = readProjectFile('src/components/popup-surface.css')
const popupDefinitionSource = readProjectFile('src/docs/component-definitions/popup-surface.tsx')

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
  "id: 'card-surface'",
  "name: 'CardSurface'",
  "registryName: 'card-surface'",
  "packageExport: './components/card-surface'",
  "group: 'surface-material'",
  "id: 'popup-surface'",
  "name: 'PopupSurface'",
  "registryName: 'popup-surface'",
  "packageExport: './components/popup-surface'",
]) {
  assert.ok(manifestSource.includes(snippet), `components-manifest.ts must include ${snippet}.`)
}
assert.ok(
  manifestSource.indexOf("id: 'card-surface'") < manifestSource.indexOf("id: 'glass-surface'") &&
    manifestSource.indexOf("id: 'glass-surface'") < manifestSource.indexOf("id: 'popup-surface'"),
  'Surface / 材质 components must stay sorted by component name.',
)

for (const snippet of [
  "import { cardSurfaceDefinition } from './card-surface'",
  "'card-surface': cardSurfaceDefinition",
  "import { popupSurfaceDefinition } from './popup-surface'",
  "'popup-surface': popupSurfaceDefinition",
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
  'className={getCardSurfaceClassName(className)}',
]) {
  assert.ok(cardSurfaceSource.includes(snippet), `CardSurface source must include ${snippet}.`)
}
const cardSurfaceBlock = blockFor(cardSurfaceCss, '.card-surface')
for (const snippet of [
  'box-sizing: border-box;',
  'color: var(--color-text-primary);',
  'border: 1px solid var(--color-border);',
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

for (const snippet of [
  "import { CardSurface } from '../../components/card-surface'",
  "import { ComponentPreviewCard } from '../../components/component-preview-card'",
  "id: 'card-surface'",
  '静态实体卡片材质',
  '<ComponentPreviewCard>',
  '<CardSurface className="card-surface-preview__tile">',
  "frame: 'plain',",
]) {
  assert.ok(cardDefinitionSource.includes(snippet), `CardSurface docs definition must include ${snippet}.`)
}
assert.ok(
  !cardDefinitionSource.includes('label=') &&
    !cardDefinitionSource.includes('items=') &&
    !cardDefinitionSource.includes('surface-backdrop'),
  'CardSurface docs definition must render the bare CardSurface demo without token rows, label, or preview backdrop.',
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
const popupSurfaceBlock = blockFor(popupSurfaceCss, '.popup-surface')
for (const snippet of [
  'color: var(--color-text-primary);',
  'border: 1px solid var(--color-border);',
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
  !popupSurfaceCss.includes('backdrop-filter') && !popupSurfaceBlock.includes('padding:'),
  'PopupSurface must own popup material only, not backdrop blur or layout padding.',
)
for (const snippet of [
  "import { PopupSurface } from '../../components/popup-surface'",
  "id: 'popup-surface'",
  '抬升浮层主体材质',
  '<PopupSurface className="popup-surface-preview__tile">',
  '<PopupSurface className="popup-surface-preview__tile" level="tooltip">',
]) {
  assert.ok(popupDefinitionSource.includes(snippet), `PopupSurface docs definition must include ${snippet}.`)
}

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
