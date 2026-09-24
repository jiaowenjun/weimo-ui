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

const dialogSource = readProjectFile('src/components/coss/dialog.tsx')
const dialogCss = readProjectFile('src/components/coss/dialog.css')
const popupSurfaceCss = readProjectFile('src/components/popup-surface.css')
const inputGroupSource = readProjectFile('src/components/coss/input-group.tsx')
const inputGroupCss = readProjectFile('src/components/coss/input-group.css')
const glassSurfaceCss = readProjectFile('src/components/glass-surface.css')
const scrollAreaSource = readProjectFile('src/components/coss/scroll-area.tsx')
const scrollAreaCss = readProjectFile('src/components/coss/scroll-area.css')
const packageJson = JSON.parse(readProjectFile('package.json'))
const glassSurfaceBlock =
  glassSurfaceCss.match(/\.glass-surface\s*\{(?<block>[^}]*)\}/)?.groups?.block ?? ''

assert.ok(
  dialogSource.includes("import { Dialog as BaseDialog } from '@base-ui/react/dialog'") &&
    dialogSource.includes('export function Dialog') &&
    dialogSource.includes('export function DialogTrigger') &&
    dialogSource.includes('export function DialogClose') &&
    dialogSource.includes('export function DialogPopup') &&
    dialogSource.includes('export function DialogHeader') &&
    dialogSource.includes('export function DialogTitle') &&
    dialogSource.includes('export function DialogDescription') &&
    dialogSource.includes('export function DialogPanel') &&
    dialogSource.includes('export function DialogFooter') &&
    dialogSource.includes('BaseDialog.Portal') &&
    dialogSource.includes('BaseDialog.Backdrop') &&
    dialogSource.includes('BaseDialog.Viewport') &&
    dialogSource.includes('BaseDialog.Popup'),
  'coss dialog wrapper must compose Base UI Dialog root, trigger, close, portal, backdrop, viewport, popup, and section helpers.',
)
assert.ok(
  dialogSource.includes('portalProps?: BaseDialog.Portal.Props') &&
    dialogSource.includes('data-slot="dialog-popup"') &&
    dialogSource.includes('data-slot="dialog-header"') &&
    dialogSource.includes('data-slot="dialog-panel"') &&
    dialogSource.includes('data-slot="dialog-footer"'),
  'coss dialog wrapper must expose portalProps and stable section data slots.',
)
assert.ok(
  dialogCss.includes('.coss-dialog__backdrop') &&
    dialogCss.includes('.coss-dialog__viewport') &&
    dialogCss.includes('.coss-dialog__popup') &&
    dialogCss.includes('.coss-dialog__header') &&
    dialogCss.includes('.coss-dialog__panel') &&
    dialogCss.includes('.coss-dialog__footer') &&
    dialogCss.includes('z-index: 80;') &&
    dialogCss.includes('z-index: 81;') &&
    dialogSource.includes("import { getPopupSurfaceClassName } from '../popup-surface'") &&
    dialogSource.includes("getPopupSurfaceClassName('modal', 'coss-dialog__popup', className)") &&
    popupSurfaceCss.includes('border-radius: var(--radius);') &&
    popupSurfaceCss.includes('background: var(--color-bg-card);'),
  'coss dialog CSS must define sections and high-layer backdrop/viewport while PopupSurface owns the themed modal shell.',
)

assert.ok(
  inputGroupSource.includes('export function InputGroup') &&
    inputGroupSource.includes('export function InputGroupAddon') &&
    inputGroupSource.includes('export function InputGroupInput') &&
    inputGroupSource.includes('export function InputGroupText') &&
    inputGroupSource.includes("data-slot=\"input-group\"") &&
    inputGroupSource.includes("data-slot=\"input-group-addon\"") &&
    inputGroupSource.includes("data-slot=\"input\"") &&
    inputGroupSource.includes("role=\"group\""),
  'coss input-group wrapper must expose group, addon, input, and text helpers with stable slots.',
)
assert.ok(
  inputGroupSource.includes("align = 'inline-start'") &&
    inputGroupSource.includes('data-align={align}') &&
    inputGroupSource.includes('onMouseDown={handleMouseDown}') &&
    inputGroupSource.includes("querySelector<") &&
    inputGroupSource.includes("'input, textarea'") &&
    inputGroupSource.includes('input.focus()'),
  'coss input-group addon must keep documented align props and focus the input from non-interactive addon clicks.',
)
assert.ok(
  inputGroupCss.includes('.coss-input-group') &&
    inputGroupCss.includes('.coss-input-group__input') &&
    inputGroupCss.includes('.coss-input-group__addon') &&
    inputGroupCss.includes('.coss-input-group__text') &&
    inputGroupCss.includes('[data-align="inline-start"]') &&
    inputGroupCss.includes('[data-align="inline-end"]') &&
    inputGroupCss.includes('order: -1;') &&
    inputGroupCss.includes('order: 1;'),
  'coss input-group CSS must define themed shell, input, addons, text, and visual addon ordering.',
)
assert.ok(
  inputGroupCss.includes('box-sizing: border-box;') &&
    inputGroupCss.includes('min-height: 48px;') &&
    inputGroupCss.includes('padding-inline: 12px 6px;') &&
    inputGroupCss.includes('gap: 6px;') &&
    inputGroupCss.includes('min-height: 34px;') &&
    inputGroupCss.includes('padding-inline-start: 2px;') &&
    inputGroupCss.includes('line-height: 34px;'),
  'coss input-group CSS must keep empty and filled groups the same height while padding input text away from the left border.',
)
assert.ok(
  inputGroupSource.includes("getGlassSurfaceClassName('coss-input-group', className)") &&
    !inputGroupSource.includes('getGlassSurfaceAttributes') &&
    glassSurfaceBlock.includes('border: 1px solid transparent;') &&
    glassSurfaceCss.includes('.glass-surface--bordered {') &&
    glassSurfaceCss.includes('border-color: var(--glass-surface-border);') &&
    !glassSurfaceBlock.includes('background: var(--glass-gradient);') &&
    !glassSurfaceBlock.includes('linear-gradient') &&
    !glassSurfaceCss.includes('box-shadow:') &&
    !glassSurfaceCss.includes('--glass-shadow') &&
    glassSurfaceBlock.includes('backdrop-filter: blur(var(--glass-blur));') &&
    glassSurfaceBlock.includes('-webkit-backdrop-filter: blur(var(--glass-blur));'),
  'coss input-group must compose the shared Weimo frosted GlassSurface material without a gradient background.',
)

assert.ok(
  scrollAreaSource.includes("import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area'") &&
    scrollAreaSource.includes('export function ScrollArea') &&
    scrollAreaSource.includes('BaseScrollArea.Root') &&
    scrollAreaSource.includes('BaseScrollArea.Viewport') &&
    scrollAreaSource.includes('BaseScrollArea.Content') &&
    scrollAreaSource.includes('BaseScrollArea.Scrollbar') &&
    scrollAreaSource.includes('BaseScrollArea.Thumb') &&
    scrollAreaSource.includes('BaseScrollArea.Corner'),
  'coss scroll-area wrapper must compose Base UI Root, Viewport, Content, both Scrollbars, Thumb, and Corner.',
)
assert.ok(
  scrollAreaSource.includes('fill?: boolean') &&
    scrollAreaSource.includes('scrollFade?: boolean') &&
    scrollAreaSource.includes('scrollbarGutter?: boolean') &&
    scrollAreaSource.includes('clampContentMinWidth?: boolean') &&
    scrollAreaSource.includes('data-slot="scroll-area"') &&
    scrollAreaSource.includes('data-slot="scroll-area-viewport"') &&
    scrollAreaSource.includes('data-slot="scroll-area-content"'),
  'coss scroll-area wrapper must expose fill, scrollFade, scrollbarGutter, clampContentMinWidth, and stable slots.',
)
assert.ok(
  scrollAreaCss.includes('.coss-scroll-area') &&
    scrollAreaCss.includes('.coss-scroll-area__viewport') &&
    scrollAreaCss.includes('.coss-scroll-area__content') &&
    scrollAreaCss.includes('.coss-scroll-area__scrollbar') &&
    scrollAreaCss.includes('.coss-scroll-area__thumb') &&
    scrollAreaCss.includes('[data-scroll-fade]') &&
    scrollAreaCss.includes('[data-scrollbar-gutter]') &&
    scrollAreaCss.includes('[data-fill]') &&
    scrollAreaCss.includes('[data-clamp-min-width]'),
  'coss scroll-area CSS must define viewport/content sizing, scrollbars, fade, gutter, fill, and min-width clamp hooks.',
)
assert.ok(
  scrollAreaCss.includes('opacity: 0;') &&
    scrollAreaCss.includes('transition-property: opacity;') &&
    scrollAreaCss.includes('transition-delay: 300ms;') &&
    scrollAreaCss.includes('.coss-scroll-area__scrollbar[data-hovering]') &&
    scrollAreaCss.includes('.coss-scroll-area__scrollbar[data-scrolling]') &&
    scrollAreaCss.includes('opacity: 1;') &&
    scrollAreaCss.includes('transition-duration: 100ms;') &&
    scrollAreaCss.includes('transition-delay: 0ms;'),
  'coss scroll-area scrollbar must follow official coss auto-hide behavior with delayed opacity fade-out and immediate hover/scroll fade-in.',
)

assert.equal(
  packageJson.exports?.['./components/dialog'],
  undefined,
  'internal coss Dialog must not be added as a public package export.',
)
assert.equal(
  packageJson.exports?.['./components/scroll-area'],
  undefined,
  'internal coss ScrollArea must not be added as a public package export.',
)
assert.equal(
  packageJson.exports?.['./components/input-group'],
  undefined,
  'internal coss InputGroup must not be added as a public package export.',
)
assert.ok(
  packageJson.scripts?.test?.includes('scripts/tag-picker-coss-contract.test.mjs'),
  'package.json test script must run tag-picker-coss-contract.test.mjs.',
)
