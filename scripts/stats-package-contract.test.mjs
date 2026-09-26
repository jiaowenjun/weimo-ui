import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const packageRoot = join(root, 'packages/weimo-ui-stats')

function readProjectFile(relativePath) {
  const absolutePath = join(root, relativePath)
  assert.ok(existsSync(absolutePath), `${relativePath} must exist.`)
  return readFileSync(absolutePath, 'utf8')
}

const packageJson = JSON.parse(readProjectFile('packages/weimo-ui-stats/package.json'))
const rootPackageJson = JSON.parse(readProjectFile('package.json'))
const workspace = readProjectFile('pnpm-workspace.yaml')

assert.equal(packageJson.name, 'weimo-ui-stats')
assert.equal(packageJson.private, true)
assert.ok(rootPackageJson.files.includes('packages/weimo-ui-stats/src'))
assert.match(workspace, /packages:\s*\n\s+- 'packages\/\*'/u)

const workspaceDependencies = Object.entries({
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
  ...packageJson.peerDependencies,
}).filter(([, version]) => String(version).startsWith('workspace:'))

assert.deepEqual(
  workspaceDependencies,
  [['weimo-ui-core', 'workspace:*']],
  'weimo-ui-stats must have weimo-ui-core as its only workspace dependency.',
)
for (const dependencyName of [
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.devDependencies ?? {}),
  ...Object.keys(packageJson.peerDependencies ?? {}),
]) {
  assert.ok(
    !dependencyName.startsWith('weimo-ui-') || dependencyName === 'weimo-ui-core',
    `weimo-ui-stats must not depend on workspace package ${dependencyName}.`,
  )
}

for (const [exportName, target] of [
  ['.', './src/index.ts'],
  ['./components/heatmap', './src/components/heatmap.tsx'],
  ['./components/stat-group', './src/components/stat-group.tsx'],
  ['./styles/heatmap.css', './src/components/heatmap/heatmap.css'],
  ['./styles/stat-group.css', './src/components/stat-group.css'],
]) {
  assert.equal(packageJson.exports?.[exportName], target, `${exportName} must resolve to ${target}.`)
  assert.ok(existsSync(join(packageRoot, target.slice(2))), `${target} must exist.`)
}

function collectSourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name)
    return entry.isDirectory() ? collectSourceFiles(entryPath) : [entryPath]
  })
}

for (const absolutePath of collectSourceFiles(join(packageRoot, 'src'))) {
  const source = readFileSync(absolutePath, 'utf8')
  assert.ok(
    !/from\s+['"](?:\.\.\/)+src\//u.test(source) &&
      !/from\s+['"]@\//u.test(source) &&
      !/from\s+['"]weimo-ui['"]/u.test(source),
    `${absolutePath} must not import the root weimo-ui source package.`,
  )
  if (/\.(?:tsx?|css)$/u.test(absolutePath) && !absolutePath.endsWith('.css')) {
    assert.ok(
      !source.includes("from './lib/") &&
        !source.includes("from '../lib/") &&
        !source.includes("from './coss/") &&
        !source.includes("from '../coss/"),
      `${absolutePath} must use weimo-ui-core for shared utilities and primitives.`,
    )
  }
}

assert.ok(
  readProjectFile('packages/weimo-ui-stats/src/components/heatmap/heatmap.tsx').includes(
    "from 'weimo-ui-core/components/heat-color'",
  ),
  'Heatmap must consume HeatColor from weimo-ui-core.',
)
assert.ok(
  readProjectFile('packages/weimo-ui-stats/src/components/stat-group.tsx').includes(
    "from 'weimo-ui-core/components/lib/utils'",
  ),
  'StatGroup must consume cn from weimo-ui-core.',
)

console.log('weimo-ui-stats package contract tests passed.')
