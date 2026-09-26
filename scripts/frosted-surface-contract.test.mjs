import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = fileURLToPath(new URL('..', import.meta.url))

function readProjectFile(relativePath) {
  const absolutePath = join(root, relativePath)

  assert.ok(existsSync(absolutePath), `${relativePath} must exist.`)

  return readFileSync(absolutePath, 'utf8')
}

function readJson(relativePath) {
  return JSON.parse(readProjectFile(relativePath))
}

function assertIncludes(source, snippet, message) {
  assert.ok(source.includes(snippet), message)
}

function assertOmits(source, snippet, message) {
  assert.ok(!source.includes(snippet), message)
}

function cssBlockFor(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))

  assert.ok(match, `${selector} block must exist.`)

  return match[1]
}

const packageJson = readJson('package.json')
const rootRegistry = readJson('registry.json')
const frostedSurfaceRegistry = readJson('registry/frosted-surface.json')
const rootFrostedSurfaceItem = rootRegistry.items.find(
  (item) => item.name === 'frosted-surface',
)
const rootStyleItem = rootRegistry.items.find((item) => item.name === 'style')
const styleRegistry = readJson('registry/style.json')
const componentManifestSource = readProjectFile('src/docs/components-manifest.ts')
const componentDefinitionsIndexSource = readProjectFile(
  'src/docs/component-definitions/index.ts',
)
const frostedSurfaceDefinitionSource = readProjectFile(
  'src/docs/component-definitions/surface.tsx',
)
const frostedSurfaceSource = readProjectFile('src/components/frosted-surface.tsx')
const frostedSurfaceModelSource = readProjectFile(
  'src/components/frosted-surface-model.ts',
)
const frostedSurfaceCss = readProjectFile('src/components/frosted-surface.css')
const sliderCss = readProjectFile('src/components/slider.css')
const appCss = readProjectFile('src/App.css')
const tokensCss = readProjectFile('src/styles/tokens.css')
const frostedSurfaceModelContractModule = await import(
  `data:text/javascript;base64,${Buffer.from(
    ts.transpileModule(
      frostedSurfaceModelSource
        .replace("import type { ClassValue } from 'clsx'\n\n", 'type ClassValue = unknown\n\n')
        .replace(
          "import { cn } from './lib/utils'\n\n",
          "function cn(...className) { return className.filter(Boolean).join(' ') }\n\n",
        ),
      {
        compilerOptions: {
          module: ts.ModuleKind.ES2022,
          target: ts.ScriptTarget.ES2022,
        },
      },
    ).outputText,
  ).toString('base64')}`
)

class ContractElement {
  parentElement = null

  constructor(ownerDocument, rect, computedStyle = {}) {
    this.ownerDocument = ownerDocument
    this.rect = rect
    this.computedStyle = computedStyle
    this.children = new Set()
  }

  appendChild(child) {
    child.parentElement = this
    this.children.add(child)
  }

  contains(candidate) {
    if (this.children.has(candidate)) return true

    return Array.from(this.children).some((child) => child.contains(candidate))
  }

  getBoundingClientRect() {
    return this.rect
  }
}

class ContractHtmlElement extends ContractElement {}

class ContractImageElement extends ContractHtmlElement {
  complete = true
  naturalWidth = 4
  naturalHeight = 4

  constructor(ownerDocument, rect, pixelColor = [8, 10, 12, 255]) {
    super(ownerDocument, rect)
    this.pixelColor = pixelColor
  }

  pixelAt() {
    return this.pixelColor
  }
}

class ContractCanvasElement extends ContractHtmlElement {
  width = 0
  height = 0

  constructor(ownerDocument) {
    super(ownerDocument, contractRect(0, 0, 1, 1))
    this.context = new ContractCanvasRenderingContext2D()
  }

  getContext(type) {
    return type === '2d' ? this.context : null
  }
}

class ContractCanvasRenderingContext2D {
  clearRect() {}

  drawImage(image, sourceX, sourceY) {
    this.image = image
    this.sourceX = sourceX
    this.sourceY = sourceY
  }

  getImageData() {
    assert.ok(this.image, 'Contract canvas must receive an image before pixel read.')

    return {
      data: new Uint8ClampedArray(
        this.image.pixelAt(Math.floor(this.sourceX), Math.floor(this.sourceY)),
      ),
    }
  }
}

function contractRect(left, top, width, height) {
  return {
    bottom: top + height,
    height,
    left,
    right: left + width,
    top,
    width,
  }
}

{
  let elementsAtPoint = []
  let ownerWindow
  const ownerDocument = {
    createElement: (tagName) =>
      tagName === 'canvas' ? new ContractCanvasElement(ownerDocument) : null,
    defaultView: null,
    elementsFromPoint: () => elementsAtPoint,
  }

  ownerWindow = {
    Element: ContractElement,
    HTMLCanvasElement: ContractCanvasElement,
    HTMLImageElement: ContractImageElement,
    getComputedStyle: (element) => ({
      backgroundColor: 'rgba(0, 0, 0, 0)',
      backgroundImage: 'none',
      objectFit: 'fill',
      objectPosition: '50% 50%',
      ...element.computedStyle,
    }),
  }
  ownerDocument.defaultView = ownerWindow

  const surface = new ContractHtmlElement(ownerDocument, contractRect(40, 40, 20, 20))
  const image = new ContractImageElement(ownerDocument, contractRect(0, 0, 100, 100))
  const page = new ContractHtmlElement(ownerDocument, contractRect(0, 0, 100, 100), {
    backgroundColor: 'rgb(255, 255, 255)',
  })
  page.appendChild(image)
  page.appendChild(surface)
  elementsAtPoint = [surface, image, page]

  assert.equal(
    frostedSurfaceModelContractModule.resolveElementBackgroundTone(surface),
    'dark',
    'FrostedSurface must prefer actual image pixels behind the surface over a painted parent background.',
  )
}

{
  let elementsAtPoint = []
  let ownerWindow
  const ownerDocument = {
    createElement: (tagName) =>
      tagName === 'canvas' ? new ContractCanvasElement(ownerDocument) : null,
    defaultView: null,
    elementsFromPoint: () => elementsAtPoint,
  }

  ownerWindow = {
    Element: ContractElement,
    HTMLCanvasElement: ContractCanvasElement,
    HTMLImageElement: ContractImageElement,
    getComputedStyle: (element) => ({
      backgroundColor: 'rgba(0, 0, 0, 0)',
      backgroundImage: 'none',
      objectFit: 'fill',
      objectPosition: '50% 50%',
      ...element.computedStyle,
    }),
  }
  ownerDocument.defaultView = ownerWindow

  const surface = new ContractHtmlElement(ownerDocument, contractRect(80, 20, 20, 20))
  const actionLayer = new ContractHtmlElement(ownerDocument, contractRect(70, 10, 40, 40))
  const image = new ContractImageElement(
    ownerDocument,
    contractRect(0, 0, 120, 80),
    [246, 248, 250, 255],
  )
  const uploader = new ContractHtmlElement(ownerDocument, contractRect(0, 0, 120, 100), {
    backgroundColor: 'rgb(16, 16, 16)',
  })
  uploader.appendChild(image)
  uploader.appendChild(actionLayer)
  actionLayer.appendChild(surface)
  elementsAtPoint = [surface, actionLayer, image, uploader]

  assert.equal(
    frostedSurfaceModelContractModule.resolveElementBackgroundTone(surface),
    'light',
    'FrostedSurface must keep searching for image pixels below transparent overlay layers before falling back to ancestor backgrounds.',
  )
}

assert.ok(
  packageJson.scripts?.test?.includes('scripts/frosted-surface-contract.test.mjs'),
  'package.json test script must run frosted-surface-contract.test.mjs.',
)
assert.equal(
  packageJson.exports?.['./components/frosted-surface'],
  './src/components/frosted-surface.tsx',
  'FrostedSurface must have a public package export.',
)
assert.ok(
  !Object.hasOwn(packageJson.exports ?? {}, './components/smart-glass-surface'),
  'SmartGlassSurface package export must be removed after FrostedSurface replaces it.',
)
assert.ok(
  !packageJson.scripts?.test?.includes('scripts/smart-glass-surface-contract.test.mjs'),
  'package.json test script must not run the removed smart-glass-surface contract.',
)
assert.ok(rootFrostedSurfaceItem, 'Root registry must include FrostedSurface.')
assert.ok(
  !rootRegistry.items.some((item) => item.name === 'smart-glass-surface'),
  'Root registry must remove the standalone SmartGlassSurface item.',
)
assert.ok(
  !existsSync(join(root, 'registry/smart-glass-surface.json')),
  'Removed SmartGlassSurface must not have registry/smart-glass-surface.json.',
)
for (const removedFilePath of [
  'src/components/smart-glass-surface.tsx',
  'src/components/smart-glass-surface-model.ts',
  'src/components/smart-glass-surface.css',
  'src/docs/component-definitions/smart-glass-surface.tsx',
  'scripts/smart-glass-surface-contract.test.mjs',
]) {
  assert.ok(!existsSync(join(root, removedFilePath)), `${removedFilePath} must be removed.`)
}
assert.deepEqual(
  frostedSurfaceRegistry,
  rootFrostedSurfaceItem,
  'registry/frosted-surface.json must match registry.json payload.',
)

for (const snippet of [
  "id: 'frosted-surface'",
  "name: 'FrostedSurface'",
  "registryName: 'frosted-surface'",
  "packageExport: './components/frosted-surface'",
  "group: 'surface-material'",
  'docs: false',
  'registry: true',
]) {
  assertIncludes(
    componentManifestSource,
    snippet,
    `FrostedSurface manifest entry must include ${snippet}.`,
  )
}

for (const snippet of [
  "import { surfaceDefinition } from './surface'",
  'surface: surfaceDefinition',
]) {
  assertIncludes(
    componentDefinitionsIndexSource,
    snippet,
    `FrostedSurface docs index must include ${snippet}.`,
  )
}

for (const removedFilePath of [
  'src/components/coss/slider.tsx',
  'src/components/coss/slider.css',
  'src/docs/gray-slider.tsx',
]) {
  assert.ok(!existsSync(join(root, removedFilePath)), `${removedFilePath} must be removed.`)
}
assertOmits(
  frostedSurfaceDefinitionSource,
  'coss/slider',
  'FrostedSurface docs definition must use the self-built Slider instead of the removed coss Slider.',
)

for (const snippet of [
  "import { FrostedSurface } from '../../components/frosted-surface'",
  "import { ComponentPreviewCard } from '../../components/component-preview-card'",
  "from '../glass-preview-card'",
  "id: 'surface'",
  '静态卡片、亮度自适应磨砂玻璃层、液态玻璃与抬升浮层的材质总览',
  'function FrostedSurfacePreview()',
  'label="磨砂材质"',
  
  '<FrostedSurface bordered className="frosted-surface-preview__tile">',
  "'无边框',",
  "frame: 'plain',",
]) {
  assertIncludes(
    frostedSurfaceDefinitionSource,
    snippet,
    `FrostedSurface docs definition must include ${snippet}.`,
  )
}

assertOmits(
  frostedSurfaceDefinitionSource,
  'canvasClassName',
  'FrostedSurface demo canvas must inherit the GlassPreviewCard default canvas, not a fixed-height custom canvas class.',
)
assertOmits(
  frostedSurfaceDefinitionSource,
  'frosted-surface-preview__fixed',
  'FrostedSurface tile must sit directly in the striped canvas instead of the removed fixed overlay wrapper.',
)

// 滑块 + 主题归位 + 条纹背景的玻璃卡外壳抽到 GlassPreviewCard 共享组件
// （Surface 页磨砂材质卡与按钮页玻璃图标按钮卡共用），契约锁共享组件源。
const glassPreviewCardModuleSource = readProjectFile(
  'src/docs/glass-preview-card.tsx',
)

for (const snippet of [
  'function GlassPreviewCard(',
  "from '../components/component-preview-card'",
  "from './glass-preview'",
  "from '../components/slider'",
  'initialGray ??',
  'onGrayChange?: (gray: number) => void',
  'onGrayChange?.(glassBackgroundGray)',
  'window.matchMedia(\'(prefers-color-scheme: dark)\').matches',
  '? glassBackgroundGrayDark\n      : glassBackgroundGrayLight',
  'const syncThemeEndpoint = () => {',
  'const themeObserver = new MutationObserver(syncThemeEndpoint)',
  'themeObserver.observe(document.documentElement, {',
  'ariaLabel="背景灰度"',
  'min={glassBackgroundGrayDark}',
  'max={glassBackgroundGrayLight}',
  'onValueChange={setGlassBackgroundGray}',
  'className="glass-preview-card__canvas"',
  'style={getGlassPreviewBackground(glassBackgroundGray)}',
  'footer={',
  'glass-preview-card__slider-row',
]) {
  assertIncludes(
    glassPreviewCardModuleSource,
    snippet,
    `GlassPreviewCard shared component must include ${snippet}.`,
  )
}
assert.ok(
  glassPreviewCardModuleSource.includes('footer={') &&
    glassPreviewCardModuleSource.indexOf('footer={') <
      glassPreviewCardModuleSource.indexOf('className="glass-preview-card__canvas"'),
  'GlassPreviewCard slider row must live in the BaseCard footer slot, not inside the striped canvas content.',
)

// 条纹背景机制与自研滑块抽到 docs 共享模块（Surface 页与按钮页玻璃卡共用），契约随之锁共享文件。
const glassPreviewModuleSource = readProjectFile('src/docs/glass-preview.ts')

for (const snippet of [
  "from '../components/bg-color'",
  'parseColorLightness(bgColorToneMap.card.value.dark)?.lightness ?? 12',
  'parseColorLightness(bgColorToneMap.card.value.light)?.lightness ?? 100',
  'export const glassBackgroundGrayMidpoint = (glassBackgroundGrayDark + glassBackgroundGrayLight) / 2',
  'const glassGradientStops',
  'const glassStripeWidth = 48',
  'const glassStripePeriod = glassGradientStops.length * glassStripeWidth',
  'function glassHslToRgb(',
  'function getGlassPreviewBackground(',
  'const colorfulness = progress <= 0 || progress >= 1 ? 0 : Math.sin(Math.PI * progress)',
  'const boundedGray =',
  'colorfulness === 0 ? gray : Math.min(Math.max(gray + spread * colorfulness, 3), 100)',
  'return `rgb(${red}, ${green}, ${blue}) ${index * glassStripeWidth}px ${(index + 1) * glassStripeWidth}px`',
  'backgroundImage: `repeating-linear-gradient(90deg, ${stripes.join(\', \')})`',
  'backgroundPositionX: `${-progress * glassStripePeriod}px`',
]) {
  assertIncludes(
    glassPreviewModuleSource,
    snippet,
    `Glass preview shared module must include ${snippet}.`,
  )
}

const sliderModuleSource = readProjectFile('src/components/slider.tsx')

for (const snippet of [
  'function Slider(',
  'type="range"',
  'className="slider"',
  "style={{ '--fill': fill } as CSSProperties}",
]) {
  assertIncludes(
    sliderModuleSource,
    snippet,
    `Slider component module must include ${snippet}.`,
  )
}
assert.ok(
  !frostedSurfaceDefinitionSource.includes('items=') &&
    !frostedSurfaceDefinitionSource.includes('surface-backdrop'),
  'FrostedSurface docs definition must keep the label title bar without token rows or preview backdrop.',
)
assert.ok(
  !frostedSurfaceDefinitionSource.includes('frostedSurfacePreviewBackgroundBands') &&
    !frostedSurfaceDefinitionSource.includes('frosted-surface-preview__scroll') &&
    !frostedSurfaceDefinitionSource.includes('frosted-surface-preview__band'),
  'FrostedSurface demo background must stay the slider-driven stripe backdrop and must not resurrect the scrollable band scene.',
)

for (const snippet of [
  '.glass-preview-card__canvas {\n  display: grid;\n  min-height: 100%;\n  padding: 16px;\n  place-items: center;\n}',
  '.glass-preview-card__slider-row',
  'justify-content: center;',
  '.frosted-surface-preview__tile',
  'justify-items: center;',
  'text-align: center;',
]) {
  assertIncludes(appCss, snippet, `FrostedSurface preview CSS must include ${snippet}.`)
}
assert.ok(
  !appCss.includes('.glass-preview-card__slider-row {\n  display: flex;\n  justify-content: center;\n  min-height: 0;'),
  'The slider row must not keep the old canvas-rhythm min-height override now that it lives in the BaseCard footer.',
)

assertOmits(
  appCss,
  '.frosted-surface-preview {',
  'FrostedSurface demo canvas block must stay deleted; the demo inherits the shared canvas rhythm.',
)
assertOmits(
  appCss,
  '\n  height: 180px;',
  'FrostedSurface demo canvas must be content-sized, not fixed at 180px.',
)
assertOmits(
  appCss,
  '.frosted-surface-preview__fixed',
  'FrostedSurface fixed overlay wrapper CSS must stay deleted.',
)

for (const snippet of [
  '.slider',
  'width: 140px;',
  '.slider__input',
  'touch-action: none;',
  '.slider__track',
  '.slider__indicator',
  'transition: inline-size 300ms ease-out;',
  '.slider__thumb',
  'transition: inset-inline-start 300ms ease-out;',
  '.slider:active .slider__indicator,',
  '.slider:active .slider__thumb',
  'transition: none;',
  '.slider__input:focus-visible ~ .slider__thumb',
]) {
  assertIncludes(sliderCss, snippet, `Slider component CSS must include ${snippet}.`)
}
assertOmits(
  appCss,
  '.frosted-surface-preview__tile[data-background-tone',
  'FrostedSurface preview tile must not stack tone outlines on top of the 1px component border.',
)
assertOmits(
  appCss,
  ".preview-stage[data-component-id='frosted-surface']",
  'FrostedSurface preview renders inside ComponentPreviewCard and must not keep preview-stage special cases.',
)
assertOmits(
  appCss,
  '.frosted-surface-preview__scroll',
  'FrostedSurface preview CSS must drop the removed scrollable gradient scene.',
)
assert.ok(
  !frostedSurfaceDefinitionSource.includes('frosted-surface-preview__sticky'),
  'FrostedSurface preview must not keep the tile inside sticky scroll content.',
)

for (const snippet of [
  "import type { ComponentPropsWithoutRef, CSSProperties, RefObject } from 'react'",
  "import { useCallback, useEffect, useLayoutEffect, useState } from 'react'",
  "from './frosted-surface-model'",
  "import './frosted-surface.css'",
  'export type FrostedSurfaceProps',
  'export function useFrostedSurfaceBackgroundTone',
  'export function useFrostedSurfaceBackgroundToneRef',
  'export function FrostedSurface',
  'bordered?: boolean',
  'bordered = true',
  'observe = true',
  'const [element, setElement] = useState<ElementType | null>(null)',
  'const setElementRef = useCallback((nextElement: ElementType | null) => {',
  'useFrostedSurfaceBackgroundToneForElement(element, observe)',
  'backgroundLuminance: backgroundSample?.luminance ?? null',
  'backgroundStyle: interpolatedBorderColor',
  "'--glass-surface-border': interpolatedBorderColor",
  'backgroundTone: backgroundSample?.tone ?? null',
  'useFrostedSurfaceBackgroundToneRef<HTMLDivElement>(observe)',
  'data-background-tone={backgroundTone ?? undefined}',
  "bordered ? 'frosted-surface--bordered' : undefined",
  'ref={setElementRef}',
  "style={{ ...style, ...backgroundStyle }}",
  'resolveElementBackgroundSample(element)',
  'getFrostedSurfaceScrollParents(element)',
  'scrollParents.forEach((scrollParent) => {',
  'ResizeObserver',
  'MutationObserver',
]) {
  assertIncludes(
    frostedSurfaceSource,
    snippet,
    `FrostedSurface source must include ${snippet}.`,
  )
}

// 边框亮度插值下沉到 model,是所有磨砂材质的共享行为:持有采样 hook 的组件
// 统一经 backgroundStyle 以 inline 变量下发,直接声明 border-color 的规则
// (如磨砂图标按钮禁用描边)优先级更高不受影响。
for (const [sourcePath, sourceLabel, extraSnippets] of [
  ['src/components/chip-surface.tsx', 'ChipSurface', ['style={{ ...style, ...backgroundStyle }}']],
  ['src/components/chip.tsx', 'Chip', ['...getAnimatedInlineSizeStyle(style, inlineSize), ...backgroundStyle']],
  ['src/components/chip-button.tsx', 'ChipButton', ['...style, ...backgroundStyle']],
  ['src/components/menu.tsx', 'MenuPopup', ['style={{ ...style, ...backgroundStyle }}']],
  ['src/components/tag-bread.tsx', 'TagBread', ['...getAnimatedInlineSizeStyle(style, inlineSize), ...backgroundStyle']],
  ['src/components/frosted-icon-button.tsx', 'FrostedIconButton', ['style={{ ...style, ...backgroundStyle }}']],
  ['src/components/frosted-icon-button-group.tsx', 'FrostedIconButtonGroup', ['style={{ ...style, ...backgroundStyle }}']],
]) {
  const source = readProjectFile(sourcePath)

  for (const snippet of ['backgroundStyle', ...extraSnippets]) {
    assertIncludes(source, snippet, `${sourceLabel} must include ${snippet}.`)
  }
}
assert.ok(
  !frostedSurfaceSource.includes('const element = elementRef.current') ||
    frostedSurfaceSource.indexOf('const element = elementRef.current') <
      frostedSurfaceSource.indexOf('useFrostedSurfaceBackgroundToneForElement'),
  'FrostedSurface must move the observing effect behind an element-state hook so callback refs can resample after delayed mounts.',
)
// Chromium backdrop-filter 快照滞留的自愈抖动:祖先链内联样式变化(灰度滑块)时
// 材质停在旧模糊底色,须在自身写入一次视觉恒等的 translate 强制重采样。
// 只能观察祖先链:抖动写入与 documentElement subtree 采样观察器互相可见会
// 形成 rAF 乒乓循环,故对 backdropObserver 的 observe 显式禁 subtree。
assert.ok(
  frostedSurfaceSource.includes('const backdropObserver =') &&
    frostedSurfaceSource.includes("element.dataset.frostedBackdropNudge === '1'") &&
    frostedSurfaceSource.includes("element.style.translate = nudged ? '' : '0 0.001px'") &&
    frostedSurfaceSource.includes('backdropObserver.observe(ancestor, {'),
  'Frosted surfaces must nudge their own translate on ancestor style mutations so Chromium backdrop-filter snapshots track slider-driven inline background changes.',
)
assert.ok(
  !/backdropObserver\.observe\([^)]*subtree/.test(frostedSurfaceSource),
  'The backdrop nudge observer must watch the ancestor chain only; subtree observation would ping-pong with its own writes.',
)
for (const removedSnippet of [
  "import type { SmartGlassSurfaceProps } from './smart-glass-surface'",
  "from './smart-glass-surface'",
  "import './smart-glass-surface.css'",
]) {
  assertOmits(
    frostedSurfaceSource,
    removedSnippet,
    `FrostedSurface source must not include removed ${removedSnippet}.`,
  )
}

for (const snippet of [
  "import type { ClassValue } from 'clsx'",
  "import { cn } from './lib/utils'",
  'export type FrostedSurfaceBackgroundTone',
  'export type FrostedSurfaceBackgroundSample',
  "export function getFrostedSurfaceClassName(...className: ClassValue[])",
  "return cn('frosted-surface', className)",
  'export function resolveElementBackgroundSample',
  'export function resolveElementBackgroundTone',
  'return resolveElementBackgroundSample(element)?.tone ?? null',
  'export function interpolateFrostedBorderColor',
  'const BORDER_ANCHOR_ON_DARK_LIGHTNESS = 20',
  'const BORDER_ANCHOR_ON_LIGHT_LIGHTNESS = 90',
  'const BORDER_FOREGROUND_DARK_LIGHTNESS = 98',
  'const BORDER_FOREGROUND_LIGHT_LIGHTNESS = 9',
  '[BORDER_ANCHOR_ON_DARK_LIGHTNESS, BORDER_FOREGROUND_DARK_LIGHTNESS, progress / 0.5]',
  '[\n          BORDER_FOREGROUND_LIGHT_LIGHTNESS,\n          BORDER_ANCHOR_ON_LIGHT_LIGHTNESS,\n          (progress - 0.5) / 0.5,\n        ]',
  'export function getReadableToneForColor',
  'export function relativeLuminanceForRgb',
  'export function parseCssColor',
  'elementsFromPoint',
  'backgroundImage',
]) {
  assertIncludes(
    frostedSurfaceModelSource,
    snippet,
    `FrostedSurface model source must include ${snippet}.`,
  )
}
assertOmits(
  frostedSurfaceModelSource,
  'smart-glass-surface-model',
  'FrostedSurface model must not import the removed SmartGlassSurface model.',
)

for (const snippet of [
  '.frosted-surface {',
  '@property --glass-surface-fg-opacity',
  '--glass-surface-muted-color: var(--glass-surface-muted-fg);',
  '--glass-surface-hover-bg: color-mix(in srgb, currentColor 12%, transparent);',
  'border: 1px solid transparent;',
  'backdrop-filter: blur(var(--glass-blur));',
  '-webkit-backdrop-filter: blur(var(--glass-blur));',
  'color: var(--glass-surface-fg);',
  'transition: color 160ms ease, border-color 160ms ease;',
  '.frosted-surface--bordered {',
  'border-color: var(--glass-surface-border);',
  '.frosted-surface[data-background-tone="light"]',
  '--glass-surface-fg: var(--glass-surface-fg-on-light);',
  '--glass-surface-muted-color: var(--glass-surface-muted-fg-on-light);',
  '--glass-surface-border: var(--glass-surface-border-on-light);',
  '.frosted-surface[data-background-tone="dark"]',
  '--glass-surface-fg: var(--glass-surface-fg-on-dark);',
  '--glass-surface-muted-color: var(--glass-surface-muted-fg-on-dark);',
  '--glass-surface-border: var(--glass-surface-border-on-dark);',
]) {
  assertIncludes(frostedSurfaceCss, snippet, `FrostedSurface CSS must include ${snippet}.`)
}
assertOmits(
  frostedSurfaceCss,
  'border: 1px solid var(--color-border);',
  'FrostedSurface border must use its adaptive border token instead of the global theme border.',
)
for (const removedBorderReset of ['border: none', 'border: 0', 'border-width: 0']) {
  assertOmits(
    frostedSurfaceCss,
    removedBorderReset,
    `FrostedSurface borderless variant must keep the 1px transparent border geometry instead of ${removedBorderReset}.`,
  )
}
assertOmits(
  frostedSurfaceCss,
  '--smart-glass-surface',
  'FrostedSurface CSS must not consume removed SmartGlassSurface CSS variables.',
)

for (const [tokenName, lightValue, darkValue] of [
  ['glass-surface-border', 'hsl(0 0% 80%)', 'hsl(0 0% 38%)'],
  ['glass-surface-border-on-light', 'hsl(0 0% 80%)'],
  ['glass-surface-border-on-dark', 'hsl(0 0% 38%)'],
  ['glass-surface-fg', 'hsl(222.2 47.4% 11.2% / 0.9)', 'hsl(0 0% 79.2%)'],
  ['glass-surface-muted-fg', 'hsl(215.3 25% 26.7% / 0.68)', 'hsl(0 0% 100% / 0.68)'],
  ['glass-surface-fg-on-light', 'hsl(222.2 47.4% 11.2% / 0.9)'],
  ['glass-surface-muted-fg-on-light', 'hsl(215.3 25% 26.7% / 0.68)'],
  ['glass-surface-fg-on-dark', 'hsl(0 0% 100% / 0.9)'],
  ['glass-surface-muted-fg-on-dark', 'hsl(0 0% 100% / 0.72)'],
].map(([tokenName, lightValue, darkValue = lightValue]) => [tokenName, lightValue, darkValue])) {
  assertIncludes(
    tokensCss,
    `--${tokenName}: ${lightValue};`,
    `tokens.css must define --${tokenName}.`,
  )
  assert.equal(
    styleRegistry.cssVars.light[tokenName],
    lightValue,
    `registry/style.json must mirror light ${tokenName}.`,
  )
  assert.equal(
    styleRegistry.cssVars.dark[tokenName],
    darkValue,
    `registry/style.json must mirror dark ${tokenName}.`,
  )
  assert.equal(
    rootStyleItem.cssVars.light[tokenName],
    lightValue,
    `registry.json style item must mirror light ${tokenName}.`,
  )
  assert.equal(
    rootStyleItem.cssVars.dark[tokenName],
    darkValue,
    `registry.json style item must mirror dark ${tokenName}.`,
  )
}
for (const removedTokenName of ['smart-glass-surface-fg', 'smart-glass-surface-muted-fg']) {
  assertOmits(tokensCss, `--${removedTokenName}:`, `tokens.css must remove --${removedTokenName}.`)
  assert.equal(
    styleRegistry.cssVars.light[removedTokenName],
    undefined,
    `registry/style.json must remove light ${removedTokenName}.`,
  )
  assert.equal(
    styleRegistry.cssVars.dark[removedTokenName],
    undefined,
    `registry/style.json must remove dark ${removedTokenName}.`,
  )
  assert.equal(
    rootStyleItem.cssVars.light[removedTokenName],
    undefined,
    `registry.json style item must remove light ${removedTokenName}.`,
  )
  assert.equal(
    rootStyleItem.cssVars.dark[removedTokenName],
    undefined,
    `registry.json style item must remove dark ${removedTokenName}.`,
  )
}

assert.deepEqual(
  getRegistryFiles(rootFrostedSurfaceItem),
  [
    'src/components/frosted-surface.tsx',
    'src/components/frosted-surface-model.ts',
    'src/components/frosted-surface.css',
  ],
  'FrostedSurface registry item must ship only its own files.',
)

function getRegistryFiles(item) {
  assert.ok(item, 'Registry item must exist.')

  return item.files.map((file) => file.path)
}
