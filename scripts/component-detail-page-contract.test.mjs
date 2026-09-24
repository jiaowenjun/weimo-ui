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
const docsShellSource = readProjectFile('src/docs/docs-shell.tsx')
const componentDocsSource = readProjectFile('src/docs/component-docs.tsx')
const mdRenderDefinitionSource = readProjectFile('src/docs/component-definitions/markdown.tsx')
const imageViewDefinitionSource = readProjectFile('src/docs/component-definitions/image.tsx')
const buttonDefinitionSource = readProjectFile('src/docs/component-definitions/button.tsx')
const borderTokensDefinitionSource = readProjectFile('src/docs/component-definitions/border-tokens.tsx')
const componentDefinitionsSource = readProjectFile('src/docs/component-definitions/tagged-card.tsx') +
  mdRenderDefinitionSource +
  imageViewDefinitionSource +
  readProjectFile('src/docs/component-definitions/surface.tsx') +
  readProjectFile('src/docs/component-definitions/tag.tsx') +
  readProjectFile('src/docs/component-definitions/stat.tsx') +
  buttonDefinitionSource +
  borderTokensDefinitionSource +
  readProjectFile('src/docs/component-definitions/menu.tsx') +
  readProjectFile('src/docs/component-definitions/bar.tsx') +
  readProjectFile('src/docs/component-definitions/page-layout.tsx') +
  readProjectFile('src/docs/component-definitions/action-dialog.tsx') +
  readProjectFile('src/docs/component-definitions/capsule.tsx') +
  mdRenderDefinitionSource
const css = readProjectFile('src/App.css')
const iconPreviewRowBlock = blockFor(css, '.icon-preview__row')
const packageJson = JSON.parse(readProjectFile('package.json'))

assert.ok(
  docsShellSource.includes('className="docs-top-bar__title"') &&
    docsShellSource.includes('content={selected.name}') &&
    docsShellSource.includes('<Chip') &&
    !detailPageSource.includes('<h1') &&
    !detailPageSource.includes('doc-page__header') &&
    !css.includes('.doc-page__title') &&
    css.includes('.docs-top-bar__title'),
  'component titles must render in the TopBar instead of consuming detail-page content space.',
)

assert.ok(
  !existsSync(join(root, 'src/docs/component-definitions/editable-card.tsx')),
  'Removed EditableCard detail docs definition must not exist.',
)
assert.ok(
  existsSync(join(root, 'src/docs/component-definitions/tagged-card.tsx')),
  'Merged tagged-card detail docs definition must exist.',
)
assert.ok(
  !existsSync(join(root, 'src/docs/component-definitions/tag-edit-bar.tsx')),
  'Removed TagEditBar detail docs definition must not exist.',
)
assert.ok(
  existsSync(join(root, 'src/docs/component-definitions/capsule.tsx')),
  'Merged Capsule detail docs definition must exist.',
)
assert.ok(
  existsSync(join(root, 'src/docs/component-definitions/surface.tsx')),
  'Surface detail docs definition must exist.',
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
  detailPageSource.includes("if (selected.frame === 'plain')") &&
    detailPageSource.includes('return selected.preview(previewContext)') &&
    componentDocsSource.includes("frame?: 'stage' | 'plain'"),
  'component detail page must return plain previews directly without a doc-page or demo-block wrapper.',
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
  "id: 'bar'",
  "id: 'action-dialog'",
  "id: 'tag'",
  "id: 'capsule'",
  "id: 'image'",
  "id: 'markdown'",
  "id: 'button'",
  "id: 'surface'",
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
  mdRenderDefinitionSource.includes("import { MdRender } from '../../components/md-render'") &&
    mdRenderDefinitionSource.includes("id: 'markdown'") &&
    mdRenderDefinitionSource.includes('const [markdown, setMarkdown] = useState(mdRenderSample)') &&
    mdRenderDefinitionSource.includes('content={markdown}'),
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
    mdRenderDefinitionSource.includes('<MdRenderPreview />'),
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
    imageViewDefinitionSource.includes("id: 'image'") &&
    imageViewDefinitionSource.includes("const sampleImage = 'data:image/png;base64,") &&
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
    componentDefinitionsSource.includes("id: 'surface'") &&
    componentDefinitionsSource.includes('静态卡片、亮度自适应玻璃层与抬升浮层的材质总览') &&
    componentDefinitionsSource.includes("from '../glass-preview-card'") &&
    componentDefinitionsSource.includes('<GlassPreviewCard') &&
    !componentDefinitionsSource.includes('glass-surface-preview__scroll') &&
    !componentDefinitionsSource.includes('glass-surface-preview__fixed') &&
    componentDefinitionsSource.includes('<GlassSurface bordered={bordered} className="glass-surface-preview__tile">') &&
    !componentDefinitionsSource.includes('glass-surface-preview__sticky'),
  'GlassSurface detail page must render a slider-driven dark-to-light adaptive material preview via the shared GlassPreviewCard.',
)
assert.ok(
    buttonDefinitionSource.includes("import { GlassIconButton } from '../../components/glass-icon-button'") &&
    buttonDefinitionSource.includes("import { PreviewToggle } from '../preview-toggle'") &&
    buttonDefinitionSource.includes("import { useState } from 'react'") &&
    buttonDefinitionSource.includes("import { TextButton } from '../../components/text-button'") &&
    buttonDefinitionSource.includes("id: 'button'") &&
    !buttonDefinitionSource.includes('glassIconButtonPreviewScenes') &&
    buttonDefinitionSource.includes("from '../glass-preview-card'") &&
    buttonDefinitionSource.includes('<GlassPreviewCard') &&
    buttonDefinitionSource.includes('label="玻璃图标按钮"') &&
    buttonDefinitionSource.includes('className="icon-button-preview"') &&
    !buttonDefinitionSource.includes('icon-preview__scene--light-gradient') &&
    !buttonDefinitionSource.includes('icon-preview__scene--dark-solid') &&
    !buttonDefinitionSource.includes('icon-preview__scene--dark-gradient') &&
    !buttonDefinitionSource.includes('title:') &&
    !buttonDefinitionSource.includes('icon-preview__scene-title') &&
    !buttonDefinitionSource.includes('scene.title') &&
    buttonDefinitionSource.includes('function GlassIconButtonPreview()') &&
    buttonDefinitionSource.includes('const [disabled, setDisabled] = useState(false)') &&
    buttonDefinitionSource.includes('setDisabled(!checked)') &&
    buttonDefinitionSource.includes('checked={!disabled}') &&
    buttonDefinitionSource.includes('action={') &&
    !buttonDefinitionSource.includes('icon-preview-shell') &&
    !buttonDefinitionSource.includes('icon-preview__controls') &&
    buttonDefinitionSource.includes('<TextButton') &&
    !buttonDefinitionSource.includes("from '../../components/coss/button'") &&
    !buttonDefinitionSource.includes("variant=\"outline\"") &&
    !buttonDefinitionSource.includes('className={`icon-preview__scene icon-preview__scene--${scene.id}`}') &&
    (buttonDefinitionSource.match(/<GlassIconButton\b[^>\n]*disabled=\{disabled\}/g) ?? []).length === 4 &&
    buttonDefinitionSource.includes('<GlassIconButton aria-label="带边框菜单" bordered disabled={disabled}>') &&
    !buttonDefinitionSource.includes('状态切换菜单') &&
    buttonDefinitionSource.includes('preview: () => <ButtonDemo />') &&
    buttonDefinitionSource.includes('<GlassIconButtonPreview />') &&
    !componentDefinitionsSource.includes("from '../../components/icon-button'") &&
    !componentDefinitionsSource.includes("id: 'icon-button'") &&
    !componentDefinitionsSource.includes('<IconButton'),
  'Button page glass icon card must reuse the shared GlassPreviewCard (slider + striped glass background) from the Surface glass card.',
)
assert.ok(
  borderTokensDefinitionSource.includes("frame: 'plain',") &&
    borderTokensDefinitionSource.includes('<ComponentPreviewCard') &&
    !borderTokensDefinitionSource.includes('<TokenPreviewDetails') &&
    borderTokensDefinitionSource.includes('...contexts.flatMap') &&
    borderTokensDefinitionSource.includes('--glass-surface-border') &&
    borderTokensDefinitionSource.includes('--color-border-divider-menu-on-light'),
  'BorderColor detail page must keep background-aware token variants searchable without rendering redundant prose.',
)
assert.ok(
    buttonDefinitionSource.includes("import { GhostIconButton } from '../../components/ghost-icon-button'") &&
    buttonDefinitionSource.includes("import { useState } from 'react'") &&
    buttonDefinitionSource.includes("import { TextButton } from '../../components/text-button'") &&
    buttonDefinitionSource.includes('function GhostIconButtonPreview()') &&
    buttonDefinitionSource.includes('const [disabled, setDisabled] = useState(false)') &&
    buttonDefinitionSource.includes('setDisabled(!checked)') &&
    buttonDefinitionSource.includes('checked={!disabled}') &&
    buttonDefinitionSource.includes('action={') &&
    !buttonDefinitionSource.includes('icon-preview-shell') &&
    !buttonDefinitionSource.includes('icon-preview__controls') &&
    buttonDefinitionSource.includes('<TextButton') &&
    !buttonDefinitionSource.includes("from '../../components/coss/button'") &&
    !buttonDefinitionSource.includes("variant=\"outline\"") &&
    buttonDefinitionSource.includes('className="icon-button-preview"') &&
    buttonDefinitionSource.includes('普通背景') &&
    (buttonDefinitionSource.match(/<GhostIconButton\b[^>\n]*disabled=\{disabled\}/g) ?? []).length === 3 &&
    !buttonDefinitionSource.includes('状态切换菜单') &&
    buttonDefinitionSource.includes('<GhostIconButtonPreview />') &&
    !buttonDefinitionSource.includes('ghostIconButtonPreviewScenes') &&
    !buttonDefinitionSource.includes("title: '亮色单色背景'") &&
    !buttonDefinitionSource.includes("title: '亮色多色彩渐变背景'") &&
    !buttonDefinitionSource.includes("title: '暗色单色背景'") &&
    !buttonDefinitionSource.includes("title: '暗色多色彩渐变背景'"),
  'Button page ghost icon card must render one manual disabled-state transition preview on an ordinary background.',
)
assert.ok(
  !css.includes('.icon-preview-shell') &&
    !css.includes('.icon-preview__controls') &&
    !css.includes('.icon-preview__toggle'),
  'IconButton detail previews must host the manual disabled-state toggle in the card title bar action slot, not in a preview shell.',
)
assert.ok(
  !css.includes('.icon-preview__scene') &&
    !css.includes('.icon-preview--plain') &&
    iconPreviewRowBlock.includes('align-self: center;') &&
    iconPreviewRowBlock.includes('justify-self: center;') &&
    iconPreviewRowBlock.includes('justify-content: center;') &&
    !css.includes('.icon-preview--plain .icon-preview__scene') &&
    !css.includes('.icon-preview--plain .icon-preview__row'),
  'IconButton detail previews must center button rows on the borderless card preview canvas without scene frames.',
)
