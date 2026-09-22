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

const shellSource = readProjectFile('src/docs/docs-shell.tsx')
const detailSource = readProjectFile('src/docs/pages/component-detail-page.tsx')
const actionDialogDefinitionSource = readProjectFile('src/docs/component-definitions/action-dialog.tsx')
const cardTopBarDefinitionSource = readProjectFile('src/docs/component-definitions/bar.tsx')
const mathDialogDefinitionSource = readProjectFile('src/docs/component-definitions/math-editor.tsx')
const tagTreeRowDefinitionSource = readProjectFile('src/docs/component-definitions/tag.tsx')
const css = readProjectFile('src/App.css')
const packageJson = JSON.parse(readProjectFile('package.json'))

function cssBlockFor(source, selector) {
  const start = source.indexOf(`${selector} {`)

  assert.notEqual(start, -1, `App.css must include ${selector} block.`)

  const blockStart = source.indexOf('{', start)
  let depth = 0

  for (let index = blockStart; index < source.length; index += 1) {
    const character = source[index]

    if (character === '{') depth += 1
    if (character === '}') depth -= 1

    if (depth === 0) {
      return source.slice(blockStart + 1, index)
    }
  }

  throw new Error(`Could not parse CSS block for ${selector}.`)
}

const internalFloatPreviewBlock = cssBlockFor(css, '.internal-float-preview')
const cardTopBarPreviewSurfaceBlock = cssBlockFor(
  css,
  '.internal-card-top-bar-preview__surface',
)
const cardTopBarPreviewToggleBlock = cssBlockFor(
  css,
  '.internal-card-top-bar-preview__toggle',
)

for (const snippet of [
  'Lock',
  "'公开组件'",
  "'内部共享'",
  'doc.visibility ===',
  'selected.visibility ===',
  'component-frame__visibility',
  'doc-page__visibility',
  'docs-sidebar-nav__lock',
  'command-item__meta',
]) {
  for (const [source, label] of [
    [shellSource, 'DocsShell'],
    [detailSource, 'ComponentDetailPage'],
  ]) {
    assert.ok(!source.includes(snippet), `${label} must remove ${snippet}.`)
  }
}

for (const selector of [
  '.component-frame__visibility',
  '.doc-page__visibility',
  '.docs-sidebar-nav__lock',
  '.command-item__meta',
]) {
  assert.ok(!css.includes(selector), `App.css must remove ${selector}.`)
}

assert.ok(
  shellSource.includes('componentDocGroups') &&
    shellSource.includes('docGroup.title') &&
    shellSource.includes('group.items.map') &&
    !shellSource.includes("'概览'") &&
    !shellSource.includes("'全部组件'") &&
    !shellSource.includes("'组件'") &&
    !shellSource.includes("'公开组件'"),
  'DocsShell sidebar must render only the shared component doc groups instead of overview or flat component groups.',
)

assert.ok(
  !existsSync(join(root, 'src/docs/pages/component-gallery-page.tsx')),
  'ComponentGalleryPage must be removed with the overview page.',
)

for (const selector of [
  '.internal-float-preview',
  '.internal-bottom-preview',
  '.internal-card-top-bar-preview',
  '.internal-card-top-bar-preview__surface',
  '.internal-card-top-bar-preview__toggle',
  '.internal-dialog-preview',
  '.internal-tag-tree-row-preview',
]) {
  assert.ok(css.includes(selector), `App.css must include ${selector}.`)
}

assert.ok(
  tagTreeRowDefinitionSource.includes('className="internal-tag-tree-row-preview tag-tree"'),
  'TagTreeRow docs preview must render inside the tag-tree styling scope.',
)

assert.ok(
  css.includes('justify-items: stretch;'),
  'TagTreeRow docs preview must stretch each row across the preview panel.',
)

assert.ok(
  actionDialogDefinitionSource.includes('preview: () => <ActionDialogDemo />') &&
    actionDialogDefinitionSource.includes('右侧工具按钮'),
  'ActionDialog detail preview must not open the dialog on initial render and must show the right toolbar slot.',
)

assert.ok(
  actionDialogDefinitionSource.includes('<GlassIconButton aria-label="保存">') &&
    !actionDialogDefinitionSource.includes('<GlassIconButton aria-label="保存" size="sm">'),
  'ActionDialog docs bottom save button must use the default GlassIconButton size.',
)

assert.ok(
    cardTopBarDefinitionSource.includes("useState<'display' | 'edit'>('display')") &&
    cardTopBarDefinitionSource.includes("setMode('edit')") &&
    cardTopBarDefinitionSource.includes('function enterEdit()') &&
    cardTopBarDefinitionSource.includes('function exitEdit()') &&
    cardTopBarDefinitionSource.includes("setMode('display')") &&
    cardTopBarDefinitionSource.includes('onAction={enterEdit}') &&
    cardTopBarDefinitionSource.includes('onCancel={exitEdit}') &&
    cardTopBarDefinitionSource.includes('切换到编辑态') &&
    cardTopBarDefinitionSource.includes('切换到展示态') &&
    cardTopBarDefinitionSource.includes('<CardTopBar') &&
    !cardTopBarDefinitionSource.includes("import { Ellipsis, X } from 'lucide-react'") &&
    !cardTopBarDefinitionSource.includes("import { IconButton } from '../../components/icon-button'") &&
    !cardTopBarDefinitionSource.includes("import { ActionMenu } from '../../components/menu'") &&
    !cardTopBarDefinitionSource.includes('const actionSlot = ('),
  'CardTopBar docs preview must use CardTopBar default ModeButton actions plus the external toggle.',
)

assert.ok(
  cardTopBarPreviewSurfaceBlock.includes('grid-template-columns: minmax(0, 1fr);') &&
    cardTopBarPreviewSurfaceBlock.includes('border: 1px solid var(--color-border);') &&
    !cardTopBarPreviewSurfaceBlock.includes('box-shadow:') &&
    !css.includes('internal-card-top-bar-preview__action-slot') &&
    !css.includes('internal-card-top-bar-preview__action-layer') &&
    cardTopBarPreviewToggleBlock.includes('justify-self: center;'),
  'CardTopBar docs preview must stack the external toggle below the top bar and rely on ModeButton for action animation.',
)

assert.ok(
  mathDialogDefinitionSource.includes(
    'useState<MathEditorValue | null>(null)',
  ),
  'MathEditor detail preview must not open the dialog on initial render.',
)

for (const [snippet, message] of [
  ['position: relative;', 'FloatBar docs preview must anchor absolute FloatBar inside the preview panel.'],
  ['min-height: 48px;', 'FloatBar docs preview must keep enough height for its absolutely positioned toolbar.'],
  ['overflow: hidden;', 'FloatBar docs preview must prevent the absolute FloatBar from spilling outside the preview panel.'],
]) {
  assert.ok(internalFloatPreviewBlock.includes(snippet), message)
}

assert.ok(
  packageJson.scripts?.test?.includes('scripts/internal-docs-ui-contract.test.mjs'),
  'package.json test script must run internal-docs-ui-contract.test.mjs.',
)
