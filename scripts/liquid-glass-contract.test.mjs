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
const tileSource = readProjectFile('src/docs/liquid-glass-tile.tsx')
const buttonDefinitionSource = readProjectFile('src/docs/component-definitions/button.tsx')
const capsuleDefinitionSource = readProjectFile('src/docs/component-definitions/capsule.tsx')
const barDefinitionSource = readProjectFile('src/docs/component-definitions/bar.tsx')
const pageLayoutDefinitionSource = readProjectFile('src/docs/component-definitions/page-layout.tsx')
const manifestSource = readProjectFile('src/docs/components-manifest.ts')
const appCss = readProjectFile('src/App.css')
const frostedSurfaceSource = readProjectFile('src/components/frosted-surface.tsx')
const registryItem = JSON.parse(readProjectFile('registry/liquid-glass.json'))
const packageJson = JSON.parse(readProjectFile('package.json'))

assert.ok(
  componentSource.includes("import LiquidGlass from './liquid-glass-react'"),
  'liquid-glass.tsx must adapt the vendored in-repo LiquidGlass default export.',
)
for (const vendoredFile of [
  'src/components/liquid-glass-react/index.tsx',
  'src/components/liquid-glass-react/shader-utils.ts',
  'src/components/liquid-glass-react/utils.ts',
  'src/components/liquid-glass-react/LICENSE',
]) {
  assert.ok(existsSync(join(root, vendoredFile)), `${vendoredFile} must exist: the glass engine is vendored in-repo.`)
}
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
    componentSource.includes('padding') &&
    componentSource.includes('onClick'),
  'LiquidGlassSurface must keep forwarding the material effect parameters.',
)

// 两种玻璃材质保持独立:液态玻璃不并入普通玻璃的实现,普通玻璃不依赖液态玻璃。
assert.ok(
  !componentSource.includes('glass-surface'),
  'LiquidGlassSurface must stay independent from the plain FrostedSurface material.',
)
assert.ok(
  !frostedSurfaceSource.includes('liquid'),
  'The plain FrostedSurface material must not depend on liquid glass.',
)

for (const snippet of [
  '<GlassPreviewCard',
  'label="液态玻璃材质"',
  '<LiquidGlassSurface',
  "from '../../components/liquid-glass'",
  "import { LiquidGlassTile } from '../liquid-glass-tile'",
]) {
  assert.ok(
    definitionSource.includes(snippet),
    `The Surface page liquid glass card must include ${snippet}.`,
  )
}
for (const snippet of [
  "import { useFrostedSurfaceBackgroundToneRef } from '../components/frosted-surface'",
  'data-background-tone={backgroundTone ?? undefined}',
]) {
  assert.ok(tileSource.includes(snippet), `liquid-glass-tile.tsx must include ${snippet}.`)
}
for (const snippet of [
  'label="液态玻璃图标按钮"',
  'label="液态玻璃图标按钮组"',
  '<LiquidGlassSurface cornerRadius={999}',
  "import { LiquidGlassTile } from '../liquid-glass-tile'",
]) {
  assert.ok(
    buttonDefinitionSource.includes(snippet),
    `The button page liquid glass icon cards must include ${snippet}.`,
  )
}
for (const snippet of [
  'label="液态玻璃胶囊"',
  '<LiquidGlassSurface cornerRadius={999} padding="6px 10px">',
  '液态玻璃胶囊字号预览',
]) {
  assert.ok(
    capsuleDefinitionSource.includes(snippet),
    `The capsule page liquid glass chip card must include ${snippet}.`,
  )
}
for (const snippet of [
  'label="浮动工具栏"',
  '<LiquidGlassTile className="liquid-glass-toolbar-preview">',
  'liquid-glass-chip--sm',
  'liquid-glass-icon-button--sm',
]) {
  assert.ok(
    barDefinitionSource.includes(snippet),
    `The float toolbar liquid glass demo must include ${snippet}.`,
  )
}
for (const snippet of [
  'label="顶部工具栏"',
  '<LiquidGlassTile className="liquid-glass-toolbar-preview">',
  'liquid-glass-chip--lg',
  'top-bar-preview__title',
]) {
  assert.ok(
    pageLayoutDefinitionSource.includes(snippet),
    `The top toolbar liquid glass demo must include ${snippet}.`,
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
assert.ok(
  !registryItem.dependencies?.includes('liquid-glass-react'),
  'liquid-glass must not declare the liquid-glass-react npm dependency: the engine is vendored in-repo.',
)
assert.ok(
  registryItem.files.some((file) => file.path === 'src/components/liquid-glass-react/index.tsx') &&
    registryItem.files.some((file) => file.path === 'src/components/liquid-glass-react/LICENSE'),
  'liquid-glass must ship the vendored engine sources and its MIT LICENSE.',
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
  !packageJson.dependencies['liquid-glass-react'],
  'package.json must not depend on the liquid-glass-react npm package: the engine is vendored in-repo.',
)
// The forbidden class name is assembled at runtime: this file is itself a
// Tailwind source-scanning candidate, and a literal utility string here
// would regenerate the very rule this assertion bans.
const forbiddenUtilityClass = ['text', 'white'].join('-')
assert.ok(
  !readProjectFile('src/components/liquid-glass-react/index.tsx').includes(forbiddenUtilityClass),
  `The vendored engine must not carry the upstream ${forbiddenUtilityClass} class: vendored source under src/ feeds Tailwind's scanner, and the generated rule would set color on the content wrapper, severing the inherited tone-adaptive foreground.`,
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
    '.liquid-glass-preview__tile {\n  position: relative;\n  width: 260px;\n  max-width: 100%;\n  height: 80px;\n}',
  ) &&
    appCss.includes('width: 220px;') &&
    definitionSource.includes('padding="20px"'),
  'The liquid glass tile must keep the same 260x80 visible footprint as the card/frosted/popup tiles.',
)
assert.ok(
  appCss.includes(
    ".liquid-glass-preview__tile[data-background-tone='light'] .liquid-glass-preview__title",
  ) &&
    appCss.includes('var(--glass-surface-fg-on-light)') &&
    appCss.includes('var(--glass-surface-fg-on-dark)'),
  'Liquid glass demo text must adapt to the sampled background tone through the shared glass foreground tokens.',
)
assert.ok(
  appCss.includes('color-mix(in srgb, currentColor 12%, transparent)') &&
    appCss.includes('.liquid-glass-icon-button:not(:disabled):hover::after') &&
    appCss.includes('.liquid-glass-icon-button:not(:disabled):active::after') &&
    appCss.includes('@media (hover: hover) and (pointer: fine)'),
  'Liquid glass buttons must mirror the frosted icon button hover color wash (same 12% currentColor value as frosted-surface-contract locks, hover gated to fine pointers, active pinned on).',
)
assert.ok(
  appCss.includes('.liquid-glass-icon-button-group__item::after') &&
    appCss.includes('__item:hover::after') &&
    appCss.includes('__item:active::after') &&
    appCss.includes('.liquid-glass-icon-button-group__item {'),
  'Liquid glass icon groups must give each icon an independent hover disc (frosted-group-like inset circle, hover gated to fine pointers, active pinned on) inside the single-button shell.',
)
assert.ok(
  !appCss.includes('.liquid-glass-icon-button-group::after') &&
    !appCss.includes('.liquid-glass-icon-button-group:not(:disabled):hover::after') &&
    !appCss.includes('.liquid-glass-icon-button-group:not(:disabled):active::after'),
  'Liquid glass icon groups must not carry a group-wide pill wash: the frosted group container has no group-level hover feedback, per-icon discs replace it.',
)
assert.ok(
  appCss.includes('.docs-top-bar__actions.liquid-glass-icon-button-group') &&
    appCss.includes('.docs-top-bar__actions .liquid-glass-icon-button-group__item::after') &&
    appCss.includes('.docs-top-bar__actions .liquid-glass-icon-button-group__item svg') &&
    !appCss.includes('docs-liquid-top-bar-actions'),
  'The docs top bar actions pill must reuse the standard liquid glass icon button group skeleton (sized modifier, real buttons carrying the item class for independent hover discs) instead of a bespoke actions stylesheet.',
)
