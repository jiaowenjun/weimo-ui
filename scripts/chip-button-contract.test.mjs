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
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))

  assert.ok(match, `${selector} block must exist.`)

  return match[1]
}

function standaloneCssBlockFor(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const matches = Array.from(
    source.matchAll(new RegExp(`\\n\\s*${escapedSelector}\\s*\\{([^}]*)\\}`, 'g')),
  )
  const match = matches.at(-1)

  assert.ok(match, `${selector} standalone block must exist.`)

  return match[1]
}

function assertIncludes(source, snippet, message) {
  assert.ok(source.includes(snippet), message)
}

const packageJson = readJson('package.json')
const rootRegistry = readJson('registry.json')
const source = readProjectFile('src/components/chip-button.tsx')
const css = readProjectFile('src/components/chip-button.css')
const surfaceCss = readProjectFile('src/components/chip-surface.css')
const tokensCss = readProjectFile('src/styles/tokens.css')
const docsSource = readProjectFile('src/docs/component-definitions/capsule.tsx')
const definitionsIndexSource = readProjectFile('src/docs/component-definitions/index.ts')
const manifestSource = readProjectFile('src/docs/components-manifest.ts')
const appCss = readProjectFile('src/App.css')

const baseBlock = cssBlockFor(surfaceCss, '.chip-surface')
const defaultLayerBlock = cssBlockFor(surfaceCss, '.chip-surface::before')
const glassLayerBlock = cssBlockFor(surfaceCss, '.chip-surface::after')
const glassBaseBlock = cssBlockFor(surfaceCss, '.chip-surface[data-variant="glass"]')
const defaultStateBeforeBlock = cssBlockFor(surfaceCss, '.chip-surface[data-variant="default"]::before')
const defaultStateAfterBlock = cssBlockFor(surfaceCss, '.chip-surface[data-variant="default"]::after')
const glassStateBeforeBlock = cssBlockFor(surfaceCss, '.chip-surface[data-variant="glass"]::before')
const glassStateAfterBlock = cssBlockFor(surfaceCss, '.chip-surface[data-variant="glass"]::after')
const hoverLayerBlock = cssBlockFor(
  surfaceCss,
  `.chip-surface[data-interactive="true"]:hover::before,
    .chip-surface[data-interactive="true"]:hover::after`,
)
const activeLayerBlock = cssBlockFor(
  surfaceCss,
  `.chip-surface[data-interactive="true"]:active::before,
  .chip-surface[data-interactive="true"]:active::after`,
)
const slotBlock = cssBlockFor(surfaceCss, '.chip-surface__slot')
const contentBlock = cssBlockFor(surfaceCss, '.chip-surface__content')
const chipButtonBlock = standaloneCssBlockFor(css, 'button.chip-button')
const textBlock = standaloneCssBlockFor(css, '.chip-button__text')
const reducedMotionBlock = cssBlockFor(
  surfaceCss,
  `.chip-surface,
    .chip-surface::before,
    .chip-surface::after`,
)
const previewWidthExampleBlock = cssBlockFor(appCss, '.chip-button-preview__width-example')
const previewWidthSlotBlock = cssBlockFor(appCss, '.chip-button-preview__width-slot')
const previewWidthSlotChipBlock = cssBlockFor(appCss, '.chip-button-preview__width-slot .chip-button')
const previewWidthMeasureBlock = cssBlockFor(appCss, '.chip-button-preview__width-measure')
const previewWidthMeasureChipBlock = cssBlockFor(appCss, '.chip-button-preview__width-measure .chip-button')
assert.ok(
  !appCss.includes('.chip-button-preview__controls') &&
    !/\.chip-button-preview\s*\{/.test(appCss) &&
    !appCss.includes('.chip-button-preview__panel') &&
    !appCss.includes('.chip-button-preview__row'),
  'ChipButton preview cards must inherit ComponentPreviewCard default layout; only the width-demo mechanism keeps custom CSS.',
)

assert.ok(
  packageJson.scripts?.test?.includes('scripts/chip-button-contract.test.mjs'),
  'package.json test script must run chip-button-contract.test.mjs.',
)
assert.equal(
  packageJson.exports?.['./components/chip-button'],
  './src/components/chip-button.tsx',
  'ChipButton must have a public package export.',
)
assert.ok(
  rootRegistry.items.some((item) => item.name === 'chip-button'),
  'ChipButton must be listed in registry.json.',
)
assert.ok(
  existsSync(join(root, 'registry/chip-button.json')),
  'ChipButton must have registry/chip-button.json.',
)

for (const snippet of [
  "import type { ButtonHTMLAttributes } from 'react'",
  "from './animated-inline-size'",
  "from './animated-inline-size-model'",
  "from './chip-surface-model'",
  "import './chip-button.css'",
  "export type ChipButtonState = 'default' | 'glass'",
  'export type ChipButtonProps',
  "Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'prefix'>",
  'animateWidth?: boolean',
  'prefix?: string',
  'state?: ChipButtonState',
  'export function ChipButton',
  'animateWidth = false',
  "prefix = '#'",
  "state = 'default'",
  'const renderedPrefix = prefix.slice(0, 1)',
  'getChipSurfaceAttributes({ variant: state, interactive: true })',
  'data-state={state}',
  "isGlassState && 'frosted-surface',",
  'style={animateWidth ? getAnimatedInlineSizeStyle(style, inlineSize) : style}',
  'chip-surface__slot chip-button__prefix',
  'chip-surface__content chip-button__text',
  'type="button"',
]) {
  assertIncludes(source, snippet, `ChipButton source must include ${snippet}.`)
}

for (const [block, snippet, message] of [
  [baseBlock, 'display: inline-flex;', 'ChipButton must match ChipButton inline-flex layout.'],
  [baseBlock, 'justify-content: flex-start;', 'ChipButton must keep prefix and text left-aligned during width transitions.'],
  [baseBlock, 'gap: 4px;', 'Shared ChipSurface gap must stay 4px so Chip and TagBread spacing do not change.'],
  [baseBlock, 'padding: 6px 10px;', 'ChipButton must match ChipButton padding.'],
  [baseBlock, 'border: 1px solid transparent;', 'ChipButton must start with a transparent border.'],
  [baseBlock, 'border-radius: var(--radius-round);', 'ChipButton must match ChipButton radius.'],
  [baseBlock, 'background: transparent;', 'ChipButton base must leave background to layers and hover.'],
  [baseBlock, 'isolation: isolate;', 'ChipButton must isolate visual layers.'],
  [baseBlock, 'overflow: hidden;', 'ChipButton must clip visual layers to capsule radius.'],
  [baseBlock, '--animated-inline-size-transition-duration: 180ms;', 'ChipButton width transitions must use the shared 180ms duration when enabled.'],
  [baseBlock, '--chip-surface-state-transition-duration: 180ms;', 'ChipButton hover and state transitions must stay independent from width transitions.'],
  [baseBlock, '--chip-surface-hover-background: var(--color-bg-hover);', 'ChipButton must keep a stable shared hover background token for visual layers.'],
  [baseBlock, '--chip-surface-active-background: var(--color-bg-hover);', 'ChipButton must keep a stable shared active background token for visual layers.'],
  [baseBlock, 'transition:', 'ChipButton must transition state changes.'],
  [baseBlock, 'inline-size var(--animated-inline-size-transition-duration) cubic-bezier(0.2, 0, 0, 1)', 'ChipButton must be able to animate measured content-width changes without custom CSS.'],
  [baseBlock, 'border-color var(--chip-surface-state-transition-duration) ease', 'ChipButton border transition must use the shared state duration variable.'],
  [baseBlock, 'color var(--chip-surface-state-transition-duration) ease', 'ChipButton color transition must use the shared state duration variable.'],
  [defaultLayerBlock, 'background: var(--color-bg-chip);', 'ChipButton default layer must use the shared brand chip surface.'],
  [defaultLayerBlock, 'opacity var(--chip-surface-state-transition-duration) ease', 'ChipButton default layer opacity transition must use the shared state duration variable.'],
  [defaultLayerBlock, 'transform var(--chip-surface-state-transition-duration) ease', 'ChipButton default layer transform transition must use the shared state duration variable.'],
  [defaultLayerBlock, 'background-color var(--chip-surface-state-transition-duration) ease', 'ChipButton default layer hover repaint must fade like icon buttons.'],
  [glassLayerBlock, 'opacity var(--chip-surface-state-transition-duration) ease', 'ChipButton glass layer opacity transition must use the shared state duration variable.'],
  [glassLayerBlock, 'transform var(--chip-surface-state-transition-duration) ease', 'ChipButton glass layer transform transition must use the shared state duration variable.'],
  [glassLayerBlock, 'background-color var(--chip-surface-state-transition-duration) ease', 'ChipButton glass layer hover tint must fade like icon buttons.'],
  [glassBaseBlock, 'border-color: var(--glass-surface-border);', 'ChipButton glass state must transition to the standard glass surface border.'],
  [glassBaseBlock, 'backdrop-filter: blur(var(--glass-blur));', 'ChipButton glass state must use shared glass blur.'],
  [defaultStateBeforeBlock, 'opacity: 1;', 'ChipButton default state must show default layer.'],
  [defaultStateAfterBlock, 'opacity: 0;', 'ChipButton default state must hide glass layer.'],
  [glassStateBeforeBlock, 'opacity: 0;', 'ChipButton glass state must hide default layer.'],
  [glassStateAfterBlock, 'opacity: 1;', 'ChipButton glass state must show glass layer.'],
  [hoverLayerBlock, 'background: var(--chip-surface-hover-background);', 'ChipButton hover must retint the visible layer through ChipSurface instead of fading it out.'],
  [activeLayerBlock, 'background: var(--chip-surface-active-background);', 'ChipButton active must retint the visible layer through ChipSurface instead of fading it out.'],
  [slotBlock, 'align-self: center;', 'ChipButton prefix slot must be vertically centered instead of baseline-aligned.'],
  [slotBlock, 'align-items: center;', 'ChipButton prefix content must be vertically centered within the slot.'],
  [slotBlock, 'justify-content: center;', 'ChipButton prefix content must stay centered horizontally within the slot.'],
  [contentBlock, 'z-index: 1;', 'ChipButton content must stay above visual layers.'],
  [chipButtonBlock, 'gap: 1px;', 'ChipButton must tighten its own prefix/text gap without changing shared ChipSurface spacing.'],
  [textBlock, 'overflow: hidden;', 'ChipButton text must hide overflowing content.'],
  [textBlock, 'text-overflow: clip;', 'ChipButton text overflow must be clipped without an ellipsis.'],
  [textBlock, 'white-space: nowrap;', 'ChipButton text must stay on one line when clipped.'],
  [reducedMotionBlock, 'transition-duration: 1ms;', 'ChipButton must respect reduced motion.'],
  [previewWidthExampleBlock, 'position: relative;', 'ChipButton width example must anchor its hidden measurement chip.'],
  [previewWidthExampleBlock, 'display: inline-grid;', 'ChipButton width example must keep the animated slot inline.'],
  [previewWidthSlotBlock, '--chip-button-preview-width-transition-duration: 180ms;', 'ChipButton width example must use the standard 180ms transition duration.'],
  [previewWidthSlotBlock, 'display: inline-block;', 'ChipButton width slot must allow inline-size animation.'],
  [previewWidthSlotBlock, 'overflow: visible;', 'ChipButton width slot must keep the animated chip visible outside the measured width box.'],
  [previewWidthSlotBlock, 'transition: inline-size var(--chip-button-preview-width-transition-duration) cubic-bezier(0.2, 0, 0, 1);', 'ChipButton width slot must animate inline-size with the standard duration.'],
  [previewWidthSlotChipBlock, 'width: 100%;', 'ChipButton width example must let the visible chip fill the animated slot.'],
  [previewWidthMeasureBlock, 'position: absolute;', 'ChipButton width measurement chip must be removed from normal layout.'],
  [previewWidthMeasureBlock, 'inline-size: max-content;', 'ChipButton width measurement chip must expose natural content width.'],
  [previewWidthMeasureBlock, 'visibility: hidden;', 'ChipButton width measurement chip must not be visible.'],
  [previewWidthMeasureBlock, 'pointer-events: none;', 'ChipButton width measurement chip must not intercept interactions.'],
  [previewWidthMeasureChipBlock, 'width: max-content;', 'ChipButton width measurement chip must measure the unconstrained capsule width.'],
  [previewWidthMeasureChipBlock, 'max-width: none;', 'ChipButton width measurement chip must not inherit preview constraints.'],
]) {
  assertIncludes(block, snippet, message)
}
assert.ok(
  !css.includes('--glass-gradient'),
  'ChipButton wrapper CSS must not depend directly on a shared glass background gradient token.',
)
assert.ok(
  !baseBlock.includes('box-shadow') &&
    !glassBaseBlock.includes('box-shadow') &&
    !css.includes('--glass-shadow'),
  'ChipButton glass state must not use glass shadow effects.',
)

assert.ok(
  !hoverLayerBlock.includes('opacity: 0;') && !activeLayerBlock.includes('opacity: 0;'),
  'ChipButton hover and active must not fade visual layers out because that causes dark-mode background flicker.',
)
assert.ok(
  tokensCss.includes('--color-bg-chip: hsl(40 12% 92%);') &&
    tokensCss.includes('--color-bg-chip: hsl(0 0% 19%);'),
  'ChipButton brand chip surface token must derive from the local neutral brand theme by default.',
)
assert.ok(
  !/\.chip-surface\[data-interactive="true"\]:(?:hover|active)::(?:before|after)[^{]*\{[^}]*opacity:\s*0;/.test(surfaceCss),
  'ChipButton CSS must not contain hover or active pseudo-layer opacity fades.',
)
assert.ok(
  !textBlock.includes('text-overflow: ellipsis;'),
  'ChipButton text overflow must not render an ellipsis.',
)

assert.ok(
  docsSource.includes("import { useLayoutEffect, useRef, useState } from 'react'") &&
    docsSource.includes("import { ChipButton } from '../../components/chip-button'") &&
    docsSource.includes("import { PreviewToggle, SurfaceBorderToggle } from '../preview-toggle'") &&
    docsSource.includes("id: 'capsule'") &&
    docsSource.includes("const [state, setState] = useState<'default' | 'glass'>('default')") &&
    docsSource.includes("const [widthMode, setWidthMode] = useState<'short' | 'long'>('short')") &&
    docsSource.includes('const widthMeasureRef = useRef<HTMLSpanElement | null>(null)') &&
    docsSource.includes('const [widthPreviewSize, setWidthPreviewSize] = useState<number | null>(null)') &&
    docsSource.includes("const widthPreviewLabel = widthMode === 'short' ? '短标签' : '观察宽度变化的长标签'") &&
    docsSource.includes('const widthPreviewStyle = widthPreviewSize === null') &&
    docsSource.includes('inlineSize: `${widthPreviewSize}px`') &&
    docsSource.includes('useLayoutEffect(() => {') &&
    docsSource.includes('widthMeasureRef.current') &&
    docsSource.includes('getBoundingClientRect().width') &&
    docsSource.includes('setWidthPreviewSize((currentSize) =>') &&
    docsSource.includes('<ChipButton state={state}>') &&
    docsSource.includes('<ChipButton state="default">') &&
    docsSource.includes('<ChipButton state="glass">') &&
    docsSource.includes('className="chip-button-preview__width-example"') &&
    docsSource.includes('className="chip-button-preview__width-slot"') &&
    docsSource.includes('style={widthPreviewStyle}') &&
    docsSource.includes('className="chip-button-preview__width-measure"') &&
    docsSource.includes('ref={widthMeasureRef}') &&
    docsSource.includes('aria-label="ChipButton 宽度变化预览"') &&
    docsSource.includes("checked={state === 'glass'}") &&
    docsSource.includes("label={state === 'glass' ? '磨砂态' : '默认态'}") &&
    docsSource.includes("checked={widthMode === 'long'}") &&
    docsSource.includes("label={widthMode === 'long' ? '长标签' : '短标签'}"),
  'ChipButton docs definition must include an internal preview with state and width-change toggles.',
)
assert.ok(
  !docsSource.includes("import { Button } from '../../components/coss/button'") &&
    !/<Button\b/.test(docsSource),
  'ChipButton docs text toggles must not use coss Button.',
)
assert.ok(
  docsSource.includes(
    '<div className="text-button-preview" aria-label="ChipButton 默认态与磨砂态预览">',
  ) && appCss.includes('.text-button-preview'),
  'Capsule chip-button demo card must lay out its buttons in the shared 12px-gap preview row.',
)
assert.ok(
  definitionsIndexSource.includes("import { capsuleDefinition } from './capsule'") &&
    definitionsIndexSource.includes('capsule: capsuleDefinition') &&
    !definitionsIndexSource.includes('chip-button'),
  'Component definitions index must register ChipButton through the merged Capsule page.',
)
assert.ok(
  manifestSource.includes("id: 'chip-button'") &&
    manifestSource.includes("name: 'ChipButton'") &&
    manifestSource.includes("registryName: 'chip-button'") &&
    manifestSource.includes("packageExport: './components/chip-button'") &&
    manifestSource.includes('docs: false') &&
    manifestSource.includes('registry: true') &&
    !manifestSource.includes("internalGroup: 'tag-tree'"),
  'Component manifest must keep ChipButton registry-only after the Capsule page merge.',
)
