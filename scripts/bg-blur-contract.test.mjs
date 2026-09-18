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
const docsDefinitionSource = readProjectFile('src/docs/component-definitions/bg-color.tsx')
const appCss = readProjectFile('src/App.css')
const tokenPreviewCardCss = readProjectFile('src/components/token-preview-card.css')
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
const sampleBlock = blockFor(
  tokenPreviewCardCss,
  '.token-preview-card > .token-preview-card__meta ~ *',
)
const backdropBlock = blockFor(
  tokenPreviewCardCss,
  '.token-preview-card .token-preview-card__surface-backdrop',
)
const surfaceBlock = blockFor(
  tokenPreviewCardCss,
  '.token-preview-card .token-preview-card__surface',
)

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
  tokensCss.includes('--color-bg-backdrop: hsl(214.3 33.3% 4.1% / 0.32);') &&
    tokensCss.includes('--backdrop-blur: 4px;'),
  'shared UI tokens must define the backdrop background and blur pair.',
)
assert.equal(
  styleRegistry.cssVars?.light?.['color-bg-backdrop'],
  'hsl(214.3 33.3% 4.1% / 0.32)',
  'registry/style.json must export the light --color-bg-backdrop value.',
)
assert.equal(
  rootStyleItem?.cssVars?.light?.['color-bg-backdrop'],
  'hsl(214.3 33.3% 4.1% / 0.32)',
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
    manifestSource.includes("name: '背景模糊度'") &&
    manifestSource.includes("registryName: 'bg-blur'") &&
    manifestSource.includes("packageExport: './components/bg-blur'") &&
    /id: 'bg-blur',[\s\S]*?docs: false,/.test(manifestSource) &&
    !manifestSource.includes("id: 'blur'") &&
    !manifestSource.includes("name: 'Blur'"),
  'component manifest must list BgBlur as the public registry-backed utility and remove Blur.',
)
assert.ok(
  !definitionsIndexSource.includes("from './bg-blur'") &&
    !definitionsIndexSource.includes('bgBlurDefinition') &&
    !existsSync(join(root, 'src/docs/component-definitions/bg-blur.tsx')) &&
    !definitionsIndexSource.includes("from './blur'") &&
    !definitionsIndexSource.includes("'blur':"),
  'component definitions index must remove the merged BgBlur detail page and old Blur alias.',
)
assert.ok(
  docsDefinitionSource.includes("id: 'bg-color'") &&
    docsDefinitionSource.includes("frame: 'plain',") &&
    docsDefinitionSource.includes("import { TokenPreviewCard } from '../../components/token-preview-card'") &&
    docsDefinitionSource.includes('bgBlurTones.map') &&
    docsDefinitionSource.includes('bgBlurToneMap[tone]') &&
    docsDefinitionSource.includes('getBgBlurClassName(tone)') &&
    docsDefinitionSource.includes('getBgBlurBlurToken(tone)') &&
    docsDefinitionSource.includes('getBgBlurBlurValue(tone)') &&
    docsDefinitionSource.includes('<TokenPreviewCard') &&
    docsDefinitionSource.includes('label={item.label}') &&
    docsDefinitionSource.includes('token={getBgBlurBlurToken(tone)}') &&
    docsDefinitionSource.includes('value={getBgBlurBlurValue(tone)}') &&
    docsDefinitionSource.includes('token-preview-card__surface-preview') &&
    docsDefinitionSource.includes('token-preview-card__surface-backdrop') &&
    docsDefinitionSource.includes('token-preview-card__surface') &&
    docsDefinitionSource.includes('<h2 className="token-preview-card-demo__category">背景模糊度</h2>') &&
    !docsDefinitionSource.includes('bg-blur-preview__group') &&
    !docsDefinitionSource.includes('bg-blur-preview__stage') &&
    !docsDefinitionSource.includes('summary:'),
  'Background docs definition must render the BgBlur group from the shared tone map.',
)
assert.ok(
  !docsDefinitionSource.includes('<span>text</span>') && !docsDefinitionSource.includes('>text<'),
  'BgBlur docs preview overlay must not render sample text inside the background-only swatch.',
)
assert.ok(
  !docsDefinitionSource.includes('<TokenPreviewDetails') &&
    !docsDefinitionSource.includes('description={item.description}') &&
    !docsDefinitionSource.includes('uiUsage={item.uiUsage}') &&
    !docsDefinitionSource.includes('bijiUsage={item.bijiUsage}') &&
    docsDefinitionSource.includes('item.backgroundToken') &&
    !docsDefinitionSource.includes('getBgBlurBackgroundToken') &&
    !docsDefinitionSource.includes('getBgBlurFilter'),
  'BgBlur docs preview must index background-token metadata without rendering redundant prose.',
)

assert.ok(
  !appCss.includes('.bg-blur-preview__') &&
    !appCss.includes(".app-shell__content--token-grid[data-component-id='bg-blur']") &&
    !appCss.includes('.bg-blur-preview__group') &&
    !appCss.includes('.bg-blur-preview__stage'),
  'BgBlur must use the shared token grid without page-specific preview or layout overrides.',
)
assert.ok(
  sampleBlock.includes('position: relative;') &&
    sampleBlock.includes('overflow: hidden;') &&
    sampleBlock.includes('isolation: isolate;'),
  'TokenPreviewCard must provide the stable preview clipping context used by BgBlur.',
)
assert.ok(
  backdropBlock.includes('position: absolute;') &&
    backdropBlock.includes('inset: -16px;') &&
    backdropBlock.includes('hsl(18.1 71.9% 46.1% / 0.72)') &&
    !backdropBlock.includes('rgb(') &&
    surfaceBlock.includes('inset: 10px 12px;') &&
    surfaceBlock.includes('border: 1px solid var(--color-border);') &&
    surfaceBlock.includes('border-radius: var(--radius-sm);') &&
    !surfaceBlock.includes('background:'),
  'TokenPreviewCard must own the shared backdrop and surface presentation used by BgBlur.',
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
