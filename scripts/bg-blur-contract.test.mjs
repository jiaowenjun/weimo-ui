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

function blockFor(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const matches = Array.from(source.matchAll(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, 'g')))
  const match = matches.at(-1)

  assert.ok(match, `${selector} block must exist.`)

  return match[1]
}

const expectedTones = [
  {
    tone: 'glass',
    label: '玻璃材质',
    backgroundToken: 'none',
    blurToken: '--glass-blur',
    blurValue: '14px',
    filter: 'blur(var(--glass-blur))',
    className: 'bg-blur--glass',
    usage: 'ChipSurface glass',
  },
  {
    tone: 'backdrop',
    label: '背景遮罩',
    backgroundToken: '--color-bg-backdrop',
    blurToken: '--backdrop-blur',
    blurValue: '4px',
    filter: 'blur(var(--backdrop-blur))',
    className: 'bg-blur--backdrop',
    usage: 'Coss Dialog backdrop、Command backdrop、SideBar drawer backdrop',
  },
]

const packageJson = readJson('package.json')
const bgBlurSource = readProjectFile('src/components/bg-blur.ts')
const bgBlurCss = readProjectFile('src/components/bg-blur.css')
const manifestSource = readProjectFile('src/docs/components-manifest.ts')
const definitionsIndexSource = readProjectFile('src/docs/component-definitions/index.ts')
const docsDefinitionSource = readProjectFile('src/docs/component-definitions/bg-blur.tsx')
const appCss = readProjectFile('src/App.css')
const tokensCss = readProjectFile('src/styles/tokens.css')
const glassSurfaceCss = readProjectFile('src/components/glass-surface.css')
const chipSurfaceCss = readProjectFile('src/components/chip-surface.css')
const commandCss = readProjectFile('src/components/coss/command.css')
const dialogCss = readProjectFile('src/components/coss/dialog.css')
const sidebarShellCss = readProjectFile('src/components/sidebar/sidebar-shell.css')
const rootRegistry = readJson('registry.json')
const styleRegistry = readJson('registry/style.json')
const standaloneRegistryItem = readJson('registry/bg-blur.json')
const rootStyleItem = rootRegistry.items.find((item) => item.name === 'style')
const registryItem = rootRegistry.items.find((item) => item.name === 'bg-blur')
const sampleBlock = blockFor(appCss, '.bg-blur-preview__sample')
const overlayBlock = blockFor(appCss, '.bg-blur-preview__overlay')

assert.equal(
  packageJson.exports?.['./components/bg-blur'],
  './src/components/bg-blur.ts',
  'package.json must expose the public BgBlur tone map.',
)
assert.equal(
  packageJson.exports?.['./styles/bg-blur.css'],
  './src/components/bg-blur.css',
  'package.json must expose the standalone BgBlur utility stylesheet.',
)
assert.ok(
  !Object.hasOwn(packageJson.exports ?? {}, './components/blur') &&
    !Object.hasOwn(packageJson.exports ?? {}, './styles/blur.css'),
  'Blur must be replaced by BgBlur instead of kept as a parallel public alias.',
)
assert.ok(
  packageJson.scripts?.test?.includes('scripts/bg-blur-contract.test.mjs') &&
    !packageJson.scripts?.test?.includes('scripts/blur-contract.test.mjs'),
  'package.json test script must run bg-blur-contract.test.mjs and drop the old blur contract.',
)

assert.ok(
  bgBlurSource.includes("import './bg-blur.css'"),
  'BgBlur tone map module must import its utility stylesheet.',
)
assert.ok(
  bgBlurSource.includes('export const bgBlurToneMap') &&
    bgBlurSource.includes('export const bgBlurTones') &&
    bgBlurSource.includes('export type BgBlurTone') &&
    bgBlurSource.includes('export function getBgBlurClassName') &&
    bgBlurSource.includes('export function getBgBlurBackgroundToken') &&
    bgBlurSource.includes('export function getBgBlurBlurToken') &&
    bgBlurSource.includes('export function getBgBlurBlurValue') &&
    bgBlurSource.includes('export function getBgBlurFilter'),
  'BgBlur module must expose its tone map, ordered tones, type, and focused helpers.',
)
assert.ok(
  !bgBlurSource.includes('none:') &&
    !bgBlurSource.includes("'none':") &&
    !bgBlurCss.includes('bg-blur--none'),
  'BgBlur public tone map must not expose blur(0); that remains an animation state, not a background+blur combination.',
)

for (const item of expectedTones) {
  assert.ok(
    (bgBlurSource.includes(`${item.tone}: {`) || bgBlurSource.includes(`'${item.tone}': {`)) &&
      bgBlurSource.includes(`label: '${item.label}'`) &&
      bgBlurSource.includes(`backgroundToken: '${item.backgroundToken}'`) &&
      bgBlurSource.includes(`blurToken: '${item.blurToken}'`) &&
      bgBlurSource.includes(`blurValue: '${item.blurValue}'`) &&
      bgBlurSource.includes(`filter: '${item.filter}'`) &&
      bgBlurSource.includes(`className: '${item.className}'`) &&
      bgBlurSource.includes(item.usage) &&
      bgBlurSource.includes('uiUsage:'),
    `bgBlurToneMap must include ${item.tone} with background marker, blur token, value, class, and usage notes.`,
  )

  const utilityBlock = blockFor(bgBlurCss, `.${item.className}`)

  if (item.backgroundToken === 'none') {
    assert.ok(
      !utilityBlock.includes('background:') &&
        utilityBlock.includes(`backdrop-filter: ${item.filter};`) &&
        utilityBlock.includes(`-webkit-backdrop-filter: ${item.filter};`),
      `bg-blur.css must define ${item.className} as blur-only with Safari support.`,
    )
  } else {
    assert.ok(
      utilityBlock.includes(`background: var(${item.backgroundToken});`) &&
        utilityBlock.includes(`backdrop-filter: ${item.filter};`) &&
        utilityBlock.includes(`-webkit-backdrop-filter: ${item.filter};`),
      `bg-blur.css must define ${item.className} as ${item.backgroundToken} plus ${item.filter} with Safari support.`,
    )
  }
}

assert.ok(
  !tokensCss.includes('--glass-gradient') &&
    !Object.hasOwn(styleRegistry.cssVars?.light ?? {}, 'glass-gradient') &&
    !Object.hasOwn(styleRegistry.cssVars?.dark ?? {}, 'glass-gradient') &&
    !Object.hasOwn(rootStyleItem?.cssVars?.light ?? {}, 'glass-gradient') &&
    !Object.hasOwn(rootStyleItem?.cssVars?.dark ?? {}, 'glass-gradient'),
  'shared UI tokens and registry style payloads must remove the glass background gradient token.',
)
assert.equal(
  styleRegistry.cssVars?.light?.['glass-blur'],
  '14px',
  'registry/style.json must export --glass-blur as 14px.',
)
assert.ok(tokensCss.includes('--glass-blur: 14px;'), 'shared UI tokens must define --glass-blur as 14px.')
assert.equal(
  rootStyleItem?.cssVars?.light?.['glass-blur'],
  '14px',
  'registry.json style item must export --glass-blur as 14px.',
)
assert.ok(
  tokensCss.includes('--color-bg-backdrop: rgb(7 10 14 / 0.32);') &&
    tokensCss.includes('--backdrop-blur: 4px;'),
  'shared UI tokens must define the backdrop background and blur pair.',
)
assert.equal(
  styleRegistry.cssVars?.light?.['color-bg-backdrop'],
  'rgb(7 10 14 / 0.32)',
  'registry/style.json must export the light --color-bg-backdrop value.',
)
assert.equal(
  rootStyleItem?.cssVars?.light?.['color-bg-backdrop'],
  'rgb(7 10 14 / 0.32)',
  'registry.json style item must export the light --color-bg-backdrop value.',
)
assert.equal(
  styleRegistry.cssVars?.light?.['backdrop-blur'],
  '4px',
  'registry/style.json must export --backdrop-blur as 4px.',
)

const chipGlassBlock = blockFor(chipSurfaceCss, '.chip-surface[data-variant="glass"]')

assert.ok(
  chipSurfaceCss.includes('.chip-surface::after') &&
    !chipSurfaceCss.includes('--glass-gradient') &&
    chipGlassBlock.includes('backdrop-filter: blur(var(--glass-blur));') &&
    chipGlassBlock.includes('-webkit-backdrop-filter: blur(var(--glass-blur));'),
  'ChipSurface glass must keep the shared blur while removing the shared glass background gradient token.',
)
assert.ok(
  blockFor(glassSurfaceCss, '.glass-surface').includes('backdrop-filter: blur(var(--glass-blur));') &&
    !blockFor(glassSurfaceCss, '.glass-surface').includes('background: var(--glass-gradient);'),
  'GlassSurface currently owns only the shared glass blur.',
)

for (const [source, selector] of [
  [commandCss, '.coss-command__backdrop'],
  [dialogCss, '.coss-dialog__backdrop'],
]) {
  const block = blockFor(source, selector)

  assert.ok(
    block.includes('background: var(--color-bg-backdrop);') &&
      block.includes('backdrop-filter: blur(var(--backdrop-blur));'),
    `${selector} must use the backdrop transparent background plus blur pair.`,
  )
}
assert.ok(
  blockFor(sidebarShellCss, '.weimo-sidebar-drawer__backdrop').includes('background: var(--color-bg-backdrop);') &&
    sidebarShellCss.includes('backdrop-filter: blur(var(--backdrop-blur));') &&
    sidebarShellCss.includes('backdrop-filter: blur(0);'),
  'SideBar drawer backdrop must use --color-bg-backdrop and animate between blur(0) and --backdrop-blur.',
)

assert.ok(
  manifestSource.includes("id: 'bg-blur'") &&
    manifestSource.includes("name: 'BgBlur'") &&
    manifestSource.includes("registryName: 'bg-blur'") &&
    manifestSource.includes("packageExport: './components/bg-blur'") &&
    !manifestSource.includes("id: 'blur'") &&
    !manifestSource.includes("name: 'Blur'"),
  'component manifest must list BgBlur as the public registry-backed utility and remove Blur.',
)
assert.ok(
  definitionsIndexSource.includes("import { bgBlurDefinition } from './bg-blur'") &&
    definitionsIndexSource.includes("'bg-blur': bgBlurDefinition") &&
    !definitionsIndexSource.includes("from './blur'") &&
    !definitionsIndexSource.includes("'blur':"),
  'component definitions index must wire the BgBlur detail definition and remove Blur.',
)
assert.ok(
  docsDefinitionSource.includes("id: 'bg-blur'") &&
    docsDefinitionSource.includes("frame: 'plain',") &&
    docsDefinitionSource.includes("import { CardPanel } from '../../components/coss/card'") &&
    docsDefinitionSource.includes('bgBlurTones.map') &&
    docsDefinitionSource.includes('bgBlurToneMap[tone]') &&
    docsDefinitionSource.includes('getBgBlurClassName(tone)') &&
    docsDefinitionSource.includes('getBgBlurBlurToken(tone)') &&
    docsDefinitionSource.includes('getBgBlurBlurValue(tone)') &&
    docsDefinitionSource.includes('<CardPanel className="bg-blur-preview__panel"') &&
    docsDefinitionSource.includes('bg-blur-preview__sample') &&
    docsDefinitionSource.includes('bg-blur-preview__overlay') &&
    docsDefinitionSource.includes('bg-blur-preview__value') &&
    !docsDefinitionSource.includes('bg-blur-preview__group') &&
    !docsDefinitionSource.includes('bg-blur-preview__stage'),
  'BgBlur docs definition must render one CardPanel per blur tone driven by the shared tone map.',
)
assert.ok(
  !docsDefinitionSource.includes('<span>text</span>') && !docsDefinitionSource.includes('>text<'),
  'BgBlur docs preview overlay must not render sample text inside the background-only swatch.',
)
assert.ok(
  !docsDefinitionSource.includes('bijiUsage') &&
    !docsDefinitionSource.includes('uiUsage') &&
    !docsDefinitionSource.includes('getBgBlurBackgroundToken') &&
    !docsDefinitionSource.includes('getBgBlurFilter'),
  'BgBlur docs preview must stay visual-only: no usage notes or background/filter metadata text.',
)

assert.ok(
  appCss.includes('.bg-blur-preview') &&
    appCss.includes('.bg-blur-preview__panel') &&
    appCss.includes('.bg-blur-preview__sample') &&
    appCss.includes('.bg-blur-preview__backdrop') &&
    appCss.includes('.bg-blur-preview__overlay') &&
    appCss.includes('.bg-blur-preview__label') &&
    appCss.includes('.bg-blur-preview__value') &&
    !appCss.includes('.bg-blur-preview__group') &&
    !appCss.includes('.bg-blur-preview__stage'),
  'App.css must include scoped BgBlur detail-page preview styles.',
)
assert.ok(
  sampleBlock.includes('position: relative;') &&
    sampleBlock.includes('overflow: hidden;') &&
    sampleBlock.includes('isolation: isolate;'),
  'BgBlur preview samples must create a stable backdrop clipping context.',
)
assert.ok(
  overlayBlock.includes('inset: 16px 20px;') &&
    overlayBlock.includes('border: 1px solid var(--color-border);') &&
    !overlayBlock.includes('background: rgb(255 255 255 / 0.34);'),
  'BgBlur preview overlay must use the real utility background instead of a hard-coded demo background.',
)

assert.ok(registryItem, 'registry.json must include the bg-blur registry item.')
assert.deepEqual(
  standaloneRegistryItem,
  registryItem,
  'registry/bg-blur.json must match registry.json payload.',
)
assert.deepEqual(
  registryItem.files.map((file) => file.path),
  ['src/components/bg-blur.ts', 'src/components/bg-blur.css'],
  'bg-blur registry item must ship the tone map and utility stylesheet.',
)
assert.ok(
  !rootRegistry.items.some((item) => item.name === 'blur') &&
    !existsSync(join(root, 'registry/blur.json')),
  'registry must drop the old blur item when BgBlur replaces it.',
)
