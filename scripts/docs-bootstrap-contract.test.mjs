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

function blockFor(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))

  assert.ok(match, `${selector} block must exist.`)

  return match[1]
}

const appSource = readProjectFile('src/App.tsx')
const appCss = readProjectFile('src/App.css')
const docsShellSource = readProjectFile('src/docs/docs-shell.tsx')
const routesSource = readProjectFile('src/docs/routes.ts')
const componentDocsSource = readProjectFile('src/docs/component-docs.tsx')
const componentManifestSource = readProjectFile('src/docs/components-manifest.ts')
const componentDefinitionsIndexSource = readProjectFile(
  'src/docs/component-definitions/index.ts',
)
const sidebarPreviewSource = readProjectFile(
  'src/docs/component-definitions/sidebar-preview.tsx',
)
const componentDefinitionSources = {
  'card': readProjectFile('src/docs/component-definitions/card.tsx'),
  'share-card': readProjectFile('src/docs/component-definitions/share-card.tsx'),
  'tag-picker': readProjectFile('src/docs/component-definitions/tag-picker.tsx'),
  'tag-bread': readProjectFile('src/docs/component-definitions/tag-bread.tsx'),
  'stat-group': readProjectFile('src/docs/component-definitions/stat-group.tsx'),
  'heatmap': readProjectFile(
    'src/docs/component-definitions/heatmap.tsx',
  ),
  'heat-color': readProjectFile(
    'src/docs/component-definitions/heat-color.tsx',
  ),
  'bg-blur': readProjectFile('src/docs/component-definitions/bg-blur.tsx'),
  'bg-color': readProjectFile('src/docs/component-definitions/bg-color.tsx'),
  'border-color': readProjectFile('src/docs/component-definitions/border-color.tsx'),
  'glass-icon-button': readProjectFile('src/docs/component-definitions/glass-icon-button.tsx'),
  'ghost-icon-button': readProjectFile('src/docs/component-definitions/ghost-icon-button.tsx'),
  menu: readProjectFile('src/docs/component-definitions/menu.tsx'),
  'glass-surface': readProjectFile(
    'src/docs/component-definitions/glass-surface.tsx',
  ),
  'md-editor': [
    readProjectFile('src/docs/component-definitions/md-editor.tsx'),
    readProjectFile('src/docs/component-definitions/md-editor-demos.tsx'),
  ].join('\n'),
  'md-render': readProjectFile('src/docs/component-definitions/md-render.tsx'),
  'md-view': readProjectFile('src/docs/component-definitions/md-view.tsx'),
  'tag-tree': readProjectFile(
    'src/docs/component-definitions/tag-tree.tsx',
  ),
  chip: readProjectFile('src/docs/component-definitions/chip.tsx'),
  'chip-button': readProjectFile('src/docs/component-definitions/chip-button.tsx'),
  'top-bar': readProjectFile(
    'src/docs/component-definitions/top-bar.tsx',
  ),
  sidebar: readProjectFile('src/docs/component-definitions/sidebar.tsx'),
}
const componentDefinitionsSource = [
  ...Object.values(componentDefinitionSources),
  sidebarPreviewSource,
].join('\n')
const docsOutletContextSource = readProjectFile('src/docs/docs-outlet-context.ts')
const detailPageSource = readProjectFile('src/docs/pages/component-detail-page.tsx')
const packageJson = JSON.parse(readProjectFile('package.json'))
const heatmapPreviewBlock = blockFor(appCss, '.heatmap-preview')
const iconPreviewSceneBlock = blockFor(appCss, '.icon-preview__scene')
const iconPreviewSceneTitleBlock = blockFor(appCss, '.icon-preview__scene-title')
const iconPreviewRowBlock = blockFor(appCss, '.icon-preview__row')

assert.ok(
  packageJson.dependencies?.['react-router'],
  'package.json must include react-router as a dependency.',
)

for (const snippet of [
  "type Theme = 'light' | 'dark' | 'system'",
  "useState<Theme>('system')",
  "window.matchMedia('(prefers-color-scheme: dark)')",
  "theme === 'system'",
  "mediaQuery.addEventListener('change', syncSystemTheme)",
  "mediaQuery.removeEventListener('change', syncSystemTheme)",
  "case 'light':",
  "return 'dark'",
  "case 'dark':",
  "return 'system'",
  "return 'light'",
  "theme === 'system' ? <Monitor />",
]) {
  assert.ok(
    docsShellSource.includes(snippet),
    `DocsShell theme toggle must include ${snippet}.`,
  )
}

assert.ok(
  !docsShellSource.includes('command-item__icon') &&
    !appCss.includes('.command-item__icon'),
  'DocsShell search results must not reserve a leading placeholder icon column.',
)

for (const snippet of [
  'export const routerBasename =',
  'export function componentPath',
  'export function componentHref',
  "'/components/'",
]) {
  assert.ok(routesSource.includes(snippet), `src/docs/routes.ts must include ${snippet}.`)
}

assert.ok(
  !routesSource.includes('/docs/components/'),
  'src/docs/routes.ts must not define the old /docs/components/ route.',
)
assert.ok(
  !routesSource.includes('homePath') && !routesSource.includes('appHref'),
  'src/docs/routes.ts must remove the overview/home route helpers.',
)

for (const snippet of [
  "from 'react-router'",
  '<BrowserRouter',
  '<Routes>',
  '<Route element={<DocsShell />} path="/">',
  'const defaultComponentPath = componentPath(componentDocs[0].id)',
  '<Route index element={<Navigate replace to={defaultComponentPath} />} />',
  'path="components/:componentId"',
  '<Navigate replace to={defaultComponentPath} />',
  'basename={routerBasename || undefined}',
]) {
  assert.ok(appSource.includes(snippet), `App.tsx must include ${snippet}.`)
}

for (const snippet of [
  'parseRoute',
  'pushState',
  'popstate',
  'type Route',
  'componentCode',
  'buildInstallGuide',
  'useMemo<ComponentDoc[]>',
  'window.history',
  '/docs/components/',
  'ComponentGalleryPage',
]) {
  assert.ok(!appSource.includes(snippet), `App.tsx must not include ${snippet}.`)
}

for (const snippet of [
  "'概览'",
  "'全部组件'",
  'homeActive',
  'homeHref',
  'onHome',
  'openHome',
  'homeMatch',
  'homePath',
]) {
  assert.ok(!docsShellSource.includes(snippet), `DocsShell must remove ${snippet}.`)
}

for (const snippet of [
  'export type ComponentDoc',
  'export type ComponentPreviewContext',
  'export type ComponentDefinition',
  'export const componentDocs',
  'componentManifest',
  'componentDefinitionsById',
]) {
  assert.ok(
    componentDocsSource.includes(snippet),
    `src/docs/component-docs.tsx must include ${snippet}.`,
  )
}

for (const componentId of [
  'card',
  'share-card',
  'tag-picker',
  'tag-bread',
  'stat-group',
  'heatmap',
  'heat-color',
  'bg-blur',
  'bg-color',
  'border-color',
  'ghost-icon-button',
  'glass-icon-button',
  'menu',
  'glass-surface',
  'tag-tree',
  'top-bar',
  'sidebar',
]) {
  assert.ok(
    componentDefinitionsIndexSource.includes(`from './${componentId}'`),
    `component-definitions/index.ts must export ${componentId}.`,
  )
}

for (const snippet of [
  "id: 'card'",
  "id: 'share-card'",
  "id: 'tag-picker'",
  "id: 'tag-bread'",
  "id: 'stat-group'",
  "id: 'ghost-icon-button'",
  "id: 'glass-icon-button'",
  "id: 'menu'",
  "id: 'glass-surface'",
  "id: 'tag-tree'",
  "id: 'top-bar'",
  "id: 'sidebar'",
  './components/stat-group',
  './components/tag-picker',
  './components/tag-bread',
  "id: 'heatmap'",
  "id: 'heat-color'",
  "id: 'bg-blur'",
  "id: 'bg-color'",
  "id: 'border-color'",
  './components/heatmap',
  './components/heat-color',
  './components/bg-blur',
  './components/bg-color',
  './components/border-color',
  './components/ghost-icon-button',
  './components/glass-icon-button',
  './components/menu',
  './components/glass-surface',
  './components/tag-tree',
  './components/share-card',
  './components/card',
]) {
  assert.ok(
    componentManifestSource.includes(snippet),
    `components-manifest.ts must include ${snippet}.`,
  )
}

for (const snippet of [
  `size', type: "'default' | 'sm'"`,
  "{ name: 'disabled', type: 'boolean'",
  "{ name: 'children', type: 'ReactNode'",
  "{ name: 'mode', type: \"'insert' | 'update' | 'pick'\"",
  "{ name: 'tagOptions', type: 'string[]'",
  "{ name: 'tag', type: 'string'",
  "{ name: 'onSelect', type: '(tag: string) => void'",
  "{ name: 'nodes', type: 'TagTreeNode[]'",
  "{ name: 'variant', type: \"'default' | 'no-action'\"",
  "{ name: 'defaultIcon', type: 'ReactNode'",
  "{ name: 'dailyCounts', type: 'HeatmapDailyCount[]'",
  "{ name: 'onDateSelect'",
  "name: 'onMenuAction'",
  '"rename" | "delete"',
  "name: 'additionalMenuItems'",
  'ActionMenuItem[]',
  "{ name: 'leftSlot'",
  "{ name: 'rightSlot'",
  "{ name: 'content', type: 'string'",
  "{ name: 'createdAt', type: 'Date'",
  "{ name: 'font', type: \"'default' | 'print'\"",
  "{ name: 'note', type: 'CardNote'",
  "{ name: 'onDraftChange', type: '(draft: CardDraft) => void'",
  "{ name: 'labels', type: 'CardLabels'",
  "{ name: 'editor', type: 'CardEditorOptions'",
  "{ name: 'onEditorChange', type: '(editor: Editor | null) => void'",
]) {
  assert.ok(
    componentDefinitionsSource.includes(snippet),
    `component definitions must include ${snippet}.`,
  )
}

for (const snippet of [
  "import { useState } from 'react'",
  'type TagTreeNode',
  "import { CalendarDays, Folder, Hash } from 'lucide-react'",
  'icon: <Folder aria-hidden="true" />',
  'defaultIcon={<Hash aria-hidden="true" />}',
  'TagTreeVariant',
  'HeatmapDailyCount',
  'className="heatmap-preview"',
  '<TagTree',
  '<Heatmap',
  'setActiveDate(date)',
  'onSelect={setSelectedTag}',
  '<ChipButton key={`${tag}-${index}`} onClick={() => openTagPicker(index)}>',
  '<TagPicker',
  '<Card',
  'note={note}',
  'TagPickerDemo',
  'function TagBreadDemo',
  "import { Hash } from 'lucide-react'",
  '<TagBread tag="文学/古代/诗词"',
  'className={getChipSurfaceClassName(',
  "'tag-bread-docs-preview__ellipsis'",
  '{...tagBreadDocsSurfaceAttributes}',
  '<span className="tag-bread__prefix">',
  '<Hash aria-hidden="true" />',
  '<MenuTrigger',
  '<GhostIconButton',
  '<BreadcrumbEllipsis />',
  '<MenuPopup align="start">',
  '<MenuItem render={<a href="/docs" />}>Docs</MenuItem>',
  '<BreadcrumbSeparator className="tag-bread__separator">',
  '<BreadcrumbPage className="tag-bread__page">Breadcrumb</BreadcrumbPage>',
  'CardDemo',
  'labels={{ placeholder: ',
  'function openTagPicker',
  'const [activeSlotIndex, setActiveSlotIndex]',
  'prefix="+"',
  '<StatGroup items={sidebarStatsItems}',
  'sidebar-preview__panel weimo-sidebar weimo-sidebar--normal',
  'className="top-bar-preview"',
  'glassIconButtonPreviewScenes',
  "id: 'light-solid'",
  "id: 'light-gradient'",
  "id: 'dark-solid'",
  "id: 'dark-gradient'",
  'className={`icon-preview__scene icon-preview__scene--${scene.id}`}',
  'function GlassIconButtonPreviewGroup({ disabled }: { disabled: boolean })',
  '<GlassIconButton aria-label="菜单" disabled={disabled}>',
  'className="icon-preview icon-preview--plain"',
  'className="icon-preview__scene icon-preview__scene--plain"',
  '普通背景',
  'function GhostIconButtonPreviewGroup({ disabled }: { disabled: boolean })',
  '<GhostIconButton aria-label="菜单" disabled={disabled}>',
  'glassSurfacePreviewBackgroundBands',
  'glass-surface-preview__scroll-viewport',
  'glass-surface-preview__scroll-content',
  'glass-surface-preview__band',
  'glass-surface-preview__fixed',
  '<GlassSurface className="glass-surface-preview__tile">',
]) {
  assert.ok(
    componentDefinitionsSource.includes(snippet),
    `component definitions must include ${snippet}.`,
  )
}

assert.ok(
  !componentDefinitionSources['glass-icon-button'].includes('title:') &&
    !componentDefinitionSources['glass-icon-button'].includes('icon-preview__scene-title') &&
    !componentDefinitionSources['glass-icon-button'].includes('scene.title'),
  'GlassIconButton docs preview must remove redundant scene title text from the preview frame.',
)

assert.ok(
  !componentDefinitionSources['ghost-icon-button'].includes('ghostIconButtonPreviewScenes') &&
    !componentDefinitionSources['ghost-icon-button'].includes("title: '亮色单色背景'") &&
    !componentDefinitionSources['ghost-icon-button'].includes("title: '亮色多色彩渐变背景'") &&
    !componentDefinitionSources['ghost-icon-button'].includes("title: '暗色单色背景'") &&
    !componentDefinitionSources['ghost-icon-button'].includes("title: '暗色多色彩渐变背景'") &&
    !componentDefinitionSources['ghost-icon-button'].includes('scene.id'),
  'GhostIconButton docs preview must use one ordinary background instead of multiple background scenes.',
)

assert.ok(
  heatmapPreviewBlock.includes('display: flex;') &&
  heatmapPreviewBlock.includes('width: 100%;') &&
  heatmapPreviewBlock.includes('min-height: 100%;') &&
  heatmapPreviewBlock.includes('align-items: center;') &&
  heatmapPreviewBlock.includes('justify-content: center;') &&
  !heatmapPreviewBlock.includes('flex-direction: column;') &&
  !heatmapPreviewBlock.includes('gap: 12px;') &&
  !appCss.includes('.heatmap-preview .sidebar-preview__panel.weimo-sidebar') &&
  !componentDefinitionSources['heatmap'].includes(
    'sidebar-preview__panel weimo-sidebar',
  ),
  'Heatmap docs preview must center the grid directly without wrapping it in the sidebar shell.',
)

assert.ok(
  !componentDefinitionSources['heatmap'].includes('HeatColor') &&
    !componentDefinitionSources['heatmap'].includes('<HeatColor') &&
    !componentDefinitionSources['heatmap'].includes('HeatColor.'),
  'Heatmap docs must not display HeatColor because the heat color has its own component detail page.',
)

assert.equal(
  componentDefinitionSources['heat-color'].match(/<HeatColor\b/g)?.length ?? 0,
  0,
  'HeatColor docs preview must render one row per level instead of an extra horizontal HeatColor legend.',
)
assert.ok(
  !componentDefinitionSources['heat-color'].includes('高热力色阶') &&
    !componentDefinitionSources['heat-color'].includes('levels={[2, 3, 4]}'),
  'HeatColor docs preview must not include the redundant subset heat color row.',
)

for (const snippet of [
  'renderSideBarBlankPreview',
  'function SideBarDrawerPreview',
  'renderTopBarSidebarButton',
  'renderTopBarSearchButton',
  'renderMenuDemo',
  'const tagTreeDemoNodes',
  'function TagTreeDemo',
  "from '../../components/top-bar'",
  "from '../../components/tag-tree'",
  "from '../../components/chip-button'",
  "from '../../components/menu'",
  '<TagTreeDemo />',
  'onMenuAction={variant === "default" ? () => {} : undefined}',
  "selectedTag: initialSelectedTag = 'writing/daily'",
  'const [selectedTag, setSelectedTag] = useState(initialSelectedTag)',
  "defaultExpandedTags = ['writing', 'research']",
  'defaultExpandedTags={defaultExpandedTags}',
  "variant: 'destructive'",
  '<ActionMenu',
  "type: 'checkbox'",
  "type: 'radio'",
  "type: 'sub'",
  '<span className="sidebar-preview__trigger-label">抽屉侧边栏</span>',
  "const tagOptions = [",
  "'工作/项目'",
  "'杂项/待整理'",
  'type TagPickerApplyPayload',
]) {
  assert.ok(
    componentDefinitionsSource.includes(snippet),
    `component definitions must include ${snippet}.`,
  )
}

assert.ok(
  !componentDefinitionSources['tag-picker'].includes("from '../../components/coss/button'") &&
  componentDefinitionSources['tag-picker'].includes("from '../../components/chip-button'") &&
  !componentDefinitionSources['tag-picker'].includes('tag-picker-preview__trigger') &&
  !componentDefinitionSources['tag-picker'].includes('<Button') &&
  !componentDefinitionSources['tag-picker'].includes('选择标签'),
  'TagPicker docs preview must remove the standalone select-tag button and use internal ChipButton chips.',
)
assert.ok(
  appCss.includes('.icon-preview__scene--light-solid') &&
    appCss.includes('.icon-preview__scene--light-gradient') &&
    appCss.includes('.icon-preview__scene--dark-solid') &&
    appCss.includes('.icon-preview__scene--dark-gradient') &&
    appCss.includes('--icon-preview-text: rgba(15, 23, 42, 0.9);') &&
    appCss.includes('--icon-preview-text: rgba(255, 255, 255, 0.9);'),
  'Icon button docs previews must define light and dark background scene styles.',
)
assert.ok(
  !iconPreviewSceneBlock.includes('grid-template-rows: auto minmax(0, 1fr);') &&
    iconPreviewSceneTitleBlock.includes('grid-area: 1 / 1;') &&
    iconPreviewSceneTitleBlock.includes('align-self: start;') &&
    iconPreviewSceneTitleBlock.includes('justify-self: start;') &&
    iconPreviewRowBlock.includes('grid-area: 1 / 1;') &&
    iconPreviewRowBlock.includes('align-self: center;') &&
    iconPreviewRowBlock.includes('justify-self: center;') &&
    iconPreviewRowBlock.includes('justify-content: center;') &&
    !appCss.includes('.icon-preview--plain .icon-preview__scene') &&
    !appCss.includes('.icon-preview--plain .icon-preview__row'),
  'IconButton docs preview scenes must center their button rows against the whole scene frame across GhostIconButton and GlassIconButton.',
)
assert.match(
  appCss,
  /\.tag-picker-preview__tags\s*\{[\s\S]*?gap:\s*var\(--space-tag-gap\);/,
  'TagPicker docs preview chip gap must match the shared card tag rhythm.',
)
assert.ok(
  !appCss.includes('.tag-edit-bar-preview') &&
    !appCss.includes('.tag-edit-bar-preview__panel'),
  'App.css must not keep removed TagEditBar docs preview styles.',
)

for (const snippet of [
  "import { SideBarDrawerPreview } from './sidebar-preview'",
  '<SideBarDrawerPreview />',
]) {
  assert.ok(
    componentDefinitionSources.sidebar.includes(snippet),
    `SideBar component definition must include ${snippet}.`,
  )
}

for (const snippet of [
  "import { Drawer } from '@base-ui/react/drawer'",
  "import { Menu, X } from 'lucide-react'",
  "import { GlassIconButton } from '../../components/glass-icon-button'",
  "function SideBarDrawerPreview",
  "const [drawerOpen, setDrawerOpen] = useState(false)",
  'Drawer.Root',
  'Drawer.Backdrop',
  'Drawer.Popup',
  "aria-label=\"抽屉侧边栏\"",
  "aria-label=\"关闭抽屉侧边栏示例\"",
  '<strong className="sidebar-preview__drawer-title">',
  '抽屉侧边栏',
]) {
  assert.ok(
    sidebarPreviewSource.includes(snippet),
    `SideBar preview drawer component must include ${snippet}.`,
  )
}

assert.ok(
  !componentDefinitionSources.sidebar.includes('preview: ({ onOpenSidebar })') &&
  !componentDefinitionSources.sidebar.includes('preview: ({onOpenSidebar})') &&
  !componentDefinitionSources.sidebar.includes('onClick={onOpenSidebar}') &&
  !sidebarPreviewSource.includes('onOpenSidebar'),
  'SideBar preview drawer trigger must use local preview drawer state, not the docs shell sidebar.',
)

assert.ok(
  !componentDefinitionSources.menu.includes("from '../../components/card'") &&
  !componentDefinitionSources.menu.includes("from '../../components/chip-button'") &&
  !componentDefinitionSources.menu.includes('<WeimoCard') &&
  !componentDefinitionSources.menu.includes('<CardHeader') &&
  !componentDefinitionSources.menu.includes('<CardContent') &&
  !componentDefinitionSources.menu.includes('<CardFooter') &&
  !componentDefinitionSources.menu.includes('<ChipButton'),
  'Menu preview must render only its trigger button and menu content, not a memo card shell.',
)
assert.ok(
  componentDefinitionSources['share-card'].includes("from '../../components/share-card'") &&
    componentDefinitionSources['share-card'].includes("id: 'share-card'") &&
    componentDefinitionSources['share-card'].includes('font="print"') &&
    componentDefinitionSources['share-card'].includes('useLunarDate'),
  'ShareCard docs must live on an independent detail page, not inside Card docs.',
)
assert.ok(
  componentDefinitionSources.menu.includes(
    'render: <GhostIconButton aria-label="更多操作" size="sm" />',
  ) &&
    componentDefinitionSources.menu.includes('<ActionMenu') &&
    componentDefinitionSources.menu.includes('function renderMenuDemo()'),
  'Menu preview must lead with the high-level ActionMenu API and GhostIconButton trigger.',
)
assert.ok(
  !componentDefinitionSources.menu.includes("from '../../components/coss/button'") &&
  !componentDefinitionSources.menu.includes('CossButton') &&
  !componentDefinitionSources.menu.includes("name: 'Selection Items'") &&
  !componentDefinitionSources.menu.includes('checkbox and radio rows') &&
  !componentDefinitionSources.menu.includes('menu-preview menu-preview--compact'),
  'Menu detail page must not define extra variant previews that render a redundant examples section.',
)

assert.ok(
  !componentDefinitionsSource.includes('code:') &&
    !componentDefinitionsSource.includes('variantPreviews:'),
  'component definitions must not keep detail-page code samples or extra example previews.',
)

assert.ok(
  !componentDocsSource.includes('const componentCode = {') &&
  !componentDocsSource.includes("from 'lucide-react'") &&
  !componentDocsSource.includes("from '../components/card'") &&
  !componentDocsSource.includes("from '../components/menu'"),
  'component-docs.tsx must not own example strings or preview component imports.',
)
assert.ok(
  !componentDocsSource.includes('componentPropsById') &&
  !componentDocsSource.includes('componentCodeById') &&
  !componentDocsSource.includes('componentPreviewsById'),
  'component-docs.tsx must not assemble docs from separate props/code/preview maps.',
)

assert.ok(
  !componentDefinitionsSource.includes('<SidebarPreviewContent />'),
  'SideBar main and variant previews must show the blank panel, not caller-owned navigation content.',
)
assert.ok(
  !componentDefinitionsSource.includes('sidebar-preview__shine') &&
  !appCss.includes('.sidebar-preview__shine'),
  'SideBar desktop preview must not keep glass highlight decoration.',
)
assert.ok(
  !componentDefinitionsSource.includes('<strong className="tag-tree-preview__title">标签</strong>'),
  'TagTree preview must not render a separate title above the tree.',
)
assert.ok(
  !componentDefinitionsSource.includes('variant="button"') &&
    !componentDefinitionsSource.includes('<ChipButton label='),
  'ChipButton example code must match the single button chip API.',
)
assert.ok(
  !componentDefinitionsSource.includes('variant="bordered"') &&
  !componentDefinitionsSource.includes('onSidebarOpen={onOpenSidebar}'),
  'TopBar previews must not use removed variants or bind demo buttons through the TopBar API.',
)

assert.ok(
  detailPageSource.includes('{selected.preview(previewContext)}') &&
    !detailPageSource.includes('galleryPreview'),
  'component detail page must keep rendering the full preview, not the compact gallery preview.',
)
assert.ok(
  !componentDocsSource.includes('galleryPreview') &&
    !componentDefinitionsSource.includes('galleryPreview') &&
    !packageJson.scripts?.test?.includes('gallery-preview-contract.test.mjs') &&
    !existsSync(join(root, 'src/docs/pages/component-gallery-page.tsx')) &&
    !existsSync(join(root, 'src/docs/component-definitions/gallery-preview-sample.ts')) &&
    !existsSync(join(root, 'scripts/gallery-preview-contract.test.mjs')),
  'overview-only gallery preview code and tests must be removed.',
)

for (const componentId of ['card', 'share-card', 'md-editor', 'md-view', 'md-render']) {
  assert.ok(
    !componentDefinitionSources[componentId].includes('galleryPreview') &&
      !componentDefinitionSources[componentId].includes('gallery-preview-sample'),
    `${componentId} must not keep overview-only gallery preview code.`,
  )
}

for (const snippet of [
  "id: 'tag-edit-bar'",
  "packageExport: './components/tag-edit-bar',",
  "from './tag-edit-bar'",
  "from '../../components/tag-edit-bar'",
  '<TagEditBar',
  'TagEditBarDemo',
  "id: 'editable-card'",
  "packageExport: './components/editable-card',",
  "from './editable-card'",
  '<EditableCard ',
  '<EditableCard\n',
  'EditableCardDemo',
  'EditableCardNote',
  'EditableCardDraft',
  'EditableCardLabels',
  'EditableCardEditorOptions',
]) {
  assert.ok(
    !componentManifestSource.includes(snippet) &&
      !componentDefinitionsIndexSource.includes(snippet) &&
      !componentDefinitionsSource.includes(snippet),
    `docs sources must not keep removed EditableCard snippet ${snippet}.`,
  )
}

assert.ok(
  existsSync(join(root, 'src/docs/component-definitions/card.tsx')),
  'Card docs definition must exist.',
)
assert.ok(
  existsSync(join(root, 'src/docs/component-definitions/chip-button.tsx')),
  'ChipButton docs definition must exist.',
)

for (const [source, label] of [
  [docsOutletContextSource, 'docs outlet context'],
  [detailPageSource, 'detail page'],
]) {
  assert.ok(
    source.includes('componentDocs') || source.includes('useDocsOutletContext'),
    `${label} must still consume docs data through the existing docs flow.`,
  )
}

assert.match(
  appCss,
  /\.menu-preview\s*\{[\s\S]*?justify-content:\s*center;/,
  'Menu docs must include centered preview styling.',
)
assert.ok(
  !appCss.includes('.chip-preview'),
  'App.css must not keep legacy chip preview styles.',
)
assert.match(
  appCss,
  /\.tag-tree-preview__panel\s*\{[\s\S]*?width:\s*min\(100%, 340px\);/,
  'TagTree preview panel must use the expanded docs preview width.',
)
assert.match(
  appCss,
  /\.sidebar-preview\s*\{[\s\S]*?container:\s*sidebar-preview \/ inline-size;/,
  'SideBar preview must expose an inline-size container for responsive trigger behavior.',
)
assert.match(
  appCss,
  /@container sidebar-preview \(max-width: 344px\)\s*\{[\s\S]*?\.sidebar-preview__trigger-label\s*\{[\s\S]*?display:\s*none;/,
  'SideBar drawer preview trigger must hide its label only when the preview is too narrow for the full trigger.',
)
