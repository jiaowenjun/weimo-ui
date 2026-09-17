import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const componentsRoot = join(root, 'src/components')

function collectCssFiles(directory) {
  const entries = readdirSync(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const absolutePath = join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...collectCssFiles(absolutePath))
      continue
    }

    if (entry.isFile() && entry.name.endsWith('.css')) {
      files.push(absolutePath)
    }
  }

  return files
}

function readProjectFile(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8')
}

const tokensCss = readProjectFile('src/styles/tokens.css')
const styleItem = JSON.parse(readProjectFile('registry/style.json'))
const registry = JSON.parse(readProjectFile('registry.json'))
const rootStyleItem = registry.items.find((item) => item.name === 'style')

assert.ok(tokensCss.includes('--radius-xs: 4px;'), 'Shared tokens must define --radius-xs.')
assert.equal(styleItem.cssVars.light['radius-xs'], '4px', 'Registry style must export --radius-xs.')
assert.deepEqual(rootStyleItem, styleItem, 'Root registry style item must match registry/style.json.')

const cssFiles = collectCssFiles(componentsRoot)

assert.ok(cssFiles.length > 0, 'Component CSS files must exist.')

const disallowedDeclarations = []
const radiusCardConsumers = []

for (const absolutePath of cssFiles) {
  assert.ok(statSync(absolutePath).isFile())

  const source = readFileSync(absolutePath, 'utf8')
  const relativePath = relative(root, absolutePath)

  if (source.includes('var(--radius-card)')) {
    radiusCardConsumers.push(relativePath)
  }

  for (const match of source.matchAll(/border-radius:\s*([^;]+);/g)) {
    const value = match[1].trim()

    if (value === '0' || value === 'inherit' || value.startsWith('var(')) {
      continue
    }

    disallowedDeclarations.push(`${relativePath}: border-radius: ${value};`)
  }
}

assert.deepEqual(
  disallowedDeclarations,
  [],
  'Component border-radius declarations must use shared radius tokens, inherit, or explicit 0.',
)

assert.deepEqual(
  radiusCardConsumers,
  [],
  'Components must use --radius after merging --radius-card into the unified radius token.',
)

assert.ok(
  readProjectFile('src/components/heatmap/heatmap.css').includes('--heatmap-cell-radius: var(--radius-xs);'),
  'Heatmap cell radius must bridge through the shared xs radius token.',
)
