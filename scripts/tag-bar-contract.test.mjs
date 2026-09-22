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

function assertNotIncludes(source, snippet, message) {
  assert.ok(!source.includes(snippet), message)
}

const componentSource = readProjectFile('src/components/tag-bar.tsx')
const cssSource = readProjectFile('src/components/tag-bar.css')
const docsSource = readProjectFile('src/docs/component-definitions/tag.tsx')
const definitionsIndexSource = readProjectFile('src/docs/component-definitions/index.ts')
const manifestSource = readProjectFile('src/docs/components-manifest.ts')
const appCssSource = readProjectFile('src/App.css')
const packageJson = readJson('package.json')
const rootRegistry = readJson('registry.json')

const rootBlock = cssBlockFor(cssSource, '.tag-bar')
const positionAnimatingRootBlock = cssBlockFor(cssSource, '.tag-bar[data-position-animating="true"]')
const floatBarBlock = cssBlockFor(cssSource, '.tag-bar__float-bar')
const frameBlock = cssBlockFor(cssSource, '.tag-bar__float-bar .float-bar__frame')
const leftSlotBlock = cssBlockFor(cssSource, '.tag-bar__float-bar .float-bar__slot--left')
const hiddenSlotBlock = cssBlockFor(
  cssSource,
  `.tag-bar__float-bar .float-bar__slot--center,
  .tag-bar__float-bar .float-bar__slot--right`,
)
const chipsBlock = cssBlockFor(cssSource, '.tag-bar__chips')
const morphSlotBlock = cssBlockFor(cssSource, '.tag-bar__morph-slot')
const morphSlotChipBlock = cssBlockFor(cssSource, '.tag-bar__morph-slot .chip-button')
const morphMeasureBlock = cssBlockFor(cssSource, '.tag-bar__morph-measure')
const morphMeasureChipBlock = cssBlockFor(cssSource, '.tag-bar__morph-measure .chip-button')
const addChipBlock = cssBlockFor(cssSource, '.tag-bar__add-chip')
const exitingAddChipBlock = cssBlockFor(cssSource, '.tag-bar__add-chip[data-exiting="true"]')
const previewBlock = cssBlockFor(appCssSource, '.tag-bar-preview')
const previewPanelBlock = cssBlockFor(appCssSource, '.tag-bar-preview__panel')
const previewControlsBlock = cssBlockFor(appCssSource, '.tag-bar-preview__controls')
const visibleTagsMapStart = componentSource.indexOf('visibleTags.map((tag, index) =>')
const addChipStart = componentSource.indexOf('showAddChip ? (', visibleTagsMapStart)
const visibleTagsMapSource = componentSource.slice(visibleTagsMapStart, addChipStart)
const addChipSource = componentSource.slice(
  addChipStart,
  componentSource.indexOf('<TagPicker', addChipStart),
)
const rootPositionAnimationStart = componentSource.indexOf('function clearRootPositionAnimation()')
const rootPositionAnimationEnd = componentSource.indexOf('function openInsert()', rootPositionAnimationStart)
assert.ok(
  rootPositionAnimationStart >= 0 && rootPositionAnimationEnd > rootPositionAnimationStart,
  'TagBar root position FLIP block must exist before interactive handlers.',
)
const rootPositionAnimationSource = componentSource.slice(
  rootPositionAnimationStart,
  rootPositionAnimationEnd,
)

assert.ok(
  packageJson.scripts?.test?.includes('scripts/tag-bar-contract.test.mjs'),
  'package.json test script must run tag-bar-contract.test.mjs.',
)
assert.equal(
  packageJson.exports?.['./components/tag-bar'],
  './src/components/tag-bar.tsx',
  'TagBar must have a public package export.',
)
assert.ok(
  rootRegistry.items.some((item) => item.name === 'tag-bar'),
  'TagBar must be listed in registry.json.',
)
assert.ok(
  existsSync(join(root, 'registry/tag-bar.json')),
  'TagBar must have registry/tag-bar.json.',
)

for (const snippet of [
  "import { useEffect, useLayoutEffect, useRef, useState } from 'react'",
  "import type { ComponentPropsWithoutRef } from 'react'",
  "import { FloatBar } from './float-bar'",
  "import { ChipButton } from './chip-button'",
  'TagPicker,',
  'type TagPickerApplyPayload,',
  'type TagPickerMode,',
  "from './tag-picker'",
  "import { cn } from './lib/utils'",
  "import './tag-bar.css'",
  'export type TagBarProps',
  'Omit<',
  "ComponentPropsWithoutRef<'div'>",
  "'children' | 'onChange'",
  'tags: string[]',
  'editable?: boolean',
  'tagOptions?: string[]',
  'onTagsChange?: (tags: string[]) => void',
  'onTagClick?: (tag: string) => void',
  'disabled?: boolean',
  'addLabel?: string',
  'emptyLabel?: string',
  'export function TagBar',
  'editable = false',
  "tagOptions = []",
  "addLabel = '标签'",
  "emptyLabel = '无'",
  "const [pickerOpen, setPickerOpen] = useState(false)",
  "const [pickerMode, setPickerMode] = useState<TagPickerMode>('insert')",
  "const [activeTag, setActiveTag] = useState('')",
  "const [renderAddChip, setRenderAddChip] = useState(editable)",
  "const [addChipExiting, setAddChipExiting] = useState(false)",
  'const rootRef = useRef<HTMLDivElement | null>(null)',
  'const rootPositionAnimationRef = useRef<Animation | null>(null)',
  'const previousRootParentOffsetRef = useRef<TagBarRootParentOffset | null>(null)',
  'const emptyChipMeasureRef = useRef<HTMLSpanElement | null>(null)',
  'const [emptyChipSize, setEmptyChipSize] = useState<number | null>(null)',
  'const canEdit = editable && !disabled && Boolean(onTagsChange)',
  'const isEmpty = tags.length === 0',
  'const visibleTags = isEmpty ? [editable ? addLabel : emptyLabel] : tags',
  'const showAddChip = !isEmpty && (editable || renderAddChip)',
  "const emptyChipLabel = editable ? addLabel : emptyLabel",
  "const emptyChipPrefix = editable ? '+' : '#'",
  'const emptyChipWidthStyle = emptyChipSize === null',
  'const rootPositionLayoutSignature = [',
  "editable ? 'edit' : 'view'",
  "renderAddChip ? 'add' : 'no-add'",
  "addChipExiting ? 'exit' : 'stable'",
  "tags.join('\\u0000')",
  "].join('\\u0001')",
  'function handleDisplayTagClick(tag: string)',
  'if (editable || disabled) return',
  'onTagClick?.(tag)',
  'function getChipClickHandler(tag: string)',
  'if (editable) return () => (isEmpty ? openInsert() : openUpdate(tag))',
  'if (isEmpty) return undefined',
  'return () => handleDisplayTagClick(tag)',
  "className={cn('tag-bar', className)}",
  'ref={rootRef}',
  'data-editable={editable ?',
  "aria-label={editable ? '编辑标签栏' : '标签栏'}",
  "role={editable ? undefined : 'group'}",
  'className="tag-bar__float-bar"',
  "role={editable ? undefined : 'presentation'}",
  'className="tag-bar__chips"',
  "className={isEmpty ? 'tag-bar__morph-slot' : undefined}",
  'style={isEmpty ? emptyChipWidthStyle : undefined}',
  'className="tag-bar__morph-measure"',
  'ref={emptyChipMeasureRef}',
  'visibleTags.map((tag, index) =>',
  '<ChipButton',
  'key={isEmpty ? \'empty\' : `${tag}-${index}`}',
  'prefix={editable && isEmpty ? \'+\' : \'#\'}',
  "state={editable ? 'glass' : 'default'}",
  'disabled={editable && !canEdit}',
  'onClick={getChipClickHandler(tag)}',
  'showAddChip ? (',
  "className=\"tag-bar__add-chip\"",
  'data-exiting={!editable && addChipExiting ?',
  'onAnimationEnd={handleAddChipAnimationEnd}',
  'aria-label={`新增${addLabel}`}',
  'onClick={openInsert}',
  'prefix="+"',
  'state="glass"',
  '<TagPicker',
  'initialDraft={activeTag}',
  'mode={pickerMode}',
  'onApply={handleApply}',
  'onOpenChange={setPickerOpen}',
  'open={pickerOpen}',
  'selectedTags={tags}',
  'tagOptions={tagOptions}',
  'targetTag={activeTag}',
]) {
  assertIncludes(componentSource, snippet, `TagBar source must include ${snippet}.`)
}

assert.ok(
  componentSource.includes('type TagBarRootParentOffset = {') &&
    componentSource.includes('left: number') &&
    componentSource.includes('top: number'),
  'TagBar must track its root offset relative to the parent container for position FLIP.',
)

for (const snippet of [
  'function clearRootPositionAnimation()',
  'rootPositionAnimationRef.current = null',
  'delete rootRef.current?.dataset.positionAnimating',
  'function cancelRootPositionAnimation()',
  'rootPositionAnimationRef.current?.cancel()',
  'clearRootPositionAnimation()',
  'function readRootParentOffset(',
  'root: HTMLDivElement',
  'parent: HTMLElement',
  '): TagBarRootParentOffset',
  'function resolveRootPositionAnimationStartOffset(',
  'return rootPositionAnimationRef.current',
  '? readRootParentOffset(root, parent)',
  ': previousRootParentOffsetRef.current',
  'function animateRootFromPreviousParentOffset()',
  'const root = rootRef.current',
  'const parent = root?.parentElement',
  'const previousOffset = resolveRootPositionAnimationStartOffset(root, parent)',
  'cancelRootPositionAnimation()',
  'const nextOffset = readRootParentOffset(root, parent)',
  'previousRootParentOffsetRef.current = nextOffset',
  'const deltaX = previousOffset.left - nextOffset.left',
  'const deltaY = previousOffset.top - nextOffset.top',
  "window.matchMedia('(prefers-reduced-motion: reduce)').matches",
  "root.dataset.positionAnimating = 'true'",
  'root.animate(',
  'transform: `translate(${deltaX}px, ${deltaY}px)`',
  "transform: 'translate(0, 0)'",
  'duration: 180',
  "easing: 'cubic-bezier(0.2, 0, 0, 1)'",
  'rootPositionAnimationRef.current.onfinish = clearRootPositionAnimation',
  'rootPositionAnimationRef.current.oncancel = clearRootPositionAnimation',
]) {
  assertIncludes(
    rootPositionAnimationSource,
    snippet,
    `TagBar root position FLIP must include ${snippet}.`,
  )
}

assert.ok(
  componentSource.includes('useLayoutEffect(() => {') &&
    componentSource.includes('animateRootFromPreviousParentOffset()') &&
    componentSource.includes('}, [rootPositionLayoutSignature])') &&
    componentSource.includes('useEffect(() => () => {') &&
    componentSource.includes('cancelRootPositionAnimation()'),
  'TagBar must run root position FLIP after layout-affecting changes only and clean up animations on unmount.',
)

assert.ok(
  !componentSource.includes("from './tag-edit-bar'") &&
    !componentSource.includes('<TagEditBar') &&
    !componentSource.includes('TagEditBarProps'),
  'TagBar must not import, render, or reuse TagEditBar.',
)
assert.ok(
  !componentSource.includes("from './chip-button" + "-v2'") &&
    !componentSource.includes('<ChipButton' + 'v2'),
  'TagBar must consume renamed ChipButton instead of the old v2 tag chip.',
)
assert.ok(
  componentSource.includes('function openInsert()') &&
    componentSource.includes('if (!canEdit) return') &&
    componentSource.includes("setPickerMode('insert')") &&
    componentSource.includes("setActiveTag('')") &&
    componentSource.includes('setPickerOpen(true)'),
  'TagBar add chip must open TagPicker insert mode with an empty active tag.',
)
assert.ok(
  componentSource.includes('function openUpdate(tag: string)') &&
    componentSource.includes('if (!canEdit) return') &&
    componentSource.includes("setPickerMode('update')") &&
    componentSource.includes('setActiveTag(tag)') &&
    componentSource.includes('setPickerOpen(true)'),
  'TagBar tag chips must open TagPicker update mode for the clicked tag.',
)
assert.ok(
    componentSource.includes('function handleDisplayTagClick(tag: string)') &&
    componentSource.includes('if (editable || disabled) return') &&
    componentSource.includes('onTagClick?.(tag)') &&
    componentSource.includes('function getChipClickHandler(tag: string)') &&
    componentSource.includes('if (editable) return () => (isEmpty ? openInsert() : openUpdate(tag))') &&
    componentSource.includes('if (isEmpty) return undefined') &&
    componentSource.includes('return () => handleDisplayTagClick(tag)') &&
    componentSource.includes('onClick={getChipClickHandler(tag)}'),
  'TagBar display chips must invoke onTagClick for real tags without opening TagPicker.',
)
assert.ok(
  componentSource.includes('function handleApply(payload: TagPickerApplyPayload)') &&
    componentSource.includes('onTagsChange?.(payload.selectedTags)'),
  'TagBar must forward the complete TagPicker selectedTags payload to onTagsChange.',
)
assert.ok(
  componentSource.includes('useEffect(() => {') &&
    componentSource.includes('if ((!editable || disabled || !onTagsChange) && pickerOpen) setPickerOpen(false)') &&
    componentSource.includes('}, [disabled, editable, onTagsChange, pickerOpen])'),
  'TagBar must close its picker if it becomes disabled, non-editable, or lacks onTagsChange while open.',
)
assert.ok(
  componentSource.includes('useLayoutEffect(() => {') &&
    componentSource.includes('if (!isEmpty) {') &&
    componentSource.includes('setEmptyChipSize(null)') &&
    componentSource.includes('const element = emptyChipMeasureRef.current') &&
    componentSource.includes('const nextSize = element.getBoundingClientRect().width') &&
    componentSource.includes('setEmptyChipSize((currentSize) =>') &&
    componentSource.includes('}, [emptyChipLabel, emptyChipPrefix, isEmpty])'),
  'TagBar empty chip must measure its natural width when #emptyLabel morphs into +addLabel.',
)
assert.ok(
  componentSource.includes('if (editable) {') &&
    componentSource.includes('setRenderAddChip(true)') &&
    componentSource.includes('setAddChipExiting(false)') &&
    componentSource.includes('if (renderAddChip) setAddChipExiting(true)') &&
    componentSource.includes('}, [editable, renderAddChip])') &&
    componentSource.includes('function handleAddChipAnimationEnd()') &&
    componentSource.includes('if (!addChipExiting) return') &&
    componentSource.includes('setRenderAddChip(false)') &&
    componentSource.includes('setAddChipExiting(false)'),
  'TagBar add chip must stay mounted for its exit scale animation, clear stale exit state, and unmount after animation end.',
)
assert.ok(
  componentSource.includes("data-exiting={!editable && addChipExiting ? 'true' : undefined}"),
  'TagBar add chip must not carry a stale exiting marker while re-entering edit mode.',
)
assert.ok(
  !componentSource.includes('if (!editable) {') &&
    visibleTagsMapStart !== -1 &&
    addChipStart !== -1 &&
    visibleTagsMapSource.includes("key={isEmpty ? 'empty' : `${tag}-${index}`}") &&
    visibleTagsMapSource.includes('<span') &&
    visibleTagsMapSource.includes("className={isEmpty ? 'tag-bar__morph-slot' : undefined}") &&
    visibleTagsMapSource.includes('style={isEmpty ? emptyChipWidthStyle : undefined}') &&
    visibleTagsMapSource.includes("prefix={editable && isEmpty ? '+' : '#'}") &&
    visibleTagsMapSource.includes("state={editable ? 'glass' : 'default'}") &&
    visibleTagsMapSource.includes('onClick={getChipClickHandler(tag)}') &&
    visibleTagsMapSource.includes('disabled={editable && !canEdit}'),
  'TagBar display and edit modes must share the same mapped tag chips so each chip can morph in place.',
)
assert.ok(
  componentSource.includes('const isEmpty = tags.length === 0') &&
    componentSource.includes('const visibleTags = isEmpty ? [editable ? addLabel : emptyLabel] : tags') &&
    componentSource.includes('const showAddChip = !isEmpty && (editable || renderAddChip)') &&
    componentSource.includes('const emptyChipLabel = editable ? addLabel : emptyLabel') &&
    componentSource.includes("const emptyChipPrefix = editable ? '+' : '#'") &&
    componentSource.includes('const emptyChipWidthStyle = emptyChipSize === null') &&
    componentSource.includes('inlineSize: `${emptyChipSize}px`'),
  'TagBar empty state must reuse the mapped chip and animate its wrapper width while morphing #emptyLabel into +addLabel.',
)
assert.ok(
  addChipSource.includes('showAddChip ? (') &&
    addChipSource.includes('<ChipButton') &&
    !addChipSource.includes('isEmpty'),
  'TagBar add chip branch must only serve non-empty tag rows; empty rows morph the placeholder chip in place.',
)
assert.ok(
  !cssSource.includes('.tag-bar .chip-button') &&
    !cssSource.includes(':where(.tag-bar) .chip-button') &&
    !cssSource.includes('.tag-bar[data-editable="true"] .chip-button'),
  'TagBar CSS must not duplicate ChipButton morph, hover, glass, or content-layer styles.',
)

for (const [block, snippet, message] of [
  [rootBlock, 'position: relative;', 'TagBar root must provide a positioning context.'],
  [rootBlock, 'min-width: 0;', 'TagBar root must allow shrinking inside cards.'],
  [positionAnimatingRootBlock, 'will-change: transform;', 'TagBar root must scope transform optimization to active position FLIP animations.'],
  [floatBarBlock, 'position: static;', 'TagBar must neutralize FloatBar absolute positioning in edit mode.'],
  [floatBarBlock, 'justify-content: flex-start;', 'TagBar FloatBar must align the row to the left.'],
  [frameBlock, 'display: block;', 'TagBar FloatBar frame must collapse to normal row layout.'],
  [leftSlotBlock, 'display: flex;', 'TagBar left slot must remain a flex container.'],
  [leftSlotBlock, 'justify-content: flex-start;', 'TagBar left slot must align chips left.'],
  [hiddenSlotBlock, 'display: none;', 'TagBar must hide unused center and right FloatBar slots.'],
  [chipsBlock, 'display: flex;', 'TagBar chips must use the same flex display as Card tags.'],
  [chipsBlock, 'position: relative;', 'TagBar chips must anchor the hidden empty-chip measurement element.'],
  [chipsBlock, 'min-width: 0;', 'TagBar chips must shrink like Card tags.'],
  [chipsBlock, 'flex-wrap: wrap;', 'TagBar chips must wrap like Card tags.'],
  [chipsBlock, 'align-items: flex-end;', 'TagBar chips must bottom-align like Card tags.'],
  [chipsBlock, 'gap: var(--space-tag-gap);', 'TagBar chips must use Card tag gap.'],
  [morphSlotBlock, '--tag-bar-empty-chip-width-transition-duration: 180ms;', 'TagBar empty chip width transition must use the standard 180ms duration.'],
  [morphSlotBlock, 'display: inline-block;', 'TagBar empty chip slot must allow inline-size animation.'],
  [morphSlotBlock, 'max-width: 100%;', 'TagBar empty chip slot must respect Card width constraints.'],
  [morphSlotBlock, 'overflow: visible;', 'TagBar empty chip slot must let edit-state shadows render outside the animated width box.'],
  [morphSlotBlock, 'transition: inline-size var(--tag-bar-empty-chip-width-transition-duration) cubic-bezier(0.2, 0, 0, 1);', 'TagBar empty chip slot must animate inline-size.'],
  [morphSlotChipBlock, 'width: 100%;', 'TagBar empty visible chip must fill the animated slot.'],
  [morphMeasureBlock, 'position: absolute;', 'TagBar empty width measurement chip must be removed from normal layout.'],
  [morphMeasureBlock, 'inline-size: max-content;', 'TagBar empty width measurement chip must expose natural content width.'],
  [morphMeasureBlock, 'visibility: hidden;', 'TagBar empty width measurement chip must not be visible.'],
  [morphMeasureBlock, 'pointer-events: none;', 'TagBar empty width measurement chip must not intercept interactions.'],
  [morphMeasureChipBlock, 'width: max-content;', 'TagBar empty measurement chip must measure the unconstrained capsule width.'],
  [morphMeasureChipBlock, 'max-width: none;', 'TagBar empty measurement chip must avoid truncation while measuring.'],
  [addChipBlock, 'animation: tag-bar-add-chip-in var(--weimo-card-transition-duration, 180ms)', 'TagBar add chip must enter separately from existing chip morphs and honor Card transition duration overrides.'],
  [addChipBlock, 'transform-origin: center;', 'TagBar add chip must scale from its center.'],
  [exitingAddChipBlock, 'animation: tag-bar-add-chip-out var(--weimo-card-transition-duration, 160ms)', 'TagBar add chip must play a separate exit shrink animation and honor Card transition duration overrides.'],
  [exitingAddChipBlock, 'pointer-events: none;', 'TagBar exiting add chip must not remain interactive.'],
]) {
  assertIncludes(block, snippet, message)
}

assert.ok(
  cssSource.includes('@keyframes tag-bar-add-chip-in') &&
    cssSource.includes('opacity: 0;') &&
    cssSource.includes('transform: scale(0.72);') &&
    cssSource.includes('opacity: 1;') &&
    cssSource.includes('transform: scale(1);'),
  'TagBar add chip enter animation must scale up from transparent to full size.',
)
assert.ok(
  cssSource.includes('@keyframes tag-bar-add-chip-out') &&
    cssSource.includes('opacity: 1;') &&
    cssSource.includes('transform: scale(1);') &&
    cssSource.includes('opacity: 0;') &&
    cssSource.includes('transform: scale(0.72);'),
  'TagBar add chip exit animation must scale down to transparent.',
)

assert.ok(
  !chipsBlock.includes('padding:') &&
    !chipsBlock.includes('margin:') &&
    !chipsBlock.includes('background:') &&
    !chipsBlock.includes('border:'),
  'TagBar chip row must not add padding, margin, background, or border beyond Card tag rhythm.',
)

assert.ok(
  docsSource.includes("import { useState } from 'react'") &&
    docsSource.includes("import { TagBar } from '../../components/tag-bar'") &&
    docsSource.includes("import { TextButton } from '../../components/text-button'") &&
    docsSource.includes("id: 'tag'") &&
    docsSource.includes('preview: () => <TagDemo />') &&
    docsSource.includes('<TagBarDemo />') &&
    docsSource.includes('summary:') &&
    docsSource.includes('status:') &&
    docsSource.includes('preview:') &&
    !docsSource.includes('code:') &&
    !docsSource.includes('variantPreviews:') &&
    docsSource.includes('const [editable, setEditable] = useState(false)') &&
    docsSource.includes("const [tags, setTags] = useState(['写作/日记', '研究/论文'])") &&
    docsSource.includes('<TagBar') &&
    docsSource.includes('editable={editable}') &&
    docsSource.includes('onTagsChange={setTags}') &&
    docsSource.includes('tagOptions={tagOptions}') &&
    docsSource.includes('tags={tags}') &&
    docsSource.includes('<TextButton') &&
    docsSource.includes("editable ? '切换到展示态' : '切换到编辑态'"),
  'Tag docs definition must provide a local state TagBar preview with a mode toggle.',
)
assert.ok(
  !docsSource.includes("import { Button } from '../../components/coss/button'") &&
    !/<Button\b/.test(docsSource),
  'TagBar docs mode toggle must not use coss Button.',
)
assert.ok(
  definitionsIndexSource.includes("import { tagDefinition } from './tag'") &&
    definitionsIndexSource.includes('tag: tagDefinition') &&
    !definitionsIndexSource.includes('tag-bar'),
  'Component definitions index must export the merged Tag docs definition.',
)
assert.ok(
  manifestSource.includes("id: 'tag'") &&
    manifestSource.includes("name: '标签'") &&
    manifestSource.includes("exportName: 'TagBar'") &&
    manifestSource.includes("registryName: 'tag-bar'") &&
    manifestSource.includes("packageExport: './components/tag-bar'") &&
    manifestSource.includes('registry: true') &&
    !manifestSource.includes("id: 'tag-bar',") &&
    !manifestSource.includes("internalGroup: 'tag-tree'"),
  'Component manifest must list TagBar as a public registry component through the merged Tag page.',
)

for (const [block, snippet, message] of [
  [previewBlock, 'display: grid;', 'TagBar preview root must center the preview panel.'],
  [previewBlock, 'place-items: center;', 'TagBar preview root must center contents.'],
  [previewPanelBlock, 'display: grid;', 'TagBar preview panel must stack the tag row and toggle.'],
  [previewPanelBlock, 'grid-template-columns: minmax(0, 1fr);', 'TagBar preview panel must stack content like CardTopBar.'],
  [previewPanelBlock, 'justify-items: start;', 'TagBar preview panel must align stacked content to the left.'],
  [previewPanelBlock, 'gap: 12px;', 'TagBar preview panel must keep the toggle below the tag row with compact spacing.'],
  [previewPanelBlock, 'padding: 16px;', 'TagBar preview panel must use CardTopBar preview padding.'],
  [previewPanelBlock, 'border: 1px solid var(--color-border);', 'TagBar preview panel must draw an outer border.'],
  [previewPanelBlock, 'border-radius: var(--radius);', 'TagBar preview panel must use the standard preview radius.'],
  [previewPanelBlock, 'background: var(--color-bg-card);', 'TagBar preview panel must use the standard preview surface.'],
  [previewControlsBlock, 'justify-self: center;', 'TagBar preview controls must be centered below the tag row.'],
]) {
  assertIncludes(block, snippet, message)
}

for (const [block, snippet, message] of [
  [previewPanelBlock, 'box-shadow:', 'TagBar preview panel must match CardTopBar by omitting an outer shadow.'],
  [previewPanelBlock, 'display: flex;', 'TagBar preview panel must not use side-by-side flex layout.'],
]) {
  assertNotIncludes(block, snippet, message)
}
