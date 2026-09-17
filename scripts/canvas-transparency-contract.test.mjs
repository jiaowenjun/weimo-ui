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

const source = readProjectFile('src/components/canvas-transparency.tsx')
const cacheSource = readProjectFile('src/components/canvas-transparency-cache.ts')
const modelSource = readProjectFile('src/components/canvas-transparency-model.ts')
const docsDefinition = readProjectFile(
  'src/docs/component-definitions/canvas-transparency.tsx',
)
const definitionsIndex = readProjectFile('src/docs/component-definitions/index.ts')
const manifest = readProjectFile('src/docs/components-manifest.ts')
const packageJson = readJson('package.json')
const rootRegistry = readJson('registry.json')
const standaloneRegistry = readJson('registry/canvas-transparency.json')
const registryItem = rootRegistry.items.find(
  (item) => item.name === 'canvas-transparency',
)

assert.equal(
  packageJson.exports?.['./components/canvas-transparency'],
  './src/components/canvas-transparency.tsx',
  'package.json must export CanvasTransparency.',
)
assert.equal(
  packageJson.exports?.['./components/canvas-transparency-cache'],
  './src/components/canvas-transparency-cache.ts',
  'package.json must expose CanvasTransparency cache controls separately from the React component.',
)
assert.ok(
  packageJson.scripts?.test?.includes(
    'scripts/canvas-transparency-contract.test.mjs',
  ),
  'package.json test script must run canvas-transparency-contract.test.mjs.',
)
assert.ok(
  manifest.includes("id: 'canvas-transparency'") &&
    manifest.includes("name: 'CanvasTransparency'") &&
    manifest.includes("registryName: 'canvas-transparency'") &&
    manifest.includes("packageExport: './components/canvas-transparency'") &&
    manifest.includes("group: 'media-ocr'"),
  'Component manifest must list CanvasTransparency in the media-ocr group.',
)
assert.ok(
  definitionsIndex.includes(
    "import { canvasTransparencyDefinition } from './canvas-transparency'",
  ) &&
    definitionsIndex.includes(
      "'canvas-transparency': canvasTransparencyDefinition",
    ),
  'CanvasTransparency docs definition must be wired into the definitions index.',
)

for (const snippet of [
  "import { useEffect, useLayoutEffect, useRef, useState } from 'react'",
  "import type { ComponentPropsWithoutRef } from 'react'",
  'acquireCachedCanvasTransparencyAssets,',
  'acquireCanvasTransparencyAssets,',
  'DEFAULT_CANVAS_TRANSPARENCY_OPTIONS,',
  'peekCachedCanvasTransparencyAssets,',
  "type CanvasTransparencyTone = 'light' | 'dark'",
  'export type CanvasTransparencyAsset = CachedCanvasTransparencyAsset',
  'export type CanvasTransparencyState =',
  "| { status: 'loading' }",
  "| { status: 'ready'; asset: CanvasTransparencyAsset; background: CanvasTransparencyRgbColor }",
  "| { status: 'error'; error: Error }",
  "export type CanvasTransparencyProps = Omit<ComponentPropsWithoutRef<'img'>, 'src' | 'alt'> & {",
  'src: string',
  'alt: string',
  'tolerance?: number',
  'feather?: number',
  'onStateChange?: (state: CanvasTransparencyState) => void',
  'export function CanvasTransparency({',
  'tolerance = DEFAULT_CANVAS_TRANSPARENCY_OPTIONS.tolerance,',
  'feather = DEFAULT_CANVAS_TRANSPARENCY_OPTIONS.feather,',
  'acquireCanvasTransparencyAssets(src, { tolerance, feather })',
  'lease.release()',
  'const imageRef = useRef<HTMLImageElement | null>(null)',
  'const [tone, setTone] = useState<CanvasTransparencyTone | null>(null)',
  'window.getComputedStyle(element).colorScheme',
  "window.matchMedia('(prefers-color-scheme: dark)')",
  'const observer = new MutationObserver(syncTone)',
  'observer.observe(document.documentElement, {',
  "attributeFilter: ['class', 'style', 'data-theme', 'data-image-theme']",
  'subtree: true',
  'observer.disconnect()',
  'const selectedTone = tone ??',
  'const selectedAsset = currentState.assets[selectedTone]',
  "if (currentState.status !== 'ready') return null",
  '<img',
  'ref={imageRef}',
  'alt={alt}',
  'height={imageProps.height ?? selectedAsset.height}',
  'src={selectedAsset.url}',
  'width={imageProps.width ?? selectedAsset.width}',
]) {
  assert.ok(source.includes(snippet), `CanvasTransparency source must include ${snippet}.`)
}
for (const helperName of [
  'peekCachedCanvasTransparencyAssets',
  'acquireCachedCanvasTransparencyAssets',
]) {
  assert.match(
    source,
    new RegExp(`${helperName}\\(src, \\{\\s*tolerance,\\s*feather,?\\s*\\}\\)`, 'u'),
    `CanvasTransparency must call ${helperName} with the complete processing key.`,
  )
}

assert.match(
  source,
  /<img\s+\{\.\.\.imageProps\}[\s\S]*?height=\{imageProps\.height \?\? selectedAsset\.height\}[\s\S]*?width=\{imageProps\.width \?\? selectedAsset\.width\}[\s\S]*?\/>/u,
  'Cached image dimensions must be applied after imageProps so missing caller dimensions cannot erase the fallback.',
)

assert.ok(
  /useLayoutEffect\(\(\) => \{[\s\S]*?acquireCanvasTransparencyAssets\(src, \{ tolerance, feather \}\)[\s\S]*?\}, \[feather, requestKey, src, tolerance\]\)/.test(
    source,
  ),
  'Canvas decoded asset acquisition must depend on the source and processing parameters, not tone.',
)
assert.ok(
  cacheSource.includes('new Map<string, CanvasTransparencyResult>()') &&
    cacheSource.includes('new Map<string, Promise<CanvasTransparencyResult>>()') &&
    cacheSource.includes('createCanvasTransparencyAssetCache') &&
    cacheSource.includes('peekCachedCanvasTransparencyAssets') &&
    cacheSource.includes('acquireCachedCanvasTransparencyAssets'),
  'CanvasTransparency must keep processed results and synchronously reusable decoded assets.',
)
for (const snippet of [
  'export type CachedCanvasTransparencyAsset = {',
  'blob: Blob',
  'url: string',
  'width: number',
  'height: number',
]) {
  assert.ok(
    cacheSource.includes(snippet),
    `Canvas transparency asset cache must preserve the public image metadata: ${snippet}`,
  )
}
assert.ok(
  !source.includes('URL.createObjectURL') && !source.includes('URL.revokeObjectURL'),
  'CanvasTransparency instances must lease cache-owned URLs instead of recreating them per mount.',
)
assert.ok(
  !source.includes('export type CanvasTransparencyTone') &&
    !source.includes('tone?: CanvasTransparencyTone') &&
    !source.includes("tone = 'light',"),
  'CanvasTransparency must determine tone internally instead of exposing a tone prop.',
)
assert.ok(
  source.includes("if (document.documentElement.classList.contains('dark')) return 'dark'") &&
    source.includes("return 'light'") &&
    !source.includes("return window.matchMedia('(prefers-color-scheme: dark)').matches"),
  'Explicit light mode must win over a dark OS preference when the root has no dark class.',
)

for (const snippet of [
  'export type CanvasTransparencyRgbColor = readonly [',
  'export function resolveCanvasTransparencyAlpha(',
  'export function estimateCanvasTransparencyBackground(',
  'export function makeCanvasBackgroundTransparent(',
  'export function makeCanvasDarkForeground(',
  'export async function processCanvasTransparency(',
  'const [lightBlob, darkBlob] = await Promise.all([',
  "imageDataToBlob(lightImageData, 'image/png')",
  "imageDataToBlob(darkImageData, 'image/png')",
]) {
  assert.ok(modelSource.includes(snippet), `Canvas transparency model must include ${snippet}.`)
}

assert.ok(
  docsDefinition.includes("id: 'canvas-transparency'") &&
    docsDefinition.includes('<CanvasTransparency') &&
    docsDefinition.includes('最多缓存 32 组处理结果') &&
    !docsDefinition.includes("name: 'tone'") &&
    !docsDefinition.includes('tone=') &&
    docsDefinition.includes("status: 'Ready'"),
  'CanvasTransparency detail docs must rely on automatic theme detection.',
)

assert.ok(registryItem, 'Root registry must include @weimo/canvas-transparency.')
assert.deepEqual(
  registryItem,
  standaloneRegistry,
  'Root and standalone CanvasTransparency registry items must match.',
)
assert.ok(
  !registryItem.dependencies || registryItem.dependencies.length === 0,
  'CanvasTransparency must not add external runtime dependencies.',
)
assert.deepEqual(
  registryItem.registryDependencies,
  ['@weimo/style'],
  'CanvasTransparency must install only the shared style registry item.',
)
assert.deepEqual(
  registryItem.files.map((file) => file.path),
  [
    'src/components/canvas-transparency.tsx',
    'src/components/canvas-transparency-cache.ts',
    'src/components/canvas-transparency-model.ts',
  ],
  'CanvasTransparency registry item must ship the component, result cache, and processing model.',
)

const {
  estimateCanvasTransparencyBackground,
  makeCanvasBackgroundTransparent,
  makeCanvasDarkForeground,
  resolveCanvasTransparencyAlpha,
} = await import('../src/components/canvas-transparency-model.ts')

assert.equal(
  resolveCanvasTransparencyAlpha([255, 255, 255], [255, 255, 255], 16, 32),
  0,
  'pixels matching the sampled background must become transparent.',
)
assert.equal(
  resolveCanvasTransparencyAlpha([0, 0, 0], [255, 255, 255], 16, 32),
  255,
  'dark drawing strokes must stay opaque.',
)
assert.ok(
  resolveCanvasTransparencyAlpha([225, 225, 225], [255, 255, 255], 16, 48) > 0 &&
    resolveCanvasTransparencyAlpha([225, 225, 225], [255, 255, 255], 16, 48) < 255,
  'edge pixels inside the feather range must keep partial alpha.',
)

const samplePixels = new Uint8ClampedArray([
  250, 248, 240, 255, 250, 248, 240, 255, 250, 248, 240, 255,
  250, 248, 240, 255,   0,   0,   0, 255, 250, 248, 240, 255,
  250, 248, 240, 255, 250, 248, 240, 255, 250, 248, 240, 255,
])

assert.deepEqual(
  estimateCanvasTransparencyBackground(samplePixels, 3, 3, 1),
  [250, 248, 240],
  'background sampling must average the image corners.',
)

const transparentPixels = makeCanvasBackgroundTransparent(samplePixels, 3, 3, {
  tolerance: 12,
  feather: 24,
  sampleSize: 1,
})

for (const pixelIndex of [0, 1, 2, 3, 5, 6, 7, 8]) {
  assert.equal(
    transparentPixels[pixelIndex * 4 + 3],
    0,
    `background pixel ${pixelIndex} must become transparent.`,
  )
}
assert.equal(
  transparentPixels[4 * 4 + 3],
  255,
  'the black center stroke must remain opaque.',
)
assert.notEqual(
  transparentPixels,
  samplePixels,
  'processing must return a new buffer without mutating source pixels.',
)

const antialiasedStrokePixels = new Uint8ClampedArray([
  255, 255, 255, 255,
  224, 224, 224, 255,
    0,   0,   0, 255,
])
const darkForegroundPixels = makeCanvasDarkForeground(
  antialiasedStrokePixels,
  3,
  1,
  {
    background: [255, 255, 255],
    foreground: [245, 247, 246],
    tolerance: 16,
  },
)

assert.equal(
  darkForegroundPixels[3],
  0,
  'the dark-background variant must remove the sampled background.',
)
assert.ok(
  darkForegroundPixels[7] > 0 && darkForegroundPixels[7] < 255,
  'antialiased dark-theme edges must keep partial alpha.',
)
assert.deepEqual(
  Array.from(darkForegroundPixels.slice(4, 7)),
  [245, 247, 246],
  'dark-theme edges must use one light foreground color.',
)
assert.deepEqual(
  Array.from(darkForegroundPixels.slice(8, 12)),
  [245, 247, 246, 255],
  'solid strokes must become opaque light strokes for dark backgrounds.',
)

console.log('canvas transparency contract passed')
