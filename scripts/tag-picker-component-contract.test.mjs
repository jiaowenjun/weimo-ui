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

function cssBlockFor(source, selector) {
  const start = source.indexOf(selector)
  assert.notEqual(start, -1, `${selector} must exist.`)
  const end = source.indexOf('}', start)
  assert.notEqual(end, -1, `${selector} must have a closing brace.`)
  return source.slice(start, end + 1)
}

const entrySource = readProjectFile('src/components/tag-picker.tsx')
const indexSource = readProjectFile('src/components/tag-picker/index.tsx')
const componentSource = readProjectFile('src/components/tag-picker/tag-picker.tsx')
const hookSource = readProjectFile('src/components/tag-picker/use-tag-picker.ts')
const modelSource = readProjectFile('src/components/tag-picker/tag-picker-model.ts')
const cssSource = readProjectFile('src/components/tag-picker/tag-picker.css')
const bottomBarSource = readProjectFile('src/components/bottom-bar.tsx')
const bottomBarCss = readProjectFile('src/components/bottom-bar.css')
const floatBarSource = readProjectFile('src/components/float-bar.tsx')
const floatBarCss = readProjectFile('src/components/float-bar.css')
const actionDialogSource = readProjectFile('src/components/action-dialog.tsx')
const actionDialogCss = readProjectFile('src/components/action-dialog.css')
const manifestSource = readProjectFile('src/docs/components-manifest.ts')
const rootRegistry = JSON.parse(readProjectFile('registry.json'))
const packageJson = JSON.parse(readProjectFile('package.json'))
const floatBarBlock = cssBlockFor(floatBarCss, '.float-bar {')
const floatBarFrameBlock = cssBlockFor(floatBarCss, '.float-bar__frame {')
const floatBarSlotBlock = cssBlockFor(floatBarCss, '.float-bar__slot {')
const floatBarSlotContentBlock = cssBlockFor(floatBarCss, '.float-bar__slot > * {')

assert.ok(
  entrySource.includes("from './tag-picker/index'"),
  'TagPicker entry file must re-export the folder API.',
)
assert.ok(
  indexSource.includes('TagPicker') &&
  indexSource.includes('TagPickerProps') &&
  indexSource.includes('TagPickerApplyPayload') &&
  indexSource.includes('TagPickerMode') &&
  indexSource.includes('TagPickerOption') &&
  indexSource.includes('TagPickerDraftSource') &&
  indexSource.includes('normalizeTagPickerDraft') &&
  indexSource.includes('applyTagPickerDraft') &&
  indexSource.includes('deriveTagPickerState') &&
  indexSource.includes('filterTagPickerOptions') &&
  indexSource.includes('tagMatchesPickerQuery'),
  'TagPicker folder API must export the component, public types, and model helpers.',
)
assert.equal(
  packageJson.exports?.['./components/tag-picker'],
  './src/components/tag-picker.tsx',
  'package.json must expose ./components/tag-picker.',
)
assert.equal(
  packageJson.exports?.['./components/float-bar'],
  './src/components/float-bar.tsx',
  'FloatBar must have a public package export.',
)
assert.equal(
  packageJson.exports?.['./components/action-dialog'],
  './src/components/action-dialog.tsx',
  'ActionDialog must have a public package export.',
)
assert.equal(
  packageJson.exports?.['./components/bottom-bar'],
  './src/components/bottom-bar.tsx',
  'BottomBar must have a public package export.',
)
assert.ok(
  packageJson.scripts?.test?.includes('scripts/tag-picker-component-contract.test.mjs'),
  'package.json test script must run tag-picker-component-contract.test.mjs.',
)

assert.ok(
  manifestSource.includes("id: 'bar'") &&
    manifestSource.includes("exportName: 'FloatBar'") &&
    manifestSource.includes("registryName: 'float-bar'") &&
    manifestSource.includes("packageExport: './components/float-bar'") &&
    manifestSource.includes('registry: true'),
  'FloatBar must stay public through the merged floating Bar page.',
)
assert.ok(
  manifestSource.includes("id: 'action-dialog'") &&
    manifestSource.includes("name: '对话框'") &&
    manifestSource.includes("exportName: 'ActionDialog'") &&
    manifestSource.includes("registryName: 'action-dialog'") &&
    manifestSource.includes("packageExport: './components/action-dialog'") &&
    manifestSource.includes('registry: true'),
  'ActionDialog must be documented as a public registry-backed component.',
)
assert.ok(
  manifestSource.includes("id: 'bottom-bar'") &&
    manifestSource.includes("name: 'BottomBar'") &&
    manifestSource.includes("registryName: 'bottom-bar'") &&
    manifestSource.includes("packageExport: './components/bottom-bar'") &&
    manifestSource.includes('registry: true'),
  'BottomBar must be documented as a public registry-backed component.',
)
assert.equal(
  rootRegistry.items.some((item) => item.name === 'float-bar'),
  true,
  'FloatBar must be added as a standalone registry item.',
)
assert.equal(
  rootRegistry.items.some((item) => item.name === 'action-dialog'),
  true,
  'ActionDialog must be added as a standalone registry item.',
)
assert.equal(
  rootRegistry.items.some((item) => item.name === 'bottom-bar'),
  true,
  'BottomBar must be added as a standalone registry item.',
)

assert.ok(
  floatBarSource.includes("import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'") &&
  floatBarSource.includes("import { cn } from './lib/utils'") &&
  floatBarSource.includes("import './float-bar.css'") &&
  floatBarSource.includes('export type FloatBarProps') &&
  floatBarSource.includes('leftSlot?: ReactNode') &&
  floatBarSource.includes('centerSlot?: ReactNode') &&
  floatBarSource.includes('rightSlot?: ReactNode') &&
  floatBarSource.includes('export const FloatBar = forwardRef<HTMLDivElement, FloatBarProps>(function FloatBar') &&
  floatBarSource.includes('ref={ref}') &&
  floatBarSource.includes("FloatBar.displayName = 'FloatBar'") &&
  floatBarSource.includes("role={role ?? 'toolbar'}") &&
  floatBarSource.includes("className={cn('float-bar', className)}") &&
  floatBarSource.includes('float-bar__frame') &&
  floatBarSource.includes('float-bar__slot--left') &&
  floatBarSource.includes('float-bar__slot--center') &&
  floatBarSource.includes('float-bar__slot--right'),
  'FloatBar must expose an internal three-slot toolbar layout with default toolbar semantics.',
)
assert.ok(
  floatBarBlock.includes('position: absolute;') &&
  floatBarBlock.includes('inset-block-start: 0;') &&
  floatBarBlock.includes('inset-inline: 0;') &&
  floatBarBlock.includes('pointer-events: none;') &&
  floatBarFrameBlock.includes('pointer-events: none;') &&
  floatBarSlotBlock.includes('pointer-events: none;') &&
  floatBarSlotContentBlock.includes('pointer-events: auto;') &&
  floatBarCss.includes('.float-bar__slot--center') &&
  floatBarCss.includes('justify-content: center;') &&
  floatBarCss.includes('.float-bar__slot--right') &&
  floatBarCss.includes('justify-content: flex-end;'),
  'FloatBar CSS must let transparent layout regions pass pointer events through while keeping slot content interactive.',
)
assert.ok(
  bottomBarSource.includes("import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'") &&
  bottomBarSource.includes("import { FloatBar } from './float-bar'") &&
  bottomBarSource.includes("import { cn } from './lib/utils'") &&
  bottomBarSource.includes("import './bottom-bar.css'") &&
  bottomBarSource.includes('export type BottomBarProps') &&
  bottomBarSource.includes('leftSlot?: ReactNode') &&
  !bottomBarSource.includes('centerSlot?: ReactNode') &&
  bottomBarSource.includes('rightSlot?: ReactNode') &&
  bottomBarSource.includes('export const BottomBar = forwardRef<HTMLDivElement, BottomBarProps>(function BottomBar') &&
  bottomBarSource.includes('<FloatBar') &&
  bottomBarSource.includes('ref={ref}') &&
  bottomBarSource.includes("BottomBar.displayName = 'BottomBar'") &&
  bottomBarSource.includes("className={cn('bottom-bar', className)}") &&
  bottomBarSource.includes('leftSlot={leftSlot}') &&
  bottomBarSource.includes('rightSlot={rightSlot}') &&
  !bottomBarSource.includes('centerSlot={'),
  'BottomBar must compose internal FloatBar with a narrow left/right slot API.',
)
assert.ok(
  bottomBarCss.includes('.bottom-bar') &&
  bottomBarCss.includes('inset-block-start: auto;') &&
  bottomBarCss.includes('inset-block-end: 0;') &&
  bottomBarCss.includes('padding: 0 12px 12px;') &&
  bottomBarCss.includes('.bottom-bar .float-bar__frame') &&
  bottomBarCss.includes('grid-template-columns: minmax(0, 1fr) auto;') &&
  bottomBarCss.includes('.bottom-bar .float-bar__slot--left') &&
  bottomBarCss.includes('overflow: visible;') &&
  bottomBarCss.includes('grid-column: 1;') &&
  bottomBarCss.includes('.bottom-bar .float-bar__slot--center') &&
  bottomBarCss.includes('display: none;') &&
  bottomBarCss.includes('.bottom-bar .float-bar__slot--right') &&
  bottomBarCss.includes('grid-column: 2;'),
  'BottomBar CSS must centralize bottom positioning, padding, two-column layout, and center-slot hiding.',
)
assert.ok(
  actionDialogSource.includes("import { X } from 'lucide-react'") &&
    actionDialogSource.includes("import type { ReactNode } from 'react'") &&
    actionDialogSource.includes("from './coss/dialog'") &&
    actionDialogSource.includes("import { BottomBar } from './bottom-bar'") &&
    actionDialogSource.includes("import { FloatBar } from './float-bar'") &&
    actionDialogSource.includes("import { GlassIconButton } from './glass-icon-button'") &&
    actionDialogSource.includes("import { cn } from './lib/utils'") &&
    actionDialogSource.includes("import './action-dialog.css'") &&
    actionDialogSource.includes('export type ActionDialogProps') &&
    actionDialogSource.includes('bottomBarLabel?: string') &&
    actionDialogSource.includes('bottomBarClassName?: string') &&
    actionDialogSource.includes('bottomBarLeftSlot?: ReactNode') &&
    actionDialogSource.includes('bottomBarRightSlot?: ReactNode') &&
    actionDialogSource.includes('showCloseButton?: boolean') &&
    actionDialogSource.includes('toolbarRightSlot?: ReactNode') &&
    actionDialogSource.includes('popupProps?: Omit<DialogPopupProps') &&
    actionDialogSource.includes('title: ReactNode') &&
    actionDialogSource.includes('export function ActionDialog') &&
    actionDialogSource.includes("bottomBarLabel = '对话框底部操作栏'") &&
    actionDialogSource.includes('showCloseButton = true') &&
    actionDialogSource.includes('const showBottomBar = Boolean(bottomBarLeftSlot || bottomBarRightSlot)') &&
    actionDialogSource.includes('<Dialog') &&
    actionDialogSource.includes('<DialogPopup') &&
    actionDialogSource.includes("className={cn('action-dialog', className)}") &&
    actionDialogSource.includes('<FloatBar') &&
    actionDialogSource.includes("className={cn('action-dialog__bar', floatBarClassName)}") &&
    actionDialogSource.includes('<DialogTitle') &&
    actionDialogSource.includes("className={cn('action-dialog__title', titleClassName)}") &&
    actionDialogSource.includes('className="action-dialog__actions"') &&
    actionDialogSource.includes('{toolbarRightSlot}') &&
    actionDialogSource.includes('showCloseButton ?') &&
    actionDialogSource.includes('<DialogClose') &&
    actionDialogSource.includes('render={<GlassIconButton />}') &&
    actionDialogSource.includes('type="button"') &&
    actionDialogSource.includes('{children}') &&
    actionDialogSource.includes('showBottomBar ?') &&
    actionDialogSource.includes('<BottomBar') &&
    actionDialogSource.includes('aria-label={bottomBarLabel}') &&
    actionDialogSource.includes("className={cn('action-dialog__bottom-bar', bottomBarClassName)}") &&
    actionDialogSource.includes('leftSlot={bottomBarLeftSlot}') &&
    actionDialogSource.includes('rightSlot={bottomBarRightSlot}') &&
    actionDialogSource.indexOf('{children}') < actionDialogSource.indexOf('showBottomBar ?'),
  'ActionDialog must compose coss Dialog, internal FloatBar title bar, right toolbar slot, optional internal BottomBar, visible DialogTitle, and GlassIconButton-backed DialogClose.',
)
assert.ok(
  actionDialogCss.includes('.action-dialog') &&
  actionDialogCss.includes('position: relative;') &&
  actionDialogCss.includes('.action-dialog__bar') &&
  actionDialogCss.includes('padding: 10px 10px 0;') &&
  actionDialogCss.includes('.action-dialog__bar .float-bar__frame') &&
  actionDialogCss.includes('min-height: 34px;') &&
  actionDialogCss.includes('.action-dialog__title') &&
  actionDialogCss.includes('overflow: hidden;') &&
  actionDialogCss.includes('text-overflow: ellipsis;') &&
  actionDialogCss.includes('white-space: nowrap;'),
  'ActionDialog CSS must define reusable popup positioning, compact toolbar spacing, and title truncation.',
)

assert.ok(
  modelSource.includes("export type TagPickerMode = 'insert' | 'update' | 'pick'") &&
  modelSource.includes('export type TagPickerApplyPayload') &&
  modelSource.includes('selectedTags: string[]') &&
  modelSource.includes('draft: string') &&
  modelSource.includes('mode: TagPickerMode'),
  'TagPicker model must define public mode and apply payload types.',
)

assert.ok(
  hookSource.includes('DOUBLE_TAP_INTERVAL_MS = 300') &&
  hookSource.includes('export function useTagPicker') &&
  hookSource.includes("useState<TagPickerDraftSource>('sync-init')") &&
  hookSource.includes('lastOptionTapRef') &&
  hookSource.includes("'list-tap'") &&
  hookSource.includes('Date.now()') &&
  hookSource.includes('onApplyPayload') &&
  hookSource.includes('applyTagPickerDraft') &&
  hookSource.includes('deriveTagPickerState') &&
  hookSource.includes('state') &&
  hookSource.includes('resetPickerState'),
  'useTagPicker must orchestrate draft state, model derivation, and 300ms row double-tap apply.',
)
assert.ok(
  hookSource.includes('open,') &&
  hookSource.includes('mode,') &&
  hookSource.includes('tagOptions,') &&
  hookSource.includes('selectedTags,') &&
  hookSource.includes('targetTag,') &&
  hookSource.includes('initialDraft,') &&
  hookSource.includes('allowEmptyRemove,'),
  'useTagPicker must reset/derive from the controlled picker inputs.',
)

assert.ok(
  componentSource.includes("from '../coss/dialog'") &&
    componentSource.includes("from '../coss/input-group'") &&
    componentSource.includes("from '../coss/scroll-area'") &&
    !componentSource.includes("from '../bottom-bar'") &&
    !componentSource.includes('<BottomBar') &&
    !componentSource.includes("from '../float-bar'") &&
    componentSource.includes("from '../action-dialog'") &&
    componentSource.includes("from '../glass-icon-button'") &&
    componentSource.includes('<ActionDialog') &&
    componentSource.includes('className="tag-picker"') &&
    componentSource.includes('closeLabel="关闭标签选择器"') &&
    componentSource.includes('floatBarClassName="tag-picker__float-bar"') &&
    componentSource.includes('onOpenChange={onOpenChange}') &&
    componentSource.includes('open={open}') &&
    componentSource.includes('title={dialogTitle}') &&
    componentSource.includes('titleClassName="tag-picker__title"') &&
    componentSource.includes('toolbarLabel="标签选择器工具栏"') &&
    componentSource.includes('bottomBarLabel="标签选择器输入栏"') &&
    componentSource.includes('bottomBarClassName="tag-picker__bottom-float-bar"') &&
    componentSource.includes('bottomBarLeftSlot={') &&
    !componentSource.includes('<Dialog open={open} onOpenChange={onOpenChange}>') &&
    !componentSource.includes('<DialogPopup') &&
    !componentSource.includes('<DialogTitle') &&
    !componentSource.includes('<DialogClose') &&
    !componentSource.includes('<DialogHeader') &&
    !componentSource.includes('<DialogFooter') &&
    !componentSource.includes("DialogFooter,\n") &&
    componentSource.includes('<DialogPanel') &&
    componentSource.includes('className="tag-picker__input-row"') &&
    componentSource.includes('<InputGroup data-mode={mode}>') &&
    componentSource.includes('<InputGroupInput') &&
    componentSource.includes('<InputGroupAddon') &&
    componentSource.includes('<ScrollArea') &&
    componentSource.includes('scrollFade={false}') &&
    componentSource.includes('scrollbarGutter'),
  'TagPicker must delegate its popup shell and bottom input row to ActionDialog bottomBarLeftSlot.',
)
assert.ok(
  componentSource.indexOf('bottomBarLeftSlot={') <
    componentSource.indexOf('className="tag-picker__input-row"') &&
    componentSource.indexOf('className="tag-picker__input-row"') <
      componentSource.indexOf('<DialogPanel'),
  'TagPicker bottom input row must be passed through ActionDialog bottomBarLeftSlot before the dialog panel children.',
)
assert.ok(
  componentSource.includes("mode === 'pick'") &&
  componentSource.includes('align="inline-start"') &&
  componentSource.includes('align="inline-end"') &&
  !componentSource.includes('className="tag-picker__input-bar"') &&
  !componentSource.includes('className="tag-picker__input"') &&
  !componentSource.includes('className="tag-picker__search-addon"') &&
  componentSource.includes('<X') &&
  componentSource.includes('<Check') &&
  componentSource.includes('toolbarLabel="标签选择器工具栏"') &&
  componentSource.includes('<Search') &&
    componentSource.includes('<GlassIconButton') &&
  componentSource.includes('closeLabel="关闭标签选择器"') &&
  componentSource.includes('aria-label="确认"') &&
  componentSource.includes('aria-label={inputAriaLabel}') &&
  componentSource.includes('data-mode={mode}') &&
  componentSource.includes('onKeyDown={handleInputKeyDown}') &&
  componentSource.includes('type="button"') &&
  componentSource.includes('type="text"') &&
  componentSource.includes('disabled={state.confirmDisabled}'),
  'TagPicker must render accessible search/clear/confirm controls with explicit button and input semantics.',
)
assert.ok(
  componentSource.indexOf('<InputGroupInput') <
  componentSource.indexOf('<InputGroupAddon'),
  'TagPicker InputGroup addons must follow InputGroupInput in DOM order for coss focus behavior.',
)
assert.ok(
  componentSource.indexOf('</InputGroup>') <
  componentSource.indexOf('className="tag-picker__confirm"'),
  'TagPicker confirm GlassIconButton must render outside the InputGroup as the right-side footer action.',
)
assert.ok(
  componentSource.includes('className="tag-picker__confirm"') &&
  !componentSource.includes('variant="ghost"') &&
  !componentSource.includes('variant={') &&
  !componentSource.includes('size="sm"'),
  'TagPicker confirm control must use the default GlassIconButton size instead of custom/ghost button styling.',
)
assert.ok(
  componentSource.includes('onClick={() => onPress(option)}') &&
  componentSource.includes('onPress={handleOptionPress}') &&
  componentSource.includes('disabled={option.disabled}') &&
  componentSource.includes('option.optionBadge') &&
  componentSource.includes("option.tag === currentDraft") &&
  componentSource.includes("mode === 'pick'") &&
  componentSource.includes('未找到匹配标签，仅可选择已有标签') &&
  componentSource.includes('可直接输入新标签'),
  'TagPicker must render option buttons, disabled badges, exact-match check state, and mode-aware empty states.',
)
assert.ok(
  componentSource.includes('onApply(payload)') &&
  componentSource.includes('onOpenChange(false)') &&
  componentSource.includes('targetTag =') &&
  componentSource.includes('initialDraft =') &&
  componentSource.includes('allowEmptyRemove = true'),
  'TagPicker must call onApply then close and define mode defaults.',
)

assert.ok(
  cssSource.includes('.tag-picker') &&
  cssSource.includes('position: relative;') &&
  cssSource.includes('.tag-picker__title') &&
  cssSource.includes('max-width: min(100%, 280px);') &&
  !cssSource.includes('.tag-picker__close') &&
  !cssSource.includes('.tag-picker__footer') &&
  cssSource.includes('.tag-picker__bottom-float-bar') &&
  !cssSource.includes('.tag-picker__bottom-float-bar {\n    inset-block-start: auto;') &&
  !cssSource.includes('padding: 0 12px 12px;') &&
  cssSource.includes('.tag-picker__bottom-float-bar .float-bar__frame') &&
  cssSource.includes('grid-template-columns: 1fr;') &&
  cssSource.includes('.tag-picker__bottom-float-bar .float-bar__slot--left') &&
  cssSource.includes('grid-column: 1 / -1;') &&
  cssSource.includes('.tag-picker__list') &&
  cssSource.includes('padding-bottom: 72px;') &&
  cssSource.includes('.tag-picker__option') &&
  cssSource.includes('.tag-picker__option-badge') &&
  cssSource.includes('.tag-picker__option-check') &&
  cssSource.includes('.tag-picker__empty') &&
  cssSource.includes('.tag-picker__input-row') &&
  cssSource.includes('.tag-picker__confirm'),
  'TagPicker CSS must define picker sizing, bottom FloatBar layout, option list safe padding, empty state, input row, and action selectors without footer or custom close styles.',
)
assert.ok(
  cssSource.includes('height: min(460px, 68vh);') &&
  cssSource.includes('max-height: 68vh;') &&
  cssSource.includes('padding-top: 52px;') &&
  cssSource.includes('min-width: 0;') &&
  cssSource.includes('border-radius: var(--radius-sm);') &&
  cssSource.includes('background: var(--color-bg-hover);') &&
  cssSource.includes('color: var(--color-text-placeholder);'),
  'TagPicker CSS must give ScrollArea more vertical room, clear the floating header, truncate long tags, and use Weimo theme tokens.',
)
assert.ok(
  !cssSource.includes('.tag-picker__input-bar {') &&
  !cssSource.includes('.tag-picker__input {') &&
  !cssSource.includes('.tag-picker__search-addon') &&
  !cssSource.includes('grid-template-columns: auto minmax(0, 1fr) auto auto;') &&
  !cssSource.includes('grid-template-columns: minmax(0, 1fr) auto auto;'),
  'TagPicker input bar must use coss InputGroup styling without component-level input/group/search overrides.',
)
assert.ok(
  cssSource.includes('.tag-picker__confirm') &&
    !cssSource.includes('.tag-picker__confirm:disabled'),
  'TagPicker confirm button must keep only layout styling and rely on IconButton for disabled state styling.',
)
