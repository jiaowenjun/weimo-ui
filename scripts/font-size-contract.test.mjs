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
  ['2xs', '--font-size-2xs', 'font-size--2xs', '10px'],
  ['xs', '--font-size-xs', 'font-size--xs', '12px'],
  ['sm', '--font-size-sm', 'font-size--sm', '13px'],
  ['md', '--font-size-md', 'font-size--md', '14px'],
  ['base', '--font-size-base', 'font-size--base', '16px'],
  ['lg', '--font-size-lg', 'font-size--lg', '17px'],
  ['xl', '--font-size-xl', 'font-size--xl', '18px'],
  ['stat', '--font-size-stat', 'font-size--stat', '28px'],
]

const packageJson = readJson('package.json')
const fontSizeSource = readProjectFile('src/components/font-size.ts')
const fontSizeCss = readProjectFile('src/components/font-size.css')
const cossCardCss = readProjectFile('src/components/coss/card.css')
const tokensCss = readProjectFile('src/styles/tokens.css')
const manifestSource = readProjectFile('src/docs/components-manifest.ts')
const definitionsIndexSource = readProjectFile('src/docs/component-definitions/index.ts')
const docsDefinitionSource = readProjectFile('src/docs/component-definitions/font-size.tsx')
const appCss = readProjectFile('src/App.css')
const rootRegistry = readJson('registry.json')
const styleRegistry = readJson('registry/style.json')
const standaloneRegistryItem = readJson('registry/font-size.json')
const rootStyleItem = rootRegistry.items.find((item) => item.name === 'style')
const registryItem = rootRegistry.items.find((item) => item.name === 'font-size')
const sampleBlock = blockFor(appCss, '.font-size-preview__sample')

assert.equal(
  packageJson.exports?.['./components/font-size'],
  './src/components/font-size.ts',
  'package.json must expose the public font-size scale map.',
)
assert.equal(
  packageJson.exports?.['./styles/font-size.css'],
  './src/components/font-size.css',
  'package.json must expose the standalone font-size utility stylesheet.',
)
assert.ok(
  packageJson.scripts?.test?.includes('scripts/font-size-contract.test.mjs'),
  'package.json test script must run font-size-contract.test.mjs.',
)

assert.ok(
  fontSizeSource.includes("import './font-size.css'"),
  'font-size module must import its utility stylesheet.',
)
for (const snippet of [
  'export const fontSizeScaleMap',
  'export const fontSizeScales',
  'export type FontSizeScale',
  'export function getFontSizeClassName',
  'export function getFontSizeToken',
  'export function getFontSizeValue',
]) {
  assert.ok(fontSizeSource.includes(snippet), `font-size module must include ${snippet}.`)
}

for (const [scale, token, className, value] of expectedScales) {
  assert.ok(
    (fontSizeSource.includes(`${scale}: {`) || fontSizeSource.includes(`'${scale}': {`)) &&
      fontSizeSource.includes(`token: '${token}'`) &&
      fontSizeSource.includes(`value: '${value}'`) &&
      fontSizeSource.includes(`className: '${className}'`),
    `fontSizeScaleMap must include ${scale} -> ${token} -> ${className} -> ${value}.`,
  )

  assert.ok(
    fontSizeCss.includes(`.${className}`) && fontSizeCss.includes(`font-size: var(${token});`),
    `font-size.css must define ${className} using ${token}.`,
  )

  const tokenName = token.slice(2)
  assert.ok(tokensCss.includes(`${token}: ${value};`), `shared UI tokens must define ${token}: ${value}.`)
  assert.equal(
    styleRegistry.cssVars.light[tokenName],
    value,
    `registry/style.json light cssVars must export ${token}.`,
  )
  assert.equal(
    rootStyleItem?.cssVars.light[tokenName],
    value,
    `registry.json style item light cssVars must export ${token}.`,
  )
}

assert.ok(
  !fontSizeSource.includes('font-size-display') &&
    !fontSizeSource.includes('font-size--display') &&
    !fontSizeCss.includes('font-size--display') &&
    !fontSizeCss.includes('--font-size-display') &&
    !tokensCss.includes('--font-size-display') &&
    !Object.hasOwn(styleRegistry.cssVars.light, 'font-size-display') &&
    rootStyleItem &&
    !Object.hasOwn(rootStyleItem.cssVars.light, 'font-size-display'),
  '--font-size-display must be removed from the public font-size token scale and registry mirrors.',
)
assert.ok(
  !fontSizeSource.includes('font-size-2xl') &&
    !fontSizeSource.includes('font-size--2xl') &&
    !fontSizeCss.includes('font-size--2xl') &&
    !fontSizeCss.includes('--font-size-2xl') &&
    !tokensCss.includes('--font-size-2xl') &&
    !Object.hasOwn(styleRegistry.cssVars.light, 'font-size-2xl') &&
    rootStyleItem &&
    !Object.hasOwn(rootStyleItem.cssVars.light, 'font-size-2xl'),
  '--font-size-2xl must be removed from the public font-size token scale and registry mirrors.',
)
assert.ok(
  cossCardCss.includes('font-size: var(--font-size-stat);') &&
    !cossCardCss.includes('font-size: var(--font-size-display);'),
  'CardFrameTitle must merge the old display size into --font-size-stat.',
)

assert.deepEqual(rootStyleItem, styleRegistry, 'registry.json style item must match registry/style.json.')

assert.ok(
  manifestSource.includes("id: 'font-size'") &&
    manifestSource.includes("name: '文字'") &&
    manifestSource.includes("registryName: 'font-size'") &&
    manifestSource.includes("packageExport: './components/font-size'") &&
    manifestSource.includes("group: 'token-style'"),
  'component manifest must list FontSize as a public registry-backed token utility.',
)
assert.ok(
  definitionsIndexSource.includes("import { fontSizeDefinition } from './font-size'") &&
    definitionsIndexSource.includes("'font-size': fontSizeDefinition"),
  'component definitions index must wire the FontSize detail definition.',
)
assert.ok(
  docsDefinitionSource.includes("id: 'font-size'") &&
    docsDefinitionSource.includes("frame: 'plain',") &&
    docsDefinitionSource.includes("import { TokenPreviewCard } from '../../components/token-preview-card'") &&
    docsDefinitionSource.includes("from '../../components/text-color'") &&
    docsDefinitionSource.includes('<h2 className="token-preview-card-demo__category">字色</h2>') &&
    docsDefinitionSource.includes('<h2 className="token-preview-card-demo__category">字号</h2>') &&
    docsDefinitionSource.includes('<h2 className="token-preview-card-demo__category">字体</h2>') &&
    docsDefinitionSource.includes('fontFamilyTokens.map') &&
    docsDefinitionSource.includes("'--font-sans'") &&
    docsDefinitionSource.includes("'--font-mono'") &&
    !docsDefinitionSource.includes("'--font-print'") &&
    docsDefinitionSource.includes('typography-preview__sample') &&
    docsDefinitionSource.includes('textColorToneMap[tone]') &&
    docsDefinitionSource.includes('getTextColorClassName(tone)') &&
    docsDefinitionSource.includes('fontSizeScales.map') &&
    docsDefinitionSource.includes('fontSizeScaleMap[scale]') &&
    docsDefinitionSource.includes('getFontSizeClassName(scale)') &&
    docsDefinitionSource.includes('getFontSizeToken(scale)') &&
    docsDefinitionSource.includes('getFontSizeValue(scale)') &&
    docsDefinitionSource.includes('<TokenPreviewCard') &&
    docsDefinitionSource.includes('label={item.label}') &&
    docsDefinitionSource.includes('token={getFontSizeToken(scale)}') &&
    docsDefinitionSource.includes('value={getFontSizeValue(scale)}') &&
    docsDefinitionSource.includes('font-size-preview__sample') &&
    !docsDefinitionSource.includes('<TokenPreviewDetails') &&
    !docsDefinitionSource.includes('summary:') &&
    !docsDefinitionSource.includes('font-size-preview__row') &&
    !docsDefinitionSource.includes('font-size-preview__description'),
  'Font docs definition must group TextColor, FontSize, and FontFamily TokenPreviewCards.',
)

assert.ok(
  appCss.includes('.typography-preview__sample--font-sans') &&
    appCss.includes('.typography-preview__sample--font-mono') &&
    !appCss.includes('.typography-preview__sample--font-print'),
  'App.css must style FontFamily preview samples through the shared font tokens.',
)

assert.ok(
  appCss.includes('.font-size-preview__sample') &&
    !appCss.includes('.font-size-preview__row') &&
    !appCss.includes('.font-size-preview__identity') &&
    !appCss.includes('.font-size-preview__description') &&
    !appCss.includes('.font-size-preview__value'),
  'App.css must include only the FontSize-specific preview-effect styles.',
)
assert.ok(
  sampleBlock.includes('font-family: var(--font-sans);') &&
    sampleBlock.includes('overflow-wrap: anywhere;') &&
    sampleBlock.includes('align-items: center;') &&
    sampleBlock.includes('justify-content: center;') &&
    sampleBlock.includes('text-align: center;'),
  'FontSize preview samples must render centered text with shared font family and safe wrapping.',
)

assert.ok(registryItem, 'registry.json must include the font-size registry item.')
assert.deepEqual(
  standaloneRegistryItem,
  registryItem,
  'registry/font-size.json must match registry.json payload.',
)
assert.deepEqual(
  registryItem.files.map((file) => file.path),
  [
    'src/components/font-size.ts',
    'src/components/font-size.css',
  ],
  'font-size registry item must ship the scale map and utility stylesheet.',
)
assert.deepEqual(
  registryItem.registryDependencies,
  ['@weimo/style'],
  'font-size registry item must depend only on shared style tokens.',
)

const registryContractSource = readProjectFile('scripts/registry-contract.test.mjs')
const registrySmokeSource = readProjectFile('scripts/registry-smoke.test.mjs')

assert.ok(
  registryContractSource.includes("'font-size'"),
  'registry contract must promote font-size as a public registry item.',
)
assert.ok(
  registrySmokeSource.includes('@weimo/font-size') &&
    registrySmokeSource.includes('fontSizeScales') &&
    registrySmokeSource.includes('getFontSizeClassName') &&
    registrySmokeSource.includes('font-size.json') &&
    registrySmokeSource.includes('font-size.css'),
  'registry smoke test must install and typecheck FontSize utilities.',
)
