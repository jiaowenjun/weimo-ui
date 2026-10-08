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

const appSource = readProjectFile('packages/weimo-ui-site/src/app/app.tsx')
const appCss = readProjectFile('packages/weimo-ui-site/src/app/app.css')
const docsShellSource = readProjectFile('packages/weimo-ui-site/src/docs/shell/docs-shell.tsx')
const routesSource = readProjectFile('packages/weimo-ui-site/src/docs/routes.ts')
const componentDocsSource = readProjectFile('packages/weimo-ui-site/src/docs/catalog/component-docs.tsx')
const componentDefinitionsIndexSource = readProjectFile(
  'packages/weimo-ui-site/src/docs/catalog/definitions.ts',
)
const sidebarPreviewSource = readProjectFile(
  'packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/sidebar-preview.tsx',
)
const componentDefinitionSources = {
  'tagged-card': readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-card/tagged-card.tsx'),
  'card-tool-bar': readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-card/card-tool-bar.tsx'),
  'tag-bar': readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-card/tag-bar.tsx'),
  'tag-bread': [
    readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-tagtree/tag-bread.tsx'),
    readProjectFile('packages/weimo-ui-tagtree/src/page/tag-bread-page.tsx'),
  ].join('\n'),
  tag: [
    readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-tagtree/tag.tsx'),
    readProjectFile('packages/weimo-ui-tagtree/src/page/tag-page.tsx'),
  ].join('\n'),
  stat: readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-stats/stat.tsx'),
  'background-tokens': readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/background-tokens.tsx'),
  'border-tokens': readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/border-tokens.tsx'),
  button: readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/button.tsx'),
  menu: readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/menu.tsx'),
  surface: readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/surface.tsx'),
  markdown: [
    readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-markdown/markdown.tsx'),
    readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-markdown/md-editor-demos.tsx'),
  ].join('\n'),
  'markdown-render': [
    readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-markdown/markdown-render.tsx'),
    readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-markdown/markdown-styles.tsx'),
  ].join('\n'),
  bar: readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/bar.tsx'),
  sidebar: readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/sidebar.tsx'),
  'capsule-button': readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/capsule-button.tsx'),
}
const componentDefinitionsSource = [
  ...Object.values(componentDefinitionSources),
  sidebarPreviewSource,
].join('\n')
const docsOutletContextSource = readProjectFile('packages/weimo-ui-site/src/docs/shell/docs-outlet-context.ts')
const detailPageSource = readProjectFile('packages/weimo-ui-site/src/docs/pages/component-detail-page.tsx')
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

// 顶部栏改走磨砂:标题胶囊 FrostedLabel,侧边栏钮 FrostedIconButton(默认
// 顶栏尺寸档),搜索与主题两颗按钮收在同一枚磨砂按钮组里,组件各自采样
// 页面背景 tone 自适应。
for (const snippet of [
  "import { FrostedLabel } from 'weimo-ui-core/components/frosted-label'",
  "import { FrostedIconButton } from 'weimo-ui-core/components/frosted-icon-button'",
  "from 'weimo-ui-core/components/frosted-icon-button-group'",
  'FrostedIconGroupButton',
  'className="docs-top-bar__slot"',
  '<FrostedIconButtonGroup aria-label="搜索与主题" className="docs-top-bar__actions">',
  '<FrostedLabel className="docs-top-bar__title" key={selected.name} size="lg">',
  'title="按 / 搜索"',
]) {
  assert.ok(
    docsShellSource.includes(snippet),
    `DocsShell frosted top bar must include ${snippet}.`,
  )
}
assert.equal(
  (docsShellSource.match(/docs-top-bar__actions[\s\S]*?<\/div>/g) ?? []).length,
  1,
  'DocsShell top bar must hold exactly one frosted actions pill.',
)
assert.ok(
  (docsShellSource.match(/docs-top-bar__actions[\s\S]*?<\/div>/)?.[0].match(/<FrostedIconGroupButton\b/g) ?? []).length ===
    2,
  'DocsShell frosted actions pill must hold exactly the search and theme toggle buttons.',
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
  assert.ok(routesSource.includes(snippet), `packages/weimo-ui-site/src/docs/routes.ts must include ${snippet}.`)
}

assert.ok(
  !routesSource.includes('/docs/components/'),
  'packages/weimo-ui-site/src/docs/routes.ts must not define the old /docs/components/ route.',
)
assert.ok(
  !routesSource.includes('homePath') && !routesSource.includes('appHref'),
  'packages/weimo-ui-site/src/docs/routes.ts must remove the overview/home route helpers.',
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
    `packages/weimo-ui-site/src/docs/catalog/component-docs.tsx must include ${snippet}.`,
  )
}

for (const componentId of [
  'tagged-card',
  'tag-bread',
  'tag',
  'stat',
  'background-tokens',
  'border-tokens',
  'button',
  'menu',
  'surface',
  'bar',
  'sidebar',
  'card-tool-bar',
  'capsule-button',
]) {
  assert.ok(
    componentDefinitionsIndexSource.includes(`/${componentId}'`),
    `component-definitions/index.ts must export ${componentId}.`,
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
  '<CapsuleButton key={`${tag}-${index}`} onClick={() => openTagPicker(index)} state="frosted">',
  '<TagPicker',
  '<Card',
  'note={note}',
  'TagPickerDemo',
  'function TagBreadDemo',
  '<TagBread tag="文学/古代/诗词"',
  'className={getCapsuleFrameClassName(',
  "'tag-bread'",
  '{...surfaceAttributes}',
  '<span className="tag-bread__prefix">',
  '<Hash aria-hidden="true" />',
  '<MenuTrigger',
  '<GhostIconButton',
  '<BreadcrumbEllipsis />',
  '<MenuPopup align="start">',
  '<MenuItem render={<a href="/docs" />}>Docs</MenuItem>',
  '<BreadcrumbSeparator>/</BreadcrumbSeparator>',
  '<BreadcrumbPage>Breadcrumb</BreadcrumbPage>',
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
  componentDefinitionSources.stat.includes('heatColorLevels.map') &&
    componentDefinitionSources.stat.includes('heat-color-preview__swatch') &&
    componentDefinitionSources.stat.includes('label="热力图色"'),
  'HeatColor token docs must render on the stat page as the 热力图色 card.',
)

assert.ok(
  !existsSync(join(root, 'packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/bg-blur.tsx')) &&
    componentDefinitionSources['background-tokens'].includes('bgBlurTones.map') &&
    componentDefinitionSources['background-tokens'].includes('label="背景模糊度"'),
  'BgBlur docs must be merged into the Background detail page.',
)

assert.ok(
  !existsSync(join(root, 'packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/heat-color.tsx')) &&
    !componentDefinitionSources['background-tokens'].includes('heatColor') &&
    !componentDefinitionSources['background-tokens'].includes('heat-color') &&
    !componentDefinitionSources['background-tokens'].includes('热力图'),
  'HeatColor token docs must not stay on the BgColor detail page; the card lives on the stat page.',
)

for (const snippet of [
  'renderSideBarBlankPreview',
  'function SideBarDrawerPreview',
  'renderTopBarSidebarButton',
  'renderTopBarSearchButton',
  'renderMenuDemo',
  'const tagTreeDemoNodes',
  'function TagTreeDemo',
  "from 'weimo-ui-core/components/top-bar'",
  "from '../components/tag-tree/tag-tree'",
  "from 'weimo-ui-core/components/capsule-button'",
  "from 'weimo-ui-core/components/menu'",
  '<TagTreeDemo />',
  "onMenuAction={variant === 'default' ? () => {} : undefined}",
  'const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined)',
  "defaultExpandedTags={['writing', 'research']}",
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
  !componentDefinitionSources.tag.includes("from 'weimo-ui-core/components/capsule-button'") &&
    !componentDefinitionSources.tag.includes('选择标签') &&
    !componentDefinitionSources.tag.includes('TagPicker') &&
    !componentDefinitionSources.tag.includes('TagBar'),
  'Tag docs page must not keep moved TagPicker/TagBar demos after the card package migration.',
)
assert.ok(
  !componentDefinitionSources.tag.includes('TagBread') &&
    !componentDefinitionSources.tag.includes('面包屑') &&
    componentDefinitionSources['tag-bread'].includes('function TagBreadDemo'),
  'Tag docs page must not keep the moved TagBread demo after the 标签面包屑 page split.',
)
assert.ok(
  !componentDefinitionSources['tag-bar'].includes("from 'weimo-ui-core/components/coss/button'") &&
  componentDefinitionSources['tag-bar'].includes("from 'weimo-ui-core/components/capsule-button'") &&
  !componentDefinitionSources['tag-bar'].includes('tag-picker-preview__trigger') &&
  !componentDefinitionSources['tag-bar'].includes('<Button'),
  'TagPicker docs preview must remove the standalone select-tag button and use internal CapsuleButton chips.',
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
    componentDefinitionSources['sidebar'].includes(snippet),
    `SideBar component definition must include ${snippet}.`,
  )
}

for (const snippet of [
  "import { Drawer } from '@base-ui/react/drawer'",
  "import { Menu, X } from 'lucide-react'",
  "import { FrostedIconButton } from 'weimo-ui-core/components/frosted-icon-button'",
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
  !componentDefinitionSources['sidebar'].includes('preview: ({ onOpenSidebar })') &&
    !componentDefinitionSources['sidebar'].includes('preview: ({onOpenSidebar})') &&
    !componentDefinitionSources['sidebar'].includes('onClick={onOpenSidebar}') &&
    !sidebarPreviewSource.includes('onOpenSidebar'),
  'SideBar preview drawer trigger must use local preview drawer state, not the docs shell sidebar.',
)

assert.ok(
  !componentDefinitionSources['sidebar'].includes('TopBar') &&
    !componentDefinitionSources['sidebar'].includes('顶部工具栏'),
  'PageLayout docs page must not keep the TopBar demo after it moves to the bar page.',
)

assert.ok(
  !componentDefinitionSources.menu.includes("from 'weimo-ui-core/components/card'") &&
  !componentDefinitionSources.menu.includes("from 'weimo-ui-core/components/capsule-button'") &&
  !componentDefinitionSources.menu.includes('<WeimoCard') &&
  !componentDefinitionSources.menu.includes('<CardHeader') &&
  !componentDefinitionSources.menu.includes('<CardContent') &&
  !componentDefinitionSources.menu.includes('<CardFooter') &&
  !componentDefinitionSources.menu.includes('<CapsuleButton'),
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
  !componentDefinitionSources.menu.includes("from 'weimo-ui-core/components/coss/button'") &&
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
  !componentDocsSource.includes("from 'weimo-ui-core/components/card'") &&
  !componentDocsSource.includes("from 'weimo-ui-core/components/menu'"),
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
    !componentDefinitionsSource.includes('<CapsuleButton label='),
  'CapsuleButton example code must match the single button chip API.',
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
    !packageJson.scripts?.['test:contracts']?.includes('gallery-preview-contract.test.mjs') &&
    !existsSync(join(root, 'packages/weimo-ui-site/src/docs/pages/component-gallery-page.tsx')) &&
    !existsSync(join(root, 'packages/weimo-ui-site/src/docs/component-definitions/gallery-preview-sample.ts')) &&
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

assert.ok(
  existsSync(join(root, 'packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-card/tagged-card.tsx')),
  'Merged tagged-card docs definition must exist.',
)
assert.ok(
  existsSync(join(root, 'packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/capsule-button.tsx')) &&
    existsSync(join(root, 'packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-card/card-tool-bar.tsx')),
  'Package-specific CapsuleButton and card bar docs definitions must exist.',
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
