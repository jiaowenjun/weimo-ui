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

function cssBlockFor(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = source.match(new RegExp(`(?:^|\\n)\\s*${escapedSelector}\\s*\\{([^}]*)\\}`))

  assert.ok(match, `${selector} block must exist.`)

  return match[1]
}

function assertIncludes(source, snippet, message) {
  assert.ok(source.includes(snippet), message)
}

const packageJson = readJson('package.json')
const rootRegistry = readJson('registry.json')
const standaloneRegistryItem = readJson('registry/text-button.json')
const source = readProjectFile('src/components/text-button.tsx')
const css = readProjectFile('src/components/text-button.css')
const docsSource = readProjectFile('src/docs/component-definitions/text-button.tsx')
const definitionsIndexSource = readProjectFile('src/docs/component-definitions/index.ts')
const manifestSource = readProjectFile('src/docs/components-manifest.ts')
const glassIconButtonDocsSource = readProjectFile('src/docs/component-definitions/glass-icon-button.tsx')
const ghostIconButtonDocsSource = readProjectFile('src/docs/component-definitions/ghost-icon-button.tsx')
const appCss = readProjectFile('src/App.css')
const registryItem = rootRegistry.items.find((item) => item.name === 'text-button')

const baseBlock = cssBlockFor(css, '.text-button')
const hoverBlock = cssBlockFor(css, '.text-button:not(:disabled):hover')
const activeBlock = cssBlockFor(css, '.text-button:not(:disabled):active')
const disabledBlock = cssBlockFor(css, '.text-button:disabled')
const focusBlock = cssBlockFor(css, '.text-button:focus-visible')
const unlayeredBaseBlock = cssBlockFor(css, 'button.text-button')
const unlayeredDisabledBlock = cssBlockFor(css, 'button.text-button:disabled')
const previewBlock = cssBlockFor(appCss, '.text-button-preview')

assert.ok(
  packageJson.scripts?.test?.includes('scripts/text-button-contract.test.mjs'),
  'package.json test script must run text-button-contract.test.mjs.',
)
assert.equal(
  packageJson.exports?.['./components/text-button'],
  './src/components/text-button.tsx',
  'TextButton must have a public package export.',
)
assert.equal(
  packageJson.exports?.['./styles/text-button.css'],
  './src/components/text-button.css',
  'TextButton must expose its standalone stylesheet.',
)
assert.ok(registryItem, 'TextButton must be listed in registry.json.')
assert.deepEqual(
  standaloneRegistryItem,
  registryItem,
  'registry/text-button.json must match the root registry item.',
)
assert.deepEqual(
  registryItem?.registryDependencies,
  ['@weimo/style', '@weimo/utils'],
  'TextButton registry item must install shared style tokens and cn().',
)
assert.deepEqual(
  registryItem?.files.map((file) => file.path),
  ['src/components/text-button.tsx', 'src/components/text-button.css'],
  'TextButton registry item must ship source and CSS while depending on @weimo/utils for cn().',
)

for (const snippet of [
  "import { forwardRef, type ComponentPropsWithoutRef } from 'react'",
  "import { cn } from './lib/utils'",
  "import './text-button.css'",
  'export type TextButtonProps = ComponentPropsWithoutRef<\'button\'>',
  'forwardRef<HTMLButtonElement, TextButtonProps>(function TextButton',
  "type = 'button'",
  "className={cn('text-button', className)}",
  'ref={ref}',
  'TextButton.displayName = \'TextButton\'',
]) {
  assertIncludes(source, snippet, `TextButton source must include ${snippet}.`)
}

for (const [block, snippet, message] of [
  [baseBlock, 'display: inline-flex;', 'TextButton must be an inline-flex control.'],
  [baseBlock, 'align-items: center;', 'TextButton must vertically center text.'],
  [baseBlock, 'justify-content: center;', 'TextButton must center text horizontally.'],
  [baseBlock, 'min-height: 34px;', 'TextButton must match the current small docs control height.'],
  [baseBlock, 'padding: 0 11px;', 'TextButton must match the current small docs control padding.'],
  [baseBlock, 'border: 1px solid var(--color-border);', 'TextButton must use the shared default border token.'],
  [baseBlock, 'border-radius: var(--radius-sm);', 'TextButton must use the standard small radius.'],
  [baseBlock, 'background: var(--color-bg-card);', 'TextButton must start on the shared card background.'],
  [baseBlock, 'color: var(--color-text-primary);', 'TextButton must use primary text by default.'],
  [baseBlock, 'font-size: var(--font-size-md);', 'TextButton must use the small control text size.'],
  [baseBlock, 'font-weight: 560;', 'TextButton must keep the current button label weight.'],
  [baseBlock, 'line-height: 1;', 'TextButton must keep labels vertically stable.'],
  [baseBlock, 'white-space: nowrap;', 'TextButton labels must stay on one line.'],
  [baseBlock, 'cursor: pointer;', 'TextButton must show pointer affordance while enabled.'],
  [baseBlock, 'transition:', 'TextButton must transition state feedback.'],
  [baseBlock, 'border-color 160ms ease', 'TextButton must transition border feedback.'],
  [baseBlock, 'background 160ms ease', 'TextButton must transition background feedback.'],
  [baseBlock, 'color 160ms ease', 'TextButton must transition disabled text feedback.'],
  [hoverBlock, 'border-color: var(--color-border-emphasis);', 'TextButton hover must emphasize the border.'],
  [hoverBlock, 'background: var(--color-bg-hover);', 'TextButton hover must use the shared feedback background.'],
  [activeBlock, 'background: var(--color-bg-hover);', 'TextButton active must keep the shared feedback background.'],
  [disabledBlock, 'cursor: default;', 'TextButton disabled state must remove pointer affordance.'],
  [disabledBlock, 'color: var(--color-text-disabled);', 'TextButton disabled state must use the shared disabled text token.'],
  [disabledBlock, 'border-color: var(--color-border-disabled);', 'TextButton disabled state must use the shared disabled border token.'],
  [disabledBlock, 'background: var(--color-bg-card);', 'TextButton disabled state must keep the ordinary card surface.'],
  [focusBlock, 'outline: 2px solid var(--color-border-accent);', 'TextButton focus must use the shared accent border.'],
  [focusBlock, 'outline-offset: 2px;', 'TextButton focus ring must stay outside the control.'],
  [unlayeredBaseBlock, 'color: var(--color-text-primary);', 'TextButton must keep primary text outside layered CSS ordering.'],
  [unlayeredDisabledBlock, 'color: var(--color-text-disabled);', 'TextButton must keep disabled text outside layered CSS ordering.'],
  [previewBlock, 'display: flex;', 'TextButton detail preview must lay out examples in one row when possible.'],
]) {
  assertIncludes(block, snippet, message)
}
assert.ok(
  css.includes('@media (prefers-reduced-motion: reduce)') &&
    css.includes('transition-duration: 1ms;'),
  'TextButton must respect reduced-motion preferences.',
)
assert.ok(
  css.includes('.text-button:not(:disabled):hover') &&
    css.includes('.text-button:not(:disabled):active') &&
    !css.includes('.text-button:hover {') &&
    !css.includes('.text-button:active {'),
  'TextButton hover and active selectors must exclude disabled buttons.',
)

for (const snippet of [
  "import { TextButton } from '../../components/text-button'",
  "id: 'text-button'",
  "summary: '文本操作按钮，封装普通边框、hover/active 与 disabled token'",
  'preview: () => <TextButtonPreview />',
]) {
  assertIncludes(docsSource, snippet, `TextButton docs definition must include ${snippet}.`)
}
assertIncludes(
  definitionsIndexSource,
  "import { textButtonDefinition } from './text-button'",
  'TextButton definition must be imported from component-definitions/index.ts.',
)
assertIncludes(
  definitionsIndexSource,
  "'text-button': textButtonDefinition",
  'TextButton definition must be mapped by id.',
)
assert.ok(
  manifestSource.includes("id: 'text-button'") &&
    manifestSource.includes("name: 'TextButton'") &&
    manifestSource.includes("registryName: 'text-button'") &&
    manifestSource.includes("packageExport: './components/text-button'") &&
    manifestSource.includes("group: 'controls-overlays'"),
  'TextButton must be listed as a public controls component in the manifest.',
)
assert.ok(
  glassIconButtonDocsSource.includes("import { TextButton } from '../../components/text-button'") &&
    ghostIconButtonDocsSource.includes("import { TextButton } from '../../components/text-button'") &&
    glassIconButtonDocsSource.includes('<TextButton') &&
    ghostIconButtonDocsSource.includes('<TextButton') &&
    !glassIconButtonDocsSource.includes("from '../../components/coss/button'") &&
    !ghostIconButtonDocsSource.includes("from '../../components/coss/button'") &&
    !glassIconButtonDocsSource.includes('variant="outline"') &&
    !ghostIconButtonDocsSource.includes('variant="outline"'),
  'IconButton detail disabled toggles must use the shared TextButton instead of a local coss Button.',
)
