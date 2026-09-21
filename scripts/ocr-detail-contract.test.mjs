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

function sourceBetween(source, startSnippet, endSnippet) {
  const start = source.indexOf(startSnippet)
  const end = source.indexOf(endSnippet, start + startSnippet.length)

  assert.notEqual(start, -1, `${startSnippet} must exist.`)
  assert.notEqual(end, -1, `${endSnippet} must exist after ${startSnippet}.`)

  return source.slice(start, end)
}

const packageJson = readJson('package.json')
const manifest = readProjectFile('src/docs/components-manifest.ts')
const definitionsIndex = readProjectFile('src/docs/component-definitions/index.ts')
const docsDefinition = readProjectFile('src/docs/component-definitions/ocr-detail.tsx')
const ocrDetailSource = readProjectFile('src/components/ocr-detail.tsx')
const ocrDetailCss = readProjectFile('src/components/ocr-detail.css')
const rootRegistry = readJson('registry.json')
const standaloneRegistry = readJson('registry/ocr-detail.json')
const registryItem = rootRegistry.items.find((item) => item.name === 'ocr-detail')

assert.equal(
  packageJson.exports?.['./components/ocr-detail'],
  './src/components/ocr-detail.tsx',
  'package.json must export OcrDetail.',
)
assert.ok(
  packageJson.scripts?.test?.includes('scripts/ocr-detail-contract.test.mjs'),
  'package.json test script must run ocr-detail-contract.test.mjs.',
)

assert.ok(
  manifest.includes("id: 'ocr-detail'") &&
    manifest.includes("name: 'OcrDetail'") &&
    manifest.includes("registryName: 'ocr-detail'") &&
    manifest.includes("packageExport: './components/ocr-detail'") &&
    manifest.includes("group: 'media-ocr'"),
  'Component manifest must list OcrDetail as a public registry-backed media/OCR component.',
)
assert.ok(
  definitionsIndex.includes("import { ocrDetailDefinition } from './ocr-detail'") &&
    definitionsIndex.includes("'ocr-detail': ocrDetailDefinition"),
  'OcrDetail docs definition must be wired into component-definitions/index.ts.',
)

for (const snippet of [
  "import { useEffect, useState } from 'react'",
  "import { ActionDialog, type ActionDialogProps } from './action-dialog'",
  "import { Card, type CardDraft, type CardProps } from './card'",
  "import { ImageView, ImageViewDisplayModeMenu, type ImageViewDisplayMode } from './image-view'",
  "import { cn } from './lib/utils'",
  "import './ocr-detail.css'",
  'export type OcrDetailDraft = {',
  'title: string',
  'markdown: string',
  'tags: string[]',
  'export type OcrDetailProps = Omit<',
  'ActionDialogProps,',
  "'children' | 'title' | 'showCloseButton' | 'onOpenChange'",
  '> & {',
  'imageSrc?: string',
  'imageAlt?: string',
  'title?: string',
  'tags?: string[]',
  'value?: string',
  'defaultValue?: string',
  'onChange?: (markdown: string, draft: OcrDetailDraft) => void',
  'onOpenChange?: (open: boolean) => void',
  'onSave?: (markdown: string, draft: OcrDetailDraft) => void',
  'onCancel?: () => void',
  'placeholder?: string',
  'disabled?: boolean',
  'cardProps?: Omit<',
  "'note' | 'onDraftChange' | 'onSave' | 'onCancel' | 'disabled'",
  "const DEFAULT_OCR_DETAIL_IMAGE_ALT = 'OCR source image'",
  "const DEFAULT_OCR_DETAIL_PLACEHOLDER = 'Review and correct OCR markdown...'",
  "const DEFAULT_OCR_DETAIL_CREATED_AT_TEXT = 'OCR Markdown'",
  'export function OcrDetail',
  'onOpenChange,',
  'tags = [],',
  "title = ''",
  'toolbarRightSlot,',
  'const isControlled = value !== undefined',
  'const [internalMarkdown, setInternalMarkdown] = useState(() => value ?? defaultValue ?? \'\')',
  'const markdown = isControlled ? value ?? \'\' : internalMarkdown',
  "const [imageDisplayMode, setImageDisplayMode] = useState<ImageViewDisplayMode>('fit-width')",
  'useEffect(() => {',
  'if (isControlled) setInternalMarkdown(value ?? \'\')',
  'function resolveOcrDetailDraft(draft: CardDraft): OcrDetailDraft {',
  "title: draft.title ?? ''",
  'markdown: draft.content',
  'tags: draft.tags',
  'function handleDraftChange(draft: CardDraft) {',
  'const detailDraft = resolveOcrDetailDraft(draft)',
  'onChange?.(detailDraft.markdown, detailDraft)',
  'function handleSave(draft: CardDraft) {',
  'onSave?.(detailDraft.markdown, detailDraft)',
  'function handleCancel() {',
  'onCancel?.()',
  'onOpenChange?.(false)',
  'function renderToolbarRightSlot()',
  '<ImageViewDisplayModeMenu',
  'displayMode={imageDisplayMode}',
  'onDisplayModeChange={setImageDisplayMode}',
  '{toolbarRightSlot}',
  '<ActionDialog',
  "className={cn('ocr-detail', className)}",
  'floatBarClassName="ocr-detail__image-toolbar"',
  'onOpenChange={onOpenChange}',
  'showCloseButton={false}',
  'title={null}',
  'toolbarRightSlot={renderToolbarRightSlot()}',
  'className="ocr-detail__content"',
  'className="ocr-detail__image-pane"',
  '<ImageView',
  'alt={imageAlt}',
  'className="ocr-detail__image-view"',
  'displayMode={imageDisplayMode}',
  'open={props.open}',
  'src={imageSrc}',
  'className="ocr-detail__empty-image"',
  'className="ocr-detail__card-pane"',
  '<Card',
  "initialMode={cardProps.initialMode ?? 'edit'}",
  'createdAtText: DEFAULT_OCR_DETAIL_CREATED_AT_TEXT',
  'content: markdown',
  'title,',
  'tags,',
  'labels={{',
  '...cardProps.labels,',
  'placeholder,',
  'onCancel={handleCancel}',
  'onDraftChange={handleDraftChange}',
  'onSave={handleSave}',
]) {
  assertIncludes(ocrDetailSource, snippet, `OcrDetail source must include ${snippet}.`)
}

const handleSaveBlock = sourceBetween(
  ocrDetailSource,
  'function handleSave(draft: CardDraft) {',
  'function handleCancel() {',
)
const resolveDraftBeforeSaveIndex = handleSaveBlock.indexOf('const detailDraft = resolveOcrDetailDraft(draft)')
const saveBeforeCloseIndex = handleSaveBlock.indexOf('onSave?.(detailDraft.markdown, detailDraft)')
const closeAfterSaveIndex = handleSaveBlock.indexOf('onOpenChange?.(false)')

assert.ok(
  resolveDraftBeforeSaveIndex !== -1,
  'OcrDetail save handler must resolve the full markdown/tags draft before saving.',
)
assert.ok(
  saveBeforeCloseIndex !== -1,
  'OcrDetail save handler must save the full detail draft.',
)
assert.ok(
  closeAfterSaveIndex !== -1,
  'OcrDetail save handler must close the dialog after saving.',
)
assert.ok(
  resolveDraftBeforeSaveIndex < saveBeforeCloseIndex && saveBeforeCloseIndex < closeAfterSaveIndex,
  'OcrDetail save handler must save the changed content and tags before closing the dialog.',
)

for (const snippet of [
  'ReactNode,',
  'PointerEvent as ReactPointerEvent',
  'title?: ReactNode',
  'DEFAULT_OCR_DETAIL_TITLE',
  "title={title ?? DEFAULT_OCR_DETAIL_TITLE}",
  'OcrDetailDragState',
  'canDragOcrDetailImage',
  "from './image-detail-view'",
  'ImageDetailDisplayMode',
  'ImageDetailView',
  'handlePointerDown',
  'handlePointerMove',
  'onPointerDown={handlePointerDown}',
  'className="ocr-detail__image"',
  'draggable={false}',
  'onCancel={onCancel}',
]) {
  assert.ok(
    !ocrDetailSource.includes(snippet),
    `OcrDetail source must not include ${snippet}.`,
  )
}

const rootBlock = blockFor(ocrDetailCss, '.ocr-detail')
const contentBlock = blockFor(ocrDetailCss, '.ocr-detail__content')
const imageToolbarBlock = blockFor(ocrDetailCss, '.ocr-detail__image-toolbar')
const imageToolbarFrameBlock = blockFor(ocrDetailCss, '.ocr-detail__image-toolbar .float-bar__frame')
const imagePaneBlock = blockFor(ocrDetailCss, '.ocr-detail__image-pane')
const cardPaneBlock = blockFor(ocrDetailCss, '.ocr-detail__card-pane')
const cardBlock = blockFor(ocrDetailCss, '.ocr-detail__card-pane .weimo-card')
const imageViewBlock = blockFor(ocrDetailCss, '.ocr-detail__image-view')
const emptyImageBlock = blockFor(ocrDetailCss, '.ocr-detail__empty-image')

assertIncludes(rootBlock, 'width: min(96vw, 1280px);', 'OcrDetail dialog must use a wide review workspace.')
assertIncludes(rootBlock, 'max-width: 1280px;', 'OcrDetail dialog must keep a stable maximum width.')
assertIncludes(rootBlock, 'height: min(92vh, 860px);', 'OcrDetail dialog must use most of the viewport height.')
assertIncludes(contentBlock, 'display: grid;', 'OcrDetail content must use a two-column grid.')
assertIncludes(contentBlock, 'grid-template-columns: minmax(0, 1.1fr) minmax(360px, 0.9fr);', 'OcrDetail must dedicate more room to the image pane while preserving editor width.')
assertIncludes(contentBlock, 'grid-template-rows: minmax(0, 1fr);', 'OcrDetail must bound the desktop content row so the right pane can scroll.')
assertIncludes(contentBlock, 'gap: var(--space-card-pad);', 'OcrDetail must use shared spacing tokens.')
assertIncludes(contentBlock, 'min-height: 0;', 'OcrDetail content must be shrink-safe inside the dialog.')
assertIncludes(imageToolbarBlock, 'display: grid;', 'OcrDetail toolbar must align to the image pane grid instead of the whole dialog.')
assertIncludes(imageToolbarBlock, 'grid-template-columns: minmax(0, 1.1fr) minmax(360px, 0.9fr);', 'OcrDetail toolbar must reuse the content columns so actions land over ImageView.')
assertIncludes(imageToolbarBlock, 'gap: var(--space-card-pad);', 'OcrDetail toolbar must match the content gap.')
assertIncludes(imageToolbarBlock, 'padding: var(--space-card-pad);', 'OcrDetail toolbar must start from the padded content edge.')
assertIncludes(imageToolbarFrameBlock, 'grid-column: 1;', 'OcrDetail toolbar actions must stay inside the image pane column.')
assertIncludes(imagePaneBlock, 'overflow: hidden;', 'OcrDetail image pane must delegate scrolling to ImageView.')
assertIncludes(cardPaneBlock, 'display: flex;', 'OcrDetail card pane must stretch Card vertically.')
assertIncludes(cardPaneBlock, 'min-width: 0;', 'OcrDetail card pane must be shrink-safe.')
assertIncludes(cardPaneBlock, 'overflow-y: auto;', 'OcrDetail card pane must scroll long Card content vertically.')
assertIncludes(cardPaneBlock, 'overscroll-behavior: contain;', 'OcrDetail card pane must contain scroll momentum inside the dialog.')
assertIncludes(cardBlock, 'flex: 0 0 auto;', 'OcrDetail Card must preserve its measured content height instead of shrinking to the pane.')
assertIncludes(cardBlock, 'min-height: 100%;', 'OcrDetail Card must still fill the pane when content is short.')
assertIncludes(imageViewBlock, 'width: 100%;', 'OcrDetail ImageView must fill the left pane width.')
assertIncludes(imageViewBlock, 'height: 100%;', 'OcrDetail ImageView must fill the left pane height.')
assertIncludes(ocrDetailCss, '.ocr-detail__image-view.image-view[data-display-mode="fit-height"]', 'OcrDetail must constrain ImageView fit-height mode inside the left pane.')
assert.ok(!ocrDetailCss.includes('.ocr-detail__image {'), 'OcrDetail CSS must not keep the old direct image renderer.')
assertIncludes(emptyImageBlock, 'color: var(--color-text-secondary);', 'OcrDetail empty image state must use muted text.')
assertIncludes(ocrDetailCss, '@media (max-width: 860px)', 'OcrDetail CSS must stack at narrow widths.')

assert.ok(registryItem, 'Root registry must include the @weimo/ocr-detail item.')
assert.deepEqual(
  standaloneRegistry,
  registryItem,
  'registry/ocr-detail.json must match registry.json payload.',
)
assert.deepEqual(
  registryItem.registryDependencies,
  ['@weimo/style', '@weimo/utils', '@weimo/action-dialog', '@weimo/card', '@weimo/image-view'],
  'OcrDetail registry item must depend on style, utils, ActionDialog, Card, and ImageView.',
)
assert.ok(
  !registryItem.dependencies || registryItem.dependencies.length === 0,
  'OcrDetail registry item must let ActionDialog, Card, and ImageView own their package dependencies.',
)
for (const filePath of [
  'src/components/ocr-detail.tsx',
  'src/components/ocr-detail.css',
]) {
  assert.ok(
    registryItem.files.some((file) => file.path === filePath),
    `OcrDetail registry item must ship ${filePath}.`,
  )
}
for (const filePath of [
  'src/components/image-detail-view.tsx',
  'src/components/image-detail-view.css',
  'src/components/image-detail.tsx',
  'src/components/image-detail.css',
]) {
  assert.ok(
    !registryItem.files.some((file) => file.path === filePath),
    `OcrDetail registry item must not ship removed ${filePath}.`,
  )
}

for (const snippet of [
  "import { OcrDetail } from '../../components/ocr-detail'",
  "id: 'ocr-detail'",
  "summary: '用于 OCR 校对的全屏弹窗，左侧自然尺寸查看图片，右侧用 Card 编辑 Markdown'",
  '<OcrDetail',
  'imageSrc={sampleOcrImage}',
  'title={title}',
  'open={open}',
  'onOpenChange={setOpen}',
  "tags={['OCR', '校对']}",
  'value={markdown}',
  'onChange={(nextMarkdown, draft) => {',
  'setMarkdown(nextMarkdown)',
  'setTitle(draft.title)',
]) {
  assertIncludes(docsDefinition, snippet, `OcrDetail docs must include ${snippet}.`)
}
