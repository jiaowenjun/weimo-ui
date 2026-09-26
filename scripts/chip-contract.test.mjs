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
const source = readProjectFile('src/components/chip.tsx')
const css = readProjectFile('src/components/chip.css')
const surfaceCss = readProjectFile('src/components/chip-surface.css')
const docsSource = readProjectFile('src/docs/component-definitions/capsule.tsx')
const definitionsIndexSource = readProjectFile('src/docs/component-definitions/index.ts')
const manifestSource = readProjectFile('src/docs/components-manifest.ts')
const appCss = readProjectFile('src/App.css')
const previewCardCss = readProjectFile('src/components/component-preview-card.css')

const baseBlock = cssBlockFor(surfaceCss, '.chip-surface')
const defaultLayerBlock = cssBlockFor(surfaceCss, '.chip-surface::before')
const glassLayerBlock = cssBlockFor(surfaceCss, '.chip-surface::after')
const defaultVariantBeforeBlock = cssBlockFor(surfaceCss, '.chip-surface[data-variant="default"]::before')
const defaultVariantAfterBlock = cssBlockFor(surfaceCss, '.chip-surface[data-variant="default"]::after')
const glassVariantBlock = cssBlockFor(surfaceCss, '.chip-surface[data-variant="glass"]')
const glassVariantBeforeBlock = cssBlockFor(surfaceCss, '.chip-surface[data-variant="glass"]::before')
const glassVariantAfterBlock = cssBlockFor(surfaceCss, '.chip-surface[data-variant="glass"]::after')
const smallTextBlock = cssBlockFor(surfaceCss, '.chip-surface[data-text-size="sm"]')
const baseTextBlock = cssBlockFor(surfaceCss, '.chip-surface[data-text-size="base"]')
const lgTextBlock = cssBlockFor(surfaceCss, '.chip-surface[data-text-size="lg"]')
const slotBlock = cssBlockFor(surfaceCss, '.chip-surface__slot')
const contentBlock = cssBlockFor(surfaceCss, '.chip-surface__content')
const reducedMotionBlock = cssBlockFor(
  surfaceCss,
  `.chip-surface,
    .chip-surface::before,
    .chip-surface::after`,
)
const previewAlignBlock = cssBlockFor(
  previewCardCss,
  '.component-preview-card--align-center .base-card__content',
)

assert.ok(
  packageJson.scripts?.test?.includes('scripts/chip-contract.test.mjs'),
  'package.json test script must run chip-contract.test.mjs.',
)
assert.equal(
  packageJson.exports?.['./components/chip'],
  './src/components/chip.tsx',
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
  "from './chip-surface-model'",
  "import './chip.css'",
  "export type ChipVariant = 'default' | 'glass'",
  "export type ChipTextSize = 'sm' | 'base' | 'lg'",
  'type ChipContent = Exclude<ReactNode, boolean | null | undefined>',
  "export type ChipProps = Omit<ComponentPropsWithoutRef<'span'>, 'children' | 'content' | 'prefix'> & {",
  'bordered?: boolean',
  'prefix?: ReactNode',
  'content: ChipContent',
  'suffix?: ReactNode',
  'variant?: ChipVariant',
  'textSize?: ChipTextSize',
  'function isEmptyChipSlot(slot: ReactNode)',
  "throw new Error('Chip content cannot be empty.')",
  'export function Chip',
  'bordered = true',
  "variant = 'default'",
  "textSize = 'sm'",
  "import { useFrostedSurfaceBackgroundToneRef } from './frosted-surface'",
  "import './frosted-surface.css'",
  "isGlassVariant && 'frosted-surface',",
  'isGlassVariant ? backgroundTone ?? undefined : undefined',
  "getChipSurfaceClassName(",
  'getChipSurfaceAttributes({ bordered, variant, textSize })',
  'useAnimatedInlineSize([',
  '...getAnimatedInlineSizeStyle(style, inlineSize), ...backgroundStyle',
  '<AnimatedInlineSizeMeasure measureRef={measureRef}>',
  'chip-surface__slot chip__slot chip__slot--prefix',
  'chip-surface__content chip__content',
  'chip-surface__slot chip__slot chip__slot--suffix',
]) {
  assertIncludes(source, snippet, `Chip source must include ${snippet}.`)
}
assert.ok(
  !source.includes('ButtonHTMLAttributes') &&
    !source.includes('type="button"') &&
    !source.includes("'chip-button'"),
  'Chip must be a neutral internal slot surface rather than another button wrapper.',
)

for (const [block, snippet, message] of [
  [baseBlock, 'display: inline-flex;', 'Chip must match ChipButton inline-flex layout.'],
  [baseBlock, 'max-width: 100%;', 'Chip must fit narrow containers.'],
  [baseBlock, 'min-width: 0;', 'Chip must allow clipped content inside narrow containers.'],
  [baseBlock, 'align-items: center;', 'Chip must vertically align arbitrary slot content.'],
  [baseBlock, 'justify-content: flex-start;', 'Chip must keep prefix and content left-aligned during width transitions.'],
  [baseBlock, 'gap: 4px;', 'Chip slots must have a compact gap for icons and actions.'],
  [baseBlock, 'padding: 6px 10px;', 'Chip must match ChipButton padding.'],
  [baseBlock, 'border: 1px solid transparent;', 'Chip must start with a transparent border.'],
  [baseBlock, 'border-radius: var(--radius-round);', 'Chip must match ChipButton radius.'],
  [baseBlock, 'background: transparent;', 'Chip base must leave background to visual layers.'],
  [baseBlock, 'color: var(--color-primary);', 'Chip must match ChipButton primary text color.'],
  [baseBlock, 'line-height: 1;', 'Chip must match ChipButton compact line height.'],
  [baseBlock, 'isolation: isolate;', 'Chip must isolate visual layers.'],
  [baseBlock, 'overflow: hidden;', 'Chip must clip visual layers to capsule radius.'],
  [baseBlock, '--animated-inline-size-transition-duration: 180ms;', 'Chip width transitions must use the shared 180ms duration.'],
  [baseBlock, '--chip-surface-state-transition-duration: 180ms;', 'Chip state transitions must stay independent from width transitions.'],
  [baseBlock, 'inline-size var(--animated-inline-size-transition-duration) cubic-bezier(0.2, 0, 0, 1)', 'Chip must animate measured content-width changes.'],
  [baseBlock, 'border-color var(--chip-surface-state-transition-duration) ease', 'Chip border transition must use the shared state duration variable.'],
  [baseBlock, 'color var(--chip-surface-state-transition-duration) ease', 'Chip color transition must use the shared state duration variable.'],
  [defaultLayerBlock, 'background: var(--color-bg-chip);', 'Chip default layer must use the shared brand chip surface.'],
  [defaultLayerBlock, 'opacity var(--chip-surface-state-transition-duration) ease', 'Chip default layer opacity transition must use the shared state duration variable.'],
  [defaultLayerBlock, 'background-color var(--chip-surface-state-transition-duration) ease', 'Chip default layer hover repaint must fade like icon buttons.'],
  [glassLayerBlock, 'opacity var(--chip-surface-state-transition-duration) ease', 'Chip glass layer opacity transition must use the shared state duration variable.'],
  [glassLayerBlock, 'background-color var(--chip-surface-state-transition-duration) ease', 'Chip glass layer hover tint must fade like icon buttons.'],
  [defaultVariantBeforeBlock, 'opacity: 1;', 'Chip default variant must show default layer.'],
  [defaultVariantAfterBlock, 'opacity: 0;', 'Chip default variant must hide glass layer.'],
  [glassVariantBlock, 'color: var(--glass-surface-fg);', 'Chip glass variant must use the standard glass surface adaptive foreground.'],
  [glassVariantBlock, 'border-color: var(--glass-surface-border);', 'Chip glass variant must use the standard glass surface border token.'],
  [glassVariantBlock, 'backdrop-filter: blur(var(--glass-blur));', 'Chip glass variant must use shared glass blur.'],
  [glassVariantBlock, '--chip-surface-hover-background: var(--glass-surface-hover-bg);', 'Chip glass variant hover tint must use the glass surface currentColor mix instead of the fixed bg-hover token.'],
  [glassVariantBeforeBlock, 'opacity: 0;', 'Chip glass variant must hide default layer.'],
  [glassVariantAfterBlock, 'opacity: 1;', 'Chip glass variant must show glass layer.'],
  [smallTextBlock, 'font-size: var(--font-size-sm);', 'Chip small text size must use the shared small token.'],
  [baseTextBlock, 'font-size: var(--font-size-base);', 'Chip base text size must use the shared base token.'],
  [lgTextBlock, 'font-size: var(--font-size-lg);', 'Chip lg text size must use the shared title token.'],
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
    !glassVariantBlock.includes('box-shadow') &&
    !css.includes('--glass-shadow'),
  'Chip glass variant must not use glass shadow effects.',
)
assert.ok(
  !source.includes('interactive: true') &&
    !css.includes('cursor: pointer') &&
    !css.includes('appearance: none') &&
    !css.includes('transform: scale(0.97)') &&
    !css.includes('.chip:hover'),
  'Chip must not inherit ChipButton-only interactive button affordances.',
)

assert.ok(
  docsSource.includes("id: 'capsule'") &&
    docsSource.includes('preview: () => <CapsuleDemo />') &&
    !docsSource.includes("import { Chip } from '../../components/chip'") &&
    !docsSource.includes('<Chip ') &&
    !docsSource.includes('<Chip\n'),
  'Capsule docs must demo button-form capsules only; plain text Chip examples must stay removed from the page.',
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
  definitionsIndexSource.includes("import { capsuleDefinition } from './capsule'") &&
    definitionsIndexSource.includes('capsule: capsuleDefinition') &&
    !definitionsIndexSource.includes("from './chip'"),
  'Component definitions index must register the merged Capsule page.',
)
assert.ok(
  manifestSource.includes("id: 'capsule'") &&
    manifestSource.includes("name: '胶囊'") &&
    manifestSource.includes("exportName: 'Chip'") &&
    manifestSource.includes("registryName: 'chip'") &&
    manifestSource.includes("packageExport: './components/chip'") &&
    manifestSource.includes('registry: true') &&
    !manifestSource.includes("id: 'chip',") &&
    !manifestSource.includes("internalGroup: 'tag-tree'"),
  'Component manifest must list Chip as a public registry component through the merged Capsule page.',
)
for (const removedFilePath of [
  'src/docs/component-definitions/chip.tsx',
  'src/docs/component-definitions/chip-button.tsx',
]) {
  assert.ok(
    !existsSync(join(root, removedFilePath)),
    `${removedFilePath} must be merged into capsule.tsx.`,
  )
}
