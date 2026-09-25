import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

function projectPath(relativePath) {
  return join(root, relativePath)
}

function readProjectFile(relativePath) {
  const absolutePath = projectPath(relativePath)

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

function assertIncludes(source, snippet, message) {
  assert.ok(source.includes(snippet), message)
}

function assertNotExists(relativePath, message) {
  assert.ok(!existsSync(projectPath(relativePath)), message)
}

const packageJson = readJson('package.json')
const manifest = readProjectFile('src/docs/components-manifest.ts')
const definitionsIndex = readProjectFile('src/docs/component-definitions/index.ts')
const docsDefinition = readProjectFile('src/docs/component-definitions/image.tsx')
const imageViewSource = readProjectFile('src/components/image-view.tsx')
const imageViewCss = readProjectFile('src/components/image-view.css')
const ocrDetailSource = readProjectFile('src/components/ocr-detail.tsx')
const ocrDetailCss = readProjectFile('src/components/ocr-detail.css')
const rootRegistry = readJson('registry.json')
const standaloneRegistry = readJson('registry/image-view.json')
const registryItem = rootRegistry.items.find((item) => item.name === 'image-view')

assert.equal(
  packageJson.exports?.['./components/image-view'],
  './src/components/image-view.tsx',
  'package.json must export ImageView.',
)
assert.ok(
  !Object.hasOwn(packageJson.exports ?? {}, './components/image-detail'),
  'package.json must not export the removed ImageDetail component.',
)
assert.ok(
  !Object.hasOwn(packageJson.exports ?? {}, './components/image-detail-view'),
  'package.json must not export the removed ImageDetailView component.',
)
assert.ok(
  packageJson.scripts?.test?.includes('scripts/image-view-contract.test.mjs'),
  'package.json test script must run image-view-contract.test.mjs.',
)
assert.ok(
  !packageJson.scripts?.test?.includes('scripts/image-detail-view-contract.test.mjs'),
  'package.json test script must not run the removed image-detail-view contract.',
)

for (const relativePath of [
  'src/components/image-detail.tsx',
  'src/components/image-detail.css',
  'src/components/image-detail-view.tsx',
  'src/components/image-detail-view.css',
  'src/docs/component-definitions/image-detail.tsx',
  'src/docs/component-definitions/image-detail-view.tsx',
  'registry/image-detail.json',
  'registry/image-detail-view.json',
]) {
  assertNotExists(relativePath, `${relativePath} must be removed after ImageView owns detail viewing.`)
}

assert.ok(
  manifest.includes("id: 'image'") &&
    manifest.includes("name: '图片'") &&
    manifest.includes("exportName: 'ImageView'") &&
    manifest.includes("registryName: 'image-view'") &&
    manifest.includes("packageExport: './components/image-view'") &&
    manifest.includes("group: 'media-ocr'"),
  'Component manifest must list ImageView through the merged Image page as the only public image-detail viewing component.',
)
for (const snippet of [
  "id: 'image-detail'",
  "id: 'image-detail-view'",
  "name: 'ImageDetail'",
  "name: 'ImageDetailView'",
  "packageExport: './components/image-detail'",
  "packageExport: './components/image-detail-view'",
]) {
  assert.ok(!manifest.includes(snippet), `Component manifest must not include removed ${snippet}.`)
}
assert.ok(
  definitionsIndex.includes("import { imageDefinition } from './image'") &&
    definitionsIndex.includes('image: imageDefinition'),
  'ImageView preview must be wired into component-definitions/index.ts through the merged Image definition.',
)
for (const snippet of [
  "import { imageDetailDefinition } from './image-detail'",
  "import { imageDetailViewDefinition } from './image-detail-view'",
  "'image-detail': imageDetailDefinition",
  "'image-detail-view': imageDetailViewDefinition",
]) {
  assert.ok(!definitionsIndex.includes(snippet), `Docs definitions index must not include removed ${snippet}.`)
}

for (const snippet of [
  "import { Check, Maximize2, MoveHorizontal, MoveVertical } from 'lucide-react'",
  "import { useEffect, useRef, useState } from 'react'",
  'CSSProperties,',
  'ComponentPropsWithoutRef,',
  'MouseEvent,',
  'PointerEvent as ReactPointerEvent,',
  'ReactNode,',
  'Ref,',
  "import { ActionDialog } from './action-dialog'",
  "import { FrostedIconButton } from './frosted-icon-button'",
  "import { cn } from './lib/utils'",
  "import { ActionMenu, type ActionMenuItem } from './menu'",
  "import './image-view.css'",
  "export type ImageViewDisplayMode = 'actual-size' | 'fit-width' | 'fit-height'",
  "export type ImageViewProps = Omit<ComponentPropsWithoutRef<'figure'>, 'children'> & {",
  'displayMode?: ImageViewDisplayMode',
  'imageRef?: Ref<HTMLImageElement>',
  'open?: boolean',
  'export type ImageViewDisplayModeMenuProps = {',
  'displayMode: ImageViewDisplayMode',
  'onDisplayModeChange: (displayMode: ImageViewDisplayMode) => void',
  "const DEFAULT_IMAGE_VIEW_DISPLAY_MODE: ImageViewDisplayMode = 'fit-width'",
  'const IMAGE_VIEW_DISPLAY_MODE_ITEMS: ActionMenuItem[] = [',
  "key: 'actual-size'",
  "key: 'fit-width'",
  "key: 'fit-height'",
  'type ImageViewDragState = {',
  'function canDragImageView(element: HTMLElement)',
  'function isImageViewDisplayMode(value: unknown): value is ImageViewDisplayMode',
  'function getImageViewDisplayModeIcon(displayMode: ImageViewDisplayMode)',
  'function setImageViewRef<T>(ref: Ref<T> | undefined, node: T | null)',
  'export function ImageViewDisplayModeMenu',
  'function handleRadioValueChange(value: unknown)',
  'onDisplayModeChange(value)',
  '<ActionMenu',
  'ariaLabel="切换图片展示模式"',
  'items={IMAGE_VIEW_DISPLAY_MODE_ITEMS}',
  '<FrostedIconButton',
  'className="image-view__mode-trigger"',
  'export function ImageView',
  'const [detailDisplayMode, setDetailDisplayMode] = useState<ImageViewDisplayMode>(DEFAULT_IMAGE_VIEW_DISPLAY_MODE)',
  'const [detailOpenSrc, setDetailOpenSrc] = useState<string | null>(null)',
  'const [isDragging, setIsDragging] = useState(false)',
  'const dragRef = useRef<ImageViewDragState | null>(null)',
  'const detailOpen = Boolean(src && detailOpenSrc === src)',
  'const canOpenDetail = Boolean(canRenderImage && !displayMode && src)',
  'function openImageDetailDialog()',
  'if (!canOpenDetail) return',
  'function handleImageDetailOpenChange(open: boolean)',
  'setDetailOpenSrc(open ? src ?? null : null)',
  'function handleDoubleClick(event: MouseEvent<HTMLElement>)',
  'onDoubleClick?.(event)',
  'if (!(event.target instanceof HTMLImageElement)) return',
  'openImageDetailDialog()',
  'function handlePointerDown(event: ReactPointerEvent<HTMLElement>)',
  'event.currentTarget.setPointerCapture(event.pointerId)',
  'function handlePointerMove(event: ReactPointerEvent<HTMLElement>)',
  'event.currentTarget.scrollLeft = drag.scrollLeft - (event.clientX - drag.clientX)',
  'event.currentTarget.scrollTop = drag.scrollTop - (event.clientY - drag.clientY)',
  'function stopDrag(event: ReactPointerEvent<HTMLElement>)',
  'data-display-mode={displayMode}',
  "data-dragging={isDragging ? 'true' : undefined}",
  'onLostPointerCapture={handleLostPointerCapture}',
  'onPointerCancel={handlePointerCancel}',
  'onPointerDown={handlePointerDown}',
  'onPointerMove={handlePointerMove}',
  'onPointerUp={handlePointerUp}',
  'onDoubleClick={handleDoubleClick}',
  '<ActionDialog',
  "className=\"image-view__detail-dialog\"",
  'open={detailOpen}',
  'onOpenChange={handleImageDetailOpenChange}',
  'toolbarRightSlot={',
  '<ImageViewDisplayModeMenu',
  'displayMode={detailDisplayMode}',
  'onDisplayModeChange={setDetailDisplayMode}',
  'title={alt || DEFAULT_IMAGE_VIEW_DETAIL_TITLE}',
  'titleClassName="image-view__detail-title"',
  '<ImageView',
  'className="image-view__detail"',
  'displayMode={detailDisplayMode}',
  'open={detailOpen}',
  'className="image-view__image"',
  'draggable={displayMode ? false : undefined}',
  'ref={(node) => setImageViewRef(imageRef, node)}',
]) {
  assertIncludes(imageViewSource, snippet, `ImageView source must include ${snippet}.`)
}

for (const snippet of [
  "from './image-detail'",
  "from './image-detail-view'",
  '<ImageDetail',
  'ImageDetailView',
  'ImageViewDetailRenderProps',
  'renderDetail',
  'DEFAULT_IMAGE_VIEW_ZOOM_LABEL',
  'imageDialogState',
  'handleImageDialogOpenChange',
  'image-view__actions',
  'image-view__zoom',
]) {
  assert.ok(!imageViewSource.includes(snippet), `ImageView source must not include removed ${snippet}.`)
}

for (const selector of [
  '.image-view',
  '.image-view[data-object-fit="cover"]',
  '.image-view[data-display-mode]',
  '.image-view[data-display-mode][data-dragging="true"]',
  '.image-view__mode-trigger svg',
  '.image-view__image',
  '.image-view[data-display-mode] .image-view__image',
  '.image-view[data-display-mode="fit-width"] .image-view__image',
  '.image-view[data-display-mode="fit-height"]',
  '.image-view[data-display-mode="fit-height"] .image-view__image',
  '.image-view__detail-dialog',
  '.image-view__detail-title',
  '.image-view__detail',
]) {
  assert.ok(imageViewCss.includes(selector), `ImageView CSS must include ${selector}.`)
}
assertIncludes(
  blockFor(imageViewCss, '.image-view[data-display-mode]'),
  'touch-action: none;',
  'ImageView detail mode must keep drag-to-scroll touch handling.',
)
for (const selector of [
  '.image-view__actions',
  '.image-view__zoom',
  '.image-detail',
  '.image-detail-view',
]) {
  assert.ok(!imageViewCss.includes(selector), `ImageView CSS must not keep removed ${selector} styles.`)
}

assert.ok(
  ocrDetailSource.includes("import { ImageView, ImageViewDisplayModeMenu, type ImageViewDisplayMode } from './image-view'") &&
    ocrDetailSource.includes('<ImageViewDisplayModeMenu') &&
    ocrDetailSource.includes("const [imageDisplayMode, setImageDisplayMode] = useState<ImageViewDisplayMode>('fit-width')") &&
    ocrDetailSource.includes('<ImageView') &&
    ocrDetailSource.includes('displayMode={imageDisplayMode}') &&
    !ocrDetailSource.includes("from './image-detail-view'") &&
    !ocrDetailSource.includes('ImageDetailView') &&
    !ocrDetailSource.includes('ImageDetailDisplayMode'),
  'OcrDetail must reuse ImageView for the left detail viewport and display-mode menu.',
)
assertIncludes(
  ocrDetailCss,
  '.ocr-detail__image-view.image-view[data-display-mode="fit-height"]',
  'OcrDetail CSS must constrain ImageView fit-height mode inside the left pane.',
)
assert.ok(
  !ocrDetailCss.includes('image-detail-view'),
  'OcrDetail CSS must not target the removed ImageDetailView class name.',
)

assert.ok(registryItem, 'Root registry must include the @weimo/image-view item.')
assert.deepEqual(
  standaloneRegistry,
  registryItem,
  'registry/image-view.json must match registry.json payload.',
)
assert.deepEqual(
  registryItem.dependencies,
  ['lucide-react'],
  'ImageView registry item must install lucide-react for display-mode icons.',
)
assert.deepEqual(
  registryItem.registryDependencies,
  ['@weimo/style', '@weimo/utils', '@weimo/action-dialog', '@weimo/frosted-icon-button', '@weimo/menu'],
  'ImageView registry item must install style, utils, ActionDialog, glass button, and menu.',
)
for (const filePath of [
  'src/components/image-view.tsx',
  'src/components/image-view.css',
]) {
  assert.ok(
    registryItem.files.some((file) => file.path === filePath),
    `ImageView registry item must ship ${filePath}.`,
  )
}
for (const filePath of [
  'src/components/image-detail.tsx',
  'src/components/image-detail.css',
  'src/components/image-detail-view.tsx',
  'src/components/image-detail-view.css',
]) {
  assert.ok(
    !registryItem.files.some((file) => file.path === filePath),
    `ImageView registry item must not ship removed ${filePath}.`,
  )
}
assert.ok(
  !rootRegistry.items.some((item) => item.name === 'image-detail') &&
    !rootRegistry.items.some((item) => item.name === 'image-detail-view'),
  'Root registry must remove standalone ImageDetail and ImageDetailView items.',
)

for (const snippet of [
  "import { useState } from 'react'",
  "import { ImageView, ImageViewDisplayModeMenu, type ImageViewDisplayMode } from '../../components/image-view'",
  "id: 'image'",
  "const [displayMode, setDisplayMode] = useState<ImageViewDisplayMode>('fit-width')",
  '<ImageViewDisplayModeMenu',
  'displayMode={displayMode}',
  'onDisplayModeChange={setDisplayMode}',
  '<ImageView',
  'className="image-view-docs-preview__detail"',
  'displayMode={displayMode}',
  'open',
  'src={sampleImage}',
  'preview: () => <ImageDemo />',
  '<ImageViewPreview />',
]) {
  assertIncludes(docsDefinition, snippet, `ImageView docs must include ${snippet}.`)
}
