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

const source = readProjectFile('src/components/image-uploader.tsx')
const css = readProjectFile('src/components/image-uploader.css')
const packageJson = readJson('package.json')
const manifest = readProjectFile('src/docs/components-manifest.ts')
const definitionsIndex = readProjectFile('src/docs/component-definitions/index.ts')
const docsDefinition = readProjectFile('src/docs/component-definitions/image-uploader.tsx')
const rootRegistry = readJson('registry.json')
const standaloneRegistry = readJson('registry/image-uploader.json')
const registryItem = rootRegistry.items.find((item) => item.name === 'image-uploader')

const rootBlock = blockFor(css, '.image-uploader')
const panelBlock = blockFor(css, '.image-uploader__panel')
const inputBlock = blockFor(css, '.image-uploader__input')
const previewBlock = blockFor(css, '.image-uploader__preview')
const previewViewBlock = blockFor(css, '.image-uploader__preview-view.image-view')
const previewImageBlock = blockFor(css, '.image-uploader__preview-view .image-view__image')
const titleBlock = blockFor(css, '.image-uploader__title')
const descriptionBlock = blockFor(css, '.image-uploader__description')
const sourceBlock = blockFor(css, '.image-uploader__source')
const readyBlock = css.match(/\.image-uploader\[data-state="ready"\]\s*\{([^}]*)\}/)?.[1] ?? ''
const readyPanelBlock = blockFor(css, '.image-uploader[data-state="ready"] .image-uploader__panel')

assert.equal(
  packageJson.exports?.['./components/image-uploader'],
  './src/components/image-uploader.tsx',
  'package.json must export ImageUploader.',
)
assert.ok(
  packageJson.scripts?.test?.includes('scripts/image-uploader-contract.test.mjs'),
  'package.json test script must run image-uploader-contract.test.mjs.',
)
assert.ok(
  manifest.includes("id: 'image-uploader'") &&
    manifest.includes("name: 'ImageUploader'") &&
    manifest.includes("registryName: 'image-uploader'") &&
    manifest.includes("packageExport: './components/image-uploader'"),
  'Component manifest must list ImageUploader as a public registry-backed component.',
)
assert.ok(
  definitionsIndex.includes("import { imageUploaderDefinition } from './image-uploader'") &&
    definitionsIndex.includes("'image-uploader': imageUploaderDefinition"),
  'ImageUploader docs definition must be wired into component-definitions/index.ts.',
)

for (const snippet of [
  "import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'",
  "import type { ChangeEvent, DragEvent, KeyboardEvent, MouseEvent } from 'react'",
  "import type { ComponentPropsWithoutRef } from 'react'",
  "import { ImageView } from './image-view'",
  "import { cn } from './lib/utils'",
  "import './image-uploader.css'",
  "type ImageUploaderSelectionSource = 'picker' | 'clipboard' | 'drop'",
  'export type ImageUploaderActionApi = {',
  'hasFile: boolean',
  'canPasteClipboardImage: boolean',
  'canCheck: boolean',
  'select: () => void',
  'paste: () => void',
  'close: () => void',
  'check: () => void',
  "export type ImageUploaderProps = Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'onChange'> & {",
  'file?: File | null',
  'onFileChange: (file: File | null) => void',
  'onActionsChange?: (actions: ImageUploaderActionApi) => void',
  'onCheck?: () => void',
  'title?: string',
  'description?: string',
  'clipboardSourceLabel?: string',
  "inputProps?: Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'onChange'>",
  "const DEFAULT_IMAGE_UPLOADER_TITLE = '上传图片'",
  "const DEFAULT_IMAGE_UPLOADER_DESCRIPTION = '拖放、选择或粘贴图片'",
  "const DEFAULT_IMAGE_UPLOADER_CLIPBOARD_SOURCE_LABEL = '来自剪贴板'",
  'const IMAGE_PREVIEW_REVOKE_DELAY_MS = 1000',
  'function canPreviewImageFile(file: File)',
  "return !file.type || file.type.startsWith('image/')",
  'type ImageUploaderPreview = {',
  'naturalWidth: number',
  'naturalHeight: number',
  'function isEditablePasteTarget(target: EventTarget | null)',
  'function createClipboardImageFile(blob: Blob, type = blob.type)',
  'function normalizePastedImageFile(file: File)',
  'function hasDraggedFile(dataTransfer: DataTransfer)',
  'function hasDraggedImage(dataTransfer: DataTransfer)',
  'function getDraggedImageFile(dataTransfer: DataTransfer)',
  'function canReadClipboardImage()',
  "typeof navigator !== 'undefined' && typeof navigator.clipboard?.read === 'function'",
  'function readClipboardImageFile()',
  'function loadImagePreview(file: File)',
  'function releaseImagePreview(preview: ImageUploaderPreview | null)',
  'export function ImageUploader',
  'file = null,',
  'onFileChange,',
  'onActionsChange,',
  'onCheck,',
  'const hasFile = Boolean(file)',
  'const [preview, setPreview] = useState<ImageUploaderPreview | null>(null)',
  'const [isDragActive, setIsDragActive] = useState(false)',
  'const canPasteClipboardImage = !hasFile && canReadClipboardImage()',
  'const [selectedSource, setSelectedSource] = useState<ImageUploaderSelectionSource | null>(null)',
  'const inputRef = useRef<HTMLInputElement | null>(null)',
  'const selectImageFile = useCallback(',
  'onFileChange(nextFile)',
  "void selectImageFile(normalizePastedImageFile(file), 'clipboard')",
  'const closeImageFile = useCallback(() => {',
  'void selectImageFile(null, null)',
  'const openFilePicker = useCallback(() => {',
  'inputRef.current?.click()',
  'const selectClipboardImageFile = useCallback(async () => {',
  'if (!canPasteClipboardImage) return',
  'const nextFile = await readClipboardImageFile().catch(() => null)',
  "void selectImageFile(nextFile, 'clipboard')",
  'const checkImageFile = useCallback(() => {',
  'if (!hasFile) return',
  'onCheck?.()',
  'const actions = useMemo<ImageUploaderActionApi>(() => ({',
  'canCheck: hasFile && Boolean(onCheck)',
  'select: openFilePicker',
  'paste: selectClipboardImageFile',
  'close: closeImageFile',
  'check: checkImageFile',
  'onActionsChange?.(actions)',
  'function handleRootClick(',
  'function handleRootKeyDown(',
  'function handleRootDragEnter(event: DragEvent<HTMLDivElement>)',
  'function handleRootDrop(event: DragEvent<HTMLDivElement>)',
  "void selectImageFile(nextFile, 'drop')",
  "className={cn('image-uploader', className)}",
  "data-drag-over={isDragActive ? 'true' : undefined}",
  "data-state={hasFile ? 'ready' : 'initial'}",
  'className="image-uploader__panel"',
  'ref={inputRef}',
  "className={cn('image-uploader__input', inputProps.className)}",
  "aria-label={inputProps['aria-label'] ?? title}",
  'type="file"',
  'onChange={handleInputChange}',
  'className="image-uploader__preview"',
  '<ImageView',
  'className="image-uploader__preview-view"',
  'src={preview.src}',
  'imageWidth={preview.naturalWidth}',
  'imageHeight={preview.naturalHeight}',
  'objectFit="contain"',
  '<span className="image-uploader__title">{title}</span>',
  "{!hasFile && selectedSource === 'clipboard' ? (",
  'image-uploader__source',
]) {
  assertIncludes(source, snippet, `ImageUploader source must include ${snippet}.`)
}

assert.equal(
  source.match(/navigator\.clipboard\.read\(\)/g)?.length ?? 0,
  1,
  'ImageUploader must read the clipboard only from the explicit paste action.',
)
assert.ok(
  !source.includes('hasClipboardImageFile') &&
    !source.includes('updateClipboardImageAvailability') &&
    !source.includes('setCanPasteClipboardImage') &&
    !source.includes("window.addEventListener('focus'") &&
    !source.includes("document.addEventListener('visibilitychange'") &&
    !source.includes('function handleRootFocus') &&
    !source.includes('function handleRootMouseEnter'),
  'ImageUploader must not inspect clipboard contents on mount, focus, visibility changes, or hover.',
)

assert.ok(
  !source.includes("from 'lucide-react'") &&
    !source.includes("from './glass-icon-button'") &&
    !source.includes('<GlassIconButton') &&
    !source.includes('uploadAction') &&
    !source.includes('ImageUploaderUploadAction') &&
    !source.includes('DEFAULT_IMAGE_UPLOADER_CLEAR_LABEL') &&
    !source.includes('DEFAULT_IMAGE_UPLOADER_SELECT_LABEL') &&
    !source.includes('DEFAULT_IMAGE_UPLOADER_PASTE_LABEL') &&
    !source.includes('image-uploader__actions') &&
    !source.includes('image-uploader__clear-action') &&
    !source.includes('image-uploader__upload-action') &&
    !source.includes('image-uploader__select-action') &&
    !source.includes('image-uploader__paste-action'),
  'ImageUploader runtime must not import, configure, or render bundled action buttons.',
)
assert.ok(
  /const actions = useMemo<ImageUploaderActionApi>\(\(\) => \(\{[\s\S]*?hasFile,[\s\S]*?canPasteClipboardImage,[\s\S]*?canCheck: hasFile && Boolean\(onCheck\),[\s\S]*?select: openFilePicker,[\s\S]*?paste: selectClipboardImageFile,[\s\S]*?close: closeImageFile,[\s\S]*?check: checkImageFile,[\s\S]*?\}\)/.test(source) &&
    /useEffect\(\(\) => \{[\s\S]*?onActionsChange\?\.\(actions\)[\s\S]*?\}, \[actions, onActionsChange\]\)/.test(source),
  'ImageUploader must expose select, paste, close, and check action functions through onActionsChange.',
)
assert.ok(
  /const nextPreview = await loadImagePreview\(nextFile\)[\s\S]*?replaceImagePreview\(nextPreview\)[\s\S]*?onFileChange\(nextFile\)/.test(source),
  'ImageUploader picker and clipboard paths must prepare preview metadata before notifying controlled file changes.',
)
assert.ok(
  /function canPreviewImageFile\(file: File\)[\s\S]*?file\.type\.startsWith\('image\/'\)/.test(source) &&
    /if \(!canPreviewImageFile\(file\)\)[\s\S]*?return Promise\.resolve\(null\)/.test(source) &&
    /if \(!nextPreview\)[\s\S]*?setSelectedSource\(null\)[\s\S]*?replaceImagePreview\(null\)[\s\S]*?return/.test(source),
  'ImageUploader must not create an ImageView preview or publish onFileChange when the selected file is not an image.',
)
assert.ok(
  /<div[\s\S]*?className=\{cn\('image-uploader', className\)\}[\s\S]*?data-state=\{hasFile \? 'ready' : 'initial'\}/.test(source),
  'ImageUploader root must stay a div upload zone.',
)
assert.ok(
  !source.includes('<label') &&
    !source.includes('</label>') &&
    !source.includes('htmlFor') &&
    !source.includes("ComponentPropsWithoutRef<'label'>") &&
    !source.includes('useId'),
  'ImageUploader must not use label/htmlFor for the root because it makes nested ImageView buttons inherit label behavior.',
)
assert.ok(
  source.includes('role={role}') &&
    source.includes('tabIndex={tabIndex}') &&
    !source.includes('role={role ??') &&
    !source.includes('tabIndex={tabIndex ??'),
  'ImageUploader must not default the root to a button role because caller-owned buttons provide explicit controls.',
)
assert.ok(
  !source.includes('className="image-uploader__preview-image"') &&
    !source.includes('<img') &&
    /<ImageView[\s\S]*?src=\{preview\.src\}[\s\S]*?objectFit="contain"/.test(source) &&
    source.includes('imageWidth={preview.naturalWidth}') &&
    source.includes('imageHeight={preview.naturalHeight}') &&
    source.includes('naturalWidth: image.naturalWidth') &&
    source.includes('naturalHeight: image.naturalHeight') &&
    !source.includes('showZoomButton'),
  'ImageUploader preview must decode image dimensions before notifying callers and pass them into ImageView.',
)
assert.ok(
  !source.includes('showRemoveButton') &&
    !source.includes('onRemove={closeImageFile}') &&
    !source.includes('className="image-view__remove"'),
  'ImageUploader must not delegate selected-image clearing to ImageView.',
)
assert.ok(
  !source.includes('export type ImageUploaderSource') &&
    !source.includes('source?:') &&
    !source.includes('source: ImageUploaderSource') &&
    !source.includes('source = null') &&
    !source.includes('fileName') &&
    !source.includes('Create OCR'),
  'ImageUploader must stay controlled without a public source API, file-name display API, or OCR actions.',
)

assertIncludes(rootBlock, '--image-uploader-panel-padding: 15px;', 'ImageUploader root must define the panel padding token.')
assertIncludes(rootBlock, 'display: grid;', 'ImageUploader root must use the OCR demo grid layout.')
assertIncludes(rootBlock, 'width: 100%;', 'ImageUploader root must occupy the available preview width before image decode.')
assertIncludes(rootBlock, 'place-items: center;', 'ImageUploader root must center the dashed panel.')
assertIncludes(rootBlock, 'isolation: isolate;', 'ImageUploader root must isolate the upload layout.')
assert.ok(
  !rootBlock.includes('border:') &&
    !/(^|\n)\s*padding:/.test(rootBlock) &&
    !/(^|\n)\s*gap:/.test(rootBlock) &&
    !rootBlock.includes('background:') &&
    !rootBlock.includes('min-height:') &&
    !rootBlock.includes('cursor:'),
  'ImageUploader root must not reserve built-in action-button layout.',
)
assertIncludes(panelBlock, 'position: relative;', 'ImageUploader dashed panel must position the hidden file input overlay.')
assertIncludes(panelBlock, 'display: grid;', 'ImageUploader dashed panel must use the OCR demo grid layout.')
assertIncludes(panelBlock, 'width: 100%;', 'ImageUploader dashed panel must occupy the available preview width.')
assertIncludes(panelBlock, 'min-height: 104px;', 'ImageUploader dashed panel must preserve the OCR demo upload height.')
assertIncludes(panelBlock, 'place-items: center;', 'ImageUploader dashed panel must center upload copy.')
assertIncludes(panelBlock, 'gap: 6px;', 'ImageUploader dashed panel must keep compact copy spacing inside the frame.')
assertIncludes(panelBlock, 'padding: var(--image-uploader-panel-padding);', 'ImageUploader dashed panel must use the shared panel padding token internally.')
assertIncludes(panelBlock, 'cursor: pointer;', 'ImageUploader dashed panel must look clickable in the initial state.')
assertIncludes(panelBlock, 'border: 1px dashed var(--color-border-emphasis, var(--color-border));', 'ImageUploader dashed panel must use the dashed emphasis token border.')
assertIncludes(panelBlock, 'border-radius: var(--radius);', 'ImageUploader dashed panel must use shared radius.')
assertIncludes(panelBlock, 'background: color-mix(in srgb, var(--color-bg-page) 58%, transparent);', 'ImageUploader dashed panel must use the OCR demo surface treatment.')
assertIncludes(inputBlock, 'position: absolute;', 'ImageUploader input must stay in the DOM for native file selection.')
assertIncludes(inputBlock, 'width: 1px;', 'ImageUploader input must be visually hidden without covering the panel.')
assertIncludes(inputBlock, 'height: 1px;', 'ImageUploader input must be visually hidden without covering the panel.')
assertIncludes(inputBlock, 'overflow: hidden;', 'ImageUploader input must not render native file input copy.')
assertIncludes(inputBlock, 'clip: rect(0 0 0 0);', 'ImageUploader input must be clipped out of view.')
assertIncludes(inputBlock, 'clip-path: inset(50%);', 'ImageUploader input must be clipped out of view.')
assertIncludes(inputBlock, 'pointer-events: none;', 'ImageUploader input must not receive hover or pointer hit testing.')
assertIncludes(inputBlock, 'white-space: nowrap;', 'ImageUploader input must not expose native file input text.')
assertIncludes(previewBlock, 'width: 100%;', 'ImageUploader preview must use the full available content width.')
assertIncludes(previewBlock, 'max-width: 100%;', 'ImageUploader preview must not exceed the padded component width.')
assertIncludes(previewBlock, 'place-items: center;', 'ImageUploader preview must center images smaller than the component.')
assertIncludes(previewViewBlock, '--image-uploader-preview-max-height: min(70vh, calc(100vw - 36px));', 'ImageUploader ImageView preview must keep the same viewport-height bound as the intrinsic img preview.')
assertIncludes(previewViewBlock, 'width: min(', 'ImageUploader ImageView preview frame must size to the strictest width constraint.')
assertIncludes(previewViewBlock, 'var(--image-uploader-preview-max-height) * var(--image-view-aspect-ratio)', 'ImageUploader ImageView preview must derive a max-height width cap from the real image aspect ratio.')
assert.ok(!previewViewBlock.includes('4 / 3'), 'ImageUploader preview must not inherit a default 4 / 3 image ratio.')
assertIncludes(previewViewBlock, 'border: 0;', 'ImageUploader ImageView preview must not add a nested preview border inside the upload panel.')
assertIncludes(previewViewBlock, 'background: transparent;', 'ImageUploader ImageView preview must preserve the upload panel surface.')
assertIncludes(previewImageBlock, 'display: block;', 'ImageUploader ImageView image must render without inline image gaps.')
assertIncludes(previewImageBlock, 'width: 100%;', 'ImageUploader ImageView image must fill the constrained preview frame.')
assertIncludes(previewImageBlock, 'height: 100%;', 'ImageUploader ImageView image must fill the constrained preview frame.')
assertIncludes(previewImageBlock, 'max-width: 100%;', 'ImageUploader ImageView image must not exceed the padded component width.')
assertIncludes(previewImageBlock, 'object-fit: contain;', 'ImageUploader preview image must show the whole uploaded image.')
assertIncludes(titleBlock, 'font-size: var(--font-size-base);', 'ImageUploader title must use base font size.')
assertIncludes(titleBlock, 'text-overflow: ellipsis;', 'ImageUploader initial title must truncate cleanly.')
assertIncludes(descriptionBlock, 'font-size: var(--font-size-xs);', 'ImageUploader description must use xs font size.')
assertIncludes(sourceBlock, 'color: var(--color-primary);', 'ImageUploader clipboard source must use primary color.')
assert.ok(
  !/(^|\n)\s*gap:/.test(readyBlock),
  'ImageUploader ready state must not keep built-in action-row spacing.',
)
assertIncludes(readyPanelBlock, 'padding: 0;', 'ImageUploader ready dashed panel must remove inner padding so the image uses the full frame.')
assertIncludes(readyPanelBlock, 'min-height: 0;', 'ImageUploader ready panel must let the selected image define the panel height.')
assertIncludes(readyPanelBlock, 'border-color: transparent;', 'ImageUploader ready dashed panel must hide the dashed border while preserving layout.')
assertIncludes(readyPanelBlock, 'cursor: default;', 'ImageUploader ready dashed panel must not look clickable for upload.')
assert.ok(
  !css.includes('.image-uploader__actions') &&
    !css.includes('.image-view__actions') &&
    !css.includes('.image-uploader__clear-action') &&
    !css.includes('.image-uploader__upload-action') &&
    !css.includes('.image-uploader__select-action') &&
    !css.includes('.image-uploader__paste-action') &&
    !css.includes('.image-uploader__clear {'),
  'ImageUploader CSS must not keep built-in action button selectors.',
)

assert.ok(registryItem, 'Root registry must include the @weimo/image-uploader item.')
assert.deepEqual(
  standaloneRegistry,
  registryItem,
  'registry/image-uploader.json must match registry.json payload.',
)
assert.deepEqual(
  registryItem.registryDependencies,
  ['@weimo/style', '@weimo/utils', '@weimo/image-view'],
  'ImageUploader registry item must depend on style, utils, and ImageView.',
)
assert.ok(
  !registryItem.dependencies || registryItem.dependencies.length === 0,
  'ImageUploader registry item must let ImageView own its package dependencies.',
)
for (const filePath of [
  'src/components/image-uploader.tsx',
  'src/components/image-uploader.css',
]) {
  assert.ok(
    registryItem.files.some((file) => file.path === filePath),
    `ImageUploader registry item must ship ${filePath}.`,
  )
}
for (const filePath of [
  'src/components/image-detail.tsx',
  'src/components/image-detail.css',
  'src/components/image-detail-view.tsx',
  'src/components/image-detail-view.css',
  'src/components/image-view.tsx',
  'src/components/image-view.css',
]) {
  assert.ok(
    !registryItem.files.some((file) => file.path === filePath),
    `ImageUploader registry item must not inline ${filePath}.`,
  )
}

for (const snippet of [
  "import { Check, Clipboard, FileImage, X } from 'lucide-react'",
  "import { useState } from 'react'",
  "import { GlassIconButton } from '../../components/glass-icon-button'",
  "import { ImageUploader, type ImageUploaderActionApi } from '../../components/image-uploader'",
  "id: 'image-uploader'",
  "summary: '受控图片上传区域，支持拖放、选择、粘贴和调用者自定义按钮'",
  'function ImageUploaderPreview()',
  'const [file, setFile] = useState<File | null>(null)',
  'const [actions, setActions] = useState<ImageUploaderActionApi | null>(null)',
  '<ImageUploader',
  'file={file}',
  'onFileChange={setFile}',
  'onActionsChange={setActions}',
  'onCheck={() => {}}',
  'className="image-uploader-docs-preview__actions"',
  '!actions?.hasFile ? (',
  'aria-label="选择文件"',
  'onClick={() => actions?.select()}',
  '<FileImage aria-hidden="true" />',
  'aria-label="粘贴图片"',
  'disabled={!actions?.canPasteClipboardImage}',
  'onClick={() => actions?.paste()}',
  '<Clipboard aria-hidden="true" />',
  ') : (',
  'aria-label="清除图片"',
  'onClick={() => actions?.close()}',
  '<X aria-hidden="true" />',
  'aria-label="确认图片"',
  'disabled={!actions?.canCheck}',
  'onClick={() => actions?.check()}',
  '<Check aria-hidden="true" />',
  'preview: () => <ImageUploaderPreview />',
]) {
  assertIncludes(docsDefinition, snippet, `ImageUploader docs must include ${snippet}.`)
}
assert.ok(
  /!actions\?\.hasFile \? \([\s\S]*?aria-label="选择文件"[\s\S]*?<FileImage aria-hidden="true" \/>[\s\S]*?aria-label="粘贴图片"[\s\S]*?<Clipboard aria-hidden="true" \/>[\s\S]*?\) : \([\s\S]*?aria-label="清除图片"[\s\S]*?<X aria-hidden="true" \/>[\s\S]*?aria-label="确认图片"[\s\S]*?<Check aria-hidden="true" \/>/.test(docsDefinition),
  'ImageUploader docs preview must show only select/paste in the empty state and only close/check after an image is selected.',
)
assert.ok(
  !docsDefinition.includes('imageUploaderPreviewSvg') &&
    !docsDefinition.includes('imageUploaderPreviewFile') &&
    !docsDefinition.includes("new File([") &&
    !docsDefinition.includes('server.png'),
  'ImageUploader docs preview must start empty without a bundled preview image.',
)
assert.ok(
  !docsDefinition.includes('fileName={') &&
    !docsDefinition.includes('...labelProps') &&
    !docsDefinition.includes('ComponentPropsWithoutRef<"label">') &&
    !docsDefinition.includes('source="clipboard"') &&
    !docsDefinition.includes('onFileChange={() => {}}'),
  'ImageUploader docs must not expose source, label, or bundled button props.',
)
