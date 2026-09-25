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
const cardTopBarDefinitionSource = readProjectFile('src/docs/component-definitions/tagged-card.tsx')
const mathDialogDefinitionSource = readProjectFile('src/docs/component-definitions/markdown.tsx')
const tagTreeRowDefinitionSource = readProjectFile('src/docs/component-definitions/tag.tsx')
const barDefinitionSource = readProjectFile('src/docs/component-definitions/bar.tsx')
const pageLayoutDefinitionSource = readProjectFile('src/docs/component-definitions/page-layout.tsx')
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
  tagTreeRowDefinitionSource.includes('className="internal-tag-tree-row-preview tag-tree"') &&
    tagTreeRowDefinitionSource.includes('<ComponentPreviewCard align="center" label="标签树行">'),
  'TagTreeRow docs preview must render centered on the shared align=center canvas inside the tag-tree styling scope.',
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
  actionDialogDefinitionSource.includes('<FrostedIconButton aria-label="保存">') &&
    !actionDialogDefinitionSource.includes('<FrostedIconButton aria-label="保存" size="sm">'),
  'ActionDialog docs bottom save button must use the default FrostedIconButton size.',
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
  ['position: static;', 'FloatBar docs preview must return the self-anchored FloatBar into canvas grid flow.'],
  ['justify-self: stretch;', 'FloatBar docs preview must stretch across the preview grid column.'],
  ['margin-inline: 24px;', 'FloatBar docs preview must keep side gaps from the preview edges.'],
]) {
  assert.ok(internalFloatPreviewBlock.includes(snippet), message)
}

// 底部操作栏与顶部工具栏演示的材质规则：按钮一律磨砂图标按钮，文字一律磨砂态胶囊。
// 相邻动作可收进 FrostedIconButtonGroup（组内为 FrostedIconGroupButton，反馈同源）。
// 磨砂图标按钮与磨砂态胶囊的边框展示不做限制（有边框、无边框都支持），
// 因此这里只锁组件种类与 variant，不断言 bordered 的有无或取值。
// 浮动工具栏与顶部工具栏改走液态玻璃：按钮与胶囊文字一律 LiquidGlassSurface 层（assertLiquidGlassToolbarDemo）。
function sliceDemoSource(source, startMarker, endMarker, label) {
  const start = source.indexOf(startMarker)

  assert.notEqual(start, -1, `bar.tsx must keep the ${label} component.`)

  const end = source.indexOf(endMarker, start)

  assert.notEqual(end, -1, `bar.tsx ${label} block must end before the next demo component.`)

  return source.slice(start, end)
}

function assertGlassToolbarDemo(demoSource, label) {
  const chipCount = (demoSource.match(/<Chip\b/g) ?? []).length
  const glassVariantCount = (demoSource.match(/variant="glass"/g) ?? []).length

  assert.ok(
    chipCount > 0 &&
      glassVariantCount >= chipCount &&
      !demoSource.includes('internal-preview__text') &&
      !demoSource.includes('internal-preview__title'),
    `${label} docs demo must render every text label as a glass-variant Chip instead of raw preview text spans.`,
  )

  assert.ok(
    ((demoSource.match(/<FrostedIconButton\b/g) ?? []).length +
      (demoSource.match(/<FrostedIconGroupButton\b/g) ?? []).length) > 0 &&
      !demoSource.includes('GhostIconButton') &&
      !demoSource.includes('<IconButton') &&
      !demoSource.includes('<TextButton') &&
      !demoSource.includes('<ChipButton') &&
      !demoSource.includes('<button'),
    `${label} docs demo must use FrostedIconButton (standalone or grouped) for every toolbar button.`,
  )
}

const bottomBarDemoSource = sliceDemoSource(
  barDefinitionSource,
  'function BottomBarDemo()',
  'function FloatBarDemo()',
  'BottomBarDemo',
)
const floatBarDemoSource = sliceDemoSource(
  barDefinitionSource,
  'function FloatBarDemo()',
  '// Docs definitions intentionally colocate',
  'FloatBarDemo',
)

// 顶部工具栏的按钮经 renderTopBarSidebarButton/renderTopBarSearchButton 渲染，
// 因此切块从第一个 render helper 起到 TopBarDemo 结束，保证断言能覆盖到按钮本体。
const topBarDemoSource = sliceDemoSource(
  pageLayoutDefinitionSource,
  'function renderTopBarSidebarButton',
  '// Docs definitions intentionally colocate',
  'TopBarDemo',
)

assertGlassToolbarDemo(bottomBarDemoSource, 'BottomBar')

function assertLiquidGlassToolbarDemo(demoSource, label) {
  const liquidLayerCount = (demoSource.match(/<LiquidGlassSurface cornerRadius=\{999\}/g) ?? []).length

  assert.ok(
    liquidLayerCount >= 3 &&
      demoSource.includes('<LiquidGlassTile') &&
      !demoSource.includes('<Chip') &&
      !demoSource.includes('FrostedIconButton'),
    `${label} docs demo must render every button and text capsule as LiquidGlassSurface layers.`,
  )
}

assertLiquidGlassToolbarDemo(floatBarDemoSource, 'FloatBar')
assertLiquidGlassToolbarDemo(topBarDemoSource, 'TopBar')

assert.ok(
  packageJson.scripts?.test?.includes('scripts/internal-docs-ui-contract.test.mjs'),
  'package.json test script must run internal-docs-ui-contract.test.mjs.',
)
