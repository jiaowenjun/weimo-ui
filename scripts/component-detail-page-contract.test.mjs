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

const detailPageSource = readProjectFile('packages/weimo-ui-site/src/docs/pages/component-detail-page.tsx')
const docsShellSource = readProjectFile('packages/weimo-ui-site/src/docs/docs-shell.tsx')
const componentDocsSource = readProjectFile('packages/weimo-ui-site/src/docs/catalog/component-docs.tsx')
const mdRenderDefinitionSource = readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-markdown/markdown.tsx')
const imageViewDefinitionSource = readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-image/image.tsx')
const buttonDefinitionSource = readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/button.tsx')
const borderTokensDefinitionSource = readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/border-tokens.tsx')
const componentDefinitionsSource = readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-card/tagged-card.tsx') +
  readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/card-tool-bar.tsx') +
  mdRenderDefinitionSource +
  imageViewDefinitionSource +
  readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/surface.tsx') +
  readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-tagtree/tag.tsx') +
  readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-stats/stat.tsx') +
  buttonDefinitionSource +
  borderTokensDefinitionSource +
  readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/menu.tsx') +
  readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/bar.tsx') +
  readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/page-layout.tsx') +
  readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/action-dialog.tsx') +
  readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/capsule.tsx') +
  readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-tagtree/chip-button.tsx') +
  mdRenderDefinitionSource
const css = readProjectFile('packages/weimo-ui-site/src/App.css')
const iconPreviewRowBlock = blockFor(css, '.icon-preview__row')
const packageJson = JSON.parse(readProjectFile('package.json'))

assert.ok(
  docsShellSource.includes('className="docs-top-bar__title"') &&
    docsShellSource.includes('{selected.name}') &&
    docsShellSource.includes('docs-top-bar__title-sizer') &&
    !detailPageSource.includes('<h1') &&
    !detailPageSource.includes('doc-page__header') &&
    !css.includes('.doc-page__title') &&
    css.includes('.docs-top-bar__title'),
  'component titles must render in the liquid glass TopBar capsule instead of consuming detail-page content space.',
)

assert.ok(
  !existsSync(join(root, 'packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/editable-card.tsx')),
  'Removed EditableCard detail docs definition must not exist.',
)
assert.ok(
  existsSync(join(root, 'packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-card/tagged-card.tsx')),
  'Merged tagged-card detail docs definition must exist.',
)
assert.ok(
  !existsSync(join(root, 'packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/tag-edit-bar.tsx')),
  'Removed TagEditBar detail docs definition must not exist.',
)
assert.ok(
  existsSync(join(root, 'packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/capsule.tsx')),
  'Merged Capsule detail docs definition must exist.',
)
assert.ok(
  existsSync(join(root, 'packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/surface.tsx')),
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
  "from 'weimo-ui-core/components/coss/tabs'",
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
  "id: 'chip-button'",
  "id: 'card-tool-bar'",
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
  packageJson.scripts?.['test:contracts']?.includes('run-contract-tests.mjs'),
  'package.json test script must run component-detail-page-contract.test.mjs.',
)

assert.ok(
  mdRenderDefinitionSource.includes("import { MdRender } from 'weimo-ui-markdown/components/md-render'") &&
    mdRenderDefinitionSource.includes("id: 'markdown'") &&
    mdRenderDefinitionSource.includes('function MdRenderPreview()') &&
    mdRenderDefinitionSource.includes('<MdRenderPreview />') &&
    mdRenderDefinitionSource.includes('content={mdRenderSample}'),
  'MdRender detail page must render the standalone markdown preview component with the shared markdown sample.',
)
assert.ok(
  !mdRenderDefinitionSource.includes('md-render-docs-preview') &&
    !mdRenderDefinitionSource.includes('resizeSourceTextarea') &&
    !mdRenderDefinitionSource.includes('textarea') &&
    !mdRenderDefinitionSource.includes('Markdown 原文'),
  'MdRender detail preview must render only the markdown result without the editable source pane.',
)
for (const selector of [
  '.md-render-docs-preview',
  '.md-render-docs-preview__pane',
  '.md-render-docs-preview__pane-label',
  '.md-render-docs-preview__textarea',
  '.md-render-docs-preview__rendered',
]) {
  assert.ok(!css.includes(selector), `App.css must remove unused ${selector} styles.`)
}

assert.ok(
  imageViewDefinitionSource.includes("import { ImageView, ImageViewDisplayModeMenu, type ImageViewDisplayMode } from 'weimo-ui-image/components/image-view'") &&
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
    componentDefinitionsSource.includes("import { FrostedSurface } from 'weimo-ui-core/components/frosted-surface'") &&
    componentDefinitionsSource.includes("id: 'surface'") &&
    componentDefinitionsSource.includes('静态卡片、亮度自适应磨砂玻璃层、液态玻璃与抬升浮层的材质总览') &&
    componentDefinitionsSource.includes("from '../../../components/glass-preview-card'") &&
    componentDefinitionsSource.includes('<GlassPreviewCard') &&
    !componentDefinitionsSource.includes('frosted-surface-preview__scroll') &&
    !componentDefinitionsSource.includes('frosted-surface-preview__fixed') &&
    componentDefinitionsSource.includes('<FrostedSurface bordered className="frosted-surface-preview__tile">') &&
    !componentDefinitionsSource.includes('frosted-surface-preview__sticky'),
  'FrostedSurface detail page must render a slider-driven dark-to-light adaptive material preview via the shared GlassPreviewCard.',
)
assert.ok(
    buttonDefinitionSource.includes("import { FrostedIconButton } from 'weimo-ui-core/components/frosted-icon-button'") &&
    buttonDefinitionSource.includes("import { PreviewToggle } from '../../../components/preview-toggle'") &&
    buttonDefinitionSource.includes("import { useState } from 'react'") &&
    buttonDefinitionSource.includes("import { TextButton } from 'weimo-ui-core/components/text-button'") &&
    buttonDefinitionSource.includes("id: 'button'") &&
    !buttonDefinitionSource.includes('glassIconButtonPreviewScenes') &&
    buttonDefinitionSource.includes("from '../../../components/glass-preview-card'") &&
    buttonDefinitionSource.includes('<GlassPreviewCard') &&
    buttonDefinitionSource.includes('label="磨砂图标按钮"') &&
    buttonDefinitionSource.includes('className="icon-button-preview"') &&
    !buttonDefinitionSource.includes('icon-preview__scene--light-gradient') &&
    !buttonDefinitionSource.includes('icon-preview__scene--dark-solid') &&
    !buttonDefinitionSource.includes('icon-preview__scene--dark-gradient') &&
    !buttonDefinitionSource.includes('title:') &&
    !buttonDefinitionSource.includes('icon-preview__scene-title') &&
    !buttonDefinitionSource.includes('scene.title') &&
    buttonDefinitionSource.includes('function FrostedIconButtonPreview()') &&
    buttonDefinitionSource.includes('const [disabled, setDisabled] = useState(false)') &&
    buttonDefinitionSource.includes('setDisabled(!checked)') &&
    buttonDefinitionSource.includes('checked={!disabled}') &&
    buttonDefinitionSource.includes('action={') &&
    !buttonDefinitionSource.includes('icon-preview-shell') &&
    !buttonDefinitionSource.includes('icon-preview__controls') &&
    buttonDefinitionSource.includes('<TextButton') &&
    !buttonDefinitionSource.includes("from 'weimo-ui-core/components/coss/button'") &&
    !buttonDefinitionSource.includes("variant=\"outline\"") &&
    !buttonDefinitionSource.includes('className={`icon-preview__scene icon-preview__scene--${scene.id}`}') &&
    (buttonDefinitionSource.match(/<FrostedIconButton\b[^>\n]*disabled=\{disabled\}/g) ?? []).length === 2 &&
    !buttonDefinitionSource.includes('状态切换菜单') &&
    buttonDefinitionSource.includes('preview: () => <ButtonDemo />') &&
    buttonDefinitionSource.includes('<FrostedIconButtonPreview />') &&
    !componentDefinitionsSource.includes("from 'weimo-ui-core/components/icon-button'") &&
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
    buttonDefinitionSource.includes("import { GhostIconButton } from 'weimo-ui-core/components/ghost-icon-button'") &&
    buttonDefinitionSource.includes("import { useState } from 'react'") &&
    buttonDefinitionSource.includes("import { TextButton } from 'weimo-ui-core/components/text-button'") &&
    buttonDefinitionSource.includes('function GhostIconButtonPreview()') &&
    buttonDefinitionSource.includes('const [disabled, setDisabled] = useState(false)') &&
    buttonDefinitionSource.includes('setDisabled(!checked)') &&
    buttonDefinitionSource.includes('checked={!disabled}') &&
    buttonDefinitionSource.includes('action={') &&
    !buttonDefinitionSource.includes('icon-preview-shell') &&
    !buttonDefinitionSource.includes('icon-preview__controls') &&
    buttonDefinitionSource.includes('<TextButton') &&
    !buttonDefinitionSource.includes("from 'weimo-ui-core/components/coss/button'") &&
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
