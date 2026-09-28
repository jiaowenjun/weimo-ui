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
const source = readProjectFile('packages/weimo-ui-core/src/components/controls/capsule/capsule-button.tsx')
const css = readProjectFile('packages/weimo-ui-core/src/components/controls/capsule/capsule-button.css')
const surfaceCss = readProjectFile('packages/weimo-ui-core/src/components/controls/capsule/capsule-frame.css')
const frostedSurfaceCss = readProjectFile('packages/weimo-ui-core/src/components/surfaces/frosted-surface/frosted-surface.css')
const tokensCss = readProjectFile('packages/weimo-ui-core/src/styles/tokens.css')
const docsSource = readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/capsule-button.tsx')
const definitionsIndexSource = readProjectFile('packages/weimo-ui-site/src/docs/catalog/definitions.ts')
const appCss = readProjectFile('packages/weimo-ui-site/src/app/app.css')

const baseBlock = cssBlockFor(surfaceCss, '.capsule-frame')
const defaultLayerBlock = cssBlockFor(surfaceCss, '.capsule-frame::before')
const glassLayerBlock = cssBlockFor(surfaceCss, '.capsule-frame::after')
const solidFrameBlock = cssBlockFor(surfaceCss, '.capsule-frame[data-material="solid"]')
const glassBaseBlock = cssBlockFor(surfaceCss, '.capsule-frame.frosted-surface')
const frostedSurfaceBlock = cssBlockFor(frostedSurfaceCss, '.frosted-surface')
const frostedBorderBlock = cssBlockFor(frostedSurfaceCss, '.frosted-surface--bordered')
const defaultStateBeforeBlock = cssBlockFor(surfaceCss, '.capsule-frame[data-material="solid"]::before')
const defaultStateAfterBlock = cssBlockFor(surfaceCss, '.capsule-frame[data-material="solid"]::after')
const glassStateBeforeBlock = cssBlockFor(surfaceCss, '.capsule-frame[data-material="frosted"]::before')
const glassStateAfterBlock = cssBlockFor(surfaceCss, '.capsule-frame[data-material="frosted"]::after')
const hoverLayerBlock = cssBlockFor(
  surfaceCss,
  `.capsule-frame[data-interactive="true"]:hover::before,
    .capsule-frame[data-interactive="true"]:hover::after`,
)
const activeLayerBlock = cssBlockFor(
  surfaceCss,
  `.capsule-frame[data-interactive="true"]:active::before,
  .capsule-frame[data-interactive="true"]:active::after`,
)
const slotBlock = cssBlockFor(surfaceCss, '.capsule-frame__slot')
const contentBlock = cssBlockFor(surfaceCss, '.capsule-frame__content')
const capsuleButtonBlock = standaloneCssBlockFor(css, 'button.capsule-button')
const capsuleButtonPrefixPaddingBlock = standaloneCssBlockFor(css, 'button.capsule-button[data-has-prefix]')
const capsuleButtonSuffixPaddingBlock = standaloneCssBlockFor(css, 'button.capsule-button[data-has-suffix]')
const textBlock = standaloneCssBlockFor(css, '.capsule-button__text')
const capsuleButtonLiquidBlock = cssBlockFor(css, '.capsule-button--liquid-glass')
const capsuleButtonLiquidToneBlock = cssBlockFor(css, `.capsule-button--liquid-glass[data-background-tone='light']`)
const reducedMotionBlock = cssBlockFor(
  surfaceCss,
  `.capsule-frame,
    .capsule-frame.frosted-surface,
    .capsule-frame::before,
    .capsule-frame::after`,
)
const previewWidthExampleBlock = cssBlockFor(appCss, '.capsule-button-preview__width-example')
const previewWidthSlotBlock = cssBlockFor(appCss, '.capsule-button-preview__width-slot')
const previewWidthSlotChipBlock = cssBlockFor(appCss, '.capsule-button-preview__width-slot .capsule-button')
const previewWidthMeasureBlock = cssBlockFor(appCss, '.capsule-button-preview__width-measure')
const previewWidthMeasureChipBlock = cssBlockFor(appCss, '.capsule-button-preview__width-measure .capsule-button')
assert.ok(
  !appCss.includes('.capsule-button-preview__controls') &&
    !/\.capsule-button-preview\s*\{/.test(appCss) &&
    !appCss.includes('.capsule-button-preview__panel') &&
    !appCss.includes('.capsule-button-preview__row'),
  'CapsuleButton preview cards must inherit ComponentPreviewCard default layout; only the width-demo mechanism keeps custom CSS.',
)

assert.equal(
  packageJson.exports?.['./components/capsule-button'],
  './packages/weimo-ui-core/src/components/controls/capsule/capsule-button.tsx',
  'CapsuleButton must have a public package export.',
)
assert.ok(
  rootRegistry.items.some((item) => item.name === 'capsule-button'),
  'CapsuleButton must be listed in registry.json.',
)
assert.ok(
  existsSync(join(root, 'registry/capsule-button.json')),
  'CapsuleButton must have registry/capsule-button.json.',
)

for (const snippet of [
  "import type { ButtonHTMLAttributes, MouseEvent, ReactElement, ReactNode } from 'react'",
  "import { Hash } from 'lucide-react'",
  "from 'weimo-ui-core/components/animated-inline-size'",
  "from 'weimo-ui-core/components/animated-inline-size-model'",
  "from './capsule-frame'",
  "import './capsule-button.css'",
  "export type CapsuleButtonState = 'default' | 'frosted' | 'liquid-glass'",
  'export type CapsuleButtonProps',
  "Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'prefix'>",
  'animateWidth?: boolean',
  'prefix?: ReactElement | null',
  'state?: CapsuleButtonState',
  'suffix?: ReactElement | null',
  'export function CapsuleButton',
  'animateWidth = false',
  'prefix = <Hash aria-hidden="true" />',
  "state = 'default'",
  'function isEmptyCapsuleButtonSlot',
  '{isEmptyCapsuleButtonSlot(prefix) ? null : (',
  '{isEmptyCapsuleButtonSlot(suffix) ? null : (',
  'const capsuleFrameAttributes = getCapsuleFrameAttributes({',
  "material: isFrostedState ? 'frosted' : 'solid'",
  "getFrostedSurfaceClassName('frosted-surface--bordered')",
  'data-state={state}',
  "data-has-prefix={isEmptyCapsuleButtonSlot(prefix) ? undefined : 'true'}",
  "data-has-suffix={isEmptyCapsuleButtonSlot(suffix) ? undefined : 'true'}",
  "const isFrostedState = state === 'frosted'",
  "import { LiquidGlassSurface } from 'weimo-ui-core/components/liquid-glass'",
  "const isLiquidGlassState = state === 'liquid-glass'",
  'capsule-button--liquid-glass',
  '? { ...getAnimatedInlineSizeStyle(style, inlineSize), ...backgroundStyle }',
  'capsule-frame__slot capsule-button__prefix',
  'capsule-frame__content capsule-button__text',
  'capsule-frame__slot capsule-button__suffix',
  'function stopSuffixClickPropagation',
  'event.stopPropagation()',
  'onClick={stopSuffixClickPropagation}',
  'type="button"',
]) {
  assertIncludes(source, snippet, `CapsuleButton source must include ${snippet}.`)
}
assert.ok(
  !source.includes('textSize?:') &&
    !source.includes("textSize = 'sm'") &&
    !source.includes('CapsuleFrameTextSize'),
  'CapsuleButton must support the single small text size only; the textSize prop stays removed.',
)
assertIncludes(
  css,
  '.capsule-button__suffix',
  'CapsuleButton suffix widget slot must reuse the shared capsule-frame slot layout beside the prefix slot.',
)
assertIncludes(
  css,
  '--icon-button-ghost-hover-bg: var(--color-bg-nested-hover)',
  'A ghost icon button nested in the CapsuleButton suffix must hover with the nested-level token so it reads distinct from the capsule hover.',
)

for (const [block, snippet, message] of [
  [baseBlock, 'display: inline-flex;', 'CapsuleButton must match CapsuleButton inline-flex layout.'],
  [baseBlock, 'justify-content: flex-start;', 'CapsuleButton must keep prefix and text left-aligned during width transitions.'],
  [baseBlock, 'gap: 4px;', 'Shared CapsuleFrame gap must stay 4px so TagBread spacing does not change; Chip and CapsuleButton tighten their own gap to 1px.'],
  [baseBlock, 'padding: 6px 10px;', 'CapsuleButton must match CapsuleButton padding.'],
  [solidFrameBlock, 'border: 1px solid transparent;', 'Solid CapsuleButton must keep transparent border geometry without overriding its frosted border.'],
  [solidFrameBlock, 'color: hsl(var(--primary));', 'Solid CapsuleButton must keep its primary foreground without overriding its frosted foreground.'],
  [baseBlock, 'border-radius: var(--radius-round);', 'CapsuleButton must match CapsuleButton radius.'],
  [baseBlock, 'background: transparent;', 'CapsuleButton base must leave background to layers and hover.'],
  [baseBlock, 'isolation: isolate;', 'CapsuleButton must isolate visual layers.'],
  [baseBlock, 'overflow: hidden;', 'CapsuleButton must clip visual layers to capsule radius.'],
  [baseBlock, '--animated-inline-size-transition-duration: 180ms;', 'CapsuleButton width transitions must use the shared 180ms duration when enabled.'],
  [baseBlock, '--capsule-frame-state-transition-duration: 180ms;', 'CapsuleButton hover and state transitions must stay independent from width transitions.'],
  [baseBlock, '--capsule-frame-hover-background: var(--color-bg-hover);', 'CapsuleButton must keep a stable shared hover background token for visual layers.'],
  [baseBlock, '--capsule-frame-active-background: var(--color-bg-hover);', 'CapsuleButton must keep a stable shared active background token for visual layers.'],
  [baseBlock, 'transition:', 'CapsuleButton must transition state changes.'],
  [baseBlock, 'inline-size var(--animated-inline-size-transition-duration) cubic-bezier(0.2, 0, 0, 1)', 'CapsuleButton must be able to animate measured content-width changes without custom CSS.'],
  [baseBlock, 'border-color var(--capsule-frame-state-transition-duration) ease', 'CapsuleButton border transition must use the shared state duration variable.'],
  [baseBlock, 'color var(--capsule-frame-state-transition-duration) ease', 'CapsuleButton color transition must use the shared state duration variable.'],
  [defaultLayerBlock, 'background: var(--color-bg-chip);', 'CapsuleButton default layer must use the shared brand chip surface.'],
  [defaultLayerBlock, 'opacity var(--capsule-frame-state-transition-duration) ease', 'CapsuleButton default layer opacity transition must use the shared state duration variable.'],
  [defaultLayerBlock, 'transform var(--capsule-frame-state-transition-duration) ease', 'CapsuleButton default layer transform transition must use the shared state duration variable.'],
  [defaultLayerBlock, 'background-color var(--capsule-frame-state-transition-duration) ease', 'CapsuleButton default layer hover repaint must fade like icon buttons.'],
  [glassLayerBlock, 'opacity var(--capsule-frame-state-transition-duration) ease', 'CapsuleButton glass layer opacity transition must use the shared state duration variable.'],
  [glassLayerBlock, 'transform var(--capsule-frame-state-transition-duration) ease', 'CapsuleButton glass layer transform transition must use the shared state duration variable.'],
  [glassLayerBlock, 'background-color var(--capsule-frame-state-transition-duration) ease', 'CapsuleButton glass layer hover tint must fade like icon buttons.'],
  [frostedBorderBlock, 'border-color: var(--frosted-surface-border);', 'CapsuleButton glass state must transition to the standard frosted surface border.'],
  [frostedSurfaceBlock, 'backdrop-filter: blur(var(--frosted-blur));', 'CapsuleButton glass state must use shared frosted blur.'],
  [frostedSurfaceBlock, 'color: var(--frosted-surface-fg);', 'CapsuleButton glass state text color must follow the tone-adaptive fg token so it flips with the sampled background.'],
  [defaultStateBeforeBlock, 'opacity: 1;', 'CapsuleButton default state must show default layer.'],
  [defaultStateAfterBlock, 'opacity: 0;', 'CapsuleButton default state must hide glass layer.'],
  [glassStateBeforeBlock, 'opacity: 0;', 'CapsuleButton glass state must hide default layer.'],
  [glassStateAfterBlock, 'opacity: 1;', 'CapsuleButton glass state must show glass layer.'],
  [hoverLayerBlock, 'background: var(--capsule-frame-hover-background);', 'CapsuleButton hover must retint the visible layer through CapsuleFrame instead of fading it out.'],
  [activeLayerBlock, 'background: var(--capsule-frame-active-background);', 'CapsuleButton active must retint the visible layer through CapsuleFrame instead of fading it out.'],
  [slotBlock, 'align-self: center;', 'CapsuleButton prefix slot must be vertically centered instead of baseline-aligned.'],
  [slotBlock, 'align-items: center;', 'CapsuleButton prefix content must be vertically centered within the slot.'],
  [slotBlock, 'justify-content: center;', 'CapsuleButton prefix content must stay centered horizontally within the slot.'],
  [contentBlock, 'z-index: 1;', 'CapsuleButton content must stay above visual layers.'],
  [capsuleButtonBlock, 'gap: 1px;', 'CapsuleButton must keep the tight uniform 1px inner gap between the prefix icon and text across text sizes.'],
  [capsuleButtonPrefixPaddingBlock, 'padding-left: 6px;', 'CapsuleButton with a prefix must sit the icon 6px from the left border across text sizes.'],
  [capsuleButtonSuffixPaddingBlock, 'padding-right: 6px;', 'CapsuleButton with a suffix must sit the icon 6px from the right border across text sizes.'],
  [capsuleButtonLiquidBlock, 'color: var(--liquid-glass-fg-on-dark);', 'CapsuleButton liquid glass state must default its label color to the on-dark glass token.'],
  [capsuleButtonLiquidToneBlock, 'color: var(--liquid-glass-fg-on-light);', 'CapsuleButton liquid glass state must flip its label color on light backgrounds via its own tone sampling.'],
  [textBlock, 'overflow: hidden;', 'CapsuleButton text must hide overflowing content.'],
  [textBlock, 'text-overflow: clip;', 'CapsuleButton text overflow must be clipped without an ellipsis.'],
  [textBlock, 'white-space: nowrap;', 'CapsuleButton text must stay on one line when clipped.'],
  [reducedMotionBlock, 'transition-duration: 1ms;', 'CapsuleButton must respect reduced motion.'],
  [previewWidthExampleBlock, 'position: relative;', 'CapsuleButton width example must anchor its hidden measurement chip.'],
  [previewWidthExampleBlock, 'display: inline-grid;', 'CapsuleButton width example must keep the animated slot inline.'],
  [previewWidthSlotBlock, '--capsule-button-preview-width-transition-duration: 180ms;', 'CapsuleButton width example must use the standard 180ms transition duration.'],
  [previewWidthSlotBlock, 'display: inline-block;', 'CapsuleButton width slot must allow inline-size animation.'],
  [previewWidthSlotBlock, 'overflow: visible;', 'CapsuleButton width slot must keep the animated chip visible outside the measured width box.'],
  [previewWidthSlotBlock, 'transition: inline-size var(--capsule-button-preview-width-transition-duration) cubic-bezier(0.2, 0, 0, 1);', 'CapsuleButton width slot must animate inline-size with the standard duration.'],
  [previewWidthSlotChipBlock, 'width: 100%;', 'CapsuleButton width example must let the visible chip fill the animated slot.'],
  [previewWidthMeasureBlock, 'position: absolute;', 'CapsuleButton width measurement chip must be removed from normal layout.'],
  [previewWidthMeasureBlock, 'inline-size: max-content;', 'CapsuleButton width measurement chip must expose natural content width.'],
  [previewWidthMeasureBlock, 'visibility: hidden;', 'CapsuleButton width measurement chip must not be visible.'],
  [previewWidthMeasureBlock, 'pointer-events: none;', 'CapsuleButton width measurement chip must not intercept interactions.'],
  [previewWidthMeasureChipBlock, 'width: max-content;', 'CapsuleButton width measurement chip must measure the unconstrained capsule width.'],
  [previewWidthMeasureChipBlock, 'max-width: none;', 'CapsuleButton width measurement chip must not inherit preview constraints.'],
]) {
  assertIncludes(block, snippet, message)
}
assert.ok(
  !css.includes('--glass-gradient'),
  'CapsuleButton wrapper CSS must not depend directly on a shared glass background gradient token.',
)
assert.ok(
  !capsuleButtonBlock.includes('color:'),
  'The unlayered button.capsule-button block must stay geometry-only: an unlayered color would unconditionally beat the layered glass variant tone-adaptive color and pin frosted chip text.',
)
assert.ok(
  !baseBlock.includes('box-shadow') &&
    !glassBaseBlock.includes('box-shadow') &&
    !css.includes('--glass-shadow'),
  'CapsuleButton glass state must not use glass shadow effects.',
)

assert.ok(
  !hoverLayerBlock.includes('opacity: 0;') && !activeLayerBlock.includes('opacity: 0;'),
  'CapsuleButton hover and active must not fade visual layers out because that causes dark-mode background flicker.',
)
assert.ok(
  tokensCss.includes('--color-bg-chip: hsl(40 12% 92%);') &&
    tokensCss.includes('--color-bg-chip: hsl(0 0% 19%);'),
  'CapsuleButton brand chip surface token must derive from the local neutral brand theme by default.',
)
assert.ok(
  !/\.capsule-frame\[data-interactive="true"\]:(?:hover|active)::(?:before|after)[^{]*\{[^}]*opacity:\s*0;/.test(surfaceCss),
  'CapsuleButton CSS must not contain hover or active pseudo-layer opacity fades.',
)
assert.ok(
  !textBlock.includes('text-overflow: ellipsis;'),
  'CapsuleButton text overflow must not render an ellipsis.',
)

assert.ok(
  docsSource.includes("import { useLayoutEffect, useRef, useState } from 'react'") &&
    docsSource.includes("import { Hash, X } from 'lucide-react'") &&
    docsSource.includes("import { CapsuleButton } from 'weimo-ui-core/components/capsule-button'") &&
    docsSource.includes("import { GlassPreviewCard } from '../../../previews/glass-preview-card'") &&
    docsSource.includes("import { LabeledSwitch } from 'weimo-ui-core/components/labeled-switch'") &&
    docsSource.includes("id: 'capsule-button'") &&
    docsSource.includes('function CapsuleMaterialDemo') &&
    docsSource.includes('<CapsuleMaterialDemo />') &&
    docsSource.includes('label="胶囊材质"') &&
    docsSource.includes('<CapsuleButton prefix={null} state="default">普通胶囊</CapsuleButton>') &&
    docsSource.includes('<CapsuleButton prefix={null} state="frosted">磨砂胶囊</CapsuleButton>') &&
    docsSource.includes('function CapsuleSlotDemo') &&
    docsSource.includes('<CapsuleSlotDemo />') &&
    docsSource.includes('label="胶囊插槽"') &&
    docsSource.includes('prefix={<Hash aria-hidden="true" />}') &&
    docsSource.includes('suffix={') &&
    docsSource.includes('<span aria-hidden="true" className="icon-button icon-button--ghost icon-button--xs">') &&
    docsSource.includes('<X aria-hidden="true" />'),
  'Capsule docs cards must show valid button-form capsules: suffix icons stay non-interactive inside the outer CapsuleButton.',
)
assert.ok(
  docsSource.includes("const [state, setState] = useState<'default' | 'frosted'>('default')") &&
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
    docsSource.includes('<CapsuleButton state={state}>') &&
    docsSource.includes('<CapsuleButton state="default">') &&
    docsSource.includes('className="capsule-button-preview__width-example"') &&
    docsSource.includes('className="capsule-button-preview__width-slot"') &&
    docsSource.includes('style={widthPreviewStyle}') &&
    docsSource.includes('className="capsule-button-preview__width-measure"') &&
    docsSource.includes('ref={widthMeasureRef}') &&
    docsSource.includes('aria-label="CapsuleButton 宽度变化预览"') &&
    docsSource.includes("checked={state === 'frosted'}") &&
    docsSource.includes('labelOn="磨砂态"') &&
    docsSource.includes('labelOff="默认态"') &&
    docsSource.includes("checked={widthMode === 'long'}") &&
    docsSource.includes('labelOn="长标签"') &&
    docsSource.includes('labelOff="短标签"'),
  'CapsuleButton docs definition must include an internal preview with state and width-change toggles.',
)
assert.ok(
  !docsSource.includes("import { Button } from 'weimo-ui-core/components/coss/button'") &&
    !/<Button\b/.test(docsSource),
  'CapsuleButton docs text toggles must not use coss Button.',
)
assert.ok(
  ['CapsuleButton 前后缀预览'].every((demoLabel) =>
    docsSource.includes(`<div className="capsule-slot-preview" aria-label="${demoLabel}">`),
  ) &&
    appCss.includes('.capsule-slot-preview') &&
    !docsSource.includes('label="胶囊按钮"') &&
    !docsSource.includes('textSize=') &&
    !docsSource.includes('label="胶囊字号"') &&
    !docsSource.includes('label="磨砂态胶囊"'),
  'Capsule button demo cards must lay out their buttons in the slot preview row (liquid-glass shadow unclipped); the redundant state-pair and text-size cards must stay removed.',
)
assert.ok(
  definitionsIndexSource.includes("import { capsuleButtonDefinition } from './packages/weimo-ui-core/capsule-button'") &&
    definitionsIndexSource.includes("'capsule-button': capsuleButtonDefinition"),
  'Component definitions index must register the standalone core CapsuleButton page.',
)
