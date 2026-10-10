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
  [0, '--color-heat-0', 'heat-color--0', 'hsl(0 0% 94%)', 'hsl(0 0% 19%)'],
  [1, '--color-heat-1', 'heat-color--1', 'hsl(18 62% 89%)', 'hsl(23 31% 22%)'],
  [2, '--color-heat-2', 'heat-color--2', 'hsl(18 62% 78%)', 'hsl(23 42% 32%)'],
  [3, '--color-heat-3', 'heat-color--3', 'hsl(18 62% 65%)', 'hsl(23 50% 44%)'],
  [4, '--color-heat-4', 'heat-color--4', 'hsl(18 62% 52%)', 'hsl(23 68% 56%)'],
]

const packageJson = readJson('package.json')
const corePackageJson = readJson('packages/weimo-ui-core/package.json')
const statsPackageJson = readJson('packages/weimo-ui-stats/package.json')
const heatColorSource = readProjectFile('packages/weimo-ui-stats/src/components/heatmap/heat-color.tsx')
const heatColorCss = readProjectFile('packages/weimo-ui-stats/src/components/heatmap/heat-color.css')
const heatmapCss = readProjectFile('packages/weimo-ui-stats/src/components/heatmap/heatmap.css')
const heatmapSource = readProjectFile('packages/weimo-ui-stats/src/components/heatmap/heatmap.tsx')
const backgroundTokensDocsDefinitionSource = readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/background-tokens.tsx')
const statDocsDefinitionSource = readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-stats/stat.tsx')
const definitionsIndexSource = readProjectFile('packages/weimo-ui-site/src/docs/catalog/definitions.ts')
const appCss = readProjectFile('packages/weimo-ui-site/src/app/app.css')
const tokensCss = readProjectFile('packages/weimo-ui-core/src/styles/tokens.css')
const rootRegistry = readJson('registry.json')
const styleRegistry = readJson('registry/style.json')
const standaloneRegistryItem = readJson('registry/heat-color.json')
const heatmapRegistryItem = readJson('registry/heatmap.json')
const rootHeatColorItem = rootRegistry.items.find((item) => item.name === 'heat-color')
const rootHeatmapItem = rootRegistry.items.find((item) => item.name === 'heatmap')
const rootStyleItem = rootRegistry.items.find((item) => item.name === 'style')
const heatColorGroupBlock = cssBlockFor(appCss, '.heat-color-preview__group')
const heatColorSwatchBlock = cssBlockFor(appCss, '.heat-color-preview__swatch')

assert.equal(
  packageJson.exports?.['./components/heat-color'],
  './packages/weimo-ui-stats/src/components/heatmap/heat-color.tsx',
  'package.json must expose the public HeatColor entrypoint from the stats package.',
)
assert.equal(
  statsPackageJson.exports?.['./components/heat-color'],
  './src/components/heatmap/heat-color.tsx',
  'weimo-ui-stats must own the HeatColor entrypoint beside Heatmap.',
)
assert.equal(
  statsPackageJson.exports?.['./styles/heat-color.css'],
  './src/components/heatmap/heat-color.css',
  'weimo-ui-stats must ship the standalone HeatColor utility stylesheet.',
)
assert.ok(
  !('./components/heat-color' in (corePackageJson.exports ?? {})) &&
    !('./styles/heat-color.css' in (corePackageJson.exports ?? {})),
  'HeatColor must not stay exposed from the core package.',
)

assert.ok(
  heatColorSource.includes("import './heat-color.css'"),
  'HeatColor implementation must import its colocated stylesheet.',
)
assert.ok(
  heatColorSource.includes('export const heatColorMap') &&
    heatColorSource.includes('export const heatColorLevels') &&
    heatColorSource.includes('export type HeatColorLevel') &&
    heatColorSource.includes('export function getHeatColorClassName') &&
    heatColorSource.includes('export function getHeatColorToken'),
  'HeatColor module must expose its level map, ordered levels, type, and helpers.',
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
    !tokensCss.includes(`${token}:`) &&
      !tokensCss.includes(`var(${token})`) &&
      !(token.slice(2) in styleRegistry.cssVars.light) &&
      !(token.slice(2) in styleRegistry.cssVars.dark) &&
      !(token.slice(2) in rootStyleItem.cssVars.light) &&
      !(token.slice(2) in rootStyleItem.cssVars.dark),
    `${token} must live in the stats-owned heat-color.css instead of core tokens or the shared style registry.`,
  )
  assert.ok(
    heatColorCss.includes(`${token}: ${lightValue};`) && heatColorCss.includes(`${token}: ${darkValue};`),
    `heat-color.css must define the concrete ${token} values in both themes.`,
  )
  assert.ok(
    !lightValue.includes('/') && !darkValue.includes('/') &&
      !lightValue.includes('rgba(') && !darkValue.includes('rgba('),
    `${token} must use an opaque color value pre-blended over the card background.`,
  )
}

assert.ok(
  heatColorSource.includes("className={cn('heat-color__swatch', getHeatColorClassName(level))}") &&
    heatColorSource.includes('data-level={level}'),
  'HeatColor swatches must consume the shared level utility helper.',
)
assert.ok(
  heatmapSource.includes("import { getHeatColorClassName } from 'weimo-ui-stats/components/heat-color'") &&
    heatmapSource.includes('getHeatColorClassName(cell.level)'),
  'Heatmap cells must consume the stats-owned HeatColor utility helper.',
)

const todayRingToken = '--color-heatmap-today-ring'

assert.ok(
  !tokensCss.includes(`${todayRingToken}:`) &&
    !tokensCss.includes(`var(${todayRingToken})`) &&
    !(todayRingToken.slice(2) in styleRegistry.cssVars.light) &&
    !(todayRingToken.slice(2) in styleRegistry.cssVars.dark) &&
    !(todayRingToken.slice(2) in rootStyleItem.cssVars.light) &&
    !(todayRingToken.slice(2) in rootStyleItem.cssVars.dark),
  'The today ring token must live in the stats-owned heatmap.css instead of core tokens or the shared style registry.',
)
assert.ok(
  heatmapCss.includes(`${todayRingToken}: hsl(18.1 71.9% 46.1% / 0.55);`) &&
    heatmapCss.includes(`${todayRingToken}: hsl(0 0% 100% / 0.38);`) &&
    heatmapCss.includes(`var(${todayRingToken})`),
  'heatmap.css must define the today ring token in both themes beside its consumer rules.',
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
  statDocsDefinitionSource.includes("from 'weimo-ui-stats/components/heat-color'") &&
    statDocsDefinitionSource.includes("from 'weimo-ui-core/components/component-preview-card'") &&
    statDocsDefinitionSource.includes('heatColorLevels.map') &&
    statDocsDefinitionSource.includes('heatColorMap[level]') &&
    statDocsDefinitionSource.includes('getHeatColorClassName(level)') &&
    statDocsDefinitionSource.includes('getHeatColorToken(level)') &&
    statDocsDefinitionSource.includes('darkValue: item.value.dark') &&
    statDocsDefinitionSource.includes('label="热力图色"') &&
    statDocsDefinitionSource.includes('token: getHeatColorToken(level)') &&
    statDocsDefinitionSource.includes('value: item.value.light') &&
    statDocsDefinitionSource.includes('heat-color-preview__group') &&
    statDocsDefinitionSource.includes('heat-color-preview__swatch') &&
    statDocsDefinitionSource.includes('<ComponentPreviewCard') &&
    statDocsDefinitionSource.includes("'HeatColor'") &&
    statDocsDefinitionSource.includes("'热力图色'") &&
    !statDocsDefinitionSource.includes('<HeatColor ') &&
    !statDocsDefinitionSource.includes('<HeatColor/'),
  'Stat docs must render the HeatColor tokens as one searchable ComponentPreviewCard.',
)
assert.ok(
  !backgroundTokensDocsDefinitionSource.includes('heatColor') &&
    !backgroundTokensDocsDefinitionSource.includes('HeatColor') &&
    !backgroundTokensDocsDefinitionSource.includes('heat-color') &&
    !backgroundTokensDocsDefinitionSource.includes('热力图'),
  'BgColor docs must leave the HeatColor token card to the stat page.',
)
assert.ok(
  !statDocsDefinitionSource.includes('className="heat-color-preview"'),
  'HeatColor card must render its swatch row directly without a preview wrapper.',
)
assert.ok(
  heatColorGroupBlock.includes('display: flex;') &&
    heatColorGroupBlock.includes('gap: clamp(12px, 2vw, 24px);') &&
    heatColorSwatchBlock.includes('aspect-ratio: 1;') &&
    heatColorSwatchBlock.includes('border-radius: var(--radius-sm);') &&
    !heatColorSwatchBlock.includes('border:') &&
    !heatColorGroupBlock.includes('border:'),
  'HeatColor preview must use five square, rounded, borderless color swatches in one row.',
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
    'packages/weimo-ui-stats/src/components/heatmap/heat-color.tsx',
    'packages/weimo-ui-stats/src/components/heatmap/heat-color.css',
  ],
  'HeatColor registry item must ship only its implementation and utility stylesheet from the stats package.',
)
assert.ok(
  heatmapRegistryItem.registryDependencies.includes('@weimo/heat-color') &&
    rootHeatmapItem.registryDependencies.includes('@weimo/heat-color') &&
    !heatmapRegistryItem.files.some((file) => file.path.endsWith('/heat-color.tsx')) &&
    !rootHeatmapItem.files.some((file) => file.path.endsWith('/heat-color.tsx')),
  'Heatmap registry items must depend on HeatColor without bundling its implementation.',
)
