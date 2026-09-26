import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'

const root = fileURLToPath(new URL('..', import.meta.url))
const coreGroups = new Set([
  'token-style',
  'surface-material',
  'controls-overlays',
  'layout-bars',
])
const additionalCoreComponents = new Set(['base-card', 'component-preview-card'])

function readProjectFile(relativePath) {
  const absolutePath = join(root, relativePath)

  assert.ok(existsSync(absolutePath), `${relativePath} must exist.`)

  return readFileSync(absolutePath, 'utf8')
}

async function loadTsModule(relativePath) {
  const source = readProjectFile(relativePath)
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      verbatimModuleSyntax: true,
    },
    fileName: relativePath,
  }).outputText

  return import(`data:text/javascript;charset=utf-8,${encodeURIComponent(transpiled)}`)
}

const { componentManifest } = await loadTsModule('src/docs/components-manifest.ts')
const rootPackage = JSON.parse(readProjectFile('package.json'))
const corePackage = JSON.parse(readProjectFile('packages/weimo-ui-core/package.json'))
const workspace = readProjectFile('pnpm-workspace.yaml')
const coreItems = componentManifest.filter((item) =>
  coreGroups.has(item.group) || additionalCoreComponents.has(item.id),
)

assert.equal(corePackage.name, 'weimo-ui-core')
assert.ok(!rootPackage.dependencies?.['weimo-ui-core'])
assert.ok(rootPackage.files.includes('packages/weimo-ui-core/src'))
assert.match(workspace, /packages:\s*\n\s+- 'packages\/\*'/u)
assert.equal(coreItems.length, 29, 'The four core groups plus card shells must contain 29 public components.')

for (const item of coreItems) {
  const coreTarget = corePackage.exports?.[item.packageExport]
  const rootTarget = rootPackage.exports?.[item.packageExport]

  assert.ok(coreTarget, `weimo-ui-core must export ${item.packageExport}.`)
  assert.ok(rootTarget, `weimo-ui must retain compatibility export ${item.packageExport}.`)
  assert.ok(
    coreTarget.startsWith('./src/components/'),
    `${item.packageExport} must resolve to core source.`,
  )
  const rootEntry = rootTarget.slice(2)
  const coreEntry = join('packages/weimo-ui-core', coreTarget.slice(2))
  const coreImport = relative(dirname(rootEntry), coreEntry)
  assert.equal(
    readProjectFile(rootTarget.slice(2)),
    `export * from '${coreImport}'\n`,
    `${item.packageExport} compatibility entry must only re-export weimo-ui-core.`,
  )
}

for (const item of componentManifest.filter((item) =>
  !coreGroups.has(item.group) && !additionalCoreComponents.has(item.id),
)) {
  assert.ok(
    !corePackage.exports?.[item.packageExport],
    `${item.packageExport} belongs to ${item.group}, not weimo-ui-core.`,
  )
}

assert.equal(
  readProjectFile('src/styles/tokens.css'),
  '@import "../../packages/weimo-ui-core/src/styles/tokens.css";\n',
)
assert.equal(
  corePackage.exports?.['./styles/tokens.css'],
  './src/styles/tokens.css',
)

console.log('weimo-ui-core package contract tests passed.')
