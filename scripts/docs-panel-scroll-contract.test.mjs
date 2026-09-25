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

function assertDeclaration(block, declaration, message) {
  assert.ok(block.includes(declaration), message)
}

const css = readProjectFile('src/App.css')
const packageJson = JSON.parse(readProjectFile('package.json'))

const demoPanel = blockFor(css, '.demo-block__panel')
const previewStage = blockFor(css, '.preview-stage')
const previewStageChildren = blockFor(css, '.preview-stage > *')
const mdEditorDocsPreview = blockFor(css, '.md-editor-docs-preview')
const mdEditorDocsCanvas = blockFor(
  css,
  '.component-preview-card:has(.md-editor-docs-preview, .md-view-docs-preview) .base-card__content',
)
const mdViewDocsViewport = blockFor(css, '.md-view-docs-preview .md-editor__viewport')

assert.ok(!css.includes('.component-frame'), 'overview gallery frame styles must be removed.')
assert.ok(!css.includes('.component-grid'), 'overview gallery grid styles must be removed.')
assertDeclaration(
  demoPanel,
  'overscroll-behavior: contain;',
  'detail demo panels must contain nested scroll momentum when a panel scrolls.',
)
assert.ok(
  !css.includes('.demo-block__panel:has(.preview-stage)'),
  'detail preview panel must not clamp its height so component demos can be debugged at their natural height.',
)
assertDeclaration(
  previewStage,
  'width: 100%;',
  'detail preview stage must follow the preview panel width.',
)
assertDeclaration(
  previewStage,
  'min-width: 0;',
  'detail preview stage must be allowed to shrink with the preview panel.',
)
assertDeclaration(
  previewStage,
  'background: var(--color-bg-page);',
  'detail preview stage must use the shared page background token.',
)
assertDeclaration(
  previewStageChildren,
  'max-width: 100%;',
  'detail preview children must not force horizontal preview overflow.',
)
assert.ok(
  !mdEditorDocsPreview.includes('--size-md-editor-docs-preview-viewport-height') &&
    !css.includes('--size-docs-demo-panel-height'),
  'MdEditor detail preview must not define fixed panel or viewport heights.',
)
assert.ok(
  !mdEditorDocsPreview.includes('calc(var(--size-docs-demo-panel-height) - 26px)'),
  'MdEditor detail preview must not derive its height from the old compact demo panel.',
)
assertDeclaration(
  mdEditorDocsPreview,
  'width: 100%;',
  'MdEditor docs preview must stretch horizontally inside the demo stage.',
)
assertDeclaration(
  mdEditorDocsPreview,
  'min-width: 0;',
  'MdEditor docs preview must be allowed to shrink with the detail preview panel.',
)
assertDeclaration(
  mdEditorDocsPreview,
  'align-self: center;',
  'MdEditor docs preview must keep MdEditor positioned against its own box, not the full preview frame height.',
)
assertDeclaration(
  mdEditorDocsPreview,
  'justify-self: stretch;',
  'MdEditor docs preview must preserve full-width editor layout inside the demo stage.',
)
assert.ok(
  !css.includes('.md-editor-docs-preview .md-editor__viewport'),
  'MdEditor detail preview must show the component natural content-driven viewport height.',
)
assertDeclaration(
  mdEditorDocsCanvas,
  'border-radius: var(--radius-xs);',
  'MdEditor docs canvas must use the tighter radius so body text and the caret stay clear of the corner curve.',
)
assertDeclaration(
  mdViewDocsViewport,
  'max-height: none;',
  'MdView detail preview edit state must preserve natural content-driven editor height.',
)
assert.ok(
  !css.includes('.preview-stage .md-editor__viewport'),
  'detail preview stage must not globally clamp MdEditor viewport to the preview panel height.',
)
for (const removedSelector of [
  '.demo-block__panel:has(.docs-code)',
  '.docs-code',
  '.docs-code pre',
]) {
  assert.ok(
    !css.includes(removedSelector),
    `detail docs must remove unused code panel selector ${removedSelector}.`,
  )
}

assert.ok(
  !css.includes('.demo-block__bar'),
  'detail demo block must not keep the removed preview/code tab bar styles.',
)

assert.ok(
  packageJson.scripts?.test?.includes('scripts/docs-panel-scroll-contract.test.mjs'),
  'package.json test script must run docs-panel-scroll-contract.test.mjs.',
)
