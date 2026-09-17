import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { inflateSync } from 'node:zlib'

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

function constSingleLineStringValue(source, name) {
  const match = source.match(new RegExp(`const ${name} = '([^']*)'`))
  assert.ok(match, `${name} single-line string constant must exist.`)

  return match[1]
}

function assertDecodablePngDataUrl(dataUrl, message) {
  assert.ok(dataUrl.startsWith('data:image/png;base64,'), `${message} must be a PNG data URL.`)

  const png = Buffer.from(dataUrl.slice('data:image/png;base64,'.length), 'base64')
  const pngSignature = '89504e470d0a1a0a'

  assert.equal(png.subarray(0, 8).toString('hex'), pngSignature, `${message} must have a PNG signature.`)

  const idatChunks = []
  let offset = 8
  let sawIhdr = false
  let sawIend = false

  while (offset < png.length) {
    assert.ok(offset + 8 <= png.length, `${message} PNG chunk header must be complete.`)

    const length = png.readUInt32BE(offset)
    offset += 4
    const type = png.subarray(offset, offset + 4).toString('ascii')
    offset += 4

    assert.ok(offset + length + 4 <= png.length, `${message} PNG ${type} chunk must be complete.`)

    const data = png.subarray(offset, offset + length)
    offset += length
    offset += 4

    if (type === 'IHDR') sawIhdr = true
    if (type === 'IDAT') idatChunks.push(data)
    if (type === 'IEND') {
      sawIend = true
      assert.equal(offset, png.length, `${message} PNG must not contain trailing bytes after IEND.`)
      break
    }
  }

  assert.ok(sawIhdr, `${message} PNG must include IHDR.`)
  assert.ok(idatChunks.length > 0, `${message} PNG must include IDAT image data.`)
  assert.ok(sawIend, `${message} PNG must include IEND.`)
  assert.ok(inflateSync(Buffer.concat(idatChunks)).length > 0, `${message} PNG image data must inflate.`)
}

const detailPageSource = readProjectFile('src/docs/pages/component-detail-page.tsx')
const componentDocsSource = readProjectFile('src/docs/component-docs.tsx')
const shareCardDefinitionSource = readProjectFile('src/docs/component-definitions/share-card.tsx')
const mdRenderDefinitionSource = readProjectFile('src/docs/component-definitions/md-render.tsx')
const imageViewDefinitionSource = readProjectFile('src/docs/component-definitions/image-view.tsx')
const glassIconButtonDefinitionSource = readProjectFile('src/docs/component-definitions/glass-icon-button.tsx')
const ghostIconButtonDefinitionSource = readProjectFile('src/docs/component-definitions/ghost-icon-button.tsx')
const textButtonDefinitionSource = readProjectFile('src/docs/component-definitions/text-button.tsx')
const borderColorDefinitionSource = readProjectFile('src/docs/component-definitions/border-color.tsx')
const componentDefinitionsSource = readProjectFile('src/docs/component-definitions/card.tsx') +
  readProjectFile('src/docs/component-definitions/share-card.tsx') +
  readProjectFile('src/docs/component-definitions/canvas-transparency.tsx') +
  mdRenderDefinitionSource +
  readProjectFile('src/docs/component-definitions/md-view.tsx') +
  imageViewDefinitionSource +
  readProjectFile('src/docs/component-definitions/glass-surface.tsx') +
  readProjectFile('src/docs/component-definitions/tag-picker.tsx') +
  readProjectFile('src/docs/component-definitions/tag-bar.tsx') +
  readProjectFile('src/docs/component-definitions/stat-group.tsx') +
  readProjectFile('src/docs/component-definitions/heatmap.tsx') +
  glassIconButtonDefinitionSource +
  ghostIconButtonDefinitionSource +
  textButtonDefinitionSource +
  borderColorDefinitionSource +
  readProjectFile('src/docs/component-definitions/menu.tsx') +
  readProjectFile('src/docs/component-definitions/md-editor.tsx') +
  readProjectFile('src/docs/component-definitions/tag-tree.tsx') +
  readProjectFile('src/docs/component-definitions/top-bar.tsx') +
  readProjectFile('src/docs/component-definitions/sidebar.tsx') +
  readProjectFile('src/docs/component-definitions/float-bar.tsx') +
  readProjectFile('src/docs/component-definitions/bottom-bar.tsx') +
  readProjectFile('src/docs/component-definitions/card-top-bar.tsx') +
  readProjectFile('src/docs/component-definitions/card-tool-bar.tsx') +
  readProjectFile('src/docs/component-definitions/action-dialog.tsx') +
  readProjectFile('src/docs/component-definitions/tag-tree-row.tsx') +
  readProjectFile('src/docs/component-definitions/chip.tsx') +
  readProjectFile('src/docs/component-definitions/chip-button.tsx') +
  readProjectFile('src/docs/component-definitions/math-editor.tsx')
const css = readProjectFile('src/App.css')
const shareCardDocsPreviewBlock = blockFor(
  css,
  '.share-card-docs-preview,\n.card-docs-preview,\n.card-composer-docs-preview',
)
const shareCardDocsCardBlock = blockFor(css, '.share-card-docs-preview .weimo-share-card')
const iconPreviewSceneBlock = blockFor(css, '.icon-preview__scene')
const iconPreviewSceneTitleBlock = blockFor(css, '.icon-preview__scene-title')
const iconPreviewRowBlock = blockFor(css, '.icon-preview__row')
const packageJson = JSON.parse(readProjectFile('package.json'))

assert.ok(
  !existsSync(join(root, 'src/docs/component-definitions/editable-card.tsx')),
  'Removed EditableCard detail docs definition must not exist.',
)
assert.ok(
  existsSync(join(root, 'src/docs/component-definitions/card.tsx')),
  'Card detail docs definition must exist.',
)
assert.ok(
  !existsSync(join(root, 'src/docs/component-definitions/tag-edit-bar.tsx')),
  'Removed TagEditBar detail docs definition must not exist.',
)
assert.ok(
  existsSync(join(root, 'src/docs/component-definitions/chip.tsx')),
  'Internal Chip detail docs definition must exist.',
)
assert.ok(
  existsSync(join(root, 'src/docs/component-definitions/chip-button.tsx')),
  'Internal ChipButton detail docs definition must exist.',
)
assert.ok(
  existsSync(join(root, 'src/docs/component-definitions/glass-surface.tsx')),
  'GlassSurface detail docs definition must exist.',
)

for (const snippet of [
  '<div className="demo-block">',
  '<CossCardPanel className="demo-block__panel preview-stage" data-component-id={selected.id} variant="stage">',
  '{selected.preview(previewContext)}',
]) {
  assert.ok(
    detailPageSource.includes(snippet),
    `component detail page must keep ${snippet}.`,
  )
}

assert.ok(
  detailPageSource.includes("{selected.frame === 'plain' ? (") &&
    componentDocsSource.includes("frame?: 'stage' | 'plain'"),
  'component detail page must let frame: plain definitions skip the demo-block stage wrapper and render their own preview surfaces.',
)

assert.ok(
  detailPageSource.includes('{selected.summary ? <p className="doc-page__summary">{selected.summary}</p> : null}') &&
    componentDocsSource.includes('summary?: string'),
  'component detail page must omit the summary paragraph for definitions without a summary.',
)

for (const snippet of [
  'API 参考',
  'api-heading',
  'selected.props',
  "from '../../components/coss/tabs'",
  '<TabsTab value="code">',
  '<TabsTab value="preview">',
  'selected.code',
  'selected.install',
  'CopyAction',
  'InstallStrip',
  'install-heading',
  'usage-heading',
  'examples-heading',
  'showExamples',
  'variant-preview-grid',
  'variant-preview-tile',
]) {
  assert.ok(
    !detailPageSource.includes(snippet),
    `component detail page must not include ${snippet}.`,
  )
}

assert.ok(
  !componentDocsSource.includes('ComponentInstallGuide') &&
    !componentDocsSource.includes('buildInstallGuide') &&
    !componentDocsSource.includes('install:') &&
    !componentDocsSource.includes("| 'code'") &&
    !componentDocsSource.includes('props:') &&
    !componentDocsSource.includes('definition.props'),
  'component-docs.tsx must not expose install guide, example code, or props metadata for detail pages.',
)

assert.ok(
  !componentDefinitionsSource.includes('const code =') &&
    !componentDefinitionsSource.includes('code:') &&
    !componentDefinitionsSource.includes('variantPreviews:') &&
    !componentDefinitionsSource.includes('props: ['),
  'component definitions must not keep detail-page code samples, extra example previews, or props metadata.',
)

for (const snippet of [
  "id: 'float-bar'",
  "id: 'bottom-bar'",
  "id: 'card-top-bar'",
  "id: 'card-tool-bar'",
  "id: 'action-dialog'",
  "id: 'tag-tree-row'",
  "id: 'chip'",
  "id: 'chip-button'",
  "id: 'image-view'",
  "id: 'glass-surface'",
  "id: 'tag-bar'",
  "id: 'md-view'",
  "id: 'math-editor'",
  "id: 'text-button'",
  "id: 'canvas-transparency'",
]) {
  assert.ok(componentDefinitionsSource.includes(snippet), `internal definition source must include ${snippet}.`)
}

for (const selector of [
  '.demo-block__panel:has(.docs-code)',
  '.docs-code',
  '.docs-code pre',
  '.docs-code code',
  '.install-guide',
  '.install-tabs',
  '.variant-preview-grid',
  '.variant-preview-tile',
  '.variant-preview-stage',
  '.variant-card-sample',
]) {
  assert.ok(!css.includes(selector), `App.css must remove unused ${selector} styles.`)
}

assert.ok(
  packageJson.scripts?.test?.includes('scripts/component-detail-page-contract.test.mjs'),
  'package.json test script must run component-detail-page-contract.test.mjs.',
)

assert.ok(
  shareCardDefinitionSource.includes("import { mdRenderSample } from './markdown-sample'") &&
    shareCardDefinitionSource.includes('className="share-card-docs-preview"') &&
    shareCardDefinitionSource.includes('content={mdRenderSample}') &&
    !shareCardDefinitionSource.includes('shareCardContent'),
  'ShareCard detail preview must reuse the shared markdown sample instead of maintaining a separate preview copy.',
)

for (const declaration of [
  'width: min(100%, 960px);',
  'min-width: 0;',
  'justify-self: stretch;',
]) {
  assert.ok(
    shareCardDocsPreviewBlock.includes(declaration),
    `ShareCard docs preview must include ${declaration}`,
  )
}

for (const declaration of ['width: 100%;', 'max-width: none;']) {
  assert.ok(
    shareCardDocsCardBlock.includes(declaration),
    `ShareCard docs card must include ${declaration}`,
  )
}

assert.ok(
  componentDefinitionsSource.includes("import { MdRender } from '../../components/md-render'") &&
    componentDefinitionsSource.includes("id: 'md-render'") &&
    componentDefinitionsSource.includes('content={mdRenderSample}'),
  'MdRender detail page must render the standalone markdown preview component with the shared markdown sample.',
)
assert.ok(
  mdRenderDefinitionSource.includes("import { useLayoutEffect, useRef, useState } from 'react'") &&
    mdRenderDefinitionSource.includes('function MdRenderPreview()') &&
    mdRenderDefinitionSource.includes('const sourceTextareaRef = useRef<HTMLTextAreaElement | null>(null)') &&
    mdRenderDefinitionSource.includes('function resizeSourceTextarea(textarea: HTMLTextAreaElement | null)') &&
    mdRenderDefinitionSource.includes("textarea.style.height = 'auto'") &&
    mdRenderDefinitionSource.includes('textarea.style.height = `${textarea.scrollHeight}px`') &&
    mdRenderDefinitionSource.includes('const [markdown, setMarkdown] = useState(mdRenderSample)') &&
    mdRenderDefinitionSource.includes('className="md-render-docs-preview"') &&
    mdRenderDefinitionSource.includes('className="md-render-docs-preview__source"') &&
    mdRenderDefinitionSource.includes('className="md-render-docs-preview__textarea"') &&
    mdRenderDefinitionSource.includes('value={markdown}') &&
    mdRenderDefinitionSource.includes('resizeSourceTextarea(event.currentTarget)') &&
    mdRenderDefinitionSource.includes('className="md-render-docs-preview__rendered"') &&
    mdRenderDefinitionSource.includes('content={markdown}') &&
    mdRenderDefinitionSource.includes('preview: () => <MdRenderPreview />'),
  'MdRender detail preview must show editable auto-growing markdown source beside a live rendered result.',
)
for (const selector of [
  '.md-render-docs-preview',
  '.md-render-docs-preview__pane',
  '.md-render-docs-preview__pane-label',
  '.md-render-docs-preview__textarea',
  '.md-render-docs-preview__rendered',
]) {
  assert.ok(css.includes(selector), `App.css must include ${selector} styles for MdRender docs comparison.`)
}
const mdRenderPaneBlock = blockFor(css, '.md-render-docs-preview__pane')
const mdRenderTextareaBlock = blockFor(css, '.md-render-docs-preview__textarea')
const mdRenderRenderedBlock = blockFor(css, '.md-render-docs-preview__rendered')

assert.ok(
  !/(?:^|\s)(?:height|max-height|min-height):/.test(mdRenderPaneBlock) &&
    !/overflow:\s*(?:auto|hidden|scroll)/.test(mdRenderPaneBlock) &&
    !/(?:^|\s)(?:height|max-height):/.test(mdRenderRenderedBlock) &&
    !/overflow:\s*(?:auto|hidden|scroll)/.test(mdRenderRenderedBlock) &&
    !mdRenderTextareaBlock.includes('height: 100%;') &&
    mdRenderTextareaBlock.includes('overflow: hidden;'),
  'MdRender detail comparison panes must grow with content instead of introducing internal scrollbars.',
)

assert.ok(
  imageViewDefinitionSource.includes("import { ImageView, ImageViewDisplayModeMenu, type ImageViewDisplayMode } from '../../components/image-view'") &&
    imageViewDefinitionSource.includes("id: 'image-view'") &&
    imageViewDefinitionSource.includes("const sampleImage = 'data:image/png;base64,") &&
    !imageViewDefinitionSource.includes('data:image/svg+xml') &&
    imageViewDefinitionSource.includes('src={sampleImage}') &&
    (imageViewDefinitionSource.match(/src=\{sampleImage\}/g) ?? []).length === 2 &&
    imageViewDefinitionSource.includes('imageWidth={640}') &&
    imageViewDefinitionSource.includes('imageHeight={480}') &&
    imageViewDefinitionSource.includes('const nonImageSource =') &&
    imageViewDefinitionSource.includes('src={nonImageSource}') &&
    imageViewDefinitionSource.includes('imageWidth={1}') &&
    imageViewDefinitionSource.includes('imageHeight={1}') &&
    imageViewDefinitionSource.includes('alt="Not an image preview"') &&
    imageViewDefinitionSource.includes("const [displayMode, setDisplayMode] = useState<ImageViewDisplayMode>('fit-width')") &&
    imageViewDefinitionSource.includes('<ImageViewDisplayModeMenu') &&
    imageViewDefinitionSource.includes('onDisplayModeChange={setDisplayMode}') &&
    imageViewDefinitionSource.includes('className="image-view-docs-preview__detail"') &&
    imageViewDefinitionSource.includes('displayMode={displayMode}') &&
    imageViewDefinitionSource.includes('open') &&
    !imageViewDefinitionSource.includes('objectFit="cover"') &&
    imageViewDefinitionSource.includes('placeholder="等待上传或识别图片"') &&
    !imageViewDefinitionSource.includes('showZoomButton') &&
    !imageViewDefinitionSource.includes("useState(true)") &&
    !imageViewDefinitionSource.includes('showRemoveButton') &&
    !imageViewDefinitionSource.includes('onRemove'),
  'ImageView detail page must render preview, non-image, placeholder, and pannable detail-mode states.',
)
assertDecodablePngDataUrl(
  constSingleLineStringValue(imageViewDefinitionSource, 'sampleImage'),
  'ImageView detail preview sample image',
)
assert.ok(
  componentDefinitionsSource.includes("import { GlassSurface } from '../../components/glass-surface'") &&
    componentDefinitionsSource.includes("id: 'glass-surface'") &&
    componentDefinitionsSource.includes('运行时读取组件背后的背景亮度') &&
    componentDefinitionsSource.includes('glassSurfacePreviewBackgroundBands') &&
    !componentDefinitionsSource.includes('glass-surface-preview__scroll-scene') &&
    componentDefinitionsSource.includes('glass-surface-preview__scroll-viewport') &&
    componentDefinitionsSource.includes('glass-surface-preview__scroll-content') &&
    componentDefinitionsSource.includes('glass-surface-preview__band') &&
    componentDefinitionsSource.includes('glass-surface-preview__fixed') &&
    componentDefinitionsSource.includes('<GlassSurface className="glass-surface-preview__tile">') &&
    !componentDefinitionsSource.includes('glass-surface-preview__sticky'),
  'GlassSurface detail page must render a scrollable dark-to-light adaptive material preview.',
)
assert.ok(
    glassIconButtonDefinitionSource.includes("import { GlassIconButton } from '../../components/glass-icon-button'") &&
    glassIconButtonDefinitionSource.includes("import { useState } from 'react'") &&
    glassIconButtonDefinitionSource.includes("import { TextButton } from '../../components/text-button'") &&
    glassIconButtonDefinitionSource.includes("id: 'glass-icon-button'") &&
    glassIconButtonDefinitionSource.includes('glassIconButtonPreviewScenes') &&
    glassIconButtonDefinitionSource.includes("id: 'light-solid'") &&
    glassIconButtonDefinitionSource.includes("id: 'light-gradient'") &&
    glassIconButtonDefinitionSource.includes("id: 'dark-solid'") &&
    glassIconButtonDefinitionSource.includes("id: 'dark-gradient'") &&
    !glassIconButtonDefinitionSource.includes('title:') &&
    !glassIconButtonDefinitionSource.includes('icon-preview__scene-title') &&
    !glassIconButtonDefinitionSource.includes('scene.title') &&
    glassIconButtonDefinitionSource.includes('function GlassIconButtonPreview()') &&
    glassIconButtonDefinitionSource.includes('const [disabled, setDisabled] = useState(false)') &&
    glassIconButtonDefinitionSource.includes('setDisabled((current) => !current)') &&
    glassIconButtonDefinitionSource.includes('aria-pressed={disabled}') &&
    glassIconButtonDefinitionSource.includes("className=\"icon-preview-shell\"") &&
    glassIconButtonDefinitionSource.includes("className=\"icon-preview__controls\"") &&
    glassIconButtonDefinitionSource.includes('<TextButton') &&
    !glassIconButtonDefinitionSource.includes("from '../../components/coss/button'") &&
    !glassIconButtonDefinitionSource.includes("variant=\"outline\"") &&
    glassIconButtonDefinitionSource.includes('className={`icon-preview__scene icon-preview__scene--${scene.id}`}') &&
    (glassIconButtonDefinitionSource.match(/<GlassIconButton\b[^>\n]*disabled=\{disabled\}/g) ?? []).length === 2 &&
    !glassIconButtonDefinitionSource.includes('状态切换菜单') &&
    glassIconButtonDefinitionSource.includes('preview: () => <GlassIconButtonPreview />') &&
    !componentDefinitionsSource.includes("from '../../components/icon-button'") &&
    !componentDefinitionsSource.includes("id: 'icon-button'") &&
    !componentDefinitionsSource.includes('<IconButton'),
  'GlassIconButton detail page must render a manual disabled-state transition preview across light and dark backgrounds.',
)
assert.ok(
    borderColorDefinitionSource.includes('borderColorGlassSurfaceTokens') &&
    borderColorDefinitionSource.includes('borderColorMenuSeparatorTokens') &&
    borderColorDefinitionSource.includes("token: '--glass-surface-border'") &&
    borderColorDefinitionSource.includes("token: '--glass-surface-light-border'") &&
    borderColorDefinitionSource.includes("token: '--glass-surface-dark-border'") &&
    borderColorDefinitionSource.includes("token: '--color-border-divider-menu'") &&
    borderColorDefinitionSource.includes("token: '--color-border-divider-menu-on-light'") &&
    borderColorDefinitionSource.includes("token: '--color-border-divider-menu-on-dark'") &&
    borderColorDefinitionSource.includes('borderColorToneMap.default.value.light') &&
    borderColorDefinitionSource.includes('borderColorToneMap.default.value.light') &&
    borderColorDefinitionSource.includes('borderColorToneMap.divider.value.light') &&
    borderColorDefinitionSource.includes('borderColorToneMap.default.value.dark') &&
    borderColorDefinitionSource.includes("tone === 'default'") &&
    borderColorDefinitionSource.includes("tone === 'divider'") &&
    borderColorDefinitionSource.includes('aria-label="GlassSurface 背景感知边框 token"') &&
    borderColorDefinitionSource.includes('aria-label="Menu separator 背景感知 divider token"') &&
    borderColorDefinitionSource.includes('亮背景 / Menu:'),
  'BorderColor detail page must show separate GlassSurface border and Menu separator divider background-aware tokens.',
)
assert.ok(
    ghostIconButtonDefinitionSource.includes("import { GhostIconButton } from '../../components/ghost-icon-button'") &&
    ghostIconButtonDefinitionSource.includes("import { useState } from 'react'") &&
    ghostIconButtonDefinitionSource.includes("import { TextButton } from '../../components/text-button'") &&
    ghostIconButtonDefinitionSource.includes("id: 'ghost-icon-button'") &&
    ghostIconButtonDefinitionSource.includes('function GhostIconButtonPreview()') &&
    ghostIconButtonDefinitionSource.includes('const [disabled, setDisabled] = useState(false)') &&
    ghostIconButtonDefinitionSource.includes('setDisabled((current) => !current)') &&
    ghostIconButtonDefinitionSource.includes('aria-pressed={disabled}') &&
    ghostIconButtonDefinitionSource.includes("className=\"icon-preview-shell\"") &&
    ghostIconButtonDefinitionSource.includes("className=\"icon-preview__controls\"") &&
    ghostIconButtonDefinitionSource.includes('<TextButton') &&
    !ghostIconButtonDefinitionSource.includes("from '../../components/coss/button'") &&
    !ghostIconButtonDefinitionSource.includes("variant=\"outline\"") &&
    ghostIconButtonDefinitionSource.includes('className="icon-preview icon-preview--plain"') &&
    ghostIconButtonDefinitionSource.includes('className="icon-preview__scene icon-preview__scene--plain"') &&
    ghostIconButtonDefinitionSource.includes('普通背景') &&
    (ghostIconButtonDefinitionSource.match(/<GhostIconButton\b[^>\n]*disabled=\{disabled\}/g) ?? []).length === 2 &&
    !ghostIconButtonDefinitionSource.includes('状态切换菜单') &&
    ghostIconButtonDefinitionSource.includes('preview: () => <GhostIconButtonPreview />') &&
    !ghostIconButtonDefinitionSource.includes('ghostIconButtonPreviewScenes') &&
    !ghostIconButtonDefinitionSource.includes("title: '亮色单色背景'") &&
    !ghostIconButtonDefinitionSource.includes("title: '亮色多色彩渐变背景'") &&
    !ghostIconButtonDefinitionSource.includes("title: '暗色单色背景'") &&
    !ghostIconButtonDefinitionSource.includes("title: '暗色多色彩渐变背景'") &&
    !ghostIconButtonDefinitionSource.includes('scene.id'),
  'GhostIconButton detail page must render one manual disabled-state transition preview on an ordinary background.',
)
assert.ok(
  css.includes('.icon-preview-shell') &&
    css.includes('.icon-preview__controls') &&
    css.includes('.icon-preview-shell .icon-preview'),
  'IconButton detail previews must include shell and control styles for the manual disabled-state toggle.',
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
    !css.includes('.icon-preview--plain .icon-preview__scene') &&
    !css.includes('.icon-preview--plain .icon-preview__row'),
  'IconButton detail preview scenes must center GhostIconButton and GlassIconButton rows against the whole scene frame.',
)
