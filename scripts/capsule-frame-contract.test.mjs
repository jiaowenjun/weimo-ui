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
const modelSource = readProjectFile('src/components/capsule-frame.ts')
const css = readProjectFile('src/components/capsule-frame.css')
const chipSource = readProjectFile('src/components/chip.tsx')
const chipButtonSource = readProjectFile('src/components/chip-button.tsx')
const tagBreadSource = readProjectFile('src/components/tag-bread.tsx')

const frameBlock = blockFor(css, '.capsule-frame')
const beforeBlock = blockFor(css, '.capsule-frame::before')
const afterBlock = blockFor(css, '.capsule-frame::after')
const solidFrameBlock = blockFor(css, '.capsule-frame[data-material="solid"]')
const solidBeforeBlock = blockFor(css, '.capsule-frame[data-material="solid"]::before')
const solidAfterBlock = blockFor(css, '.capsule-frame[data-material="solid"]::after')
const frostedBeforeBlock = blockFor(css, '.capsule-frame[data-material="frosted"]::before')
const frostedAfterBlock = blockFor(css, '.capsule-frame[data-material="frosted"]::after')
const composedFrostedBlock = blockFor(css, '.capsule-frame.frosted-surface')
const interactiveBlock = blockFor(css, '.capsule-frame[data-interactive="true"]')
const activeTransformBlock = blockFor(css, '.capsule-frame[data-interactive="true"]:active')
const slotBlock = blockFor(css, '.capsule-frame__slot')
const contentBlock = blockFor(css, '.capsule-frame__content')
const reducedMotionBlock = blockFor(
  css,
  `.capsule-frame,
    .capsule-frame.frosted-surface,
    .capsule-frame::before,
    .capsule-frame::after`,
)

assert.ok(
  packageJson.scripts?.test?.includes('scripts/capsule-frame-contract.test.mjs'),
  'package.json test script must run capsule-frame-contract.test.mjs.',
)
assert.ok(
  !Object.hasOwn(packageJson.exports ?? {}, './components/capsule-frame') &&
    !rootRegistry.items.some((item) => item.name === 'capsule-frame') &&
    !existsSync(join(root, 'registry/capsule-frame.json')),
  'CapsuleFrame must remain an internal shared frame rather than a public component.',
)
assert.ok(
  !existsSync(join(root, 'src/components/capsule-frame.tsx')) &&
    !existsSync(join(root, 'src/components/chip-surface.tsx')) &&
    !existsSync(join(root, 'src/components/chip-surface-model.ts')) &&
    !existsSync(join(root, 'src/components/chip-surface.css')),
  'The unused surface component and its old files must stay removed.',
)

for (const snippet of [
  "export type CapsuleFrameMaterial = 'solid' | 'frosted'",
  "export type CapsuleFrameTextSize = 'sm' | 'base' | 'lg'",
  'export type CapsuleFrameOptions = {',
  'material?: CapsuleFrameMaterial',
  'textSize?: CapsuleFrameTextSize',
  'interactive?: boolean',
  'export function getCapsuleFrameClassName',
  "return cn('capsule-frame', className)",
  'export function getCapsuleFrameAttributes',
  "material = 'solid'",
  "'data-material': material",
  "'data-text-size': textSize",
  "'data-interactive': interactive ? 'true' : undefined",
]) {
  assertIncludes(modelSource, snippet, `CapsuleFrame model must include ${snippet}.`)
}
assert.ok(
  !modelSource.includes('bordered') &&
    !modelSource.includes('variant') &&
    !modelSource.includes('ChipSurface'),
  'CapsuleFrame attributes must describe frame state, not own material borders or the removed surface API.',
)

for (const [block, snippet, message] of [
  [frameBlock, 'display: inline-flex;', 'CapsuleFrame must own inline capsule layout.'],
  [frameBlock, 'max-width: 100%;', 'CapsuleFrame must fit narrow containers.'],
  [frameBlock, 'min-width: 0;', 'CapsuleFrame must allow content to shrink.'],
  [frameBlock, 'gap: 4px;', 'CapsuleFrame must keep shared slot spacing.'],
  [frameBlock, 'padding: 6px 10px;', 'CapsuleFrame must own shared padding.'],
  [frameBlock, 'border-radius: var(--radius-round);', 'CapsuleFrame must own capsule geometry.'],
  [frameBlock, 'overflow: hidden;', 'CapsuleFrame must clip material layers.'],
  [frameBlock, '--animated-inline-size-transition-duration: 180ms;', 'CapsuleFrame must expose width motion timing.'],
  [frameBlock, '--capsule-frame-state-transition-duration: 180ms;', 'CapsuleFrame must expose state timing.'],
  [beforeBlock, 'background: var(--color-bg-chip);', 'The solid capsule layer must retain the chip fill token.'],
  [solidFrameBlock, 'border: 1px solid transparent;', 'Solid capsules must preserve the shared 1px border geometry.'],
  [solidFrameBlock, 'color: var(--color-primary);', 'Solid capsules must retain the primary foreground token.'],
  [solidBeforeBlock, 'opacity: 1;', 'Solid capsules must show the chip fill layer.'],
  [solidAfterBlock, 'opacity: 0;', 'Solid capsules must hide the feedback-only frosted layer.'],
  [frostedBeforeBlock, 'opacity: 0;', 'Frosted capsules must hide the solid fill.'],
  [frostedAfterBlock, 'opacity: 1;', 'Frosted capsules must expose the feedback layer.'],
  [composedFrostedBlock, '--capsule-frame-hover-background: var(--glass-surface-hover-bg);', 'Frosted capsules must reuse the FrostedSurface hover tint.'],
  [composedFrostedBlock, 'color var(--frosted-surface-tone-transition-duration, 160ms) ease', 'Frame motion must compose with FrostedSurface tone motion.'],
  [interactiveBlock, 'cursor: pointer;', 'Interactive frames must expose pointer affordance.'],
  [interactiveBlock, 'appearance: none;', 'Interactive frames must reset native appearance.'],
  [activeTransformBlock, 'transform: scale(var(--press-scale));', 'Interactive frames must use the shared press scale.'],
  [slotBlock, 'display: inline-flex;', 'CapsuleFrame must own reusable slot layout.'],
  [slotBlock, 'flex: none;', 'Capsule slots must not shrink.'],
  [contentBlock, 'min-width: 0;', 'Capsule content must be shrinkable.'],
  [contentBlock, 'white-space: nowrap;', 'Capsule content must stay on one line.'],
  [reducedMotionBlock, 'transition-duration: 1ms;', 'CapsuleFrame must respect reduced motion.'],
]) {
  assertIncludes(block, snippet, message)
}

assert.ok(
  !frameBlock.includes('border:') && !frameBlock.includes('color:'),
  'CapsuleFrame base must not override the FrostedSurface border or foreground through same-layer import order.',
)
assert.ok(
  !css.includes('backdrop-filter:') &&
    !css.includes('color: var(--glass-surface-fg)') &&
    !css.includes('border-color: var(--glass-surface-border)') &&
    !css.includes('--glass-blur'),
  'CapsuleFrame must leave frosted foreground, border, and blur ownership to FrostedSurface.',
)
assert.ok(
  !afterBlock.includes('background: var(--glass-gradient);') &&
    !css.includes('--glass-gradient') &&
    !css.includes('--glass-shadow'),
  'CapsuleFrame must not recreate a standalone glass material.',
)

for (const [source, label] of [
  [chipSource, 'Chip'],
  [chipButtonSource, 'ChipButton'],
  [tagBreadSource, 'TagBread'],
]) {
  assert.ok(
    source.includes("from './capsule-frame'") &&
      source.includes("import './capsule-frame.css'") &&
      source.includes('getCapsuleFrameClassName(') &&
      source.includes('getCapsuleFrameAttributes({'),
    `${label} must compose the shared CapsuleFrame internals.`,
  )
  assert.ok(
    source.includes('getFrostedSurfaceClassName') &&
      source.includes('frosted-surface--bordered'),
    `${label} must delegate frosted material styling to FrostedSurface.`,
  )
}

for (const registryName of ['card', 'chip', 'chip-button', 'tag-bread']) {
  const registryItem = readJson(`registry/${registryName}.json`)
  const filePaths = registryItem.files.map((file) => file.path)

  assert.ok(
    filePaths.includes('src/components/capsule-frame.ts') &&
      filePaths.includes('src/components/capsule-frame.css'),
    `${registryName} must ship the internal CapsuleFrame files.`,
  )
  assert.ok(
    !filePaths.some((filePath) => filePath.includes('chip-surface')) &&
      !filePaths.includes('src/components/capsule-frame.tsx'),
    `${registryName} must not ship the removed surface component.`,
  )
}
