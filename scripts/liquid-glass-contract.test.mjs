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

const componentSource = readProjectFile('src/components/liquid-glass.tsx')
const definitionSource = readProjectFile('src/docs/component-definitions/surface.tsx')
const manifestSource = readProjectFile('src/docs/components-manifest.ts')
const appCss = readProjectFile('src/App.css')
const glassSurfaceSource = readProjectFile('src/components/glass-surface.tsx')
const registryItem = JSON.parse(readProjectFile('registry/liquid-glass.json'))
const packageJson = JSON.parse(readProjectFile('package.json'))

assert.ok(
  componentSource.includes("import LiquidGlass from 'liquid-glass-react'"),
  'liquid-glass.tsx must adapt the liquid-glass-react default export.',
)
assert.ok(
  componentSource.includes('export function LiquidGlassSurface'),
  'liquid-glass.tsx must export LiquidGlassSurface.',
)
assert.ok(
  componentSource.includes(
    "style={{ left: '50%', position: 'absolute', top: '50%', width: 'max-content', ...style }}",
  ),
  'LiquidGlassSurface must pin the layered glass output to the center of a relative container at max-content width.',
)
assert.ok(
  componentSource.includes('useLiquidGlassBackdropResample') &&
    componentSource.includes('MutationObserver') &&
    componentSource.includes("root.style.translate = nudged ? '' : '0 0.001px'") &&
    componentSource.includes('dataset.liquidGlassResample') &&
    componentSource.includes('root.parentElement'),
  'LiquidGlassSurface must resample its backdrop when the host background mutates (ancestor MutationObserver + alternating identity translate nudge).',
)
assert.ok(
  !componentSource.includes('subtree: true') &&
    !componentSource.includes('observer.observe(ownerDocument.documentElement'),
  'LiquidGlassSurface must only observe ancestor attributes; subtree-wide observation would echo its own nudges (and sibling glass instances) into an infinite synchronous resample loop.',
)
assert.ok(
  componentSource.includes('observe = true'),
  'LiquidGlassSurface must observe host backdrop changes by default.',
)
assert.ok(
  componentSource.includes('overLight') &&
    componentSource.includes('displacementScale') &&
    componentSource.includes('cornerRadius') &&
    componentSource.includes('padding'),
  'LiquidGlassSurface must keep forwarding the material effect parameters.',
)

// 两种玻璃材质保持独立:液态玻璃不并入普通玻璃的实现,普通玻璃不依赖液态玻璃。
assert.ok(
  !componentSource.includes('glass-surface'),
  'LiquidGlassSurface must stay independent from the plain GlassSurface material.',
)
assert.ok(
  !glassSurfaceSource.includes('liquid'),
  'The plain GlassSurface material must not depend on liquid glass.',
)

for (const snippet of [
  '<GlassPreviewCard',
  'label="液态玻璃材质"',
  '<LiquidGlassSurface',
  "from '../../components/liquid-glass'",
  "import { GlassSurface, useGlassSurfaceBackgroundToneRef } from '../../components/glass-surface'",
  'data-background-tone={backgroundTone ?? undefined}',
]) {
  assert.ok(
    definitionSource.includes(snippet),
    `The Surface page liquid glass card must include ${snippet}.`,
  )
}
assert.ok(
  !existsSync(join(root, 'src/docs/component-definitions/liquid-glass.tsx')),
  'The liquid glass docs page must be merged into the Surface page without a standalone definition file.',
)
assert.ok(
  !definitionSource.includes('overLight') &&
    !definitionSource.includes('亮背景'),
  'The liquid glass card must keep only the default material state without the overLight toggle.',
)
assert.ok(
  !definitionSource.includes('液态胶囊') &&
    !definitionSource.includes('--pill'),
  'The liquid glass card must keep one tile mirroring the plain glass card, without the pill example.',
)

for (const snippet of [
  "id: 'liquid-glass'",
  "name: '液态玻璃'",
  "exportName: 'LiquidGlassSurface'",
  "registryName: 'liquid-glass'",
  "packageExport: './components/liquid-glass'",
  "group: 'surface-material'",
]) {
  assert.ok(manifestSource.includes(snippet), `components-manifest.ts must include ${snippet}.`)
}

assert.equal(registryItem.type, 'registry:ui', 'liquid-glass must stay a registry:ui item.')
assert.deepEqual(
  registryItem.dependencies,
  ['liquid-glass-react'],
  'liquid-glass must install its liquid-glass-react runtime dependency.',
)
assert.ok(
  registryItem.registryDependencies.includes('@weimo/style'),
  'liquid-glass must install the shared style tokens.',
)
assert.ok(
  registryItem.files.some((file) => file.path === 'src/components/liquid-glass.tsx'),
  'liquid-glass must ship the LiquidGlassSurface source.',
)

assert.ok(
  packageJson.exports['./components/liquid-glass'],
  'package.json must export ./components/liquid-glass.',
)
assert.ok(
  packageJson.dependencies['liquid-glass-react'],
  'package.json must declare liquid-glass-react as a runtime dependency.',
)
assert.ok(
  packageJson.scripts.test.includes('node scripts/liquid-glass-contract.test.mjs'),
  'The package test must run the liquid-glass contract.',
)

assert.ok(
  appCss.includes('.liquid-glass-preview__tile {') &&
    !appCss.includes('.liquid-glass-preview__tile--pill') &&
    !appCss.includes('.liquid-glass-preview__pill-label'),
  'App.css must keep exactly one liquid glass demo tile style without the pill variant.',
)
assert.ok(
  appCss.includes(
    ".liquid-glass-preview__tile[data-background-tone='light'] .liquid-glass-preview__title",
  ) &&
    appCss.includes('var(--glass-surface-fg-on-light)') &&
    appCss.includes('var(--glass-surface-fg-on-dark)'),
  'Liquid glass demo text must adapt to the sampled background tone through the shared glass foreground tokens.',
)
