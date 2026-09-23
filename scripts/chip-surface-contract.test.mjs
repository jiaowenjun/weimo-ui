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

function blockFor(source, selector) {
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
const cardRegistry = readJson('registry/card.json')
const tagBreadRegistry = readJson('registry/tag-bread.json')
const surfaceSource = readProjectFile('src/components/chip-surface.tsx')
const surfaceModelSource = readProjectFile('src/components/chip-surface-model.ts')
const surfaceCss = readProjectFile('src/components/chip-surface.css')
const animatedSource = readProjectFile('src/components/animated-inline-size.tsx')
const animatedModelSource = readProjectFile('src/components/animated-inline-size-model.ts')
const animatedCss = readProjectFile('src/components/animated-inline-size.css')
const chipSource = readProjectFile('src/components/chip.tsx')
const chipButtonSource = readProjectFile('src/components/chip-button.tsx')
const chipButtonCss = readProjectFile('src/components/chip-button.css')
const tagBreadSource = readProjectFile('src/components/tag-bread.tsx')
const tagBreadCss = readProjectFile('src/components/tag-bread.css')

const surfaceBlock = blockFor(surfaceCss, '.chip-surface')
const surfaceBeforeBlock = blockFor(surfaceCss, '.chip-surface::before')
const surfaceAfterBlock = blockFor(surfaceCss, '.chip-surface::after')
const surfaceGlassBlock = blockFor(surfaceCss, '.chip-surface[data-variant="glass"]')
const surfaceBorderlessBlock = blockFor(surfaceCss, '.chip-surface[data-bordered="false"]')
const surfaceInteractiveBlock = blockFor(surfaceCss, '.chip-surface[data-interactive="true"]')
const surfaceHoverBlock = blockFor(
  surfaceCss,
  `.chip-surface[data-interactive="true"]:hover::before,
    .chip-surface[data-interactive="true"]:hover::after`,
)
const surfaceActiveBlock = blockFor(
  surfaceCss,
  `.chip-surface[data-interactive="true"]:active::before,
  .chip-surface[data-interactive="true"]:active::after`,
)
const surfaceSlotBlock = blockFor(surfaceCss, '.chip-surface__slot')
const animatedMeasureBlock = blockFor(animatedCss, '.animated-inline-size__measure')
const animatedMeasureChildBlock = blockFor(animatedCss, '.animated-inline-size__measure > *')

assert.ok(
  packageJson.scripts?.test?.includes('scripts/chip-surface-contract.test.mjs'),
  'package.json test script must run chip-surface-contract.test.mjs.',
)
assert.ok(
  !rootRegistry.items.some((item) => item.name === 'chip-surface') &&
    !existsSync(join(root, 'registry/chip-surface.json')) &&
    !rootRegistry.items.some((item) => item.name === 'animated-inline-size') &&
    !existsSync(join(root, 'registry/animated-inline-size.json')),
  'ChipSurface and AnimatedInlineSize are internal shared files, not standalone registry items.',
)

for (const snippet of [
  "import type { ComponentPropsWithoutRef } from 'react'",
  "from './chip-surface-model'",
  "import './chip-surface.css'",
  "export function ChipSurface",
]) {
  assertIncludes(surfaceSource, snippet, `ChipSurface component source must include ${snippet}.`)
}
assert.ok(
  !surfaceSource.includes('export function getChipSurfaceClassName') &&
    !surfaceSource.includes('export function getChipSurfaceAttributes'),
  'ChipSurface component file must not export non-component helper functions.',
)

for (const snippet of [
  "import type { ClassValue } from 'clsx'",
  "import { cn } from './lib/utils'",
  "export type ChipSurfaceVariant = 'default' | 'glass'",
  "export type ChipSurfaceTextSize = 'sm' | 'base'",
  'export type ChipSurfaceOptions = {',
  'bordered?: boolean',
  'variant?: ChipSurfaceVariant',
  'textSize?: ChipSurfaceTextSize',
  'interactive?: boolean',
  'export function getChipSurfaceClassName(...className: ClassValue[])',
  "return cn('chip-surface', className)",
  'export function getChipSurfaceAttributes',
  'bordered = true',
  "variant = 'default'",
  "textSize = 'sm'",
  "'data-bordered': bordered ? undefined : 'false'",
  "'data-variant': variant",
  "'data-text-size': textSize",
  "'data-interactive': interactive ? 'true' : undefined",
]) {
  assertIncludes(surfaceModelSource, snippet, `ChipSurface model source must include ${snippet}.`)
}

for (const snippet of [
  "import { useLayoutEffect, useRef, useState } from 'react'",
  "import type { CSSProperties } from 'react'",
  'export function useAnimatedInlineSize(measureKey: unknown)',
  'const measureRef = useRef<HTMLElement | null>(null)',
  'getBoundingClientRect().width',
  'setInlineSize((currentSize) =>',
  'export function getAnimatedInlineSizeStyle',
  'inlineSize: `${inlineSize}px`',
]) {
  assertIncludes(animatedModelSource, snippet, `AnimatedInlineSize model source must include ${snippet}.`)
}

for (const snippet of [
  "import type { ComponentPropsWithoutRef, MutableRefObject, ReactNode } from 'react'",
  "import { cn } from './lib/utils'",
  "import './animated-inline-size.css'",
  'export function AnimatedInlineSizeMeasure',
  "className={cn('animated-inline-size__measure', className)}",
  'aria-hidden="true"',
]) {
  assertIncludes(animatedSource, snippet, `AnimatedInlineSize component source must include ${snippet}.`)
}
assert.ok(
  !animatedSource.includes('export function useAnimatedInlineSize') &&
    !animatedSource.includes('export function getAnimatedInlineSizeStyle'),
  'AnimatedInlineSize component file must not export non-component helper functions.',
)

for (const [block, snippet, message] of [
  [surfaceBlock, '--animated-inline-size-transition-duration: 180ms;', 'ChipSurface must expose the shared 180ms inline-size transition duration.'],
  [surfaceBlock, '--chip-surface-state-transition-duration: 180ms;', 'ChipSurface must keep state transitions separate from width transitions.'],
  [surfaceBlock, '--chip-surface-hover-background: var(--color-bg-hover);', 'ChipSurface must expose a shared hover token for interactive callers.'],
  [surfaceBlock, '--chip-surface-active-background: var(--color-bg-hover);', 'ChipSurface must expose a shared active token for interactive callers.'],
  [surfaceBlock, 'display: inline-flex;', 'ChipSurface must own the inline-flex capsule layout.'],
  [surfaceBlock, 'justify-content: flex-start;', 'ChipSurface must keep its contents left-aligned during inline-size transitions.'],
  [surfaceBlock, 'padding: 6px 10px;', 'ChipSurface must own the shared capsule padding.'],
  [surfaceBlock, 'border-radius: var(--radius-round);', 'ChipSurface must own the capsule radius.'],
  [surfaceBlock, 'background: transparent;', 'ChipSurface must leave visible backgrounds to pseudo layers.'],
  [surfaceBlock, 'overflow: hidden;', 'ChipSurface must clip its visual layers to the capsule.'],
  [surfaceBlock, 'transition:', 'ChipSurface must own state transition declarations.'],
  [surfaceBlock, 'inline-size var(--animated-inline-size-transition-duration) cubic-bezier(0.2, 0, 0, 1)', 'ChipSurface must animate measured inline-size changes.'],
  [surfaceBeforeBlock, 'background: var(--color-bg-chip);', 'ChipSurface default layer must use the brand chip surface token.'],
  [surfaceGlassBlock, 'color: var(--glass-surface-fg);', 'ChipSurface glass variant must use the standard glass surface adaptive foreground.'],
  [surfaceGlassBlock, 'border-color: var(--glass-surface-border);', 'ChipSurface glass variant must use the standard glass surface border token.'],
  [surfaceGlassBlock, 'backdrop-filter: blur(var(--glass-blur));', 'ChipSurface glass variant must use the shared blur.'],
  [surfaceBorderlessBlock, 'border-color: transparent;', 'ChipSurface borderless mode must hide the variant border without changing capsule metrics.'],
  [surfaceInteractiveBlock, 'cursor: pointer;', 'Only interactive ChipSurface callers must get pointer cursor.'],
  [surfaceInteractiveBlock, 'appearance: none;', 'Only interactive ChipSurface callers must reset native appearance.'],
  [surfaceHoverBlock, 'background: var(--chip-surface-hover-background);', 'Interactive ChipSurface hover must retint visible layers.'],
  [surfaceActiveBlock, 'background: var(--chip-surface-active-background);', 'Interactive ChipSurface active must retint visible layers.'],
  [surfaceSlotBlock, 'align-self: center;', 'ChipSurface prefix and suffix slots must be vertically centered instead of baseline-aligned.'],
  [surfaceSlotBlock, 'align-items: center;', 'ChipSurface slot contents must be vertically centered inside their slot.'],
  [surfaceSlotBlock, 'justify-content: center;', 'ChipSurface slot contents must stay horizontally centered inside their slot.'],
  [animatedMeasureBlock, 'position: absolute;', 'AnimatedInlineSize measurement must be removed from normal layout.'],
  [animatedMeasureBlock, 'inline-size: max-content;', 'AnimatedInlineSize measurement must expose natural width.'],
  [animatedMeasureBlock, 'visibility: hidden;', 'AnimatedInlineSize measurement must stay hidden.'],
  [animatedMeasureBlock, 'pointer-events: none;', 'AnimatedInlineSize measurement must not intercept interactions.'],
  [animatedMeasureChildBlock, 'width: max-content;', 'AnimatedInlineSize measurement child must stay unconstrained.'],
  [animatedMeasureChildBlock, 'max-width: none;', 'AnimatedInlineSize measurement child must ignore caller max-width.'],
]) {
  assertIncludes(block, snippet, message)
}
assert.ok(
  !surfaceAfterBlock.includes('background: var(--glass-gradient);') && !surfaceCss.includes('--glass-gradient'),
  'ChipSurface glass layer must not depend on a shared glass background gradient token.',
)
assert.ok(
  !surfaceBlock.includes('box-shadow') &&
    !surfaceGlassBlock.includes('box-shadow') &&
    !surfaceCss.includes('--glass-shadow'),
  'ChipSurface must not use glass shadow effects after shared glass shadow removal.',
)
assert.ok(
  !surfaceHoverBlock.includes('opacity: 0;') && !surfaceActiveBlock.includes('opacity: 0;'),
  'Interactive ChipSurface hover/active must not fade pseudo layers out.',
)
assert.ok(
  !surfaceCss.includes('.dark .chip-surface[data-interactive="true"]') &&
    !surfaceCss.includes('--color-bg-pressable-overlay'),
  'ChipSurface must use the shared hover feedback token in every theme without a dark-only overlay branch.',
)

for (const [source, label] of [
  [chipSource, 'Chip'],
  [chipButtonSource, 'ChipButton'],
  [tagBreadSource, 'TagBread'],
]) {
  assert.ok(
    source.includes("from './chip-surface-model'") &&
      source.includes("from './animated-inline-size-model'") &&
      source.includes("from './animated-inline-size'") &&
      source.includes("import './chip-surface.css'"),
    `${label} must compose ChipSurface and AnimatedInlineSize shared internals and import the shared surface CSS.`,
  )
}

assert.ok(
  chipSource.includes("import { useGlassSurfaceBackgroundToneRef } from './glass-surface'") &&
    chipSource.includes("import './glass-surface.css'") &&
    chipSource.includes("isGlassVariant && 'glass-surface',") &&
    chipSource.includes('getChipSurfaceAttributes({ bordered, variant, textSize })') &&
    chipSource.includes('useAnimatedInlineSize') &&
    chipSource.includes('<AnimatedInlineSizeMeasure measureRef={measureRef}>') &&
    chipSource.includes('getAnimatedInlineSizeStyle(style, inlineSize)') &&
    chipSource.includes('chip-surface__slot chip__slot chip__slot--prefix') &&
    chipSource.includes('chip-surface__content chip__content'),
  'Chip must use shared surface classes and animated inline-size while preserving its slot API.',
)
assert.ok(
  chipButtonSource.includes("isGlassState && 'glass-surface',") &&
    chipButtonSource.includes("import { useGlassSurfaceBackgroundToneRef } from './glass-surface'") &&
    chipButtonSource.includes("import './glass-surface.css'") &&
    chipButtonSource.includes("getChipSurfaceAttributes({ variant: state, interactive: true })") &&
    chipButtonSource.includes('animateWidth = false') &&
    chipButtonSource.includes('style={animateWidth ? getAnimatedInlineSizeStyle(style, inlineSize) : style}') &&
    chipButtonSource.includes('data-state={state}') &&
    chipButtonSource.includes('type="button"') &&
    chipButtonSource.includes('chip-surface__slot chip-button__prefix') &&
    chipButtonSource.includes('chip-surface__content chip-button__text'),
  'ChipButton must keep its button semantics and opt-in width animation while using shared surface internals.',
)
assert.ok(
  !chipButtonCss.includes(':hover::before') &&
    !chipButtonCss.includes(':hover::after') &&
    !chipButtonCss.includes('--chip-button-hover-background') &&
    !chipButtonCss.includes('--chip-button-active-background'),
  'ChipButton hover and active behavior must come from interactive ChipSurface, not duplicated CSS.',
)
assert.ok(
  tagBreadSource.includes("getChipSurfaceClassName('glass-surface', 'tag-bread', className)") &&
    tagBreadSource.includes("useGlassSurfaceBackgroundToneRef<HTMLElement>(true)") &&
    tagBreadSource.includes("import './glass-surface.css'") &&
    tagBreadSource.includes("getChipSurfaceAttributes({ variant: 'glass', textSize: 'base' })") &&
    tagBreadSource.includes('useAnimatedInlineSize(tag)') &&
    tagBreadSource.includes('<AnimatedInlineSizeMeasure measureRef={measureRef}>') &&
    tagBreadSource.includes('<Breadcrumb') &&
    !tagBreadSource.includes("content={<Breadcrumb") &&
    !tagBreadSource.includes('<Chip'),
  'TagBread must keep coss Breadcrumb semantics while reusing ChipSurface and AnimatedInlineSize.',
)
assert.ok(
  !tagBreadCss.includes('background: var(--glass-gradient);') &&
    !tagBreadCss.includes('box-shadow: var(--glass-shadow);') &&
    !tagBreadCss.includes('backdrop-filter: blur(var(--glass-blur))'),
  'TagBread CSS must not duplicate glass material after moving to ChipSurface.',
)

for (const registryItem of [cardRegistry, tagBreadRegistry]) {
  for (const filePath of [
    'src/components/chip-surface.tsx',
    'src/components/chip-surface-model.ts',
    'src/components/chip-surface.css',
    'src/components/animated-inline-size.tsx',
    'src/components/animated-inline-size-model.ts',
    'src/components/animated-inline-size.css',
  ]) {
    assert.ok(
      registryItem.files.some((file) => file.path === filePath),
      `${registryItem.name} registry item must ship internal ${filePath}.`,
    )
  }
}
