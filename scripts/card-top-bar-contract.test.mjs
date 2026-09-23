import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

function readProjectFile(relativePath) {
  const absolutePath = join(root, relativePath)

  assert.ok(existsSync(absolutePath), `${relativePath} must exist.`)

  return readFileSync(absolutePath, 'utf8')
}

function cssBlockFor(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))

  assert.ok(match, `${selector} block must exist.`)

  return match[1]
}

const componentSource = readProjectFile('src/components/card-top-bar.tsx')
const componentCss = readProjectFile('src/components/card-top-bar.css')
const CardSource = readProjectFile('src/components/card.tsx')
const CardResolversSource = readProjectFile('src/components/card-resolvers.tsx')
const packageJson = JSON.parse(readProjectFile('package.json'))
const rootRegistry = JSON.parse(readProjectFile('registry.json'))
const registryFiles = new Set(
  readdirSync(join(root, 'registry')).filter((file) => file.endsWith('.json')),
)
const registryItemsByName = new Map(rootRegistry.items.map((item) => [item.name, item]))
const CardItem = registryItemsByName.get('card')

for (const snippet of [
  "import type { ComponentPropsWithoutRef, ReactNode } from 'react'",
  "import { ModeButton, type ModeButtonMode } from './mode-button'",
  "import type { ActionMenuItem } from './menu'",
  "import './card-top-bar.css'",
  'export type CardTopBarDisplayProps',
  "mode: 'display'",
  'createdAtText: ReactNode',
  'actionLabel?: string',
  'actionGroupClassName?: string',
  'actionPrefixSlot?: ReactNode',
  'actionSlot?: ReactNode',
  'displayMenuItems?: ActionMenuItem[]',
  'editActionLabel?: string',
  'onAction?: () => void',
  'export type CardTopBarEditProps',
  "mode: 'edit'",
  'editTitle: ReactNode',
  'actionSlot?: ReactNode',
  'cancelLabel?: string',
  'onCancel?: () => void',
  'export function CardTopBar',
  "actionLabel = '更多操作'",
  "cancelLabel = '取消'",
  "editActionLabel = '编辑'",
  'actionGroupClassName,',
  'actionPrefixSlot,',
  'displayMenuItems,',
  'const defaultActionSlot = onAction ? (',
  'const resolvedActionSlot =',
  'actionSlot ??',
  'actionPrefixSlot ? (',
  "className={cn('weimo-card-top-bar__actions', actionGroupClassName)}",
  '{actionPrefixSlot}',
  '{defaultActionSlot}',
  'rightSlot={',
  'resolvedActionSlot',
  '<ModeButton',
  'mode={mode}',
  'onModeChange={handleActionModeChange}',
  'menuCloseTiming="after-mode-change"',
  'displayLabel={actionLabel}',
  'editLabel={cancelLabel}',
  'menuLabel={actionLabel}',
  'editMenuItemLabel={editActionLabel}',
  'displayMenuItems={displayMenuItems}',
  'buttonProps={{',
  "className: 'weimo-card__header-icon-button'",
  "size: 'sm'",
  'className="weimo-card__time"',
  "cn('weimo-card__time weimo-card-top-bar__edit-title')",
  'data-mode={mode}',
  'weimo-card-top-bar__slot',
  'weimo-card-top-bar__slot-layer',
]) {
  assert.ok(componentSource.includes(snippet), `CardTopBar source must include ${snippet}.`)
}

for (const snippet of [
  "import { Ellipsis, X } from 'lucide-react'",
  "import { IconButton } from './icon-button'",
  'function CardTopBarActionButton',
  'weimo-card-top-bar__icon-layer',
  '<Ellipsis />',
  '<X />',
]) {
  assert.ok(!componentSource.includes(snippet), `CardTopBar source must not include ${snippet}.`)
}

for (const [selector, snippets] of [
  [
    '.weimo-card__header',
    [
      'display: flex;',
      'justify-content: space-between;',
      'color: var(--color-text-placeholder);',
    ],
  ],
  ['.weimo-card__header-main', ['min-width: 0;']],
  ['.weimo-card__header-action', ['flex: none;']],
  ['.weimo-card__time', ['font-size: var(--font-size-sm);']],
  [
    '.weimo-card-top-bar__edit-title',
    ['overflow: hidden;', 'text-overflow: ellipsis;', 'white-space: nowrap;'],
  ],
  [
    '.weimo-card-top-bar__slot',
    ['display: grid;', 'min-width: 0;'],
  ],
  [
    '.weimo-card-top-bar__slot-layer',
    ['transition:', 'opacity 160ms ease'],
  ],
  [
    '.weimo-card-top-bar__actions',
    ['display: flex;', 'align-items: center;', 'gap: var(--space-tag-gap);'],
  ],
]) {
  const block = cssBlockFor(componentCss, selector)

  for (const snippet of snippets) {
    assert.ok(block.includes(snippet), `${selector} must include ${snippet}.`)
  }
}

assert.ok(
  componentCss.includes('button.icon-button.weimo-card__header-icon-button'),
  'CardTopBar CSS must own the card header icon button color override.',
)
assert.ok(
  componentCss.includes('@media (prefers-reduced-motion: reduce)') &&
    componentCss.includes('transition-duration: 1ms;'),
  'CardTopBar CSS must respect reduced motion preferences.',
)
assert.ok(
  !componentCss.includes('weimo-card-top-bar__icon-layer'),
  'CardTopBar CSS must not keep duplicated icon-layer animation now that ModeButton owns it.',
)

assert.ok(
  !existsSync(join(root, 'src/components/editable-card.tsx')) &&
    !existsSync(join(root, 'src/components/editable-card.css')),
  'Removed EditableCard source and CSS files must not exist.',
)
assert.ok(
  existsSync(join(root, 'src/components/card.tsx')) &&
    existsSync(join(root, 'src/components/card-resolvers.tsx')) &&
    CardSource.includes("import { CardTopBar } from './card-top-bar'") &&
    CardSource.includes('resolveCardTopBarProps,') &&
    CardSource.includes("} from './card-resolvers'") &&
    CardSource.includes('const topBarProps = resolveCardTopBarProps(') &&
    CardSource.includes('<CardTopBar {...topBarProps} />') &&
    CardResolversSource.includes("import type { CardTopBarProps } from './card-top-bar'") &&
    CardResolversSource.includes('export function resolveCardTopBarProps(') &&
    CardResolversSource.includes('): CardTopBarProps') &&
    CardResolversSource.includes("mode: 'display'") &&
    CardResolversSource.includes('createdAtText,') &&
    CardResolversSource.includes('actionLabel: labels.more') &&
    CardResolversSource.includes('editActionLabel: labels.edit') &&
    CardResolversSource.includes('onAction: onEnterEdit') &&
    CardResolversSource.includes("mode: 'edit'") &&
    CardResolversSource.includes('editTitle,'),
  'Card must render CardTopBar for display and edit modes.',
)
assert.ok(
  !CardSource.includes('function renderDisplayActionMenu()') &&
    !CardSource.includes("import { ActionMenu } from './menu'") &&
    !CardSource.includes("import { IconButton } from './icon-button'") &&
    !CardSource.includes('actionSlot={renderDisplayActionMenu()}'),
  'Card must let CardTopBar own the display mode action control.',
)

const docsDefinitionSource = readProjectFile('src/docs/component-definitions/bar.tsx')
const componentDefinitionsIndexSource = readProjectFile('src/docs/component-definitions/index.ts')
const manifestSource = readProjectFile('src/docs/components-manifest.ts')
const appCss = readProjectFile('src/App.css')

for (const snippet of [
  "id: 'card-top-bar'",
  "name: 'CardTopBar'",
  "registryName: 'card-top-bar'",
  "packageExport: './components/card-top-bar'",
  'docs: false',
  'registry: true',
]) {
  assert.ok(manifestSource.includes(snippet), `components manifest must include ${snippet}.`)
}
assert.ok(
  manifestSource.includes("id: 'bar'") &&
    manifestSource.includes("name: '浮动栏'") &&
    manifestSource.includes("exportName: 'FloatBar'") &&
    manifestSource.includes("registryName: 'float-bar'"),
  'components manifest must list the merged floating Bar page.',
)
assert.ok(
  !manifestSource.includes("internalGroup: 'layout'"),
  'components manifest must not keep internal layout grouping.',
)

assert.ok(
  componentDefinitionsIndexSource.includes(
    "import { barDefinition } from './bar'",
  ) && componentDefinitionsIndexSource.includes('bar: barDefinition'),
  'CardTopBar preview must be registered through the merged Bar definition in component-definitions/index.ts.',
)

for (const snippet of [
  "import { useState } from 'react'",
  "import { CardTopBar } from '../../components/card-top-bar'",
  "import { TextButton } from '../../components/text-button'",
  "id: 'bar'",
  "summary: '底部操作栏、卡片工具栏、卡片顶部栏与浮动工具栏总览'",
  "useState<'display' | 'edit'>('display')",
  'setMode((current) => (current ===',
  '<TextButton',
  'function enterEdit()',
  'function exitEdit()',
  "setMode('display')",
  'onAction={enterEdit}',
  'onCancel={exitEdit}',
  '切换到编辑态',
  '切换到展示态',
  '<CardTopBarDemo />',
]) {
  assert.ok(docsDefinitionSource.includes(snippet), `CardTopBar docs definition must include ${snippet}.`)
}
for (const snippet of [
  "import { Ellipsis, X } from 'lucide-react'",
  "import { IconButton } from '../../components/icon-button'",
  "import { ActionMenu } from '../../components/menu'",
  'const [menuOpen, setMenuOpen] = useState(false)',
  'const actionSlot = (',
  'actionSlot={actionSlot}',
  'className="internal-card-top-bar-preview__action-slot"',
  'className="internal-card-top-bar-preview__action-layer"',
]) {
  assert.ok(!docsDefinitionSource.includes(snippet), `CardTopBar docs definition must not include ${snippet}.`)
}

for (const selector of [
  '.internal-card-top-bar-preview',
  '.internal-card-top-bar-preview__surface',
  '.internal-card-top-bar-preview__toggle',
]) {
  assert.ok(appCss.includes(selector), `App.css must include ${selector}.`)
}
const cardTopBarPreviewSurfaceBlock = cssBlockFor(
  appCss,
  '.internal-card-top-bar-preview__surface',
)
assert.ok(
  cardTopBarPreviewSurfaceBlock.includes('grid-template-columns: minmax(0, 1fr);'),
  'CardTopBar docs preview surface must stack the top bar and toggle vertically.',
)
assert.ok(
  cardTopBarPreviewSurfaceBlock.includes('border: 1px solid var(--color-border);') &&
    !cardTopBarPreviewSurfaceBlock.includes('box-shadow:'),
  'CardTopBar docs preview surface must draw an outer border without changing the component or adding a shadow.',
)
assert.ok(
  !appCss.includes('internal-card-top-bar-preview__action-slot') &&
    !appCss.includes('internal-card-top-bar-preview__action-layer'),
  'CardTopBar docs preview must not keep duplicated action-slot animation CSS.',
)
const cardTopBarPreviewToggleBlock = cssBlockFor(
  appCss,
  '.internal-card-top-bar-preview__toggle',
)
assert.ok(
  cardTopBarPreviewToggleBlock.includes('justify-self: center;'),
  'CardTopBar docs preview toggle must be centered below the top bar.',
)

assert.ok(
  packageJson.exports?.['./components/card-top-bar'] === './src/components/card-top-bar.tsx',
  'CardTopBar must have a public package export.',
)
assert.ok(
  registryItemsByName.has('card-top-bar'),
  'CardTopBar must be listed as a root registry item.',
)
assert.ok(
  registryFiles.has('card-top-bar.json'),
  'CardTopBar must have a standalone registry file.',
)
assert.ok(
  !Object.hasOwn(packageJson.exports ?? {}, './components/editable-card') &&
    !registryItemsByName.has('editable-card') &&
    !registryFiles.has('editable-card.json'),
  'Removed EditableCard must not keep package or registry entries.',
)
assert.ok(
  packageJson.exports?.['./components/card'] === './src/components/card.tsx' &&
    registryItemsByName.has('card') &&
    registryFiles.has('card.json'),
  'Card must keep package and registry entries.',
)
assert.ok(CardItem, 'Card registry item must exist.')
for (const filePath of [
  'src/components/card-top-bar.tsx',
  'src/components/card-top-bar.css',
  'src/components/mode-button.tsx',
  'src/components/mode-button.css',
]) {
  assert.ok(
    CardItem.files.some((file) => file.path === filePath),
    `Card registry item must ship internal ${filePath}.`,
  )
}
