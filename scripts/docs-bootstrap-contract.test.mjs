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
  'tagged-card': readProjectFile('src/docs/component-definitions/tagged-card.tsx'),
  tag: readProjectFile('src/docs/component-definitions/tag.tsx'),
  stat: readProjectFile('src/docs/component-definitions/stat.tsx'),
  'background-tokens': readProjectFile('src/docs/component-definitions/background-tokens.tsx'),
  'border-tokens': readProjectFile('src/docs/component-definitions/border-tokens.tsx'),
  button: readProjectFile('src/docs/component-definitions/button.tsx'),
  menu: readProjectFile('src/docs/component-definitions/menu.tsx'),
  surface: readProjectFile('src/docs/component-definitions/surface.tsx'),
  markdown: [
    readProjectFile('src/docs/component-definitions/markdown.tsx'),
    readProjectFile('src/docs/component-definitions/md-editor-demos.tsx'),
  ].join('\n'),
  bar: readProjectFile('src/docs/component-definitions/bar.tsx'),
  'page-layout': readProjectFile('src/docs/component-definitions/page-layout.tsx'),
  capsule: readProjectFile('src/docs/component-definitions/capsule.tsx'),
}
const componentDefinitionsSource = [
  ...Object.values(componentDefinitionSources),
  sidebarPreviewSource,
].join('\n')
const docsOutletContextSource = readProjectFile('src/docs/docs-outlet-context.ts')
const detailPageSource = readProjectFile('src/docs/pages/component-detail-page.tsx')
const packageJson = JSON.parse(readProjectFile('package.json'))
const heatmapPreviewBlock = blockFor(appCss, '.heatmap-preview')
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

// 顶部栏改走液态玻璃:标题胶囊/侧边栏钮/搜索与主题组都是 LiquidGlassSurface 层,
// 搜索与主题两颗按钮收在同一枚玻璃胶囊里,色随页面背景 tone 自适应。
for (const snippet of [
  "import { LiquidGlassSurface } from '../components/liquid-glass'",
  "import { LiquidGlassTile } from './liquid-glass-tile'",
  '<LiquidGlassTile className="docs-liquid-top-bar">',
  'liquid-glass-icon-button-group docs-top-bar__actions',
  'liquid-glass-icon-button-group__item',
  'docs-top-bar__title-sizer',
  'title="按 / 搜索"',
]) {
  assert.ok(
    docsShellSource.includes(snippet),
    `DocsShell liquid glass top bar must include ${snippet}.`,
  )
}
assert.equal(
  (docsShellSource.match(/docs-top-bar__actions[\s\S]*?<\/span>/g) ?? []).length,
  1,
  'DocsShell top bar must hold exactly one liquid glass actions pill.',
)
assert.ok(
  (docsShellSource.match(/docs-top-bar__actions[\s\S]*?<\/span>/)?.[0].match(/<button\b/g) ?? []).length ===
    2,
  'DocsShell liquid glass actions pill must hold exactly the search and theme toggle buttons.',
)
assert.ok(
  !docsShellSource.includes('FrostedIconButtonGroup') &&
    !docsShellSource.includes('<Chip\n'),
  'DocsShell top bar must not fall back to frosted groups or glass Chips.',
)

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
  'tagged-card',
  'tag',
  'stat',
  'background-tokens',
  'border-tokens',
  'button',
  'menu',
  'surface',
  'bar',
  'page-layout',
]) {
  assert.ok(
    componentDefinitionsIndexSource.includes(`from './${componentId}'`),
    `component-definitions/index.ts must export ${componentId}.`,
  )
}

for (const snippet of [
  "id: 'tagged-card'",
  "id: 'tag'",
  "id: 'tag-picker'",
  "id: 'tag-bread'",
  "id: 'stat'",
  "id: 'ghost-icon-button'",
  "id: 'frosted-icon-button'",
  "id: 'button'",
  "id: 'menu'",
  "id: 'surface'",
  "id: 'tag-tree'",
  "id: 'top-bar'",
  "id: 'page-layout'",
  './components/stat-group',
  './components/tag-picker',
  './components/tag-bread',
  "id: 'heatmap'",
  "id: 'heat-color'",
  "id: 'bg-blur'",
  "id: 'background-tokens'",
  "id: 'border-tokens'",
  './components/heatmap',
  './components/heat-color',
  './components/bg-blur',
  './components/bg-color',
  './components/border-color',
  './components/ghost-icon-button',
  './components/frosted-icon-button',
  './components/menu',
  './components/frosted-surface',
  './components/tag-tree',
  './components/card',
]) {
  assert.ok(
    componentManifestSource.includes(snippet),
    `components-manifest.ts must include ${snippet}.`,
  )
}

for (const snippet of [
  "import { useState } from 'react'",
  'type TagTreeNode',
  "import { CalendarDays, Folder, Hash, Plus } from 'lucide-react'",
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
  'prefix={<Plus aria-hidden="true" />}',
  '<StatGroup items={sidebarStatsItems}',
  'sidebar-preview__panel weimo-sidebar weimo-sidebar--normal',
  'className="top-bar-preview"',
  'function FrostedIconButtonPreviewGroup({ disabled }: { disabled: boolean })',
  '<FrostedIconButton aria-label="菜单" disabled={disabled}>',
  'className="icon-button-preview"',
  '普通背景',
  'function GhostIconButtonPreviewGroup({ disabled }: { disabled: boolean })',
  '<GhostIconButton aria-label="菜单" disabled={disabled}>',
  '<GhostIconButton aria-label="极小号菜单" disabled={disabled} size="xs">',
  '<FrostedSurface bordered className="frosted-surface-preview__tile">',
  '<GlassPreviewCard',
  'label="磨砂图标按钮"',
]) {
  assert.ok(
    componentDefinitionsSource.includes(snippet),
    `component definitions must include ${snippet}.`,
  )
}

assert.ok(
  !componentDefinitionSources.button.includes('title:') &&
    !componentDefinitionSources.button.includes('icon-preview__scene-title') &&
    !componentDefinitionSources.button.includes('scene.title'),
  'Button page icon previews must remove redundant scene title text from the preview frame.',
)

assert.ok(
  !componentDefinitionSources.button.includes('ghostIconButtonPreviewScenes') &&
    !componentDefinitionSources.button.includes('glassIconButtonPreviewScenes') &&
    !componentDefinitionSources.button.includes("title: '亮色单色背景'") &&
    !componentDefinitionSources.button.includes("title: '亮色多色彩渐变背景'") &&
    !componentDefinitionSources.button.includes("title: '暗色单色背景'") &&
    !componentDefinitionSources.button.includes("title: '暗色多色彩渐变背景'"),
  'Button page ghost icon preview must use one ordinary background instead of multiple background scenes.',
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
  !componentDefinitionSources.stat.includes(
    'sidebar-preview__panel weimo-sidebar',
  ),
  'Heatmap docs preview must center the grid directly without wrapping it in the sidebar shell.',
)

assert.ok(
  !componentDefinitionSources.stat.includes('HeatColor') &&
    !componentDefinitionSources.stat.includes('<HeatColor') &&
    !componentDefinitionSources.stat.includes('HeatColor.'),
  'Heatmap component docs must leave token previews to the BgColor detail page.',
)

assert.ok(
  !existsSync(join(root, 'src/docs/component-definitions/bg-blur.tsx')) &&
    componentDefinitionSources['background-tokens'].includes('bgBlurTones.map') &&
    componentDefinitionSources['background-tokens'].includes('label="背景模糊度"'),
  'BgBlur docs must be merged into the Background detail page.',
)

assert.ok(
  !existsSync(join(root, 'src/docs/component-definitions/heat-color.tsx')) &&
    componentDefinitionSources['background-tokens'].includes('heatColorLevels.map') &&
    componentDefinitionSources['background-tokens'].includes('<ComponentPreviewCard') &&
    componentDefinitionSources['background-tokens'].includes('label="热力图"'),
  'HeatColor docs must be merged into the BgColor Heatmap group.',
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
  !componentDefinitionSources.tag.includes("from '../../components/coss/button'") &&
  componentDefinitionSources.tag.includes("from '../../components/chip-button'") &&
  !componentDefinitionSources.tag.includes('tag-picker-preview__trigger') &&
  !componentDefinitionSources.tag.includes('<Button') &&
  !componentDefinitionSources.tag.includes('选择标签'),
  'TagPicker docs preview must remove the standalone select-tag button and use internal ChipButton chips.',
)
assert.ok(
  !appCss.includes('.icon-preview__scene--light-solid') &&
    !appCss.includes('.icon-preview__scene--light-gradient') &&
    !appCss.includes('.icon-preview__scene--dark-solid') &&
    !appCss.includes('.icon-preview__scene--dark-gradient') &&
    appCss.includes('.icon-button-preview') &&
    !appCss.includes('--icon-preview-text: hsl(222.2 47.4% 11.2% / 0.9);') &&
    !appCss.includes('--icon-preview-text: hsl(0 0% 100% / 0.9);'),
  'Icon button docs previews must host both icon cards on the shared borderless preview canvas instead of scene swatches.',
)
assert.ok(
  !appCss.includes('.icon-preview__scene') &&
    !appCss.includes('.icon-preview--plain') &&
    iconPreviewRowBlock.includes('align-self: center;') &&
    iconPreviewRowBlock.includes('justify-self: center;') &&
    iconPreviewRowBlock.includes('justify-content: center;') &&
    !appCss.includes('.icon-preview--plain .icon-preview__scene') &&
    !appCss.includes('.icon-preview--plain .icon-preview__row'),
  'IconButton docs previews must center their button rows on the borderless card preview canvas.',
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
    componentDefinitionSources['page-layout'].includes(snippet),
    `SideBar component definition must include ${snippet}.`,
  )
}

for (const snippet of [
  "import { Drawer } from '@base-ui/react/drawer'",
  "import { Menu, X } from 'lucide-react'",
  "import { FrostedIconButton } from '../../components/frosted-icon-button'",
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
  !componentDefinitionSources['page-layout'].includes('preview: ({ onOpenSidebar })') &&
    !componentDefinitionSources['page-layout'].includes('preview: ({onOpenSidebar})') &&
    !componentDefinitionSources['page-layout'].includes('onClick={onOpenSidebar}') &&
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

for (const componentId of ['tagged-card', 'markdown']) {
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
  existsSync(join(root, 'src/docs/component-definitions/tagged-card.tsx')),
  'Merged tagged-card docs definition must exist.',
)
assert.ok(
  existsSync(join(root, 'src/docs/component-definitions/capsule.tsx')),
  'Merged Capsule docs definition must exist.',
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
