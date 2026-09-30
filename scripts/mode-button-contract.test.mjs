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

function cssBlockFor(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))

  assert.ok(match, `${selector} block must exist.`)

  return match[1]
}

const componentSource = readProjectFile('packages/weimo-ui-card/src/components/card/mode-button.tsx')
const componentCss = readProjectFile('packages/weimo-ui-card/src/components/card/mode-button.css')
const docsDefinitionSource = readProjectFile(
  'packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-card/card-tool-bar.tsx',
)
const componentDefinitionsIndexSource = readProjectFile(
  'packages/weimo-ui-site/src/docs/catalog/definitions.ts',
)
const appCss = readProjectFile('packages/weimo-ui-site/src/app/app.css')
const packageJson = JSON.parse(readProjectFile('package.json'))

const ghostIconButtonRenderCount = [...componentSource.matchAll(/<GhostIconButton\b/g)].length

assert.equal(
  ghostIconButtonRenderCount,
  1,
  'ModeButton must render exactly one GhostIconButton JSX instance.',
)

for (const snippet of [
  "import { useEffect, useRef, useState, type MouseEvent } from 'react'",
  "import { Ellipsis, Pencil, X } from 'lucide-react'",
  "import { GhostIconButton, type GhostIconButtonProps } from 'weimo-ui-core/components/ghost-icon-button'",
  "import { ActionMenu, type ActionMenuItem } from 'weimo-ui-core/components/menu'",
  "import { cn } from 'weimo-ui-core/lib/utils'",
  "import './mode-button.css'",
  "export type ModeButtonMode = 'display' | 'edit'",
  "export type ModeButtonMenuCloseTiming = 'before-mode-change' | 'after-mode-change'",
  'mode: ModeButtonMode',
  'onModeChange: (mode: ModeButtonMode) => void',
  'menuCloseTiming?: ModeButtonMenuCloseTiming',
  'displayMenuItems?: ActionMenuItem[]',
  "displayLabel = '打开操作菜单'",
  "editLabel = '退出编辑态'",
  "menuLabel = '操作菜单'",
  "editMenuItemLabel = '编辑'",
  'displayMenuItems = []',
  "menuCloseTiming = 'before-mode-change'",
  'const pendingModeChangeRef = useRef<ModeButtonMode | null>(null)',
  "const menuOpenForMode = mode === 'display' && menuOpen",
  'function handleOpenChange(open: boolean)',
  "if (!open && pendingModeChangeRef.current === 'edit' && mode === 'display') return",
  "setMenuOpen(mode === 'display' ? open : false)",
  'function handleEditSelect()',
  "if (menuCloseTiming === 'after-mode-change') {",
  "pendingModeChangeRef.current = 'edit'",
  "setMenuOpen(false)",
  "onModeChange('edit')",
  'useEffect(() => {',
  "if (pendingModeChangeRef.current === null) return",
  "if (mode === 'display') return",
  'pendingModeChangeRef.current = null',
  'setMenuOpen(false)',
  'function handleButtonClick(event: MouseEvent<HTMLButtonElement>)',
  "if (mode !== 'edit') return",
  'event.preventDefault()',
  "onModeChange('display')",
  'open: menuOpenForMode',
  'onOpenChange: handleOpenChange',
  'const menuItems: ActionMenuItem[] = [',
  "key: 'edit'",
  'label: editMenuItemLabel',
  'icon: <Pencil aria-hidden="true" />',
  'onSelect: handleEditSelect',
  '...displayMenuItems',
  'items={menuItems}',
  'aria-label={mode ===',
  'data-mode={mode}',
  'disabled={buttonDisabled}',
  '{...restButtonProps}',
  'onClick={handleButtonClick}',
  'className="mode-button__icon-stack"',
  'className="mode-button__icon-layer mode-button__icon-layer--display"',
  'className="mode-button__icon-layer mode-button__icon-layer--edit"',
  "data-active={mode === 'display' ? 'true' : undefined}",
  "data-active={mode === 'edit' ? 'true' : undefined}",
]) {
  assert.ok(componentSource.includes(snippet), `component source must include ${snippet}.`)
}

for (const [selector, snippets] of [
  ['.mode-button__icon-stack', ['display: grid;', 'width: 1em;', 'height: 1em;']],
  [
    '.mode-button__icon-layer',
    ['grid-area: 1 / 1;', 'opacity: 0;', 'transition:', 'transform 160ms ease'],
  ],
  ['.mode-button__icon-layer--edit', ['rotate(18deg)']],
  [
    '.mode-button__icon-layer[data-active="true"]',
    ['opacity: 1;', 'transform: scale(1) rotate(0deg);'],
  ],
]) {
  const block = cssBlockFor(componentCss, selector)

  for (const snippet of snippets) {
    assert.ok(block.includes(snippet), `${selector} must include ${snippet}.`)
  }
}

assert.ok(
  componentCss.includes('@media (prefers-reduced-motion: reduce)') &&
    componentCss.includes('transition-duration: 1ms;'),
  'ModeButton CSS must respect reduced-motion preferences.',
)

for (const snippet of [
  "import { useState } from 'react'",
  "import { TextButton } from 'weimo-ui-core/components/text-button'",
  "import { LabeledSwitch } from 'weimo-ui-core/components/labeled-switch'",
  'ModeButton,',
  'type ModeButtonMode,',
  "} from 'weimo-ui-card/components/mode-button'",
  "useState<ModeButtonMode>('display')",
  'function toggleMode(checked: boolean)',
  '<ModeButton',
  '<TextButton',
  '<LabeledSwitch',
  'labelOn="编辑态"',
  'labelOff="默认态"',
  'mode={mode}',
  'onModeChange={setMode}',
  "buttonProps={{ size: 'sm' }}",
  '编辑',
  "id: 'card-tool-bar'",
  "summary: '卡片编辑流程的底部工具栏、展示/编辑顶部栏与模式按钮'",
  'preview: () => <CardBarDemo />',
  '<ModeButtonDemo />',
]) {
  assert.ok(docsDefinitionSource.includes(snippet), `docs definition must include ${snippet}.`)
}
assert.ok(
  packageJson.exports?.['./components/mode-button'] === './packages/weimo-ui-card/src/components/card/mode-button.tsx',
  'ModeButton must have a public package export.',
)

assert.ok(
  componentDefinitionsIndexSource.includes(
    "import { cardToolBarDefinition } from './packages/weimo-ui-card/card-tool-bar'",
  ) &&
    componentDefinitionsIndexSource.includes("'card-tool-bar': cardToolBarDefinition") &&
    !componentDefinitionsIndexSource.includes('mode-button'),
  'ModeButton preview must be registered through the merged card-tool-bar definition in definitions.ts.',
)

assert.ok(
  !appCss.includes('.internal-mode-button-preview') &&
    !docsDefinitionSource.includes('internal-mode-button-preview') &&
    docsDefinitionSource.includes('className="icon-button-preview"'),
  'ModeButton preview must drop its custom style and share the borderless icon-button preview canvas.',
)

assert.ok(
  !docsDefinitionSource.includes('internal-mode-button-preview__surface'),
  'ModeButton docs preview must not add a nested preview surface.',
)

assert.ok(
  !appCss.includes('.internal-mode-button-preview__surface'),
  'ModeButton preview CSS must not keep the redundant nested surface.',
)
