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
  const match = source.match(new RegExp(`(?:^|\\n)\\s*${escapedSelector}\\s*\\{([^}]*)\\}`))

  assert.ok(match, `${selector} block must exist.`)

  return match[1]
}

function blockForPattern(source, selectorPattern, label) {
  const match = source.match(new RegExp(`${selectorPattern}\\s*\\{([^}]*)\\}`))

  assert.ok(match, `${label} block must exist.`)

  return match[1]
}

const css = readProjectFile('src/components/tag-tree/tag-tree.css')
const source = [
  'src/components/tag-tree/tag-tree-model.ts',
  'src/components/tag-tree/use-tag-tree.ts',
  'src/components/tag-tree/tag-tree-row.tsx',
  'src/components/tag-tree/tag-tree.tsx',
]
  .map(readProjectFile)
  .join('\n')
const packageJson = JSON.parse(readProjectFile('package.json'))

const rootBlock = blockFor(css, '.tag-tree')
const rowBlock = blockFor(css, '.tag-tree__row')
const bodyBlock = blockFor(css, '.tag-tree__row-body')
const noActionBodyBlock = blockForPattern(
  css,
  '\\.tag-tree__row-body\\[data-variant="no-action"\\](?:,\\s*\\.tag-tree__row-body\\[data-variant="no-action"\\]\\[data-has-menu="true"\\])?',
  'No-action TagTree row body',
)
const noActionMenuBodyBlock = blockForPattern(
  css,
  '\\.tag-tree__row-body\\[data-variant="no-action"\\][\\s\\S]*?\\.tag-tree__row-body\\[data-variant="no-action"\\]\\[data-has-menu="true"\\]',
  'No-action TagTree menu row body',
)
const defaultNoMenuBodyBlock = blockFor(
  css,
  '.tag-tree__row-body[data-variant="default"]:not([data-has-menu="true"])',
)
const noActionToggleBlock = blockFor(
  css,
  '.tag-tree__row-body[data-variant="no-action"] .tag-tree__toggle',
)
const bodyBackgroundBlock = blockFor(css, '.tag-tree__row-body::before')
const guidesBlock = blockFor(css, '.tag-tree__guides')
const guideElementBlock = blockFor(css, '.tag-tree__guide')
const guideBlock = blockFor(css, '.tag-tree__guide::before')
const rootGuideBlock = blockFor(css, '.tag-tree__guide:first-child::before')
const rootDepthGuidesBlock = blockFor(
  css,
  '.tag-tree__row[data-depth="0"] .tag-tree__guides',
)
const enterBlock = blockFor(css, '.tag-tree__row[data-entering="true"]')
const removingBlock = blockFor(css, '.tag-tree__row[data-removing="true"]')
const rootDepthBackgroundBlock = blockFor(css, '.tag-tree__row[data-depth="0"] .tag-tree__row-body::before')
const selectedBlock = blockFor(css, '.tag-tree__row[data-selected="true"] .tag-tree__row-body::before')
const hoverBlock = blockForPattern(
  css,
  '@media \\(hover: hover\\) and \\(pointer: fine\\)\\s*\\{[\\s\\S]*?\\.tag-tree__row:hover \\.tag-tree__row-body::before',
  'TagTree hover row body',
)
const hoveredActionBlock = blockForPattern(
  css,
  '\\.tag-tree__row:hover \\.tag-tree__toggle,[\\s\\S]*?\\.tag-tree__row:hover \\.tag-tree__menu-trigger',
  'TagTree action on hovered row',
)
const directActionHoverBackdropBlock = blockFor(
  css,
  '.tag-tree__row:has(.tag-tree__toggle:hover, .tag-tree__menu-trigger:hover) .tag-tree__row-body::before',
)
const actionSlotBlock = blockFor(css, '.tag-tree__menu-slot')
const selectBlock = blockFor(css, '.tag-tree__select')
const tagIconBlock = blockFor(css, '.tag-tree__tag-icon')
const triggerBlock = blockFor(css, '.tag-tree__menu-trigger')
const chevronExpandedBlock = blockFor(css, '.tag-tree__toggle[data-expanded="true"] svg')

assert.ok(css.includes('@layer components'), 'TagTree CSS must live in @layer components.')
assert.ok(rootBlock.includes('--tag-tree-row-height: 40px;'), 'TagTree row height must match Skyline rhythm.')
assert.ok(rootBlock.includes('--tag-tree-depth-step: 20px;'), 'TagTree depth step must keep child guide columns compact.')
assert.ok(rootBlock.includes('--tag-tree-action-size: 28px;'), 'TagTree action slot must match small IconButton size.')
assert.ok(rootBlock.includes('--tag-tree-row-background-inset-start: -1px;'), 'TagTree child row backgrounds must move 3px left while keeping the guide anchor fixed.')
assert.ok(rootBlock.includes('--tag-tree-body-margin-end: 0;'), 'TagTree row bodies must reach the trailing edge without extra end margin.')
assert.ok(rootBlock.includes('--tag-tree-body-padding-start: 6px;'), 'TagTree body content must sit 6px from the row body edge.')
assert.ok(rootBlock.includes('--tag-tree-row-body-padding-inline: 3px;'), 'TagTree row body padding must be tokenized instead of hard-coded.')
assert.ok(rootBlock.includes('--tag-tree-icon-size: 20px;'), 'TagTree must expose the icon slot size used for guide alignment.')
assert.ok(rootBlock.includes('--tag-tree-guide-padding-start: 2px;'), 'TagTree must keep guide padding tight while preserving parent-icon-center alignment.')
assert.ok(
  rootBlock.includes('--tag-tree-root-body-padding-start: var(--tag-tree-row-body-padding-inline);'),
  'TagTree must align guide lines from the same row-body padding that positions root-row icons.',
)
assert.ok(
  rootBlock.includes('--tag-tree-root-icon-center: calc(var(--tag-tree-root-body-padding-start) + (var(--tag-tree-icon-size) / 2));'),
  'TagTree must derive the root icon center without moving root rows.',
)
assert.ok(rowBlock.includes('height: var(--tag-tree-row-height);'), 'Rows must use the component row height variable.')
assert.ok(
  !rowBlock.includes('column-gap:'),
  'Rows must not use column-gap for guide separation because it moves the parent hashtag center.',
)
assert.ok(rowBlock.includes('overflow: hidden;'), 'Rows must clip during expand/collapse animation.')
assert.ok(
  rowBlock.includes('transition:') &&
    rowBlock.includes('height 200ms ease') &&
    rowBlock.includes('opacity 200ms ease'),
  'Rows must animate height and opacity like Skyline.',
)
assert.ok(
  enterBlock.includes('height: 0;') && enterBlock.includes('opacity: 0;'),
  'Entering rows must start collapsed and transparent.',
)
assert.ok(
  removingBlock.includes('height: 0;') && removingBlock.includes('opacity: 0;'),
  'Removing rows must collapse and fade before being dropped.',
)
assert.ok(bodyBlock.includes('position: relative;'), 'Row body must establish a positioning context for inset backgrounds.')
assert.ok(bodyBlock.includes('padding-inline: var(--tag-tree-row-body-padding-inline);'), 'Row body must use the shared inline padding token.')
assert.ok(bodyBlock.includes('grid-template-columns: minmax(0, 1fr) var(--tag-tree-action-size) var(--tag-tree-action-size);'), 'Row body must keep fixed chevron and menu columns.')
assert.ok(
  noActionBodyBlock.includes('grid-template-columns: minmax(0, 1fr) var(--tag-tree-action-size);'),
  'No-action TagTree rows must collapse to one trailing slot.',
)
assert.ok(
  noActionMenuBodyBlock.includes('grid-template-columns: minmax(0, 1fr) var(--tag-tree-action-size);'),
  'No-action TagTree rows must ignore menu availability for layout.',
)
assert.ok(
  defaultNoMenuBodyBlock.includes('grid-template-columns: minmax(0, 1fr) var(--tag-tree-action-size);'),
  'Default TagTree rows without a menu must collapse to one trailing slot so chevrons align to the far edge.',
)
assert.ok(
  noActionToggleBlock.includes('grid-column: 2;'),
  'No-action TagTree chevrons must occupy the far trailing slot.',
)
assert.ok(bodyBlock.includes('background: transparent;'), 'Row body itself must stay transparent so the guide line is not covered.')
assert.ok(bodyBackgroundBlock.includes('inset-inline-start: var(--tag-tree-row-background-inset-start);'), 'Row backgrounds must start after the guide line while preserving content geometry.')
assert.ok(bodyBackgroundBlock.includes('inset-inline-end: 0;'), 'Inset row backgrounds must still reach the trailing edge.')
assert.ok(rootDepthBackgroundBlock.includes('inset-inline-start: 0;'), 'Root row backgrounds must keep their full leading edge because they have no guide line.')
assert.ok(
  guidesBlock.includes('padding-inline-start: var(--tag-tree-guide-padding-start);'),
  'Child guide columns must use the shared guide padding variable.',
)
assert.ok(guideElementBlock.includes('position: relative;'), 'Guide slots must position their rule from the slot start.')
assert.ok(guideBlock.includes('width: 1px;'), 'Guide lines must render as 1px vertical rules.')
assert.ok(
  guideBlock.includes('position: absolute;') &&
    guideBlock.includes('inset-block: 0;') &&
    guideBlock.includes('inset-inline-start: calc(var(--tag-tree-row-body-padding-inline) + (var(--tag-tree-icon-size) / 2));'),
  'Nested guide lines must align with their non-root parent icon centers.',
)
assert.ok(
  rootGuideBlock.includes('inset-inline-start: calc(var(--tag-tree-root-icon-center) - var(--tag-tree-guide-padding-start));'),
  'First child guide lines must align with the root parent icon center without moving root rows.',
)
assert.ok(guideBlock.includes('background: var(--color-border-divider);'), 'Guide lines must use the divider border token.')
assert.ok(
  rootDepthGuidesBlock.includes('min-width: 0;') &&
    rootDepthGuidesBlock.includes('padding-inline-start: 0;'),
  'Root TagTree rows must not reserve an empty guide slot before their icon.',
)
assert.ok(selectedBlock.includes('background: var(--color-bg-selected);'), 'Selected rows must use the shared selected background token.')
assert.ok(hoverBlock.includes('background: var(--color-bg-hover);'), 'Hovered rows must use the shared hover token.')
assert.ok(
  hoveredActionBlock.includes('--icon-button-ghost-hover-bg: var(--color-bg-hover-on-hover);'),
  'TagTree actions on hovered rows must use the stronger nested hover token.',
)
assert.ok(
  directActionHoverBackdropBlock.includes('transition-duration: 0ms;'),
  'Direct action hover must settle the row backdrop immediately so its transition does not flicker beneath the button transition.',
)
assert.ok(actionSlotBlock.includes('width: var(--tag-tree-action-size);'), 'Menu slot width must be stable.')
assert.ok(
  selectBlock.includes('grid-template-columns: var(--tag-tree-icon-size) minmax(0, 1fr);') &&
    selectBlock.includes('column-gap: 4px;'),
  'Tag row icons must keep a 4px gap to labels, matching Skyline 8rpx spacing.',
)
assert.ok(
  !selectBlock.includes('padding-inline:'),
  'Tag row select controls must not add inline padding because the row body owns it.',
)
assert.ok(
  tagIconBlock.includes('width: var(--tag-tree-icon-size);') &&
    tagIconBlock.includes('height: var(--tag-tree-icon-size);') &&
    tagIconBlock.includes('color: var(--color-text-placeholder);'),
  'Hashtag icons must use the shared icon slot size and placeholder color.',
)
assert.match(
  css,
  /\.tag-tree__toggle\s*\{[\s\S]*?color:\s*var\(--color-text-placeholder\);/,
  'Expand buttons must use placeholder color.',
)
assert.match(
  css,
  /button\.tag-tree__toggle\s*\{[\s\S]*?color:\s*var\(--color-text-placeholder\);/,
  'Expand buttons must beat the global button color rule.',
)
assert.ok(
  !/(?:^|\n)\s*\.tag-tree__toggle:hover\s*\{/.test(css),
  'Expand buttons must inherit ghost IconButton hover styling instead of defining a separate hover color.',
)
assert.ok(triggerBlock.includes('color: var(--color-text-placeholder);'), 'Menu trigger must use placeholder color.')
assert.match(
  css,
  /button\.icon-button\.tag-tree__menu-trigger\s*\{[\s\S]*?color:\s*var\(--color-text-placeholder\);/,
  'TagTree menu trigger must beat the global button.icon-button color rule.',
)
assert.ok(
  css.includes('.tag-tree__toggle svg') &&
    css.includes('.tag-tree__menu-trigger svg') &&
    (css.match(/stroke:\s*currentColor;/g) ?? []).length >= 2,
  'TagTree icon SVGs must inherit the placeholder color from their slots.',
)
assert.ok(chevronExpandedBlock.includes('transform: rotate(90deg);'), 'Expanded chevrons must rotate 90deg.')
assert.ok(
  source.includes('const TAG_TREE_ANIMATION_MS = 200'),
  'TagTree animation duration must stay aligned with Skyline.',
)
assert.ok(
  source.includes('function stageTagTreeRows') &&
    source.includes("animationState?: 'entering' | 'removing'") &&
    source.includes("animationState: 'removing'"),
  'TagTree must keep staged rows so collapsing children animate before being removed.',
)
assert.ok(
  source.includes('data-entering=') &&
    source.includes('data-removing=') &&
    source.includes('data-variant={variant}') &&
    source.includes("data-has-menu={rowMenuEnabled ? 'true' : undefined}"),
  'TagTree rows must expose animation state attributes for CSS transitions.',
)
assert.ok(
  source.includes('menuEnabled?: boolean') &&
    source.includes('rowMenuEnabled={showMenu && row.node.menuEnabled !== false}') &&
    source.includes('{rowMenuEnabled ? (') &&
    !source.includes(": variant === 'default' ? (\n          <span className=\"tag-tree__menu-slot\" aria-hidden=\"true\" />"),
  'TagTree must support row-level menu gates without reserving a hidden trailing menu slot when menus are disabled.',
)
assert.ok(
  source.includes('window.requestAnimationFrame') &&
    source.includes('window.setTimeout') &&
    source.includes('TAG_TREE_ANIMATION_MS'),
  'TagTree must coordinate enter and removal timing in React.',
)
assert.ok(
  packageJson.scripts?.test?.includes('scripts/tag-tree-style-contract.test.mjs'),
  'package.json test script must run tag-tree-style-contract.test.mjs.',
)
