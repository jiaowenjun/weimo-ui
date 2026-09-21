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
const backgroundTokensDocsDefinitionSource = readProjectFile('src/docs/component-definitions/background-tokens.tsx')
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
  !definitionsIndexSource.includes("from './pressable'") &&
    !definitionsIndexSource.includes('pressableDefinition'),
  'component definitions index must not expose a separate Pressable detail page.',
)
assert.ok(
  manifestSource.includes("id: 'pressable'") &&
    manifestSource.includes("name: '按压反馈色'") &&
    manifestSource.includes("registryName: 'pressable'") &&
    manifestSource.includes("packageExport: './components/pressable'") &&
    manifestSource.includes("group: 'token-style'") &&
    /id: 'pressable',[\s\S]*?docs: false,/.test(manifestSource),
  'component manifest must keep Pressable public while hiding its merged docs page.',
)

assert.ok(
  !existsSync(join(root, 'src/docs/component-definitions/pressable.tsx')) &&
    !existsSync(join(root, 'src/docs/component-definitions/pressable-demo.tsx')) &&
    backgroundTokensDocsDefinitionSource.includes("import { pressableToneMap, pressableTones } from '../../components/pressable'") &&
    backgroundTokensDocsDefinitionSource.includes('const pressableFeedback = pressableToneMap.feedback') &&
    backgroundTokensDocsDefinitionSource.includes('tone === pressableFeedback.bgColorTone') &&
    backgroundTokensDocsDefinitionSource.includes('pressable-preview__sample') &&
    backgroundTokensDocsDefinitionSource.includes('悬停 / 按压查看反馈色') &&
    backgroundTokensDocsDefinitionSource.includes("'Pressable'") &&
    backgroundTokensDocsDefinitionSource.includes('pressableTones.flatMap'),
  'BgColor docs must absorb the interactive Pressable preview and search metadata.',
)

assert.ok(
  pressableSource.includes('TagPicker option') &&
    pressableSource.includes('TagTree row') &&
    !pressableSource.includes('Menu item') &&
    !pressableSource.includes('GlassIconButton / GhostIconButton') &&
    pressableSource.includes('app-local controls 复用 --color-bg-hover 语义'),
  'Pressable usage notes must remain owned by the public tone map.',
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
    !backgroundTokensDocsDefinitionSource.includes(forbiddenPressedPreviewSnippet),
    `Merged Pressable docs must not invent a persistent pressed state through ${forbiddenPressedPreviewSnippet}.`,
  )
}

for (const [tone, bgColorTone, token, className] of expectedTones) {
  assert.ok(pressableSource.includes(bgColorTone), `Pressable source must reference ${bgColorTone}.`)
  assert.ok(typeof token === 'string' && token.startsWith('--color-bg-'), `${tone} token must reuse a shared BgColor token.`)
  assert.ok(typeof className === 'string' && className.startsWith('bg-color--'), `${tone} class must reuse a BgColor utility.`)
}

assert.ok(
  backgroundTokensDocsDefinitionSource.includes('pressableToneMap.feedback') &&
    backgroundTokensDocsDefinitionSource.includes('pressable-preview__sample') &&
    !backgroundTokensDocsDefinitionSource.includes("'pressable-hover'") &&
    !backgroundTokensDocsDefinitionSource.includes("'pressable-hover-strong'") &&
    !backgroundTokensDocsDefinitionSource.includes("'pressable-hover-inverse'") &&
    !backgroundTokensDocsDefinitionSource.includes("'pressable-active-inverse'") &&
    !backgroundTokensDocsDefinitionSource.includes("'surface'") &&
    !backgroundTokensDocsDefinitionSource.includes("'overlay'") &&
    !backgroundTokensDocsDefinitionSource.includes("'pressable-overlay'"),
  'BgColor detail page must own the single feedback preview without restoring removed tones.',
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
  appCss.includes('.pressable-preview__sample') &&
    appCss.includes('.pressable-preview__sample:hover') &&
    appCss.includes('.pressable-preview__sample:active') &&
    appCss.includes('background: var(--color-bg-hover);') &&
    !appCss.includes('.pressable-preview__scenario') &&
    !appCss.includes('.pressable-preview__row') &&
    !appCss.includes('.pressable-preview__state-') &&
    !appCss.includes('--smart-glass-preview-stage-bg'),
  'App.css must include the Pressable-specific interactive preview-effect styles.',
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
