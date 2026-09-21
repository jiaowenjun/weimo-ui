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

const expectedScales = [
  ['xs', '--radius-xs', '4px'],
  ['sm', '--radius-sm', '8px'],
  ['base', '--radius', '16px'],
  ['round', '--radius-round', '999px'],
]
const expectedScaleOrder = expectedScales.map(([scale]) => scale)

const packageJson = readJson('package.json')
const borderRadiusSource = readProjectFile('src/components/border-radius.ts')
const menuCss = readProjectFile('src/components/menu.css')
const manifestSource = readProjectFile('src/docs/components-manifest.ts')
const definitionsIndexSource = readProjectFile('src/docs/component-definitions/index.ts')
const docsDefinitionSource = readProjectFile('src/docs/component-definitions/border-color.tsx')
const appCss = readProjectFile('src/App.css')
const tokensCss = readProjectFile('src/styles/tokens.css')
const rootRegistry = readJson('registry.json')
const styleRegistry = readJson('registry/style.json')
const standaloneRegistryItem = readJson('registry/border-radius.json')
const rootStyleItem = rootRegistry.items.find((item) => item.name === 'style')
const registryItem = rootRegistry.items.find((item) => item.name === 'border-radius')

assert.equal(
  packageJson.exports?.['./components/border-radius'],
  './src/components/border-radius.ts',
  'package.json must expose the public border-radius scale map.',
)
assert.ok(
  packageJson.scripts?.test?.includes('scripts/border-radius-contract.test.mjs'),
  'package.json test script must run border-radius-contract.test.mjs.',
)

assert.ok(
  borderRadiusSource.includes('export const borderRadiusScaleMap'),
  'border-radius module must export borderRadiusScaleMap.',
)
assert.ok(
  borderRadiusSource.includes('export const borderRadiusScales'),
  'border-radius module must export ordered borderRadiusScales.',
)
assert.ok(
  borderRadiusSource.includes(`export const borderRadiusScales: BorderRadiusScale[] = [${expectedScaleOrder.map((scale) => `'${scale}'`).join(', ')}]`),
  'borderRadiusScales must list radii from smallest to largest.',
)
assert.ok(
  borderRadiusSource.includes('export type BorderRadiusScale'),
  'border-radius module must export BorderRadiusScale.',
)
assert.ok(
  borderRadiusSource.includes('export function getBorderRadiusToken'),
  'border-radius module must export getBorderRadiusToken.',
)
assert.ok(
  borderRadiusSource.includes('export function getBorderRadiusValue'),
  'border-radius module must export getBorderRadiusValue.',
)

for (const [scale, token, value] of expectedScales) {
  assert.ok(
    (borderRadiusSource.includes(`${scale}: {`) || borderRadiusSource.includes(`'${scale}': {`)) &&
      borderRadiusSource.includes(`token: '${token}'`) &&
      borderRadiusSource.includes(`value: '${value}'`),
    `borderRadiusScaleMap must include ${scale} -> ${token} -> ${value}.`,
  )

  assert.ok(
    tokensCss.includes(`${token}: ${value};`),
    `shared UI tokens must define ${token}: ${value}.`,
  )

  assert.equal(
    styleRegistry.cssVars.light[token.slice(2)],
    value,
    `registry/style.json light cssVars must export ${token}.`,
  )
  assert.equal(
    rootStyleItem.cssVars.light[token.slice(2)],
    value,
    `registry.json style item light cssVars must export ${token}.`,
  )
}

assert.ok(
  !borderRadiusSource.includes('--radius-card') &&
    !borderRadiusSource.includes('card: {') &&
    !tokensCss.includes('--radius-card') &&
    !JSON.stringify(styleRegistry.cssVars).includes('radius-card') &&
    !JSON.stringify(rootStyleItem.cssVars).includes('radius-card'),
  '--radius-card must be merged into --radius and removed from the public radius token scale.',
)

assert.ok(
  !borderRadiusSource.includes('--radius-lg') &&
    !borderRadiusSource.includes('lg: {') &&
    !tokensCss.includes('--radius-lg') &&
    !JSON.stringify(styleRegistry.cssVars).includes('radius-lg') &&
    !JSON.stringify(rootStyleItem.cssVars).includes('radius-lg') &&
    !docsDefinitionSource.includes('--radius-lg'),
  '--radius-lg must be merged into --radius and removed from the public radius token scale.',
)

const menuPopupBlock = blockFor(menuCss, '.weimo-menu__popup')

assert.ok(
  menuPopupBlock.includes('border-radius: var(--radius);') &&
    !menuPopupBlock.includes('var(--radius-lg)'),
  'Menu popup must use the unified --radius token.',
)

assert.deepEqual(rootStyleItem, styleRegistry, 'Root registry style item must match registry/style.json.')

assert.ok(
  manifestSource.includes("id: 'border-radius'") &&
    manifestSource.includes("name: '边框圆角'") &&
    manifestSource.includes("registryName: 'border-radius'") &&
    manifestSource.includes("packageExport: './components/border-radius'") &&
    /id: 'border-radius',[\s\S]*?docs: false,/.test(manifestSource),
  'component manifest must list BorderRadius as a public registry-backed design-token utility.',
)
assert.ok(
  !definitionsIndexSource.includes("from './border-radius'") &&
    !definitionsIndexSource.includes('borderRadiusDefinition') &&
    !existsSync(join(root, 'src/docs/component-definitions/border-radius.tsx')),
  'component definitions index must not expose a separate BorderRadius detail page.',
)
assert.ok(
  docsDefinitionSource.includes("id: 'border-color'") &&
    docsDefinitionSource.includes("frame: 'plain',") &&
    docsDefinitionSource.includes("import { TokenPreviewCard } from '../../components/token-preview-card'") &&
    docsDefinitionSource.includes('borderRadiusScales.map') &&
    docsDefinitionSource.includes('borderRadiusScaleMap[scale]') &&
    docsDefinitionSource.includes('getBorderRadiusToken(scale)') &&
    docsDefinitionSource.includes('getBorderRadiusValue(scale)') &&
    docsDefinitionSource.includes('<TokenPreviewCard') &&
    docsDefinitionSource.includes('items={borderRadiusScales.map((scale) => ({') &&
    docsDefinitionSource.includes('token: getBorderRadiusToken(scale),') &&
    docsDefinitionSource.includes('value: getBorderRadiusValue(scale),') &&
    docsDefinitionSource.includes('label="圆角"') &&
    docsDefinitionSource.includes('border-radius-preview__samples') &&
    docsDefinitionSource.includes('border-radius-preview__sample') &&
    !docsDefinitionSource.includes('token-preview-card-demo__category') &&
    !docsDefinitionSource.includes('<TokenPreviewDetails') &&
    !docsDefinitionSource.includes('summary:') &&
    !docsDefinitionSource.includes('border-radius-preview__row') &&
    !docsDefinitionSource.includes('border-radius-preview__notes') &&
    !docsDefinitionSource.includes('border-radius-preview__description') &&
    !docsDefinitionSource.includes('--radius-card'),
  'Border docs definition must render the BorderRadius group with TokenPreviewCard.',
)

const sampleBlock = blockFor(appCss, '.border-radius-preview__sample')

assert.ok(
  appCss.includes('.border-radius-preview__samples') &&
    appCss.includes('.border-radius-preview__sample') &&
    !appCss.includes('.border-radius-preview__row') &&
    !appCss.includes('.border-radius-preview__notes') &&
    !appCss.includes('.border-radius-preview__identity') &&
    !appCss.includes('.border-radius-preview__description') &&
    !appCss.includes('.border-radius-preview__value'),
  'App.css must include only the BorderRadius-specific preview-effect styles.',
)
assert.ok(
  sampleBlock.includes('width: 48px;') &&
    sampleBlock.includes('height: 48px;') &&
    sampleBlock.includes('border: 2px solid var(--color-border-emphasis);') &&
    !sampleBlock.includes('background:') &&
    !sampleBlock.includes('box-shadow:'),
  'BorderRadius preview samples must stay height-aligned with the BorderColor preview samples (48px squares).',
)

assert.ok(registryItem, 'registry.json must include the border-radius registry item.')
assert.deepEqual(
  standaloneRegistryItem,
  registryItem,
  'registry/border-radius.json must match registry.json payload.',
)
assert.deepEqual(
  registryItem.files.map((file) => file.path),
  ['src/components/border-radius.ts'],
  'border-radius registry item must ship the scale map.',
)

assert.ok(
  !appCss.includes('border-radius: 1rem;') && !readProjectFile('src/index.css').includes('border-radius: 5px;'),
  'weimo-ui runtime CSS must not keep hard-coded radius values that match shared radius tokens.',
)
