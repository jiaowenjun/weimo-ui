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

function cssVarsIncludeToken(item, token) {
  const key = token.slice(2)

  return ['theme', 'light', 'dark'].some((group) => key in (item.cssVars?.[group] ?? {}))
}

const expectedTones = [
  ['feedback', 'hover', '--color-bg-hover', 'bg-color--hover', '反馈背景'],
]

const packageJson = readJson('package.json')
const manifestSource = readProjectFile('src/docs/components-manifest.ts')
const definitionsIndexSource = readProjectFile('src/docs/component-definitions/index.ts')
const pressableSource = readProjectFile('src/components/pressable.ts')
const docsDefinitionSource = readProjectFile('src/docs/component-definitions/pressable.tsx')
const pressableDemoSource = readProjectFile('src/docs/component-definitions/pressable-demo.tsx')
const pressablePreviewSource = `${docsDefinitionSource}\n${pressableDemoSource}`
const bgColorDocsDefinitionSource = readProjectFile('src/docs/component-definitions/bg-color.tsx')
const appCss = readProjectFile('src/App.css')
const registrySmokeSource = readProjectFile('scripts/registry-smoke.test.mjs')
const rootRegistry = readJson('registry.json')
const standaloneRegistry = readJson('registry/pressable.json')
const rootStyleItem = rootRegistry.items.find((item) => item.name === 'style')
const rootPressableItem = rootRegistry.items.find((item) => item.name === 'pressable')

assert.ok(
  packageJson.scripts?.test?.includes('scripts/pressable-contract.test.mjs'),
  'package.json test script must run the Pressable focused contract.',
)
assert.equal(
  packageJson.exports?.['./components/pressable'],
  './src/components/pressable.ts',
  'package.json must expose the public Pressable tone map.',
)

assert.ok(
  pressableSource.includes("from './bg-color'") &&
    pressableSource.includes('export const pressableToneMap') &&
    pressableSource.includes('export const pressableTones') &&
    pressableSource.includes('export type PressableTone') &&
    pressableSource.includes('export function getPressableClassName') &&
    pressableSource.includes('export function getPressableToken') &&
    pressableSource.includes('export function getPressableBgColorTone'),
  'Pressable must expose a public tone map and helpers backed by BgColor.',
)

for (const [tone, bgColorTone, token, className, label] of expectedTones) {
  assert.ok(
    (pressableSource.includes(`${tone}: {`) || pressableSource.includes(`'${tone}': {`)) &&
      pressableSource.includes(`label: '${label}'`) &&
      pressableSource.includes(`bgColorTone: '${bgColorTone}'`) &&
      pressableSource.includes(`token: bgColorToneMap['${bgColorTone}'].token`) &&
      pressableSource.includes(`className: getBgColorClassName('${bgColorTone}')`) &&
      pressableSource.includes(`value: bgColorToneMap['${bgColorTone}'].value`),
    `pressableToneMap must map ${tone} to the shared ${bgColorTone} BgColor tone.`,
  )
  assert.ok(
    rootStyleItem && cssVarsIncludeToken(rootStyleItem, token),
    `@weimo/style must keep exporting ${token} for Pressable.`,
  )
}

assert.ok(
  definitionsIndexSource.includes("import { pressableDefinition } from './pressable'") &&
    (definitionsIndexSource.includes('pressable: pressableDefinition') ||
      definitionsIndexSource.includes("'pressable': pressableDefinition")),
  'component definitions index must wire the Pressable detail page.',
)
assert.ok(
  manifestSource.includes("id: 'pressable'") &&
    manifestSource.includes("name: 'Pressable'") &&
    manifestSource.includes("registryName: 'pressable'") &&
    manifestSource.includes("packageExport: './components/pressable'") &&
    manifestSource.includes("group: 'token-style'"),
  'component manifest must list Pressable as a public token-style utility.',
)

assert.ok(
  docsDefinitionSource.includes("id: 'pressable'") &&
    docsDefinitionSource.includes("summary: '集中展示代表性可按压反馈 token 值") &&
    docsDefinitionSource.includes("import { PressableDemo } from './pressable-demo'") &&
    docsDefinitionSource.includes('preview: () => <PressableDemo />') &&
    pressablePreviewSource.includes("import { useState } from 'react'") &&
    pressablePreviewSource.includes('type PressableScenario') &&
    pressablePreviewSource.includes('type PressableTokenGroup') &&
    pressablePreviewSource.includes('const pressablePreviewStateLabels') &&
    pressablePreviewSource.includes('const pressableTokenGroups') &&
    pressablePreviewSource.includes('export function PressableDemo()') &&
    pressablePreviewSource.includes('const [hoveredSampleKey, setHoveredSampleKey] = useState<string | null>(null)') &&
    pressablePreviewSource.includes('const [activeSampleKey, setActiveSampleKey] = useState<string | null>(null)') &&
    pressablePreviewSource.includes('pressableTokenGroups.map') &&
    pressablePreviewSource.includes('const feedbackItem = pressableToneMap.feedback') &&
    pressablePreviewSource.includes("getPressableClassName('feedback')") &&
    pressablePreviewSource.includes("getPressableToken('feedback')") &&
    pressablePreviewSource.includes("getPressableBgColorTone('feedback')") &&
    pressablePreviewSource.includes('states?: readonly PressablePreviewState[]') &&
    pressablePreviewSource.includes("const pressableHoverStates = ['idle', 'hover']") &&
    pressablePreviewSource.includes("const pressableHoverActiveStates = ['idle', 'hover', 'active']") &&
    pressablePreviewSource.includes("const pressableHighlightedStates = ['idle', 'highlighted']") &&
    pressablePreviewSource.includes("const pressableHoverOpenStates = ['idle', 'hover', 'open']") &&
    pressablePreviewSource.includes('states: pressableHoverActiveStates') &&
    pressablePreviewSource.includes('states: pressableHighlightedStates') &&
    pressablePreviewSource.includes('states: pressableHoverStates') &&
    pressablePreviewSource.includes('states: pressableHoverOpenStates') &&
    pressablePreviewSource.includes('const scenarioStates = scenario.states ?? pressableHoverStates') &&
    pressablePreviewSource.includes("const scenarioSupportsActive = scenarioStates.some((state) => state === 'active')") &&
    pressableSource.includes('TagPicker option') &&
    pressableSource.includes('TagTree row') &&
    !pressableSource.includes('Menu item') &&
    !pressableSource.includes('GlassIconButton / GhostIconButton') &&
    pressableSource.includes('app-local controls 复用 --color-bg-hover 语义') &&
    pressablePreviewSource.includes("'反馈背景'") &&
    pressablePreviewSource.includes("'Pressable feedback'") &&
    pressablePreviewSource.includes("'玻璃动态反馈'") &&
    pressablePreviewSource.includes("'GlassSurface hover'") &&
    pressablePreviewSource.includes('亮色背景 surface') &&
    pressablePreviewSource.includes('暗色背景 surface') &&
    pressablePreviewSource.includes("source: 'weimo-ui weimo-menu__popup > .weimo-menu__item'") &&
    pressablePreviewSource.includes("{ label: '菜单项 hover', value: '--weimo-menu-item-hover-bg' }") &&
    pressablePreviewSource.includes("token: '--weimo-menu-item-hover-bg'") &&
    pressablePreviewSource.includes('Menu popup 在根上由 --glass-surface-fg 派生本地 hover 背景。') &&
    pressablePreviewSource.includes("backgroundTone: 'light'") &&
    pressablePreviewSource.includes("backgroundTone: 'dark'") &&
    pressablePreviewSource.includes('--glass-surface-light-fg') &&
    pressablePreviewSource.includes('--glass-surface-light-muted-fg') &&
    pressablePreviewSource.includes('--glass-surface-dark-fg') &&
    pressablePreviewSource.includes('--glass-surface-dark-muted-fg') &&
    pressablePreviewSource.includes('pressable-preview__scenario-cell--smart-glass-light') &&
    pressablePreviewSource.includes('pressable-preview__scenario-cell--smart-glass-dark') &&
    pressablePreviewSource.includes("stageClassName: 'pressable-preview__surface-stage--light'") &&
    pressablePreviewSource.includes("stageClassName: 'pressable-preview__surface-stage--dark'") &&
    pressablePreviewSource.includes('const scenarioPreview = (') &&
    pressablePreviewSource.includes('pressable-preview__surface-stage') &&
    pressablePreviewSource.includes('scenario.stageClassName ?') &&
    pressablePreviewSource.includes("'组件本地反馈变量'") &&
    pressablePreviewSource.includes("'ChipSurface hover'") &&
    pressablePreviewSource.includes('scenarioRows') &&
    pressablePreviewSource.includes('GhostIconButton') &&
    pressablePreviewSource.includes('Menu item') &&
    pressablePreviewSource.includes('TagPicker option') &&
    pressablePreviewSource.includes('TagTree row') &&
    pressablePreviewSource.includes('ChipSurface') &&
    pressablePreviewSource.includes('coss Button ghost') &&
    pressablePreviewSource.includes('biji-react close button') &&
    pressablePreviewSource.includes('weimo-biji/frontend/web') &&
    pressablePreviewSource.includes('workspace-filter-bar__close:hover') &&
    pressablePreviewSource.includes('app-local close button 复用 --color-bg-hover 语义，具体值由 biji-react token 覆盖。') &&
    pressablePreviewSource.includes('不展示真实 CSS 中不存在的持久按下态。') &&
    pressablePreviewSource.includes('--glass-surface-hover-bg') &&
    pressablePreviewSource.includes('--color-bg-hover') &&
    pressablePreviewSource.includes('--chip-surface-hover-background') &&
    pressablePreviewSource.includes('data-token={scenario.token}') &&
    pressablePreviewSource.includes('data-state={stateLabel}') &&
    pressablePreviewSource.includes('onPointerEnter={() => setHoveredSampleKey(sampleKey)}') &&
    pressablePreviewSource.includes('onPointerDown={() => setActiveSampleKey(sampleKey)}') &&
    pressablePreviewSource.includes('pressable-preview__scenario-grid') &&
    pressablePreviewSource.includes('pressable-preview__scenario') &&
    pressablePreviewSource.includes('pressable-preview__scenario-fill') &&
    pressablePreviewSource.includes('pressable-preview__scenario-state') &&
    pressablePreviewSource.includes('pressable-preview__state-strip') &&
    pressablePreviewSource.includes('pressable-preview__state-chip') &&
    pressablePreviewSource.includes('{group.valueRows.map((valueRow) => (') &&
    pressablePreviewSource.includes('{valueRow.label}: {valueRow.value}'),
  'Pressable docs definition must keep a token-first preview with interactive real scenarios bound to token values.',
)

for (const forbiddenPressedPreviewSnippet of [
  "state: 'pressed'",
  'pressedSampleKey',
  'setPressedSampleKey',
  'lockedSampleKey',
  'aria-pressed',
  'data-pressed',
  'setLockedSampleKey',
]) {
  assert.ok(
    !pressablePreviewSource.includes(forbiddenPressedPreviewSnippet),
    `Pressable docs must not invent a persistent pressed state through ${forbiddenPressedPreviewSnippet}.`,
  )
}

for (const [tone, bgColorTone, token, className] of expectedTones) {
  assert.ok(docsDefinitionSource.includes(`'${tone}'`), `Pressable docs must include ${tone}.`)
  assert.ok(pressableSource.includes(bgColorTone), `Pressable source must reference ${bgColorTone}.`)
  assert.ok(typeof token === 'string' && token.startsWith('--color-bg-'), `${tone} token must reuse a shared BgColor token.`)
  assert.ok(typeof className === 'string' && className.startsWith('bg-color--'), `${tone} class must reuse a BgColor utility.`)
}

assert.ok(
  !bgColorDocsDefinitionSource.includes("title: '可按压反馈'") &&
    !bgColorDocsDefinitionSource.includes("'pressable-hover'") &&
    !bgColorDocsDefinitionSource.includes("'pressable-hover-strong'") &&
    !bgColorDocsDefinitionSource.includes("'pressable-hover-inverse'") &&
    !bgColorDocsDefinitionSource.includes("'pressable-active-inverse'") &&
    !bgColorDocsDefinitionSource.includes("'surface'") &&
    !bgColorDocsDefinitionSource.includes("'overlay'") &&
    !bgColorDocsDefinitionSource.includes("'pressable-overlay'"),
  'BgColor detail page must delegate pressable feedback previews to the Pressable detail page.',
)

assert.ok(
  !pressableSource.includes("'surface'") &&
    !pressableSource.includes("'overlay'") &&
    !pressableSource.includes("'hover-strong'") &&
    !pressableSource.includes("'hover-inverse'") &&
    !pressableSource.includes("'active-inverse'") &&
    !pressableSource.includes('pressable-overlay') &&
    !pressableSource.includes('--color-bg-pressable-overlay') &&
    !pressableSource.includes('bg-color--pressable-overlay') &&
    !pressableSource.includes('pressable-hover-strong') &&
    !pressableSource.includes('pressable-hover-inverse') &&
    !pressableSource.includes('pressable-active-inverse'),
  'Pressable must collapse all pressable feedback into a single feedback tone backed by --color-bg-hover.',
)

assert.ok(
  appCss.includes('.pressable-preview') &&
    appCss.includes('.pressable-preview__row') &&
    appCss.includes('.pressable-preview__scenario-grid') &&
    appCss.includes('.pressable-preview__scenario') &&
    appCss.includes('.pressable-preview__scenario--smart-glass') &&
    appCss.includes('.pressable-preview__scenario-cell--smart-glass-light') &&
    appCss.includes('.pressable-preview__scenario-cell--smart-glass-dark') &&
    appCss.includes('.pressable-preview__surface-stage') &&
    appCss.includes('.pressable-preview__surface-stage--light') &&
    appCss.includes('.pressable-preview__surface-stage--dark') &&
    appCss.includes('--smart-glass-preview-stage-bg: hsl(210 20% 96%);') &&
    appCss.includes('--smart-glass-preview-stage-bg: hsl(222 43% 7%);') &&
    appCss.includes('background: var(--smart-glass-preview-stage-bg);') &&
    appCss.includes('width: min(100%, 280px);') &&
    appCss.includes('--glass-surface-fg: var(--glass-surface-light-fg);') &&
    appCss.includes('--glass-surface-muted-color: var(--glass-surface-light-muted-fg);') &&
    appCss.includes('--glass-surface-fg: var(--glass-surface-dark-fg);') &&
    appCss.includes('--glass-surface-muted-color: var(--glass-surface-dark-muted-fg);') &&
    appCss.includes('--glass-surface-hover-bg: color-mix(in srgb, var(--glass-surface-fg) 12%, transparent);') &&
    appCss.includes('--weimo-menu-item-hover-bg: color-mix(in srgb, var(--glass-surface-fg) 12%, transparent);') &&
    appCss.includes('.pressable-preview__scenario--icon-ghost') &&
    appCss.includes('.pressable-preview__scenario--menu-item') &&
    appCss.includes('.pressable-preview__scenario--tag-picker') &&
    appCss.includes('.pressable-preview__scenario--tag-tree') &&
    appCss.includes('.pressable-preview__scenario--chip-surface') &&
    appCss.includes('.pressable-preview__scenario--coss-button') &&
    appCss.includes('.pressable-preview__scenario--biji-close') &&
    appCss.includes('.pressable-preview__scenario-fill') &&
    appCss.includes('.pressable-preview__scenario-state') &&
    appCss.includes('.pressable-preview__state-strip') &&
    appCss.includes('.pressable-preview__state-chip') &&
    appCss.includes('.pressable-preview__scenario:is(:hover, :focus-visible) .pressable-preview__scenario-fill') &&
    appCss.includes('.pressable-preview__scenario[data-active="true"] .pressable-preview__scenario-fill') &&
    appCss.includes('.pressable-preview__state-chip:is([data-state="hover"], [data-state="active"], [data-state="highlighted"], [data-state="open"]) .pressable-preview__scenario-fill') &&
    appCss.includes('.pressable-preview__scenario-cell--smart-glass-light .pressable-preview__state-chip .pressable-preview__scenario-fill') &&
    appCss.includes('.pressable-preview__scenario-cell--smart-glass-dark .pressable-preview__state-chip .pressable-preview__scenario-fill') &&
    appCss.includes('.pressable-preview__scenario--chip-surface ~ .pressable-preview__state-strip .pressable-preview__scenario-fill') &&
    appCss.includes('.pressable-preview__scenario[data-token="--glass-surface-hover-bg"]') &&
    appCss.includes('.pressable-preview__scenario[data-token="--weimo-menu-item-hover-bg"]') &&
    appCss.includes('.pressable-preview__scenario[data-token="--chip-surface-hover-background"]') &&
    appCss.includes('background: var(--glass-surface-hover-bg, var(--color-bg-hover));') &&
    appCss.includes('background: var(--weimo-menu-item-hover-bg, var(--glass-surface-hover-bg, var(--color-bg-hover)));') &&
    appCss.includes('background: var(--chip-surface-hover-background, var(--color-bg-hover));') &&
    appCss.includes('grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));') &&
    !appCss.includes('.pressable-preview__control-grid'),
  'App.css must include scoped Pressable token-first previews for interactive real scenario styles.',
)

for (const forbiddenPressedStyle of [
  '[data-pressed="true"]',
  '[data-state="pressed"]',
]) {
  assert.ok(
    !appCss.includes(forbiddenPressedStyle),
    `Pressable preview styles must not invent pressed styling through ${forbiddenPressedStyle}.`,
  )
}

assert.ok(rootPressableItem, 'registry.json must include @weimo/pressable.')
assert.deepEqual(
  standaloneRegistry,
  rootPressableItem,
  'registry/pressable.json must match the root registry payload.',
)
assert.deepEqual(
  rootPressableItem.registryDependencies,
  ['@weimo/style', '@weimo/bg-color'],
  'Pressable registry item must install shared style tokens and BgColor utilities.',
)
assert.deepEqual(
  rootPressableItem.files.map((file) => [file.path, file.target]),
  [['src/components/pressable.ts', '@ui/pressable.ts']],
  'Pressable registry item must ship only the focused public tone map.',
)

assert.ok(
  registrySmokeSource.includes('getPressableClassName') &&
    registrySmokeSource.includes('pressableTones') &&
    registrySmokeSource.includes("await runShadcnAdd(consumerDir, '@weimo/pressable')") &&
    registrySmokeSource.includes("hits.includes('pressable.json')") &&
    registrySmokeSource.includes("src/components/ui/pressable.ts"),
  'registry smoke must install and compile the standalone Pressable registry item.',
)
