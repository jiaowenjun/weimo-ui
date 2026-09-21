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
const glassSurfaceRegistry = readJson('registry/glass-surface.json')
const rootGlassSurfaceItem = rootRegistry.items.find(
  (item) => item.name === 'glass-surface',
)
const rootStyleItem = rootRegistry.items.find((item) => item.name === 'style')
const styleRegistry = readJson('registry/style.json')
const componentManifestSource = readProjectFile('src/docs/components-manifest.ts')
const componentDefinitionsIndexSource = readProjectFile(
  'src/docs/component-definitions/index.ts',
)
const glassSurfaceDefinitionSource = readProjectFile(
  'src/docs/component-definitions/glass-surface.tsx',
)
const glassSurfaceSource = readProjectFile('src/components/glass-surface.tsx')
const glassSurfaceModelSource = readProjectFile(
  'src/components/glass-surface-model.ts',
)
const glassSurfaceCss = readProjectFile('src/components/glass-surface.css')
const appCss = readProjectFile('src/App.css')
const tokensCss = readProjectFile('src/styles/tokens.css')
const glassSurfaceModelContractModule = await import(
  `data:text/javascript;base64,${Buffer.from(
    ts.transpileModule(
      glassSurfaceModelSource
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
    glassSurfaceModelContractModule.resolveElementBackgroundTone(surface),
    'dark',
    'GlassSurface must prefer actual image pixels behind the surface over a painted parent background.',
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
    glassSurfaceModelContractModule.resolveElementBackgroundTone(surface),
    'light',
    'GlassSurface must keep searching for image pixels below transparent overlay layers before falling back to ancestor backgrounds.',
  )
}

assert.ok(
  packageJson.scripts?.test?.includes('scripts/glass-surface-contract.test.mjs'),
  'package.json test script must run glass-surface-contract.test.mjs.',
)
assert.equal(
  packageJson.exports?.['./components/glass-surface'],
  './src/components/glass-surface.tsx',
  'GlassSurface must have a public package export.',
)
assert.ok(
  !Object.hasOwn(packageJson.exports ?? {}, './components/smart-glass-surface'),
  'SmartGlassSurface package export must be removed after GlassSurface replaces it.',
)
assert.ok(
  !packageJson.scripts?.test?.includes('scripts/smart-glass-surface-contract.test.mjs'),
  'package.json test script must not run the removed smart-glass-surface contract.',
)
assert.ok(rootGlassSurfaceItem, 'Root registry must include GlassSurface.')
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
  glassSurfaceRegistry,
  rootGlassSurfaceItem,
  'registry/glass-surface.json must match registry.json payload.',
)

for (const snippet of [
  "id: 'glass-surface'",
  "name: 'GlassSurface'",
  "registryName: 'glass-surface'",
  "packageExport: './components/glass-surface'",
  "group: 'surface-material'",
  'docs: true',
  'registry: true',
]) {
  assertIncludes(
    componentManifestSource,
    snippet,
    `GlassSurface manifest entry must include ${snippet}.`,
  )
}

for (const snippet of [
  "import { glassSurfaceDefinition } from './glass-surface'",
  "'glass-surface': glassSurfaceDefinition",
]) {
  assertIncludes(
    componentDefinitionsIndexSource,
    snippet,
    `GlassSurface docs index must include ${snippet}.`,
  )
}

for (const snippet of [
  "import { GlassSurface } from '../../components/glass-surface'",
  "id: 'glass-surface'",
  '运行时读取组件背后的背景亮度',
  'glassSurfacePreviewBackgroundBands',
  'glass-surface-preview__scroll-viewport',
  'glass-surface-preview__scroll-content',
  'glass-surface-preview__band',
  'glass-surface-preview__fixed',
  '<GlassSurface className="glass-surface-preview__tile">',
]) {
  assertIncludes(
    glassSurfaceDefinitionSource,
    snippet,
    `GlassSurface docs definition must include ${snippet}.`,
  )
}

for (const snippet of [
  ".preview-stage[data-component-id='glass-surface']",
  '.glass-surface-preview',
  'position: relative;',
  'width: 100%;',
  'height: min(340px, 70svh);',
  'min-height: 100%;',
  'overflow: hidden;',
  '.glass-surface-preview__scroll-viewport',
  'overflow-y: auto;',
  '.glass-surface-preview__scroll-content',
  'background: linear-gradient(180deg,',
  '.glass-surface-preview__band',
  'position: absolute;',
  '.glass-surface-preview__fixed',
  'position: absolute;',
  'inset: 0;',
  'pointer-events: none;',
  '.glass-surface-preview__tile',
  'pointer-events: auto;',
  '.glass-surface-preview__tile[data-background-tone="light"]',
  '.glass-surface-preview__tile[data-background-tone="dark"]',
]) {
  assertIncludes(appCss, snippet, `GlassSurface preview CSS must include ${snippet}.`)
}
const glassSurfacePreviewStageBlock = cssBlockFor(
  appCss,
  ".preview-stage[data-component-id='glass-surface']",
)
assert.ok(
  glassSurfacePreviewStageBlock.includes('padding: 0;') &&
    glassSurfacePreviewStageBlock.includes('overflow: hidden;'),
  'GlassSurface preview stage must remove padding and clip gradient overflow at the rounded frame.',
)
assertOmits(
  appCss,
  '--preview-stage-padding',
  'GlassSurface preview must fill the stage by removing stage padding, not by padding compensation variables.',
)
assertOmits(
  appCss,
  'calc(0px - var(--preview-stage-padding))',
  'GlassSurface preview must not use negative margins to fill the preview frame.',
)
assertOmits(
  glassSurfaceDefinitionSource,
  'glass-surface-preview__scroll-scene',
  'GlassSurface docs preview must not add a redundant nested scene frame.',
)
assertOmits(
  appCss,
  '.glass-surface-preview__scroll-scene',
  'GlassSurface preview CSS must not keep the redundant nested scene frame.',
)
const scrollViewportIndex = glassSurfaceDefinitionSource.indexOf(
  'className="glass-surface-preview__scroll-viewport"',
)
const scrollContentIndex = glassSurfaceDefinitionSource.indexOf(
  'className="glass-surface-preview__scroll-content"',
)
const fixedOverlayIndex = glassSurfaceDefinitionSource.indexOf(
  'className="glass-surface-preview__fixed"',
)
const tileIndex = glassSurfaceDefinitionSource.indexOf(
  '<GlassSurface className="glass-surface-preview__tile">',
)
assert.ok(
  scrollViewportIndex > -1 &&
    scrollContentIndex > scrollViewportIndex &&
    fixedOverlayIndex > scrollContentIndex &&
    tileIndex > fixedOverlayIndex,
  'GlassSurface preview tile must be a fixed overlay sibling after the scroll content.',
)
assert.ok(
  !glassSurfaceDefinitionSource.includes('glass-surface-preview__sticky'),
  'GlassSurface preview must not keep the tile inside sticky scroll content.',
)

for (const snippet of [
  "import type { ComponentPropsWithoutRef, RefObject } from 'react'",
  "import { useCallback, useEffect, useLayoutEffect, useState } from 'react'",
  "from './glass-surface-model'",
  "import './glass-surface.css'",
  'export type GlassSurfaceProps',
  'export function useGlassSurfaceBackgroundTone',
  'export function useGlassSurfaceBackgroundToneRef',
  'export function GlassSurface',
  'observe = true',
  'const [element, setElement] = useState<ElementType | null>(null)',
  'const setElementRef = useCallback((nextElement: ElementType | null) => {',
  'useGlassSurfaceBackgroundToneForElement(element, observe)',
  'return { backgroundTone, setElementRef }',
  'useGlassSurfaceBackgroundToneRef<HTMLDivElement>(observe)',
  'data-background-tone={backgroundTone ?? undefined}',
  "className={getGlassSurfaceClassName(className)}",
  'ref={setElementRef}',
  'resolveElementBackgroundTone(element)',
  'getGlassSurfaceScrollParents(element)',
  'scrollParents.forEach((scrollParent) => {',
  'ResizeObserver',
  'MutationObserver',
]) {
  assertIncludes(
    glassSurfaceSource,
    snippet,
    `GlassSurface source must include ${snippet}.`,
  )
}
assert.ok(
  !glassSurfaceSource.includes('const element = elementRef.current') ||
    glassSurfaceSource.indexOf('const element = elementRef.current') <
      glassSurfaceSource.indexOf('useGlassSurfaceBackgroundToneForElement'),
  'GlassSurface must move the observing effect behind an element-state hook so callback refs can resample after delayed mounts.',
)
for (const removedSnippet of [
  "import type { SmartGlassSurfaceProps } from './smart-glass-surface'",
  "from './smart-glass-surface'",
  "import './smart-glass-surface.css'",
]) {
  assertOmits(
    glassSurfaceSource,
    removedSnippet,
    `GlassSurface source must not include removed ${removedSnippet}.`,
  )
}

for (const snippet of [
  "import type { ClassValue } from 'clsx'",
  "import { cn } from './lib/utils'",
  'export type GlassSurfaceBackgroundTone',
  "export function getGlassSurfaceClassName(...className: ClassValue[])",
  "return cn('glass-surface', className)",
  'export function resolveElementBackgroundTone',
  'export function getReadableToneForColor',
  'export function relativeLuminanceForRgb',
  'export function parseCssColor',
  'elementsFromPoint',
  'backgroundImage',
]) {
  assertIncludes(
    glassSurfaceModelSource,
    snippet,
    `GlassSurface model source must include ${snippet}.`,
  )
}
assertOmits(
  glassSurfaceModelSource,
  'smart-glass-surface-model',
  'GlassSurface model must not import the removed SmartGlassSurface model.',
)

for (const snippet of [
  '.glass-surface {',
  '@property --glass-surface-fg-opacity',
  '--glass-surface-muted-color: var(--glass-surface-muted-fg);',
  '--glass-surface-hover-bg: color-mix(in srgb, currentColor 12%, transparent);',
  'border: 1px solid var(--glass-surface-border);',
  'backdrop-filter: blur(var(--glass-blur));',
  '-webkit-backdrop-filter: blur(var(--glass-blur));',
  'color: var(--glass-surface-fg);',
  '.glass-surface[data-background-tone="light"]',
  '--glass-surface-fg: var(--glass-surface-fg-on-light);',
  '--glass-surface-muted-color: var(--glass-surface-muted-fg-on-light);',
  '--glass-surface-border: var(--glass-surface-border-on-light);',
  '.glass-surface[data-background-tone="dark"]',
  '--glass-surface-fg: var(--glass-surface-fg-on-dark);',
  '--glass-surface-muted-color: var(--glass-surface-muted-fg-on-dark);',
  '--glass-surface-border: var(--glass-surface-border-on-dark);',
]) {
  assertIncludes(glassSurfaceCss, snippet, `GlassSurface CSS must include ${snippet}.`)
}
assertOmits(
  glassSurfaceCss,
  'border: 1px solid var(--color-border);',
  'GlassSurface border must use its adaptive border token instead of the global theme border.',
)
assertOmits(
  glassSurfaceCss,
  '--smart-glass-surface',
  'GlassSurface CSS must not consume removed SmartGlassSurface CSS variables.',
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
  getRegistryFiles(rootGlassSurfaceItem),
  [
    'src/components/glass-surface.tsx',
    'src/components/glass-surface-model.ts',
    'src/components/glass-surface.css',
  ],
  'GlassSurface registry item must ship only its own files.',
)

function getRegistryFiles(item) {
  assert.ok(item, 'Registry item must exist.')

  return item.files.map((file) => file.path)
}
