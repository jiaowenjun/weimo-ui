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

function readJson(relativePath) {
  return JSON.parse(readProjectFile(relativePath))
}

function cssBlockFor(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))

  assert.ok(match, `${selector} block must exist.`)

  return match[1]
}

function assertIncludes(source, snippet, message) {
  assert.ok(source.includes(snippet), message)
}

function assertNotIncludes(source, snippet, message) {
  assert.ok(!source.includes(snippet), message)
}

const componentSource = readProjectFile('src/components/card-tool-bar.tsx')
const componentCss = readProjectFile('src/components/card-tool-bar.css')
const docsDefinitionSource = readProjectFile(
  'src/docs/component-definitions/tagged-card.tsx',
)
const definitionsIndexSource = readProjectFile('src/docs/component-definitions/index.ts')
const manifestSource = readProjectFile('src/docs/components-manifest.ts')
const appCss = readProjectFile('src/App.css')
const packageJson = readJson('package.json')
const rootRegistry = readJson('registry.json')
const registryItemsByName = new Map(rootRegistry.items.map((item) => [item.name, item]))
const registryFiles = new Set(
  readdirSync(join(root, 'registry')).filter((file) => file.endsWith('.json')),
)

for (const snippet of [
  "import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'",
  "import { Check } from 'lucide-react'",
  "import { BottomBar } from './bottom-bar'",
  "import { GlassIconButton } from './glass-icon-button'",
  "import { cn } from './lib/utils'",
  "import './card-tool-bar.css'",
  'export type CardToolBarProps',
  "Omit<ComponentPropsWithoutRef<'div'>,",
  'disabled?: boolean',
  'saveDisabled?: boolean',
  'saveLabel?: string',
  'toolbarSlot?: ReactNode',
  'onSave?: () => void',
  'export const CardToolBar = forwardRef<HTMLDivElement, CardToolBarProps>(function CardToolBar',
  "saveLabel = '保存'",
  '<BottomBar',
  'ref={ref}',
  "className={cn('weimo-card-tool-bar', className)}",
  'leftSlot={toolbarSlot}',
  'rightSlot={',
  'weimo-card-tool-bar__actions',
  'aria-label={saveLabel}',
  'disabled={disabled || saveDisabled}',
  'onClick={onSave}',
  'onMouseDown={(event) => event.preventDefault()}',
  '<Check />',
  "CardToolBar.displayName = 'CardToolBar'",
]) {
  assertIncludes(componentSource, snippet, `CardToolBar source must include ${snippet}.`)
}

assertNotIncludes(
  componentSource,
  'MdEditorToolbar',
  'CardToolBar must not import or render MdEditorToolbar directly.',
)
assertNotIncludes(
  componentSource,
  'draft',
  'CardToolBar must not know about Card draft state.',
)
assertNotIncludes(
  componentSource,
  'TagBar',
  'CardToolBar must not know about TagBar placement.',
)

const leftSlotBlock = cssBlockFor(
  componentCss,
  '.weimo-card-tool-bar .float-bar__slot--left',
)
const actionsBlock = cssBlockFor(componentCss, '.weimo-card-tool-bar__actions')

for (const snippet of ['min-width: 0;', 'overflow: visible;']) {
  assertIncludes(leftSlotBlock, snippet, `CardToolBar left slot must include ${snippet}.`)
}

for (const snippet of [
  'display: flex;',
  'min-width: 0;',
  'justify-content: flex-end;',
  'gap: 8px;',
]) {
  assertIncludes(actionsBlock, snippet, `CardToolBar action row must include ${snippet}.`)
}

assertNotIncludes(
  componentCss,
  '.weimo-editable-card {',
  'CardToolBar CSS must not style the removed legacy editable-card shell.',
)

for (const snippet of [
  "import { useState } from 'react'",
  "import { Heading1, List, Quote } from 'lucide-react'",
  "import { CardToolBar } from '../../components/card-tool-bar'",
  "import { Button } from '../../components/coss/button'",
  "import { Toolbar, ToolbarButton, ToolbarGroup } from '../../components/coss/toolbar'",
  "import { TextButton } from '../../components/text-button'",
  "id: 'tagged-card'",
  "const [saveDisabled, setSaveDisabled] = useState(false)",
  '<CardToolBar',
  'toolbarSlot={',
  '<Toolbar aria-label="Markdown 格式工具栏" className="md-editor__toolbar">',
  '<ToolbarGroup className="md-editor__toolbar-group">',
  '<ToolbarButton',
  'className="md-editor__toolbar-button"',
  'render={<Button variant="ghost" />}',
  'saveDisabled={saveDisabled}',
  'saveLabel="保存"',
  '<TextButton',
  '禁用保存',
  '启用保存',
  'preview: () => <TaggedCardDemo />',
  '<CardToolBarDemo />',
]) {
  assertIncludes(docsDefinitionSource, snippet, `CardToolBar docs must include ${snippet}.`)
}

assertIncludes(
  definitionsIndexSource,
  "import { barDefinition } from './bar'",
  'Bar definition must be imported by component-definitions/index.ts.',
)
assertIncludes(
  definitionsIndexSource,
  'bar: barDefinition',
  'Bar definition must be registered by component-definitions/index.ts.',
)

for (const snippet of [
  "id: 'card-tool-bar'",
  "name: 'CardToolBar'",
  "registryName: 'card-tool-bar'",
  "packageExport: './components/card-tool-bar'",
  'docs: false',
  'registry: true',
]) {
  assertIncludes(manifestSource, snippet, `components manifest must include ${snippet}.`)
}
assert.ok(
  !manifestSource.includes("internalGroup: 'layout'"),
  'components manifest must not keep internal layout grouping.',
)

for (const selector of [
  '.internal-card-tool-bar-preview',
  '.internal-card-tool-bar-preview__surface',
  '.internal-card-tool-bar-preview__toggle',
]) {
  assertIncludes(appCss, selector, `App.css must include ${selector}.`)
}

const previewSurfaceBlock = cssBlockFor(appCss, '.internal-card-tool-bar-preview__surface')
assertIncludes(
  previewSurfaceBlock,
  'position: relative;',
  'CardToolBar docs preview surface must provide an absolute positioning context.',
)
assertIncludes(
  previewSurfaceBlock,
  'overflow: hidden;',
  'CardToolBar docs preview surface must clip the internal absolute bottom bar.',
)

assert.ok(
  packageJson.exports?.['./components/card-tool-bar'] === './src/components/card-tool-bar.tsx',
  'CardToolBar must have a public package export.',
)
assert.ok(
  registryItemsByName.has('card-tool-bar'),
  'CardToolBar must be listed as a root registry item.',
)
assert.ok(
  registryFiles.has('card-tool-bar.json'),
  'CardToolBar must have a standalone registry file.',
)
