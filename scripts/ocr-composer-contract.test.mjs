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

function registryFilePaths(item) {
  return new Set(item.files.map((file) => file.path))
}

function cssBlockFor(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))

  assert.ok(match, `${selector} block must exist.`)

  return match[1]
}

const packageJson = readJson('package.json')
const source = readProjectFile('src/components/ocr-composer.tsx')
const css = readProjectFile('src/components/ocr-composer.css')
const manifestSource = readProjectFile('src/docs/components-manifest.ts')
const definitionsIndexSource = readProjectFile('src/docs/component-definitions/index.ts')
const definitionSource = readProjectFile('src/docs/component-definitions/ocr-composer.tsx')
const registry = readJson('registry.json')
const standaloneRegistryItem = readJson('registry/ocr-composer.json')
const rootRegistryItem = registry.items.find((item) => item.name === 'ocr-composer')

assert.ok(
  packageJson.scripts?.test?.includes('node scripts/ocr-composer-contract.test.mjs'),
  'package test script must run the OcrComposer contract.',
)
assert.equal(
  packageJson.exports?.['./components/ocr-composer'],
  './src/components/ocr-composer.tsx',
  'package.json must expose ./components/ocr-composer.',
)

for (const snippet of [
  "import { Check, Clipboard, FileImage, X } from 'lucide-react'",
  "import { useCallback, useEffect, useState } from 'react'",
  "import type { ComponentPropsWithoutRef, ReactNode } from 'react'",
  "import { CardTopBar } from './card-top-bar'",
  "import { ComposerShell } from './composer-shell'",
  "import { GlassIconButton } from './glass-icon-button'",
  "import { GhostIconButton } from './ghost-icon-button'",
  "import { ImageUploader, type ImageUploaderActionApi, type ImageUploaderProps } from './image-uploader'",
  "import { TagBar } from './tag-bar'",
  "import { getCardSurfaceClassName } from './card-surface'",
  "import { cn } from './lib/utils'",
  "import './ocr-composer.css'",
  'export type OcrComposerDraft = {',
  'file: File',
  'tags: string[]',
  "editTitle: '新建OCR任务'",
  'export type OcrComposerProps = Omit<',
  "ComponentPropsWithoutRef<'article'>",
  'clientId: string',
  'file?: File | null',
  'onFileChange: (file: File | null) => void',
  'onSave?: (draft: OcrComposerDraft) => void',
  'onTagsChange?: (tags: string[]) => void',
  'imageUploaderProps?: OcrComposerImageUploaderProps',
  'const handleComposerClose = useCallback(() => {',
  '}, [disabled, isClosing, onCancel])',
  'function handleComposerDocumentKeyDown(event: globalThis.KeyboardEvent)',
  "if (event.defaultPrevented || event.key !== 'Escape') return",
  'if (!canUseActions) return',
  'event.preventDefault()',
  'if (hasFile) {',
  'onFileChange(null)',
  'handleComposerClose()',
  "document.addEventListener('keydown', handleComposerDocumentKeyDown)",
  "return () => document.removeEventListener('keydown', handleComposerDocumentKeyDown)",
  '}, [canUseActions, handleComposerClose, hasFile, onFileChange])',
  'const composerEditActionSlot = (',
  '<GhostIconButton',
  'aria-label={resolvedLabels.cancel}',
  'className="weimo-card__header-icon-button"',
  'const composerActionSlot = (',
  'className="weimo-ocr-composer__actions"',
  'role="group"',
  'aria-label={resolvedLabels.imageToolbar}',
  '<GlassIconButton',
  'aria-label={resolvedLabels.selectImage}',
  'disabled={!canUseActions || !imageActions}',
  'onClick={() => imageActions?.select()}',
  'onMouseDown={(event) => event.preventDefault()}',
  '<FileImage aria-hidden="true" />',
  'aria-label={resolvedLabels.pasteImage}',
  'disabled={!canUseActions || !imageActions?.canPasteClipboardImage}',
  'onClick={() => imageActions?.paste()}',
  '<Clipboard aria-hidden="true" />',
  'aria-label={resolvedLabels.clearImage}',
  'onClick={() => imageActions?.close()}',
  '<X aria-hidden="true" />',
  'aria-label={resolvedLabels.save}',
  'disabled={!canUseActions}',
  'onClick={handleSave}',
  '<Check aria-hidden="true" />',
  '<ImageUploader',
  "className={cn('weimo-ocr-composer__uploader', imageUploaderClassName)}",
  'file={file}',
  'onActionsChange={setImageActions}',
  'onFileChange={onFileChange}',
  'className="weimo-card-editable__tags weimo-ocr-composer__tags"',
  'className="weimo-ocr-composer__tag-row"',
  'aria-label={resolvedLabels.toolbar}',
  'role="group"',
  '<TagBar',
  'className="weimo-ocr-composer__tag-bar"',
  '{composerActionSlot}',
  '<ComposerShell',
  'className="weimo-ocr-composer"',
  'data-client-id={clientId}',
  'isClosing={isClosing}',
  'onExitAnimationEnd={onExitAnimationEnd}',
  'onViewTransitionEnd={onViewTransitionEnd}',
  '</ComposerShell>',
]) {
  assert.ok(source.includes(snippet), `OcrComposer source must include: ${snippet}`)
}

for (const snippet of [
  "from './coss/button'",
  "from './coss/toolbar'",
  "from './bottom-bar'",
  "from './card-tool-bar'",
  "from './glass-surface-model'",
  '<Toolbar',
  '<ToolbarButton',
  '<BottomBar',
  '<CardToolBar',
  'rightSlot={composerActionSlot}',
  'toolbarSlot={',
  'disabled={disabled || isClosing || !file}',
  'function handleComposerKeyDown',
  'onKeyDown={handleComposerKeyDown}',
  "import { useCallback, useEffect, useRef, useState } from 'react'",
  'const OCR_COMPOSER_TRANSITION_MS = 180',
  'function finishExitAnimation(cancelled: boolean)',
  'function handleTransitionEnd(event: TransitionEvent<HTMLDivElement>)',
  "className=\"weimo-card-composer weimo-ocr-composer\"",
  "className=\"weimo-card-composer__frame\"",
  "import './card-composer.css'",
]) {
  assert.ok(!source.includes(snippet), `OcrComposer source must not include: ${snippet}`)
}

const actionSlotStart = source.indexOf('const composerActionSlot = (')
const returnStart = source.indexOf('return (', actionSlotStart)
const actionSlotSource = source.slice(actionSlotStart, returnStart)

assert.match(
  actionSlotSource,
  /: \(\s*<>\s*<GlassIconButton[\s\S]*aria-label=\{resolvedLabels\.clearImage\}[\s\S]*<\/GlassIconButton>\s*<GlassIconButton[\s\S]*aria-label=\{resolvedLabels\.save\}[\s\S]*<Check aria-hidden="true" \/>[\s\S]*<\/GlassIconButton>\s*<\/>\s*\)\}/,
  'OcrComposer check action must render only in the has-file branch.',
)

for (const snippet of [
  '.weimo-ocr-composer-card {',
  '.weimo-ocr-composer__content {',
  'display: grid;',
  'flex: 1 1 auto;',
  '.weimo-ocr-composer__uploader.image-uploader {',
  'align-self: stretch;',
  '.weimo-ocr-composer__tag-row {',
  'display: flex;',
  'flex-wrap: wrap;',
  'align-items: center;',
  'gap: var(--space-tag-gap);',
  '.weimo-ocr-composer__tag-bar {',
  'flex: 1 1 min(100%, 240px);',
  '.weimo-ocr-composer__tag-bar .tag-bar__chips {',
  'align-items: center;',
  '.weimo-ocr-composer__actions {',
  'display: flex;',
  'flex: 0 0 auto;',
  'align-items: center;',
  'margin-inline-start: auto;',
  'gap: 8px;',
]) {
  assert.ok(css.includes(snippet), `OcrComposer CSS must include: ${snippet}`)
}
assert.ok(
  !cssBlockFor(css, '.weimo-ocr-composer-card').includes('padding-block-end'),
  'OcrComposer card shell must not reserve a separate bottom button bar.',
)
assert.ok(
  !css.includes('.weimo-ocr-composer__bottom-bar'),
  'OcrComposer CSS must not keep a separate bottom button bar.',
)
assert.ok(
  !cssBlockFor(css, '.weimo-ocr-composer-card').includes('min-height'),
  'OcrComposer card shell must not set a fixed minimum height.',
)
assert.ok(
  !cssBlockFor(css, '.weimo-ocr-composer__uploader .image-uploader__panel').includes('min-height'),
  'OcrComposer uploader panel must not set a fixed minimum height.',
)

for (const snippet of [
  "id: 'ocr-composer'",
  "name: 'OcrComposer'",
  "registryName: 'ocr-composer'",
  "packageExport: './components/ocr-composer'",
  "group: 'media-ocr'",
]) {
  assert.ok(manifestSource.includes(snippet), `OcrComposer manifest must include: ${snippet}`)
}

for (const snippet of [
  "import { ocrComposerDefinition } from './ocr-composer'",
  "'ocr-composer': ocrComposerDefinition",
]) {
  assert.ok(definitionsIndexSource.includes(snippet), `OcrComposer docs index must include: ${snippet}`)
}

for (const snippet of [
  "import { OcrComposer } from '../../components/ocr-composer'",
  "import type { OcrComposerDraft } from '../../components/ocr-composer'",
  "id: 'ocr-composer'",
  "summary: '复用 CardComposer 外观的 OCR 图片上传草稿壳层，正文区域替换为 ImageUploader'",
  'preview: () => <OcrComposerDemo />',
]) {
  assert.ok(definitionSource.includes(snippet), `OcrComposer docs must include: ${snippet}`)
}

assert.ok(rootRegistryItem, 'Root registry must include the @weimo/ocr-composer item.')
assert.deepEqual(
  standaloneRegistryItem,
  rootRegistryItem,
  'registry/ocr-composer.json must match registry.json payload.',
)
assert.deepEqual(
  rootRegistryItem.registryDependencies,
  [
    '@weimo/style',
    '@weimo/utils',
    '@weimo/card-composer',
    '@weimo/image-uploader',
    '@weimo/glass-icon-button',
  ],
  'OcrComposer registry item must install composer shell, uploader, utils, and glass action controls.',
)
assert.deepEqual(
  rootRegistryItem.dependencies,
  ['lucide-react'],
  'OcrComposer registry item must install lucide icons.',
)
assert.deepEqual(
  registryFilePaths(rootRegistryItem),
  new Set([
    'src/components/ocr-composer.tsx',
    'src/components/ocr-composer.css',
  ]),
  'OcrComposer registry item must ship only its component and styles.',
)
