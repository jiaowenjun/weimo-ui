import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const packageRoot = join(root, 'packages/weimo-ui-image')

function readProjectFile(relativePath) {
  const absolutePath = join(root, relativePath)
  assert.ok(existsSync(absolutePath), `${relativePath} must exist.`)
  return readFileSync(absolutePath, 'utf8')
}

const packageJson = JSON.parse(readProjectFile('packages/weimo-ui-image/package.json'))
const rootPackageJson = JSON.parse(readProjectFile('package.json'))
const workspace = readProjectFile('pnpm-workspace.yaml')

assert.equal(packageJson.name, 'weimo-ui-image')
assert.equal(packageJson.private, true)
assert.ok(rootPackageJson.files.includes('packages/weimo-ui-image/src'))
assert.match(workspace, /packages:\s*\n\s+- 'packages\/\*'/u)

const workspaceDependencies = Object.entries({
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
  ...packageJson.peerDependencies,
}).filter(([, version]) => String(version).startsWith('workspace:'))

assert.deepEqual(
  workspaceDependencies,
  [['weimo-ui-core', 'workspace:*']],
  'weimo-ui-image must have weimo-ui-core as its only workspace dependency.',
)
for (const dependencyName of [
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.devDependencies ?? {}),
  ...Object.keys(packageJson.peerDependencies ?? {}),
]) {
  assert.ok(
    !dependencyName.startsWith('weimo-ui-') || dependencyName === 'weimo-ui-core',
    `weimo-ui-image must not depend on workspace package ${dependencyName}.`,
  )
}

for (const [exportName, target] of [
  ['.', './src/index.ts'],
  ['./components/canvas-transparency', './src/components/canvas-transparency.tsx'],
  ['./components/canvas-transparency-cache', './src/components/canvas-transparency-cache.ts'],
  ['./components/image-uploader', './src/components/image-uploader.tsx'],
  ['./components/image-view', './src/components/image-view.tsx'],
  ['./styles/image-uploader.css', './src/components/image-uploader.css'],
  ['./styles/image-view.css', './src/components/image-view.css'],
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
        !source.includes("from './action-dialog'") &&
        !source.includes("from './frosted-icon-button'") &&
        !source.includes("from './menu'"),
      `${absolutePath} must use weimo-ui-core for shared utilities and controls.`,
    )
  }
}

assert.ok(
  readProjectFile('packages/weimo-ui-image/src/components/image-view.tsx').includes(
    "from 'weimo-ui-core/components/action-dialog'",
  ),
  'ImageView must consume ActionDialog from weimo-ui-core.',
)
assert.ok(
  readProjectFile('packages/weimo-ui-image/src/components/image-uploader.tsx').includes(
    "from 'weimo-ui-core/components/lib/utils'",
  ),
  'ImageUploader must consume cn from weimo-ui-core.',
)

console.log('weimo-ui-image package contract tests passed.')
