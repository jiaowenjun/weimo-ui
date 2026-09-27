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

function assertIncludes(source, snippet, message) {
  assert.ok(source.includes(snippet), message)
}

const packageJson = readJson('package.json')
const rootRegistry = readJson('registry.json')
const source = readProjectFile('packages/weimo-ui-core/src/components/chip.tsx')
const css = readProjectFile('packages/weimo-ui-core/src/components/chip.css')
const surfaceCss = readProjectFile('packages/weimo-ui-core/src/components/capsule-frame.css')
const frostedSurfaceCss = readProjectFile('packages/weimo-ui-core/src/components/frosted-surface.css')
const docsSource = readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/chip.tsx')
const definitionsIndexSource = readProjectFile('packages/weimo-ui-site/src/docs/catalog/definitions.ts')
const manifestSource = readProjectFile('packages/weimo-ui-site/src/docs/components-manifest.ts')
const appCss = readProjectFile('packages/weimo-ui-site/src/App.css')
const previewCardCss = readProjectFile('packages/weimo-ui-core/src/components/component-preview-card.css')

const baseBlock = cssBlockFor(surfaceCss, '.capsule-frame')
const chipGapBlock = cssBlockFor(css, '.chip')
const chipLiquidBlock = cssBlockFor(css, '.chip--liquid-glass')
const chipLiquidToneBlock = cssBlockFor(css, `.chip--liquid-glass[data-background-tone='light']`)
const chipPrefixPaddingBlock = cssBlockFor(css, '.chip[data-has-prefix]')
const chipSuffixPaddingBlock = cssBlockFor(css, '.chip[data-has-suffix]')
const defaultLayerBlock = cssBlockFor(surfaceCss, '.capsule-frame::before')
const glassLayerBlock = cssBlockFor(surfaceCss, '.capsule-frame::after')
const solidFrameBlock = cssBlockFor(surfaceCss, '.capsule-frame[data-material="solid"]')
const defaultVariantBeforeBlock = cssBlockFor(surfaceCss, '.capsule-frame[data-material="solid"]::before')
const defaultVariantAfterBlock = cssBlockFor(surfaceCss, '.capsule-frame[data-material="solid"]::after')
const glassVariantBlock = cssBlockFor(surfaceCss, '.capsule-frame.frosted-surface')
const glassVariantBeforeBlock = cssBlockFor(surfaceCss, '.capsule-frame[data-material="frosted"]::before')
const glassVariantAfterBlock = cssBlockFor(surfaceCss, '.capsule-frame[data-material="frosted"]::after')
const frostedSurfaceBlock = cssBlockFor(frostedSurfaceCss, '.frosted-surface')
const frostedBorderBlock = cssBlockFor(frostedSurfaceCss, '.frosted-surface--bordered')
const slotBlock = cssBlockFor(surfaceCss, '.capsule-frame__slot')
const contentBlock = cssBlockFor(surfaceCss, '.capsule-frame__content')
const reducedMotionBlock = cssBlockFor(
  surfaceCss,
  `.capsule-frame,
    .capsule-frame.frosted-surface,
    .capsule-frame::before,
    .capsule-frame::after`,
)
const previewAlignBlock = cssBlockFor(
  previewCardCss,
  '.component-preview-card--align-center .base-card__content',
)

assert.ok(
  packageJson.scripts?.['test:contracts']?.includes('run-contract-tests.mjs'),
  'package.json test script must run chip-contract.test.mjs.',
)
assert.equal(
  packageJson.exports?.['./components/chip'],
  './packages/weimo-ui-core/src/components/chip.tsx',
  'Chip must have a public package export.',
)
assert.ok(
  rootRegistry.items.some((item) => item.name === 'chip'),
  'Chip must be listed in registry.json.',
)
assert.ok(
  existsSync(join(root, 'registry/chip.json')),
  'Chip must have registry/chip.json.',
)

for (const snippet of [
  "import type { ComponentPropsWithoutRef, ReactNode } from 'react'",
  "from './animated-inline-size'",
  "from './animated-inline-size-model'",
  "from './capsule-frame'",
  "import './chip.css'",
  "export type ChipVariant = 'default' | 'frosted' | 'liquid-glass'",
  'type ChipContent = Exclude<ReactNode, boolean | null | undefined>',
  "export type ChipProps = Omit<ComponentPropsWithoutRef<'span'>, 'children' | 'content' | 'prefix'> & {",
  'bordered?: boolean',
  'prefix?: ReactNode',
  'content: ChipContent',
  'suffix?: ReactNode',
  'variant?: ChipVariant',
  'function isEmptyChipSlot(slot: ReactNode)',
  "throw new Error('Chip content cannot be empty.')",
  'export function Chip',
  'bordered = true',
  "variant = 'default'",
  'getFrostedSurfaceClassName,',
  'useFrostedSurfaceBackgroundToneRef,',
  "import './frosted-surface.css'",
  "const isFrostedVariant = variant === 'frosted'",
  'isFrostedVariant ? backgroundTone ?? undefined : undefined',
  "getCapsuleFrameClassName(",
  'const capsuleFrameAttributes = getCapsuleFrameAttributes({',
  "material: isFrostedVariant ? 'frosted' : 'solid'",
  "getFrostedSurfaceClassName(bordered ? 'frosted-surface--bordered' : undefined)",
  'useAnimatedInlineSize([',
  '...getAnimatedInlineSizeStyle(style, inlineSize), ...backgroundStyle',
  '<AnimatedInlineSizeMeasure measureRef={measureRef}>',
  'capsule-frame__slot chip__slot chip__slot--prefix',
  'capsule-frame__content chip__content',
  'capsule-frame__slot chip__slot chip__slot--suffix',
  "data-has-prefix={isEmptyChipSlot(prefix) ? undefined : 'true'}",
  "data-has-suffix={isEmptyChipSlot(suffix) ? undefined : 'true'}",
  "import { LiquidGlassSurface } from './liquid-glass'",
  "const isLiquidGlassVariant = variant === 'liquid-glass'",
  "'chip--liquid-glass'",
]) {
  assertIncludes(source, snippet, `Chip source must include ${snippet}.`)
}
assert.ok(
  !source.includes('ButtonHTMLAttributes') &&
    !source.includes('type="button"') &&
    !source.includes("'capsule-button'"),
  'Chip must be a neutral internal slot surface rather than another button wrapper.',
)
assert.ok(
  !source.includes('textSize') &&
    !source.includes('ChipTextSize') &&
    !surfaceCss.includes('data-text-size'),
  'Chip must support the single small text size only; the size parameter stays removed from the capsule frame.',
)

for (const [block, snippet, message] of [
  [baseBlock, 'display: inline-flex;', 'Chip must match CapsuleButton inline-flex layout.'],
  [baseBlock, 'max-width: 100%;', 'Chip must fit narrow containers.'],
  [baseBlock, 'min-width: 0;', 'Chip must allow clipped content inside narrow containers.'],
  [baseBlock, 'align-items: center;', 'Chip must vertically align arbitrary slot content.'],
  [baseBlock, 'justify-content: flex-start;', 'Chip must keep prefix and content left-aligned during width transitions.'],
  [baseBlock, 'gap: 4px;', 'The shared CapsuleFrame base gap stays 4px; Chip tightens its own gap to 1px.'],
  [chipGapBlock, 'gap: 1px;', 'Chip must keep the tight uniform 1px inner gap between icons and text like CapsuleButton.'],
  [baseBlock, 'padding: 6px 10px;', 'Chip must match CapsuleButton padding.'],
  [chipPrefixPaddingBlock, 'padding-left: 6px;', 'Chip with a prefix must sit the icon 6px from the left border like CapsuleButton.'],
  [chipSuffixPaddingBlock, 'padding-right: 6px;', 'Chip with a suffix must sit the icon 6px from the right border like CapsuleButton.'],
  [chipLiquidBlock, 'color: var(--glass-surface-fg-on-dark);', 'Chip liquid glass variant must default its label color to the on-dark glass token.'],
  [chipLiquidToneBlock, 'color: var(--glass-surface-fg-on-light);', 'Chip liquid glass variant must flip its label color on light backgrounds via its own tone sampling.'],
  [solidFrameBlock, 'border: 1px solid transparent;', 'Solid Chip must keep transparent border geometry without overriding its frosted border.'],
  [baseBlock, 'border-radius: var(--radius-round);', 'Chip must match CapsuleButton radius.'],
  [baseBlock, 'background: transparent;', 'Chip base must leave background to visual layers.'],
  [solidFrameBlock, 'color: var(--color-primary);', 'Solid Chip must match CapsuleButton primary text color without overriding its frosted foreground.'],
  [baseBlock, 'line-height: 1;', 'Chip must match CapsuleButton compact line height.'],
  [baseBlock, 'isolation: isolate;', 'Chip must isolate visual layers.'],
  [baseBlock, 'overflow: hidden;', 'Chip must clip visual layers to capsule radius.'],
  [baseBlock, '--animated-inline-size-transition-duration: 180ms;', 'Chip width transitions must use the shared 180ms duration.'],
  [baseBlock, '--capsule-frame-state-transition-duration: 180ms;', 'Chip state transitions must stay independent from width transitions.'],
  [baseBlock, 'inline-size var(--animated-inline-size-transition-duration) cubic-bezier(0.2, 0, 0, 1)', 'Chip must animate measured content-width changes.'],
  [baseBlock, 'border-color var(--capsule-frame-state-transition-duration) ease', 'Chip border transition must use the shared state duration variable.'],
  [baseBlock, 'color var(--capsule-frame-state-transition-duration) ease', 'Chip color transition must use the shared state duration variable.'],
  [defaultLayerBlock, 'background: var(--color-bg-chip);', 'Chip default layer must use the shared brand chip surface.'],
  [defaultLayerBlock, 'opacity var(--capsule-frame-state-transition-duration) ease', 'Chip default layer opacity transition must use the shared state duration variable.'],
  [defaultLayerBlock, 'background-color var(--capsule-frame-state-transition-duration) ease', 'Chip default layer hover repaint must fade like icon buttons.'],
  [glassLayerBlock, 'opacity var(--capsule-frame-state-transition-duration) ease', 'Chip glass layer opacity transition must use the shared state duration variable.'],
  [glassLayerBlock, 'background-color var(--capsule-frame-state-transition-duration) ease', 'Chip glass layer hover tint must fade like icon buttons.'],
  [defaultVariantBeforeBlock, 'opacity: 1;', 'Chip default variant must show default layer.'],
  [defaultVariantAfterBlock, 'opacity: 0;', 'Chip default variant must hide glass layer.'],
  [frostedSurfaceBlock, 'color: var(--glass-surface-fg);', 'Chip glass variant must use the standard frosted surface adaptive foreground.'],
  [frostedBorderBlock, 'border-color: var(--glass-surface-border);', 'Chip glass variant must use the standard frosted surface border token.'],
  [frostedSurfaceBlock, 'backdrop-filter: blur(var(--glass-blur));', 'Chip glass variant must use shared frosted blur.'],
  [glassVariantBlock, '--capsule-frame-hover-background: var(--glass-surface-hover-bg);', 'Chip glass variant hover tint must use the glass surface currentColor mix instead of the fixed bg-hover token.'],
  [glassVariantBeforeBlock, 'opacity: 0;', 'Chip glass variant must hide default layer.'],
  [glassVariantAfterBlock, 'opacity: 1;', 'Chip glass variant must show glass layer.'],
  [baseBlock, 'font-size: var(--font-size-sm);', 'Chip must render the single small text size from the shared capsule frame.'],
  [slotBlock, 'display: inline-flex;', 'Chip slots must support icons, strings, and nested controls.'],
  [slotBlock, 'flex: none;', 'Chip optional slots must not shrink the required content.'],
  [slotBlock, 'align-self: center;', 'Chip prefix and suffix slots must be vertically centered instead of baseline-aligned.'],
  [slotBlock, 'align-items: center;', 'Chip prefix and suffix contents must be vertically centered within their slots.'],
  [slotBlock, 'justify-content: center;', 'Chip prefix and suffix contents must stay centered horizontally within their slots.'],
  [contentBlock, 'min-width: 0;', 'Chip content must shrink before optional slots.'],
  [contentBlock, 'overflow: hidden;', 'Chip content must hide overflowing content.'],
  [contentBlock, 'text-overflow: clip;', 'Chip content overflow must be clipped without an ellipsis.'],
  [contentBlock, 'white-space: nowrap;', 'Chip content must stay on one line when clipped.'],
  [reducedMotionBlock, 'transition-duration: 1ms;', 'Chip must respect reduced motion.'],
  [previewAlignBlock, 'display: flex;', 'Aligned preview card bodies must lay inline examples in one flow.'],
  [previewAlignBlock, 'align-content: center;', 'Aligned preview card bodies must center wrapped example rows.'],
  [previewAlignBlock, 'align-items: center;', 'Chip docs examples must be vertically centered in the preview area.'],
  [previewAlignBlock, 'justify-content: center;', 'Chip docs examples must be horizontally centered in the preview area.'],
]) {
  assertIncludes(block, snippet, message)
}
assert.ok(
  !glassLayerBlock.includes('background: var(--glass-gradient);') && !css.includes('--glass-gradient'),
  'Chip glass layer must not depend on a shared glass background gradient token.',
)
assert.ok(
  !baseBlock.includes('box-shadow') &&
    !frostedSurfaceBlock.includes('box-shadow') &&
    !css.includes('--glass-shadow'),
  'Chip glass variant must not use glass shadow effects.',
)
assert.ok(
  !source.includes('interactive: true') &&
    !css.includes('cursor: pointer') &&
    !css.includes('appearance: none') &&
    !css.includes('transform: scale(0.97)') &&
    !css.includes('.chip:hover'),
  'Chip must not inherit CapsuleButton-only interactive button affordances.',
)

assert.ok(
  docsSource.includes("id: 'chip'") &&
    docsSource.includes('preview: () => <CapsuleDemo />') &&
    docsSource.includes("import { Chip } from 'weimo-ui-core/components/chip'") &&
    docsSource.includes('<Chip content="普通胶囊"') &&
    !docsSource.includes('textSize=') &&
    !docsSource.includes('胶囊尺寸') &&
    !docsSource.includes('CapsuleButton'),
  'The core Capsule page must demo non-interactive Chip variants without importing tagtree controls.',
)
assert.ok(
  !docsSource.includes('className="internal-chip-preview"') &&
    !docsSource.includes('className="internal-chip-preview__row"') &&
    !appCss.includes('.internal-chip-preview__row') &&
    !/\.internal-chip-preview\s*\{/.test(appCss),
  'Chip docs cards must not revive the removed internal-chip-preview wrapper chrome.',
)
assert.ok(
  !appCss.includes('.internal-chip-preview__action'),
  'Chip docs must not revive custom suffix-action preview CSS.',
)
assert.ok(
  definitionsIndexSource.includes("import { chipDefinition } from './packages/weimo-ui-core/chip'") &&
    definitionsIndexSource.includes('chip: chipDefinition'),
  'Component definitions index must register the core Capsule page.',
)
assert.ok(
  manifestSource.includes("id: 'chip'") &&
    manifestSource.includes("name: '胶囊'") &&
    manifestSource.includes("exportName: 'Chip'") &&
    manifestSource.includes("registryName: 'chip'") &&
    manifestSource.includes("packageExport: './components/chip'") &&
    manifestSource.includes("packageName: 'weimo-ui-core'") &&
    manifestSource.includes("page: 'chip'") &&
    manifestSource.includes('docs: true') &&
    manifestSource.includes('registry: true') &&
    !manifestSource.includes("internalGroup: 'tag-tree'"),
  'Component manifest must list Chip as a public registry component through the merged Capsule page.',
)
assert.ok(
  existsSync(join(root, 'packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/chip.tsx')) &&
    existsSync(join(root, 'packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-tagtree/capsule-button.tsx')),
  'Chip and CapsuleButton keep their own core docs pages named after their components.',
)
