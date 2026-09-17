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

const componentSource = readProjectFile('src/components/mode-button.tsx')
const componentCss = readProjectFile('src/components/mode-button.css')
const docsDefinitionSource = readProjectFile(
  'src/docs/component-definitions/mode-button.tsx',
)
const componentDefinitionsIndexSource = readProjectFile(
  'src/docs/component-definitions/index.ts',
)
const manifestSource = readProjectFile('src/docs/components-manifest.ts')
const appCss = readProjectFile('src/App.css')
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
  "import { GhostIconButton, type GhostIconButtonProps } from './ghost-icon-button'",
  "import { ActionMenu, type ActionMenuItem } from './menu'",
  "import { cn } from './lib/utils'",
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
  "import { TextButton } from '../../components/text-button'",
  'ModeButton,',
  'type ModeButtonMode,',
  "} from '../../components/mode-button'",
  "useState<ModeButtonMode>('display')",
  'function toggleMode()',
  '<ModeButton',
  '<TextButton',
  'mode={mode}',
  'onModeChange={setMode}',
  "buttonProps={{ size: 'sm' }}",
  '编辑态',
  '展示态',
  '切换到展示态',
  '切换到编辑态',
  "name: 'menuCloseTiming'",
  'type: \'"before-mode-change" | "after-mode-change"\'',
  "defaultValue: 'before-mode-change'",
  "name: 'displayMenuItems'",
  "type: 'ActionMenuItem[]'",
  "defaultValue: '[]'",
  "id: 'mode-button'",
  "summary: '内部模式图标按钮，统一菜单进入编辑态与关闭编辑态'",
  'preview: () => <ModeButtonDemo />',
]) {
  assert.ok(docsDefinitionSource.includes(snippet), `docs definition must include ${snippet}.`)
}
assert.ok(
  !docsDefinitionSource.includes("import { Button } from '../../components/coss/button'") &&
    !/<Button\b/.test(docsDefinitionSource),
  'ModeButton docs text toggle must not use coss Button.',
)

for (const snippet of [
  "id: 'mode-button'",
  "name: 'ModeButton'",
  "registryName: 'mode-button'",
  "packageExport: './components/mode-button'",
  'docs: true',
  'registry: true',
]) {
  assert.ok(manifestSource.includes(snippet), `components manifest must include ${snippet}.`)
}
assert.ok(
  packageJson.exports?.['./components/mode-button'] === './src/components/mode-button.tsx',
  'ModeButton must have a public package export.',
)

assert.ok(
  componentDefinitionsIndexSource.includes(
    "import { modeButtonDefinition } from './mode-button'",
  ) &&
    componentDefinitionsIndexSource.includes(
      "'mode-button': modeButtonDefinition",
    ),
  'ModeButton definition must be registered by component-definitions/index.ts.',
)

for (const selector of [
  '.internal-mode-button-preview',
  '.internal-mode-button-preview__toggle',
]) {
  assert.ok(appCss.includes(selector), `App.css must include ${selector}.`)
}

assert.ok(
  !docsDefinitionSource.includes('internal-mode-button-preview__surface'),
  'ModeButton docs preview must not add a nested preview surface.',
)

assert.ok(
  !appCss.includes('.internal-mode-button-preview__surface'),
  'ModeButton preview CSS must not keep the redundant nested surface.',
)

const previewBlock = cssBlockFor(appCss, '.internal-mode-button-preview')
assert.ok(
  previewBlock.includes('gap: 12px;') &&
    previewBlock.includes('align-content: center;') &&
    previewBlock.includes('justify-items: center;'),
  'ModeButton preview root must center the controls without drawing a nested border.',
)

assert.ok(
  packageJson.scripts?.test?.includes('scripts/mode-button-contract.test.mjs'),
  'package.json test script must run mode-button-contract.test.mjs.',
)
