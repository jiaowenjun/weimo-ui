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

const componentSource = readProjectFile('packages/weimo-ui-core/src/components/surfaces/liquid-glass/liquid-glass.tsx')
const componentCss = readProjectFile('packages/weimo-ui-core/src/components/surfaces/liquid-glass/liquid-glass.css')
const engineSource = readProjectFile('packages/weimo-ui-core/src/components/surfaces/liquid-glass/liquid-glass-react/index.tsx')
const definitionSource = readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/surface.tsx')
const tileSource = readProjectFile('packages/weimo-ui-site/src/docs/previews/liquid-glass-tile.tsx')
const buttonDefinitionSource = readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/button.tsx')
const capsuleButtonDefinitionSource = readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/capsule-button.tsx')
const appCss = readProjectFile('packages/weimo-ui-site/src/app/app.css')
const frostedSurfaceSource = readProjectFile('packages/weimo-ui-core/src/components/surfaces/frosted-surface/frosted-surface.tsx')
const registryItem = JSON.parse(readProjectFile('registry/liquid-glass.json'))
const packageJson = JSON.parse(readProjectFile('package.json'))

assert.ok(
  componentSource.includes("import LiquidGlass from './liquid-glass-react'"),
  'liquid-glass.tsx must adapt the vendored in-repo LiquidGlass default export.',
)
assert.ok(
  componentSource.includes("import './liquid-glass.css'"),
  'LiquidGlassSurface must import its semantic layer transitions.',
)
for (const vendoredFile of [
  'packages/weimo-ui-core/src/components/surfaces/liquid-glass/liquid-glass-react/index.tsx',
  'packages/weimo-ui-core/src/components/surfaces/liquid-glass/liquid-glass-react/shader-utils.ts',
  'packages/weimo-ui-core/src/components/surfaces/liquid-glass/liquid-glass-react/utils.ts',
  'packages/weimo-ui-core/src/components/surfaces/liquid-glass/liquid-glass-react/LICENSE',
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
  "from 'weimo-ui-core/components/liquid-glass'",
  "import { LiquidGlassTile } from '../../../previews/liquid-glass-tile'",
]) {
  assert.ok(
    definitionSource.includes(snippet),
    `The Surface page liquid glass card must include ${snippet}.`,
  )
}
for (const snippet of [
  "import { useFrostedSurfaceBackgroundToneRef } from 'weimo-ui-core/components/frosted-surface'",
  'data-background-tone={backgroundTone ?? undefined}',
]) {
  assert.ok(tileSource.includes(snippet), `liquid-glass-tile.tsx must include ${snippet}.`)
}
// 液态玻璃图标按钮/按钮组已删除:它们不是 core 组件,而是按钮页演示层的
// 组合用法(裸 button + LiquidGlassSurface + 演示级 CSS);工具栏家族全站
// 磨砂化后不再有演示场景,液态玻璃材质本体的演示只在 Surface 材质页。
assert.ok(
  !buttonDefinitionSource.includes('LiquidGlass') &&
    !buttonDefinitionSource.includes('liquid-glass'),
  'The button page must not carry liquid glass icon button demos: toolbar families are frosted and the material itself is demoed on the Surface page.',
)
for (const snippet of [
  'label="胶囊材质"',
  '<CapsuleButton prefix={null} state="frosted">磨砂胶囊</CapsuleButton>',
  '胶囊材质预览',
]) {
  assert.ok(
    capsuleButtonDefinitionSource.includes(snippet),
    `The core CapsuleButton page material card must include ${snippet}.`,
  )
}
// GlassLabel:工具栏标题胶囊已更名 FrostedLabel 并改用磨砂材质,浮动/顶部
// 工具栏卡的图标钮也整体磨砂化,契约随迁 surface-material-contract;两张
// 工具栏演示卡已不属于液态玻璃演示。
assert.ok(
  !existsSync(join(root, 'packages/weimo-ui-site/src/docs/component-definitions/liquid-glass.tsx')),
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

assert.equal(registryItem.type, 'registry:ui', 'liquid-glass must stay a registry:ui item.')
assert.ok(
  !registryItem.dependencies?.includes('liquid-glass-react'),
  'liquid-glass must not declare the liquid-glass-react npm dependency: the engine is vendored in-repo.',
)
assert.ok(
  registryItem.files.some((file) => file.path === 'packages/weimo-ui-core/src/components/surfaces/liquid-glass/liquid-glass-react/index.tsx') &&
    registryItem.files.some((file) => file.path === 'packages/weimo-ui-core/src/components/surfaces/liquid-glass/liquid-glass-react/LICENSE'),
  'liquid-glass must ship the vendored engine sources and its MIT LICENSE.',
)
assert.ok(
  registryItem.registryDependencies.includes('@weimo/style'),
  'liquid-glass must install the shared style tokens.',
)
assert.ok(
  registryItem.files.some((file) => file.path === 'packages/weimo-ui-core/src/components/surfaces/liquid-glass/liquid-glass.tsx'),
  'liquid-glass must ship the LiquidGlassSurface source.',
)
assert.ok(
  registryItem.files.some((file) => file.path === 'packages/weimo-ui-core/src/components/surfaces/liquid-glass/liquid-glass.css'),
  'liquid-glass must ship its semantic transition CSS.',
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
  !engineSource.includes(forbiddenUtilityClass),
  `The vendored engine must not carry the upstream ${forbiddenUtilityClass} class: vendored source under src/ feeds Tailwind's scanner, and the generated rule would set color on the content wrapper, severing the inherited tone-adaptive foreground.`,
)
for (const forbiddenTransition of [
  'transition-all',
  'duration-150',
  'transition: "all',
  'transition: baseStyle.transition',
]) {
  assert.ok(
    !engineSource.includes(forbiddenTransition),
    `Liquid glass engine must not use broad or inherited transition plumbing: ${forbiddenTransition}.`,
  )
}
for (const layerClass of [
  'liquid-glass__glass',
  'liquid-glass__content',
  'liquid-glass__over-light',
  'liquid-glass__border',
  'liquid-glass__highlight',
]) {
  assert.ok(
    engineSource.includes(layerClass) && componentCss.includes(`.${layerClass}`),
    `Liquid glass ${layerClass} must have a stable class and component-owned transition CSS.`,
  )
}
for (const transition of [
  'transform var(--liquid-glass-motion-transition-duration, 200ms) ease-out',
  'box-shadow var(--liquid-glass-motion-transition-duration, 200ms) ease-in-out',
  'color var(--liquid-glass-tone-transition-duration, 160ms) ease',
  'text-shadow var(--liquid-glass-tone-transition-duration, 160ms) ease',
  'opacity var(--liquid-glass-motion-transition-duration, 200ms) ease-out',
]) {
  assert.ok(componentCss.includes(transition), `Liquid glass CSS must include ${transition}.`)
}
assert.ok(
  componentCss.includes('@media (prefers-reduced-motion: reduce)') &&
    componentCss.includes('transition-duration: 1ms;'),
  'Liquid glass semantic layers must respect reduced motion.',
)
assert.ok(
  !appCss.includes('.docs-top-bar__title > :not(.docs-top-bar__title-sizer)') &&
    !appCss.includes('transition-property: transform, opacity, box-shadow !important;'),
  'The docs top bar must not need a transition-all size override after the engine declares exact properties.',
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
    appCss.includes('var(--liquid-glass-fg-on-light)') &&
    appCss.includes('var(--liquid-glass-fg-on-dark)'),
  'Liquid glass demo text must adapt to the sampled background tone through the shared glass foreground tokens.',
)
assert.ok(
  appCss.includes('text-shadow 160ms ease;') &&
    appCss.includes('.liquid-glass-preview__title') &&
    appCss.includes('transition-duration: 1ms;'),
  'Liquid glass previews must transition tone and text shadow together and respect reduced motion.',
)
assert.ok(
  !appCss.includes('.liquid-glass-icon-button') &&
    !appCss.includes('.liquid-glass-icon-preview'),
  'The liquid glass icon button/group demo styles must stay removed: toolbar families are frosted and the liquid material is demoed only on the Surface page tile.',
)
// 站点顶栏(docs-shell)与按钮页图标卡均已磨砂化/删除,液态玻璃演示只剩
// Surface 材质页的材质卡瓦片(经共享画布渲染,无站点特化样式)。
