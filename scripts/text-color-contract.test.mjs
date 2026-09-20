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

function blockFor(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const matches = Array.from(source.matchAll(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, 'g')))
  const match = matches.at(-1)

  assert.ok(match, `${selector} block must exist.`)

  return match[1]
}

function readJson(relativePath) {
  return JSON.parse(readProjectFile(relativePath))
}

const expectedTones = [
  ['primary', '--color-text-primary', 'text-color--primary', 'hsl(0 0% 9%)', 'hsl(0 0% 98%)'],
  ['secondary', '--color-text-secondary', 'text-color--secondary', 'hsl(0 0% 28%)', 'hsl(0 0% 64%)'],
  ['subtle', '--color-text-subtle', 'text-color--subtle', 'hsl(0 0% 48%)', 'hsl(0 0% 49%)'],
  ['placeholder', '--color-text-placeholder', 'text-color--placeholder', 'hsl(0 0% 74%)', 'hsl(0 0% 35%)'],
  ['disable', '--color-text-disable', 'text-color--disable', 'hsl(0 0% 56%)', 'hsl(0 0% 42%)'],
  ['danger', '--color-text-danger', 'text-color--danger', 'hsl(4 77% 40%)', 'hsl(7 100% 74%)'],
  ['inherit', 'inherit', 'text-color--inherit', 'inherit', 'inherit'],
]

const expectedBackgroundAwareDisableTokens = [
  ['color-text-disable-on-light', 'hsl(0 0% 56%)'],
  ['color-text-disable-on-dark', 'hsl(0 0% 62%)'],
]

const removedTones = [
  ['brand', '--color-brand', 'text-color--brand'],
  ['brand-foreground', '--color-brand-foreground', 'text-color--brand-foreground'],
  ['strong', '--color-fg-strong', 'text-color--strong'],
  ['muted', '--color-text-muted', 'text-color--muted'],
  ['muted-subtle', '--color-text-muted-subtle', 'text-color--muted-subtle'],
]

const packageJson = JSON.parse(readProjectFile('package.json'))
const textColorSource = readProjectFile('src/components/text-color.ts')
const textColorCss = readProjectFile('src/components/text-color.css')
const tokensCss = readProjectFile('src/styles/tokens.css')
const manifestSource = readProjectFile('src/docs/components-manifest.ts')
const definitionsIndexSource = readProjectFile('src/docs/component-definitions/index.ts')
const docsDefinitionSource = readProjectFile('src/docs/component-definitions/font-size.tsx')
const appCss = readProjectFile('src/App.css')
const rootRegistry = readJson('registry.json')
const styleRegistry = readJson('registry/style.json')
const standaloneRegistryItem = readJson('registry/text-color.json')
const rootStyleItem = rootRegistry.items.find((item) => item.name === 'style')
const registryItem = rootRegistry.items.find((item) => item.name === 'text-color')
const sampleBlock = blockFor(appCss, '.text-color-preview__sample')

assert.equal(
  packageJson.exports?.['./components/text-color'],
  './src/components/text-color.ts',
  'package.json must expose the public text-color tone map.',
)
assert.equal(
  packageJson.exports?.['./styles/text-color.css'],
  './src/components/text-color.css',
  'package.json must expose the standalone text-color utility stylesheet.',
)
assert.ok(
  packageJson.scripts?.test?.includes('scripts/text-color-contract.test.mjs'),
  'package.json test script must run text-color-contract.test.mjs.',
)

assert.ok(
  textColorSource.includes("import './text-color.css'"),
  'text-color tone map module must import its utility stylesheet.',
)
assert.ok(
  textColorSource.includes('export const textColorToneMap'),
  'text-color module must export textColorToneMap.',
)
assert.ok(
  textColorSource.includes('export const textColorTones'),
  'text-color module must export ordered textColorTones.',
)
assert.ok(
  textColorSource.includes('export type TextColorTone'),
  'text-color module must export TextColorTone.',
)
assert.ok(
  textColorSource.includes('export function getTextColorClassName'),
  'text-color module must export getTextColorClassName.',
)

for (const [tone, token, className, lightValue, darkValue] of expectedTones) {
  assert.ok(
    (textColorSource.includes(`${tone}: {`) || textColorSource.includes(`'${tone}': {`)) &&
      textColorSource.includes(`token: '${token}'`) &&
      textColorSource.includes(`light: '${lightValue}'`) &&
      textColorSource.includes(`dark: '${darkValue}'`) &&
      textColorSource.includes(`className: '${className}'`),
    `textColorToneMap must include ${tone} -> ${token} -> ${className} with light/dark values.`,
  )

  assert.ok(
    textColorCss.includes(`.${className}`) &&
      textColorCss.includes(`color: ${token === 'inherit' ? 'inherit' : `var(${token})`};`),
    `text-color.css must define ${className} using ${token}.`,
  )

  if (token !== 'inherit') {
    const tokenName = token.slice(2)

    assert.ok(
      tokensCss.includes(`${token}: ${lightValue};`),
      `tokens.css must define light ${token} with a concrete value.`,
    )
    assert.ok(
      tokensCss.includes(`${token}: ${darkValue};`),
      `tokens.css must define dark ${token} with a concrete value.`,
    )
    assert.equal(
      styleRegistry.cssVars.light[tokenName],
      lightValue,
      `registry/style.json must mirror the light ${token} value.`,
    )
    assert.equal(
      styleRegistry.cssVars.dark[tokenName],
      darkValue,
      `registry/style.json must mirror the dark ${token} value.`,
    )
    assert.equal(
      rootStyleItem?.cssVars.light[tokenName],
      lightValue,
      `registry.json style item must mirror the light ${token} value.`,
    )
    assert.equal(
      rootStyleItem?.cssVars.dark[tokenName],
      darkValue,
      `registry.json style item must mirror the dark ${token} value.`,
    )
  }

  if (tone === 'subtle' || tone === 'placeholder') {
    assert.ok(
      !lightValue.includes('/') && !darkValue.includes('/') &&
        !lightValue.includes('rgba(') && !darkValue.includes('rgba('),
      `${tone} text token must use an opaque color value.`,
    )
  }
}

for (const [tokenName, tokenValue] of expectedBackgroundAwareDisableTokens) {
  assert.ok(
    tokensCss.includes(`--${tokenName}: ${tokenValue};`),
    `tokens.css must define --${tokenName} with a concrete background-aware disabled text value.`,
  )
  assert.equal(
    styleRegistry.cssVars.light[tokenName],
    tokenValue,
    `registry/style.json must mirror the light --${tokenName} value.`,
  )
  assert.equal(
    styleRegistry.cssVars.dark[tokenName],
    tokenValue,
    `registry/style.json must mirror the dark --${tokenName} value.`,
  )
  assert.equal(
    rootStyleItem?.cssVars.light[tokenName],
    tokenValue,
    `registry.json style item must mirror the light --${tokenName} value.`,
  )
  assert.equal(
    rootStyleItem?.cssVars.dark[tokenName],
    tokenValue,
    `registry.json style item must mirror the dark --${tokenName} value.`,
  )
  assert.ok(
    !tokenValue.includes('/') && !tokenValue.includes('rgba('),
    `--${tokenName} must use an opaque color value.`,
  )
}

assert.deepEqual(rootStyleItem, styleRegistry, 'registry.json style item must match registry/style.json.')
for (const indirectTextValue of [
  ['color-text-primary', 'hsl(var(--foreground))'],
  ['color-text-secondary', 'hsl(var(--muted-foreground))'],
  ['color-text-subtle', 'hsl(var(--muted-foreground) / 0.72)'],
]) {
  assert.ok(
    !tokensCss.includes(`--${indirectTextValue[0]}: ${indirectTextValue[1]};`) &&
      styleRegistry.cssVars.light[indirectTextValue[0]] !== indirectTextValue[1] &&
      styleRegistry.cssVars.dark[indirectTextValue[0]] !== indirectTextValue[1] &&
      rootStyleItem &&
      rootStyleItem.cssVars.light[indirectTextValue[0]] !== indirectTextValue[1] &&
      rootStyleItem.cssVars.dark[indirectTextValue[0]] !== indirectTextValue[1],
    `TextColor tokens must not use indirect value ${indirectTextValue[1]} for --${indirectTextValue[0]}.`,
  )
}

for (const [tone, token, className] of removedTones) {
  assert.ok(
    !textColorSource.includes(`${tone}: {`) &&
      !textColorSource.includes(`'${tone}': {`) &&
      !textColorSource.includes(`token: '${token}'`) &&
      !textColorSource.includes(`className: '${className}'`),
    `textColorToneMap must not expose removed ${tone} tone.`,
  )
  assert.ok(
    !textColorCss.includes(`.${className}`),
    `text-color.css must not define removed ${className} utility.`,
  )
}

assert.ok(
  manifestSource.includes("id: 'text-color'") &&
    manifestSource.includes("name: '字色'") &&
    manifestSource.includes("registryName: 'text-color'") &&
    manifestSource.includes("packageExport: './components/text-color'") &&
    /id: 'text-color',[\s\S]*?docs: false,/.test(manifestSource),
  'component manifest must list TextColor as a public registry-backed utility.',
)
assert.ok(
  !definitionsIndexSource.includes("from './text-color'") &&
    !definitionsIndexSource.includes('textColorDefinition') &&
    !existsSync(join(root, 'src/docs/component-definitions/text-color.tsx')),
  'component definitions index must not expose a separate TextColor detail page.',
)
assert.ok(
  docsDefinitionSource.includes("id: 'font-size'") &&
    docsDefinitionSource.includes("frame: 'plain',") &&
    docsDefinitionSource.includes("import { TokenPreviewCard } from '../../components/token-preview-card'") &&
    docsDefinitionSource.includes('const previewTextColorTones = textColorTones.filter((tone) => tone !== \'inherit\')') &&
    docsDefinitionSource.includes('textColorToneMap[tone]') &&
    docsDefinitionSource.includes('function FontPreview()') &&
    docsDefinitionSource.includes('orderedTextColorTones.map') &&
    docsDefinitionSource.includes("from '../token-preview-color'") &&
    docsDefinitionSource.includes('useIsDarkTheme()') &&
    docsDefinitionSource.includes('sortByThemeLightness(') &&
    docsDefinitionSource.includes('getTextColorClassName(tone)') &&
    docsDefinitionSource.includes('getTextColorToken(tone)') &&
    docsDefinitionSource.includes('<TokenPreviewCard') &&
    docsDefinitionSource.includes('darkValue={item.value.dark}') &&
    docsDefinitionSource.includes('label={item.label}') &&
    docsDefinitionSource.includes('token={getTextColorToken(tone)}') &&
    docsDefinitionSource.includes('value={item.value.light}') &&
    docsDefinitionSource.includes('text-color-preview__sample') &&
    docsDefinitionSource.includes('<h2 className="token-preview-card-demo__category">字色</h2>') &&
    docsDefinitionSource.includes('<h2 className="token-preview-card-demo__category">字号</h2>') &&
    !docsDefinitionSource.includes('<TokenPreviewDetails') &&
    !docsDefinitionSource.includes('summary:') &&
    !docsDefinitionSource.includes('text-color-preview__row') &&
    !docsDefinitionSource.includes('text-color-preview__description'),
  'Font docs definition must render the TextColor tone group with concrete token values.',
)
assert.ok(
  appCss.includes('.text-color-preview__sample') &&
    !appCss.includes('.text-color-preview__row') &&
    !appCss.includes('.text-color-preview__identity') &&
    !appCss.includes('.text-color-preview__description') &&
    !appCss.includes('.text-color-preview__value'),
  'App.css must include only the TextColor-specific preview-effect styles.',
)
assert.ok(
  sampleBlock.includes('align-items: center;') &&
    sampleBlock.includes('justify-content: center;') &&
    sampleBlock.includes('text-align: center;'),
  'TextColor preview samples must center their text in both axes.',
)
assert.ok(
  !appCss.includes('grid-template-columns: minmax(112px, 0.8fr) minmax(180px, 1.4fr) minmax(150px, 0.9fr) minmax(180px, 1.2fr);'),
  'TextColor detail preview must not keep a separate token column.',
)

assert.ok(registryItem, 'registry.json must include the text-color registry item.')
assert.deepEqual(
  standaloneRegistryItem,
  registryItem,
  'registry/text-color.json must match registry.json payload.',
)
assert.deepEqual(
  registryItem.files.map((file) => file.path),
  [
    'src/components/text-color.ts',
    'src/components/text-color.css',
  ],
  'text-color registry item must ship the tone map and utility stylesheet.',
)
