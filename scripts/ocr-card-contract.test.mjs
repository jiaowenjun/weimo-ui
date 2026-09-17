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

function assertIncludes(source, snippet, message) {
  assert.ok(source.includes(snippet), message)
}

const packageJson = readJson('package.json')
const manifest = readProjectFile('src/docs/components-manifest.ts')
const definitionsIndex = readProjectFile('src/docs/component-definitions/index.ts')
const docsDefinition = readProjectFile('src/docs/component-definitions/ocr-card.tsx')
const source = readProjectFile('src/components/ocr-card.tsx')
const css = readProjectFile('src/components/ocr-card.css')
const appCss = readProjectFile('src/App.css')
const rootRegistry = readJson('registry.json')
const standaloneRegistry = readJson('registry/ocr-card.json')
const registryItem = rootRegistry.items.find((item) => item.name === 'ocr-card')

assert.equal(
  packageJson.exports?.['./components/ocr-card'],
  './src/components/ocr-card.tsx',
  'package.json must export OcrCard.',
)
assert.ok(
  packageJson.scripts?.test?.includes('scripts/ocr-card-contract.test.mjs'),
  'package.json test script must run ocr-card-contract.test.mjs.',
)

assert.ok(
  manifest.includes("id: 'ocr-card'") &&
    manifest.includes("name: 'OcrCard'") &&
    manifest.includes("registryName: 'ocr-card'") &&
    manifest.includes("packageExport: './components/ocr-card'") &&
    manifest.includes("group: 'media-ocr'") &&
    manifest.includes('registry: true'),
  'Component manifest must list OcrCard as a public media/OCR registry-backed component.',
)
assert.ok(
  definitionsIndex.includes("import { ocrCardDefinition } from './ocr-card'") &&
    definitionsIndex.includes("'ocr-card': ocrCardDefinition"),
  'OcrCard docs definition must be wired into component-definitions/index.ts.',
)

for (const snippet of [
  "import { BookOpenCheck } from 'lucide-react'",
  "import { useEffect, useState } from 'react'",
  "import type { ComponentPropsWithoutRef, ReactNode } from 'react'",
  "import { Card, type CardDraft, type CardEditorOptions, type CardInitialMode, type CardLabels } from './card'",
  "import { ImageView, type ImageViewProps } from './image-view'",
  "import { cn } from './lib/utils'",
  "import type { MdRenderImageRenderer, MdRenderImageSrcResolver } from './md-render'",
  "import type { ActionMenuItem } from './menu'",
  "import { OcrDetail, type OcrDetailDraft } from './ocr-detail'",
  "import './ocr-card.css'",
  'export type OcrCardNote = {',
  'createdAtText: ReactNode',
  'title?: string',
  'imageSrc?: string',
  'imageAlt?: string',
  'imageWidth: number',
  'imageHeight: number',
  'markdown?: string',
  'tags?: string[]',
  'export type OcrCardDraft = {',
  'title?: string',
  'markdown?: string',
  'tags: string[]',
  'export type OcrCardImageViewProps = Omit<',
  'ImageViewProps,',
  "'src' | 'alt' | 'imageWidth' | 'imageHeight' | 'placeholder'",
  'export type OcrCardLabels = CardLabels & {',
  'openDetail?: string',
  'imagePlaceholder?: ReactNode',
  "export type OcrCardProps = Omit<ComponentPropsWithoutRef<'article'>, 'children' | 'onChange'> & {",
  'actionSlot?: ReactNode',
  'disabled?: boolean',
  'displayMenuItems?: ActionMenuItem[]',
  'editor?: CardEditorOptions',
  'imageViewProps?: OcrCardImageViewProps',
  'initialEditAutoFocus?: boolean',
  'initialMode?: CardInitialMode',
  'labels?: OcrCardLabels',
  'markdownImageRenderer?: MdRenderImageRenderer',
  'markdownImageSrcResolver?: MdRenderImageSrcResolver',
  'note: OcrCardNote',
  'onCancel?: () => void',
  'onDelete?: () => void',
  'onDraftChange?: (draft: OcrCardDraft) => void',
  'onSave?: (draft: OcrCardDraft) => void',
  'onTagClick?: (tag: string) => void',
  'tagOptions?: string[]',
  'transitionDurationMs?: number',
  'export function OcrCard',
  "openDetail: '校对'",
  "const hasMarkdownResult = Boolean(note.markdown?.trim())",
  'const [detailOpen, setDetailOpen] = useState(false)',
  "const [detailMarkdown, setDetailMarkdown] = useState(() => note.markdown ?? '')",
  'setDetailOpen(false)',
  'const isImageViewMode = !hasMarkdownResult',
  'function resolveOcrDraft(cardDraft: CardDraft): OcrCardDraft {',
  'title: cardDraft.title',
  'markdown: cardDraft.content',
  'tags: cardDraft.tags',
  'function handleDraftChange(cardDraft: CardDraft) {',
  'onDraftChange?.(resolveOcrDraft(cardDraft))',
  'function handleSave(cardDraft: CardDraft) {',
  'onSave?.(resolveOcrDraft(cardDraft))',
  'function resolveOcrDetailDraft(detailDraft: OcrDetailDraft): OcrCardDraft {',
  'title: detailDraft.title',
  'markdown: detailDraft.markdown',
  'tags: detailDraft.tags',
  'function openDetailDialog()',
  "setDetailMarkdown(note.markdown ?? '')",
  'setDetailOpen(true)',
  'function resolveDetailMenuItems(): ActionMenuItem[]',
  "key: 'review'",
  'label: openDetail',
  '<BookOpenCheck aria-hidden="true" />',
  'disabled,',
  'onSelect: openDetailDialog',
  "key: 'review-separator'",
  "type: 'separator'",
  'const resolvedDisplayMenuItems = [',
  '...resolveDetailMenuItems()',
  '...(displayMenuItems ?? [])',
  'function handleDetailMarkdownChange(markdown: string, detailDraft: OcrDetailDraft)',
  'setDetailMarkdown(markdown)',
  'onDraftChange?.(resolveOcrDetailDraft(detailDraft))',
  'function handleDetailMarkdownSave(markdown: string, detailDraft: OcrDetailDraft)',
  'onSave?.(resolveOcrDetailDraft(detailDraft))',
  'const contentSlot = isImageViewMode ? (',
  '<ImageView',
  "className={cn('weimo-ocr-card__image', imageViewClassName)}",
  'alt={note.imageAlt}',
  'imageWidth={note.imageWidth}',
  'imageHeight={note.imageHeight}',
  'placeholder={imagePlaceholder}',
  'src={note.imageSrc}',
  '<Card',
  "className={cn('weimo-ocr-card', className)}",
  'contentSlot={contentSlot}',
  'renderProps={{',
  'renderImage: markdownImageRenderer,',
  'resolveImageSrc: markdownImageSrcResolver,',
  'displayActionGroupClassName="weimo-ocr-card__header-actions"',
  'displayActionPrefixSlot={actionSlot}',
  'disabled={disabled}',
  'displayMenuItems={resolvedDisplayMenuItems}',
  'editor={editor}',
  'initialEditAutoFocus={initialEditAutoFocus}',
  'initialMode={initialMode}',
  'note={{',
  'content: note.markdown ?? \'\'',
  'createdAtText: note.createdAtText',
  'title: note.title',
  'tags: note.tags ?? []',
  'onCancel={onCancel}',
  'onDelete={onDelete}',
  'onDraftChange={handleDraftChange}',
  'onSave={handleSave}',
  'onTagClick={onTagClick}',
  'saveDisabled={isImageViewMode ? false : undefined}',
  'tagOptions={tagOptions}',
  'transitionDurationMs={transitionDurationMs}',
  '<OcrDetail',
  'cardProps={{',
  'tagOptions,',
  'renderProps: {',
  'renderImage: markdownImageRenderer,',
  'resolveImageSrc: markdownImageSrcResolver,',
  'imageAlt={note.imageAlt}',
  'imageSrc={note.imageSrc}',
  'onCancel={onCancel}',
  'onChange={handleDetailMarkdownChange}',
  'onOpenChange={setDetailOpen}',
  'onSave={handleDetailMarkdownSave}',
  'open={detailOpen}',
  'tags={note.tags ?? []}',
  "title={note.title ?? ''}",
  'value={detailMarkdown}',
]) {
  assertIncludes(source, snippet, `OcrCard source must include ${snippet}.`)
}

assert.ok(
  source.includes('cardProps={{\n            editor,\n            tagOptions,'),
  'OcrCard must forward its editor options to the Card inside OcrDetail.',
)

assert.ok(
  !source.includes('imageWidth?: number') &&
    !source.includes('imageHeight?: number'),
  'OcrCard notes with an image must carry required real image dimensions.',
)
assert.ok(
  !source.includes('displayActionSlot={actionSlot}'),
  'OcrCard actionSlot must remain before the three-dot menu.',
)
assert.ok(
  !source.includes('<GhostIconButton') &&
    !source.includes('weimo-ocr-card__detail-button') &&
    !source.includes('const detailSlot ='),
  'OcrCard must expose review through the three-dot menu instead of a separate header button.',
)
assert.ok(
  !source.includes('markdown: isImageViewMode ? note.markdown : cardDraft.content'),
  'OcrCard edit saves must persist the current CardDraft content even when the image view is active.',
)
for (const forbiddenSnippet of [
  "import { CardTopBar",
  "from './card-top-bar'",
  "import { TagBar",
  "from './tag-bar'",
  "import { CardToolBar",
  "from './card-tool-bar'",
  "import { MdEditor",
  "from './md-editor'",
  'useCardDraft',
  'resolveOcrCardMenuItems',
  'OcrCardViewMode',
  'showImage',
  'showMarkdown',
  'setViewMode',
  'toggleViewMode',
  'modeToggleSlot',
  'weimo-ocr-card__mode-button',
  'ImageIcon',
  'FileText',
  '<CardTopBar',
  '<TagBar',
]) {
  assert.ok(
    !source.includes(forbiddenSnippet),
    `OcrCard must reuse Card edit plumbing instead of duplicating ${forbiddenSnippet}.`,
  )
}

for (const snippet of [
  '.weimo-ocr-card__header-actions {',
  'align-items: center;',
  'display: flex;',
  'gap: var(--space-tag-gap);',
  '.weimo-ocr-card__image.image-view {',
  'width: 100%;',
]) {
  assertIncludes(css, snippet, `OcrCard CSS must include ${snippet}.`)
}
assert.ok(
  !css.includes('.weimo-ocr-card__mode-button') &&
    !css.includes('.weimo-ocr-card__detail-button'),
  'OcrCard CSS must remove deleted standalone header buttons.',
)

for (const snippet of [
  "import { OcrCard } from '../../components/ocr-card'",
  "id: 'ocr-card'",
  "summary: '复用 Card 编辑壳层的 OCR 卡片，有识别结果时通过操作菜单校对 Markdown，否则展示原图'",
  "status: 'Ready'",
  "{ name: 'note', type: 'OcrCardNote', defaultValue: '-' }",
  "{ name: 'imageViewProps', type: 'OcrCardImageViewProps', defaultValue: '-' }",
  "{ name: 'markdownImageRenderer', type: 'MdRenderImageRenderer', defaultValue: '-' }",
  "{ name: 'onDraftChange', type: '(draft: OcrCardDraft) => void', defaultValue: '-' }",
  "{ name: 'onSave', type: '(draft: OcrCardDraft) => void', defaultValue: '-' }",
  "{ name: 'actionSlot', type: 'ReactNode', defaultValue: '-' }",
  'const sampleOcrMarkdown =',
  'className="ocr-card-docs-preview"',
  '<OcrCard',
  "createdAtText: 'OCR 图片'",
  'imageSrc: sampleOcrCardImage',
  'imageWidth: 640',
  'imageHeight: 480',
  'markdown: sampleOcrMarkdown',
  "tags: ['OCR', '扫描件']",
  'onSave={() => {}}',
  'tagOptions={ocrCardTagOptions}',
]) {
  assertIncludes(docsDefinition, snippet, `OcrCard docs definition must include ${snippet}.`)
}

for (const snippet of [
  '.ocr-card-docs-preview {',
  'width: min(100%, 360px);',
  'min-width: 0;',
  'align-self: center;',
  'justify-self: center;',
  '.ocr-card-docs-preview .weimo-ocr-card {',
  'width: 100%;',
  'max-width: none;',
]) {
  assertIncludes(appCss, snippet, `OcrCard docs preview CSS must include ${snippet}.`)
}

assert.ok(registryItem, 'Root registry must include the @weimo/ocr-card item.')
assert.deepEqual(
  registryItem.registryDependencies,
  [
    '@weimo/style',
    '@weimo/utils',
    '@weimo/card',
    '@weimo/image-view',
    '@weimo/ocr-detail',
  ],
  'OcrCard registry item must install Card, OcrDetail, ImageView, style, and utils.',
)
assert.deepEqual(
  registryItem.dependencies,
  ['lucide-react'],
  'OcrCard registry item must install lucide-react for its header icons.',
)
for (const filePath of [
  'src/components/ocr-card.tsx',
  'src/components/ocr-card.css',
]) {
  assert.ok(
    registryItem.files.some((file) => file.path === filePath),
    `OcrCard registry item must ship ${filePath}.`,
  )
}
assert.deepEqual(
  standaloneRegistry,
  registryItem,
  'registry/ocr-card.json must match the root OcrCard registry item.',
)
