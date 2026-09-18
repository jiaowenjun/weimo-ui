import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const componentsRoot = join(root, 'src/components')

function collectCssFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = join(directory, entry.name)

    if (entry.isDirectory()) {
      return collectCssFiles(absolutePath)
    }

    if (!entry.isFile() || !entry.name.endsWith('.css')) {
      return []
    }

    return [absolutePath]
  })
}

function readProjectFile(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8')
}

const tokensCss = readProjectFile('src/styles/tokens.css')
const styleItem = JSON.parse(readProjectFile('registry/style.json'))

for (const [token, value] of Object.entries({
  'font-size-2xs': '10px',
  'font-size-xs': '12px',
  'font-size-sm': '13px',
  'font-size-md': '14px',
  'font-size-base': '16px',
  'font-size-lg': '17px',
  'font-size-xl': '18px',
  'font-size-stat': '28px',
})) {
  assert.ok(tokensCss.includes(`--${token}: ${value};`), `Shared tokens must define --${token}.`)
  assert.equal(styleItem.cssVars.light[token], value, `Registry style must export --${token}.`)
}

assert.ok(
  !tokensCss.includes('--font-size-display') &&
    !Object.hasOwn(styleItem.cssVars.light, 'font-size-display'),
  'Shared typography tokens must not keep the removed --font-size-display token.',
)
assert.ok(
  !tokensCss.includes('--font-size-2xl') &&
    !Object.hasOwn(styleItem.cssVars.light, 'font-size-2xl'),
  'Shared typography tokens must not keep the removed --font-size-2xl token.',
)

const cssFiles = collectCssFiles(componentsRoot)
const disallowedDeclarations = []

assert.ok(cssFiles.length > 0, 'Component typography contract must inspect component CSS files.')

for (const absolutePath of cssFiles) {
  assert.ok(statSync(absolutePath).isFile())

  const source = readFileSync(absolutePath, 'utf8')
  const relativePath = relative(root, absolutePath)

  for (const match of source.matchAll(/font-size:\s*([^;]+);/g)) {
    const value = match[1].trim()

    if (value === 'inherit' || value === 'unset' || value.startsWith('var(')) {
      continue
    }

    disallowedDeclarations.push(`${relativePath}: font-size: ${value};`)
  }
}

assert.deepEqual(
  disallowedDeclarations,
  [],
  'Component font-size declarations must use shared or component typography variables.',
)
