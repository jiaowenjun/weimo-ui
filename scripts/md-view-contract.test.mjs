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

function assertNoProjectFile(relativePath) {
  assert.ok(!existsSync(join(root, relativePath)), `${relativePath} must not exist.`)
}

function cssBlockFor(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{(?<block>[^}]*)\\}`))

  assert.ok(match?.groups?.block, `App.css must include ${selector}.`)

  return match.groups.block
}

const componentSource = readProjectFile('src/components/md-view.tsx')
const mdViewCssSource = readProjectFile('src/components/md-view.css')
const manifestSource = readProjectFile('src/docs/components-manifest.ts')
const definitionSource = readProjectFile('src/docs/component-definitions/md-view.tsx')
const definitionsIndexSource = readProjectFile('src/docs/component-definitions/index.ts')
const cssSource = readProjectFile('src/App.css')
const packageJson = JSON.parse(readProjectFile('package.json'))
const registryJson = JSON.parse(readProjectFile('registry.json'))
const previewFrameBlock = cssBlockFor(cssSource, '.md-view-docs-preview__frame')
const previewMeasureBlock = cssBlockFor(cssSource, '.md-view-docs-preview__measure')
const previewMeasureValueBlock = cssBlockFor(cssSource, '.md-view-docs-preview__measure-value')
const previewEditorViewportBlock = cssBlockFor(
  cssSource,
  '.md-view-docs-preview__surface .md-editor__viewport',
)
const mdViewEditorLayerBlock = cssBlockFor(
  mdViewCssSource,
  '.md-view__editor-layer',
)
const mdViewMarkdownBlock = cssBlockFor(
  mdViewCssSource,
  '.md-view > .weimo-card-markdown',
)
const mdViewKatexBlock = cssBlockFor(
  mdViewCssSource,
  '.md-view > .weimo-card-markdown .katex',
)
const mdViewParagraphBlock = cssBlockFor(
  mdViewCssSource,
  '.md-view > .weimo-card-markdown .weimo-card-markdown__p',
)

for (const snippet of [
  'forwardRef,',
  'lazy,',
  'Suspense,',
  'useImperativeHandle,',
  "import type { MdEditorHandle, MdEditorProps } from './md-editor'",
  "import('./md-editor')",
  'const MdEditor = lazy(',
  '<Suspense fallback={null}>',
  "import { MdRender, type MdRenderProps } from './md-render'",
  "import { normalizeCenteredQuoteSyntax, restoreCenteredQuoteSyntax } from './markdown-centered-quote'",
  "import remarkGfm from 'remark-gfm'",
  "import remarkMath from 'remark-math'",
  "import remarkParse from 'remark-parse'",
  "import remarkStringify from 'remark-stringify'",
  "import { unified } from 'unified'",
  "import './md-view.css'",
  "export type MdViewMode = 'view' | 'edit'",
  'const mdViewMarkdownFormatter = unified()',
  '.use(remarkParse)',
  '.use(remarkGfm)',
  '.use(remarkMath)',
  '.use(remarkStringify',
  "bullet: '-'",
  'fences: true',
  'function formatMdViewMarkdown(markdown: string)',
  'normalizeCenteredQuoteSyntax(markdown)',
  'mdViewMarkdownFormatter.processSync',
  'restoreCenteredQuoteSyntax(formattedMarkdown)',
  "replace(/\\n$/, '')",
  'preloadEditor?: boolean',
  'export type MdViewHandle',
  "convertSelectionToInlineMath: MdEditorHandle['convertSelectionToInlineMath']",
  "formatContent: MdEditorHandle['formatContent']",
  'getContentHeight: () => number',
  'export type MdViewProps',
  'mode: MdViewMode',
  'value: string',
  'onChange?: (markdown: string) => void',
  'editorBottomSafeArea?: number | string',
  "renderProps?: Omit<MdRenderProps, 'content' | 'className'>",
  "editorProps?: Omit<MdEditorProps, 'value' | 'onChange' | 'className'>",
  'forwardRef<MdViewHandle, MdViewProps>(function MdView',
  'const editorRef = useRef<MdEditorHandle | null>(null)',
  'const renderRef = useRef<HTMLDivElement | null>(null)',
  'const previousModeRef = useRef<MdViewMode>(mode)',
  "const showEditor = mode === 'edit'",
  'const shouldMountEditor = showEditor || preloadEditor',
  'const editorAutoFocus = editorProps?.autoFocus ?? showEditor',
  "const editorAutoFocusPosition = editorProps?.autoFocusPosition ?? 'end'",
  'const editorImageRenderer = editorProps?.renderImage ?? renderProps?.renderImage',
  'const editorImageSrcResolver = editorProps?.resolveImageSrc ?? renderProps?.resolveImageSrc',
  'useEffect(() => {',
  'const previousMode = previousModeRef.current',
  'previousModeRef.current = mode',
  "previousMode !== 'edit'",
  "mode !== 'view'",
  '!onChange',
  'const formattedMarkdown = formatMdViewMarkdown(value)',
  'if (formattedMarkdown !== value) {',
  'onChange(formattedMarkdown)',
  '}, [mode, onChange, value])',
  'function measureRenderContentHeight()',
  'render.scrollHeight',
  'render.getBoundingClientRect().height',
  'useImperativeHandle(',
  'getContentHeight',
  'editorRef.current?.convertSelectionToInlineMath() ?? false',
  'editorRef.current?.formatContent(options) ?? value',
  'editorRef.current?.getContentHeight()',
  'measureRenderContentHeight()',
  'const resolvedEditorBottomSafeArea =',
  "typeof editorBottomSafeArea === 'number'",
  '`${editorBottomSafeArea}px`',
  'const editorStyle',
  'showEditor',
  "'--md-view-editor-bottom-safe-area': resolvedEditorBottomSafeArea",
  'style={editorStyle}',
  "className={cn('md-view', className)}",
  'data-mode={mode}',
  "data-preloading-editor={preloadEditor && !showEditor ? 'true' : undefined}",
  '{shouldMountEditor ? (',
  'className="md-view__editor-layer"',
  'aria-hidden={!showEditor}',
  'hidden={!showEditor}',
  '<MdEditor',
  'ref={editorRef}',
  'autoFocus={editorAutoFocus}',
  'autoFocusPosition={editorAutoFocusPosition}',
  'renderImage={editorImageRenderer}',
  'resolveImageSrc={editorImageSrcResolver}',
  'value={value}',
  'onChange={onChange}',
  '{...editorProps}',
  '{showEditor ? null : (',
  '<MdRender',
  'ref={renderRef}',
  'content={value}',
  '{...renderProps}',
]) {
  assert.ok(componentSource.includes(snippet), `MdView source must include ${snippet}.`)
}

for (const [block, snippet, message] of [
  [
    mdViewEditorLayerBlock,
    'display: flex;',
    'MdView editor layer must become a flex container so MdEditor can fill it in Card edit mode.',
  ],
  [
    mdViewEditorLayerBlock,
    'width: 100%;',
    'MdView editor layer must fill the available inline width before editor content grows.',
  ],
  [
    mdViewEditorLayerBlock,
    'min-width: 0;',
    'MdView editor layer must still be allowed to shrink in narrow containers.',
  ],
  [
    mdViewEditorLayerBlock,
    'flex: 1 1 auto;',
    'MdView editor layer must fill the flex parent instead of sizing to short editor content.',
  ],
  [
    mdViewEditorLayerBlock,
    'min-height: 0;',
    'MdView editor layer must preserve edit-mode vertical shrink behavior.',
  ],
]) {
  assert.ok(block.includes(snippet), message)
}

for (const [block, snippet, message] of [
  [
    mdViewMarkdownBlock,
    'width: 100%;',
    'MdView rendered markdown must fill the flex parent during Card exit animation.',
  ],
  [
    mdViewMarkdownBlock,
    'min-width: 0;',
    'MdView rendered markdown must still be allowed to shrink in narrow containers.',
  ],
  [
    mdViewMarkdownBlock,
    'flex: 1 1 auto;',
    'MdView rendered markdown must not size to short content while Card keeps edit layout for exit animation.',
  ],
  [
    mdViewParagraphBlock,
    'white-space: break-spaces;',
    'MdView rendered paragraphs must preserve spaces with the same line-breaking model as ProseMirror.',
  ],
  [
    mdViewMarkdownBlock,
    'font-variant-ligatures: none;',
    'MdView rendered markdown must disable ligatures to match ProseMirror text measurement.',
  ],
  [
    mdViewMarkdownBlock,
    'font-feature-settings: "liga" 0;',
    'MdView rendered markdown must match the ProseMirror ligature feature setting.',
  ],
  [
    mdViewKatexBlock,
    'display: inline-block;',
    'MdView inline KaTeX must use the same atomic inline box model as editor math nodes.',
  ],
  [
    mdViewKatexBlock,
    'white-space: normal;',
    'MdView inline KaTeX must reset preserved prose whitespace like a non-editable editor math node.',
  ],
]) {
  assert.ok(block.includes(snippet), message)
}

assert.ok(
  !mdViewMarkdownBlock.includes('white-space:'),
  'MdView rendered markdown container must collapse ReactMarkdown structural whitespace between block nodes.',
)

assert.ok(
  componentSource.includes("MdView.displayName = 'MdView'"),
  'MdView forwardRef component must preserve a displayName.',
)

assert.ok(
  !componentSource.includes('useState') &&
    !componentSource.includes('defaultMode') &&
    !componentSource.includes('setMode') &&
    !componentSource.includes('onEnterEdit') &&
    !componentSource.includes('handleEnterEdit') &&
    !componentSource.includes('onDoubleClick'),
  'MdView component must not own mode state or card edit-entry behavior.',
)

assert.ok(
  !componentSource.includes("import { MdEditor") &&
    componentSource.includes("import type { MdEditorHandle, MdEditorProps } from './md-editor'"),
  'MdView must keep MdEditor types static while loading the runtime component on demand.',
)
assert.ok(
  componentSource.indexOf("const showEditor = mode === 'edit'") <
    componentSource.indexOf('const shouldMountEditor = showEditor || preloadEditor'),
  'MdView must derive editor preloading from controlled mode before rendering.',
)
assert.ok(
  componentSource.indexOf('const previousMode = previousModeRef.current') <
    componentSource.indexOf("previousMode !== 'edit'") &&
    componentSource.indexOf("previousMode !== 'edit'") <
      componentSource.indexOf('const formattedMarkdown = formatMdViewMarkdown(value)'),
  'MdView must only format markdown after the controlled mode changes from edit to view.',
)
assert.ok(
  componentSource.indexOf('const formattedMarkdown = formatMdViewMarkdown(value)') <
    componentSource.indexOf('onChange(formattedMarkdown)') &&
    componentSource.indexOf('if (formattedMarkdown !== value) {') <
      componentSource.indexOf('onChange(formattedMarkdown)'),
  'MdView must only publish formatted markdown when remark-stringify changes the current value.',
)
assert.ok(
  componentSource.indexOf('const shouldMountEditor = showEditor || preloadEditor') <
    componentSource.indexOf('const editorAutoFocus = editorProps?.autoFocus ?? showEditor'),
  'MdView must derive its default autoFocus from the visible editor state while allowing callers to override it.',
)
assert.ok(
  componentSource.indexOf('{...editorProps}') <
    componentSource.indexOf('autoFocus={editorAutoFocus}'),
  'MdView must apply resolved editor focus defaults after spreading editorProps so undefined values still fall back to showEditor.',
)
assert.ok(
  componentSource.indexOf('hidden={!showEditor}') <
    componentSource.indexOf('            <MdEditor'),
  'MdView must hide the preloaded MdEditor layer before the editor subtree mounts.',
)
assert.ok(
  componentSource.indexOf('{showEditor ? null : (') <
    componentSource.indexOf('        <MdRender'),
  'MdView must keep MdRender visible while preloading the editor.',
)

assert.ok(
  manifestSource.includes("id: 'md-view'") &&
    manifestSource.includes("name: 'MdView'") &&
    manifestSource.includes("registryName: 'md-view'") &&
    manifestSource.includes("packageExport: './components/md-view'") &&
    manifestSource.includes('registry: true') &&
    !manifestSource.includes("internalGroup: 'editor'"),
  'components-manifest.ts must include MdView as a public registry component.',
)

assert.ok(
  definitionsIndexSource.includes("import { mdViewDefinition } from './md-view'") &&
    definitionsIndexSource.includes("'md-view': mdViewDefinition"),
  'component-definitions/index.ts must register mdViewDefinition.',
)

for (const snippet of [
  "import { useLayoutEffect, useRef, useState } from 'react'",
  "import { MdView, type MdViewHandle, type MdViewMode } from '../../components/md-view'",
  "import { TextButton } from '../../components/text-button'",
  "import { mdRenderSample } from './markdown-sample'",
  "const [mode, setMode] = useState<MdViewMode>('view')",
  'const [markdown, setMarkdown] = useState(initialMarkdown)',
  'const mdViewRef = useRef<MdViewHandle | null>(null)',
  'const previewSurfaceRef = useRef<HTMLDivElement | null>(null)',
  'const [measuredContentHeight, setMeasuredContentHeight] = useState<number | null>(null)',
  'useLayoutEffect(() => {',
  'const nextHeight = mdViewRef.current?.getContentHeight()',
  'Number.isFinite(nextHeight)',
  'Math.round(nextHeight)',
  'new ResizeObserver',
  'previewSurfaceRef.current',
  '<TextButton',
  "mode === 'view' ? '切到编辑' : '切到展示'",
  "aria-label={mode === 'view' ? '切换到 MdView 编辑态' : '切换到 MdView 展示态'}",
  'className="md-view-docs-preview__measure"',
  'className="md-view-docs-preview__measure-label"',
  'className="md-view-docs-preview__measure-value"',
  'aria-live="polite"',
  '<output',
  '内容高度',
  "{measuredContentHeight === null ? '--' : `${measuredContentHeight}px`}",
  '<MdView',
  'ref={mdViewRef}',
  'editorBottomSafeArea={100}',
  "editorProps={{ placeholder: '写点什么...' }}",
  'mode={mode}',
  'value={markdown}',
  'onChange={setMarkdown}',
  'ref={previewSurfaceRef}',
  'preview: () => <MdViewDemo />',
  'className="md-view-docs-preview__raw"',
  'className="md-view-docs-preview__raw-label"',
  'className="md-view-docs-preview__raw-content"',
  'Markdown 原始内容',
  '<pre',
  '{markdown}',
]) {
  assert.ok(definitionSource.includes(snippet), `MdView docs definition must include ${snippet}.`)
}
assert.ok(
  !definitionSource.includes("import { Button } from '../../components/coss/button'") &&
    !/<Button\b/.test(definitionSource),
  'MdView docs mode toggle must not use coss Button.',
)

for (const dependencyName of ['remark-parse', 'remark-stringify', 'unified']) {
  assert.ok(
    Object.hasOwn(packageJson.dependencies ?? {}, dependencyName),
    `package.json must declare ${dependencyName} because MdView imports it directly.`,
  )
}

for (const selector of [
  '.md-view-docs-preview',
  '.md-view-docs-preview__toolbar',
  '.md-view-docs-preview__frame',
  '.md-view-docs-preview__measure',
  '.md-view-docs-preview__measure-label',
  '.md-view-docs-preview__measure-value',
  '.md-view-docs-preview__surface',
  '.md-view-docs-preview__surface .md-editor__viewport',
  '.md-view-docs-preview__raw',
  '.md-view-docs-preview__raw-label',
  '.md-view-docs-preview__raw-content',
]) {
  assert.ok(cssSource.includes(selector), `App.css must include ${selector}.`)
}

for (const [block, snippet, message] of [
  [
    previewFrameBlock,
    'max-height:',
    'MdView preview frame must let display and edit states grow to content height.',
  ],
  [
    previewFrameBlock,
    'overflow: auto;',
    'MdView preview frame must not scroll inside its shared frame.',
  ],
  [
    previewEditorViewportBlock,
    'min-height: min(220px',
    'MdView preview editor viewport must not force the old fixed preview height.',
  ],
  [
    previewEditorViewportBlock,
    'max-height: min(220px',
    'MdView preview editor viewport must not clamp to the old fixed preview height.',
  ],
]) {
  assert.ok(!block.includes(snippet), message)
}

for (const [block, snippet, message] of [
  [
    previewMeasureBlock,
    'border-bottom: 1px solid var(--color-border-divider);',
    'MdView preview measurement row must stay visually attached to the preview frame.',
  ],
  [
    previewMeasureBlock,
    'color: var(--color-text-secondary);',
    'MdView preview measurement row must use muted supporting text.',
  ],
  [
    previewMeasureValueBlock,
    'font-variant-numeric: tabular-nums;',
    'MdView preview measurement value must use tabular numerals so height changes do not jitter.',
  ],
  [
    previewMeasureValueBlock,
    'color: var(--color-text-primary);',
    'MdView preview measurement value must be readable as the primary measured value.',
  ],
  [
    previewEditorViewportBlock,
    'min-height: 0;',
    'MdView preview editor viewport must neutralize MdEditor minimum height so the shared frame can shrink to content.',
  ],
  [
    previewEditorViewportBlock,
    'max-height: none;',
    'MdView preview editor viewport must neutralize MdEditor max height so the shared frame grows with content.',
  ],
  [
    previewEditorViewportBlock,
    'padding-block-end: var(--md-view-editor-bottom-safe-area, 100px);',
    'MdView preview editor viewport must reserve a caller-configurable bottom safe area below the final cursor line for future toolbar placement.',
  ],
]) {
  assert.ok(block.includes(snippet), message)
}

const previewRawBlock = cssBlockFor(cssSource, '.md-view-docs-preview__raw')
const previewRawLabelBlock = cssBlockFor(cssSource, '.md-view-docs-preview__raw-label')
const previewRawContentBlock = cssBlockFor(cssSource, '.md-view-docs-preview__raw-content')

assert.ok(
  previewRawBlock.includes('display: grid;') &&
    previewRawBlock.includes('gap: 6px;') &&
    previewRawBlock.includes('padding: 10px 12px 12px;') &&
    previewRawBlock.includes('border-top: 1px solid var(--color-border-divider);'),
  'App.css must place the MdView raw markdown panel inside the preview frame.',
)
assert.ok(
  previewRawLabelBlock.includes('color: var(--color-text-secondary);') &&
    previewRawLabelBlock.includes('font-size: 12px;'),
  'App.css must keep the MdView raw markdown label visually secondary.',
)
assert.ok(
  previewRawContentBlock.includes('overflow: auto;') &&
    previewRawContentBlock.includes('white-space: pre-wrap;') &&
    previewRawContentBlock.includes('font-family:') &&
    previewRawContentBlock.includes('font-size: 12px;'),
  'App.css must render the MdView raw markdown content as readable wrapped source text.',
)

assert.ok(
  packageJson.scripts?.test?.includes('scripts/md-view-contract.test.mjs'),
  'package.json test script must run md-view-contract.test.mjs.',
)
assert.ok(
  packageJson.exports?.['./components/md-view'] === './src/components/md-view.tsx',
  'package.json must expose ./components/md-view.',
)
assert.ok(
  registryJson.items.some((item) => item.name === 'md-view'),
  'registry.json must include md-view item.',
)
assert.ok(
  existsSync(join(root, 'registry/md-view.json')),
  'registry/md-view.json must exist for public MdView.',
)
