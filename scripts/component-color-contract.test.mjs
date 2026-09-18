import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const componentsRoot = join(root, 'src/components')

function readProjectFile(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8')
}

function readJson(relativePath) {
  return JSON.parse(readProjectFile(relativePath))
}

function listCssFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = join(directory, entry.name)

    if (entry.isDirectory()) {
      return listCssFiles(absolutePath)
    }

    if (!entry.isFile() || !entry.name.endsWith('.css')) {
      return []
    }

    return [absolutePath]
  })
}

const rawColorPattern = /#[\da-f]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/gi
const allowlistedTokenFiles = new Set(['src/styles/tokens.css'])
const cssFiles = listCssFiles(componentsRoot)
const tokensCss = readProjectFile('src/styles/tokens.css')
const rootRegistry = readJson('registry.json')
const styleRegistry = readJson('registry/style.json')
const rootStyleItem = rootRegistry.items.find((item) => item.name === 'style')
const hslOnlyTokenSources = [
  'src/styles/tokens.css',
  'src/components/bg-blur.ts',
  'src/components/bg-color.ts',
  'src/components/border-color.ts',
  'src/components/heatmap/heat-color.tsx',
  'src/components/text-color.ts',
  'registry/style.json',
]
const nonHslColorPattern = /#[\da-f]{3,8}\b|rgba?\(/i
const removedColorAliases = [
  '--color-brand',
  '--color-brand-foreground',
  '--color-brand-strong',
  '--color-fg-strong',
  '--color-text-muted',
  '--color-text-muted-subtle',
  '--color-danger',
]

assert.ok(cssFiles.length > 0, 'Component color contract must inspect component CSS files.')
assert.ok(rootStyleItem, 'Root registry must include the shared style item.')

for (const relativePath of hslOnlyTokenSources) {
  assert.doesNotMatch(
    readProjectFile(relativePath),
    nonHslColorPattern,
    `${relativePath} color token values must use hsl().`,
  )
}

assert.doesNotMatch(
  JSON.stringify(rootStyleItem),
  nonHslColorPattern,
  'registry.json style token values must use hsl().',
)

const violations = []
const removedAliasViolations = []

for (const file of cssFiles) {
  assert.ok(statSync(file).isFile(), `${file} must be a CSS file.`)

  const relativePath = relative(root, file)

  assert.ok(
    !allowlistedTokenFiles.has(relativePath),
    'Component color contract must not inspect shared token files.',
  )

  const source = readFileSync(file, 'utf8')

  for (const token of removedColorAliases) {
    if (source.includes(`var(${token})`)) {
      removedAliasViolations.push(`${relativePath}: var(${token})`)
    }
  }

  for (const match of source.matchAll(rawColorPattern)) {
    const before = source.slice(0, match.index)
    const line = before.split('\n').length

    violations.push(`${relativePath}:${line}: ${match[0]}`)
  }
}

for (const token of removedColorAliases) {
  assert.ok(
    !tokensCss.includes(`${token}:`),
    `${token} must be removed from shared UI tokens; use the canonical --color-text-* or action tokens instead.`,
  )
  assert.ok(
    !tokensCss.includes(`var(${token})`),
    `shared UI tokens must not reference removed ${token}.`,
  )
}

for (const [source, styleItem] of [
  ['registry.json', rootStyleItem],
  ['registry/style.json', styleRegistry],
]) {
  for (const group of ['theme', 'light', 'dark']) {
    const cssVars = styleItem.cssVars?.[group] ?? {}

    for (const token of removedColorAliases) {
      assert.ok(
        !(token.slice(2) in cssVars),
        `${source} ${group} cssVars must not expose removed ${token}.`,
      )
    }

    for (const [key, value] of Object.entries(cssVars)) {
      assert.ok(
        typeof value !== 'string' ||
          removedColorAliases.every((token) => !value.includes(`var(${token})`)),
        `${source} ${group} cssVar ${key} must not reference a removed color alias.`,
      )
    }
  }
}

assert.deepEqual(
  removedAliasViolations,
  [],
  `Component CSS must use canonical --color-text-* or action tokens instead of removed color aliases:\n${removedAliasViolations.join('\n')}`,
)

assert.deepEqual(
  violations,
  [],
  `Component CSS must consume shared color tokens instead of raw color values:\n${violations.join('\n')}`,
)
