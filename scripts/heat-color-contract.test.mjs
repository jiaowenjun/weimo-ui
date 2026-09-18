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

function cssBlockFor(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))

  assert.ok(match, `${selector} block must exist.`)

  return match[1]
}

const expectedLevels = [
  [0, '--color-heat-0', 'heat-color--0', 'hsl(0 0% 0% / 0.06)', 'hsl(0 0% 100% / 0.08)'],
  [1, '--color-heat-1', 'heat-color--1', 'hsl(18.1 71.9% 46.1% / 0.2)', 'hsl(22.6 85% 60.8% / 0.2)'],
  [2, '--color-heat-2', 'heat-color--2', 'hsl(18.1 71.9% 46.1% / 0.4)', 'hsl(22.6 85% 60.8% / 0.4)'],
  [3, '--color-heat-3', 'heat-color--3', 'hsl(18.1 71.9% 46.1% / 0.65)', 'hsl(22.6 85% 60.8% / 0.65)'],
  [4, '--color-heat-4', 'heat-color--4', 'hsl(18.1 71.9% 46.1% / 0.9)', 'hsl(22.6 85% 60.8% / 0.9)'],
]

const packageJson = readJson('package.json')
const heatColorEntrySource = readProjectFile('src/components/heat-color.tsx')
const heatColorSource = readProjectFile('src/components/heatmap/heat-color.tsx')
const heatColorCss = readProjectFile('src/components/heat-color.css')
const heatmapCss = readProjectFile('src/components/heatmap/heatmap.css')
const heatmapSource = readProjectFile('src/components/heatmap/heatmap.tsx')
const bgColorDocsDefinitionSource = readProjectFile('src/docs/component-definitions/bg-color.tsx')
const definitionsIndexSource = readProjectFile('src/docs/component-definitions/index.ts')
const manifestSource = readProjectFile('src/docs/components-manifest.ts')
const appCss = readProjectFile('src/App.css')
const tokensCss = readProjectFile('src/styles/tokens.css')
const rootRegistry = readJson('registry.json')
const styleRegistry = readJson('registry/style.json')
const standaloneRegistryItem = readJson('registry/heat-color.json')
const heatmapRegistryItem = readJson('registry/heatmap.json')
const rootHeatColorItem = rootRegistry.items.find((item) => item.name === 'heat-color')
const rootHeatmapItem = rootRegistry.items.find((item) => item.name === 'heatmap')
const rootStyleItem = rootRegistry.items.find((item) => item.name === 'style')
const tokenGridBlock = cssBlockFor(appCss, '.app-shell__content--token-grid')
const heatColorSampleBlock = cssBlockFor(appCss, '.heat-color-preview__sample')

assert.equal(
  packageJson.exports?.['./components/heat-color'],
  './src/components/heat-color.tsx',
  'package.json must expose the public HeatColor entrypoint.',
)
assert.equal(
  packageJson.exports?.['./styles/heat-color.css'],
  './src/components/heat-color.css',
  'package.json must expose the standalone HeatColor utility stylesheet.',
)
assert.ok(
  packageJson.scripts?.test?.includes('scripts/heat-color-contract.test.mjs'),
  'package.json test script must run heat-color-contract.test.mjs.',
)

assert.ok(
  heatColorSource.includes("import '../heat-color.css'"),
  'HeatColor implementation must import the standalone utility stylesheet.',
)
assert.ok(
  heatColorSource.includes('export const heatColorMap') &&
    heatColorSource.includes('export const heatColorLevels') &&
    heatColorSource.includes('export type HeatColorLevel') &&
    heatColorSource.includes('export function getHeatColorClassName') &&
    heatColorSource.includes('export function getHeatColorToken'),
  'HeatColor module must expose its level map, ordered levels, type, and helpers.',
)
assert.ok(
  heatColorEntrySource.includes('heatColorMap') &&
    heatColorEntrySource.includes('heatColorLevels') &&
    heatColorEntrySource.includes('getHeatColorToken') &&
    heatColorEntrySource.includes('type HeatColorLevel'),
  'Standalone HeatColor entry must re-export the utility map and helpers.',
)

for (const [level, token, className, lightValue, darkValue] of expectedLevels) {
  assert.ok(
    heatColorSource.includes(`${level}: {`) &&
      heatColorSource.includes(`token: '${token}'`) &&
      heatColorSource.includes(`light: '${lightValue}'`) &&
      heatColorSource.includes(`dark: '${darkValue}'`) &&
      heatColorSource.includes(`className: '${className}'`),
    `heatColorMap must include ${level} -> ${token} -> ${className} with light/dark values.`,
  )
  assert.ok(
    heatColorCss.includes(`.${className}`) &&
      heatColorCss.includes(`background: var(${token});`),
    `heat-color.css must define ${className} using ${token}.`,
  )
  assert.ok(
    tokensCss.includes(`${token}:`) &&
      token.slice(2) in styleRegistry.cssVars.light &&
      token.slice(2) in rootStyleItem.cssVars.light,
    `shared UI tokens must define ${token}.`,
  )
  assert.equal(
    styleRegistry.cssVars.light[token.slice(2)],
    lightValue,
    `registry/style.json light cssVars must export ${token} as the concrete HeatColor value.`,
  )
  assert.equal(
    styleRegistry.cssVars.dark[token.slice(2)],
    darkValue,
    `registry/style.json dark cssVars must export ${token} as the concrete HeatColor value.`,
  )
  assert.equal(
    rootStyleItem.cssVars.light[token.slice(2)],
    styleRegistry.cssVars.light[token.slice(2)],
    `registry.json style item light cssVars must mirror ${token}.`,
  )
  assert.equal(
    rootStyleItem.cssVars.dark[token.slice(2)],
    styleRegistry.cssVars.dark[token.slice(2)],
    `registry.json style item dark cssVars must mirror ${token}.`,
  )
}

assert.ok(
  heatColorSource.includes("className={cn('heat-color__swatch', getHeatColorClassName(level))}") &&
    heatColorSource.includes('data-level={level}'),
  'HeatColor swatches must consume the shared level utility helper.',
)
assert.ok(
  heatmapSource.includes("import { getHeatColorClassName } from './heat-color'") &&
    heatmapSource.includes('getHeatColorClassName(cell.level)'),
  'Heatmap cells must consume the shared HeatColor utility helper.',
)

assert.ok(
  !heatColorSource.includes('heatmap-heat-color') &&
    !heatColorCss.includes('heatmap-heat-color') &&
    !heatmapCss.includes('heatmap-heat-color') &&
    !heatmapCss.includes('.heat-color--') &&
    !heatmapCss.includes('.heat-color'),
  'Heat color utilities must live in heat-color.css without heatmap-heat-color aliases.',
)

assert.ok(
  !existsSync(join(root, 'src/docs/component-definitions/heat-color.tsx')) &&
    !definitionsIndexSource.includes("from './heat-color'") &&
    !definitionsIndexSource.includes('heatColorDefinition') &&
    /id: 'heat-color',[\s\S]*?docs: false,/.test(manifestSource),
  'HeatColor must remain public without exposing a separate detail page.',
)
assert.ok(
  bgColorDocsDefinitionSource.includes("from '../../components/heat-color'") &&
    bgColorDocsDefinitionSource.includes('<h2 className="token-preview-card-demo__category">热力图</h2>') &&
    bgColorDocsDefinitionSource.includes('heatColorLevels.map') &&
    bgColorDocsDefinitionSource.includes('heatColorMap[level]') &&
    bgColorDocsDefinitionSource.includes('getHeatColorClassName(level)') &&
    bgColorDocsDefinitionSource.includes('getHeatColorToken(level)') &&
    bgColorDocsDefinitionSource.includes('darkValue={item.value.dark}') &&
    bgColorDocsDefinitionSource.includes('label={item.label}') &&
    bgColorDocsDefinitionSource.includes('token={getHeatColorToken(level)}') &&
    bgColorDocsDefinitionSource.includes('value={item.value.light}') &&
    bgColorDocsDefinitionSource.includes('heat-color-preview__sample') &&
    bgColorDocsDefinitionSource.includes("'HeatColor'") &&
    bgColorDocsDefinitionSource.includes("'热力图'") &&
    !bgColorDocsDefinitionSource.includes('<HeatColor'),
  'BgColor docs must render the Heatmap group as one searchable TokenPreviewCard per level.',
)
assert.ok(
  tokenGridBlock.includes('display: grid;') &&
    tokenGridBlock.includes('repeat(auto-fill, minmax(min(100%, 300px), 1fr))') &&
    !bgColorDocsDefinitionSource.includes('className="heat-color-preview"'),
  'HeatColor cards must use the content-level token grid without a preview wrapper.',
)
assert.ok(
  heatColorSampleBlock.includes('height: 80px;') &&
    heatColorSampleBlock.includes('border-radius: var(--radius-sm);') &&
    !heatColorSampleBlock.includes('border:'),
  'HeatColor preview samples must use full-width borderless color blocks.',
)

assert.ok(rootHeatColorItem, 'registry.json must include the heat-color registry item.')
assert.deepEqual(
  standaloneRegistryItem,
  rootHeatColorItem,
  'registry/heat-color.json must match registry.json payload.',
)
assert.deepEqual(
  standaloneRegistryItem.files.map((file) => file.path),
  [
    'src/components/heat-color.tsx',
    'src/components/heatmap/heat-color.tsx',
    'src/components/heatmap/heatmap-model.ts',
    'src/components/heat-color.css',
  ],
  'HeatColor registry item must ship the entry, implementation, model type, and utility stylesheet.',
)
assert.ok(
  heatmapRegistryItem.files.some((file) => file.path === 'src/components/heat-color.css') &&
    rootHeatmapItem.files.some((file) => file.path === 'src/components/heat-color.css'),
  'Heatmap registry items must ship the shared HeatColor utility stylesheet.',
)
