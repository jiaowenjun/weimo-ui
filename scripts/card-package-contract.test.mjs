import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const packageRoot = join(root, 'packages/weimo-ui-card')

function readProjectFile(relativePath) {
  const absolutePath = join(root, relativePath)
  assert.ok(existsSync(absolutePath), `${relativePath} must exist.`)
  return readFileSync(absolutePath, 'utf8')
}

const packageJson = JSON.parse(readProjectFile('packages/weimo-ui-card/package.json'))
const rootPackageJson = JSON.parse(readProjectFile('package.json'))
const workspace = readProjectFile('pnpm-workspace.yaml')

assert.equal(packageJson.name, 'weimo-ui-card')
assert.equal(packageJson.private, true)
assert.ok(rootPackageJson.files.includes('packages/weimo-ui-card/src'))
assert.match(workspace, /packages:\s*\n\s+- 'packages\/\*'/u)

const workspaceDependencies = Object.entries({
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
  ...packageJson.peerDependencies,
}).filter(([, version]) => String(version).startsWith('workspace:'))

assert.deepEqual(
  workspaceDependencies,
  [
    ['weimo-ui-core', 'workspace:*'],
    ['weimo-ui-image', 'workspace:*'],
    ['weimo-ui-markdown', 'workspace:*'],
    ['weimo-ui-tagtree', 'workspace:*'],
  ],
  'weimo-ui-card workspace dependencies must match its component boundaries.',
)

for (const [exportName, target] of [
  ['.', './src/index.ts'],
  ['./components/card', './src/components/card.tsx'],
  ['./components/card-composer', './src/components/card-composer.tsx'],
  ['./components/ocr-card', './src/components/ocr-card.tsx'],
  ['./components/ocr-composer', './src/components/ocr-composer.tsx'],
  ['./components/ocr-detail', './src/components/ocr-detail.tsx'],
  ['./styles/card.css', './src/components/card.css'],
  ['./styles/card-composer.css', './src/components/card-composer.css'],
  ['./styles/ocr-card.css', './src/components/ocr-card.css'],
  ['./styles/ocr-composer.css', './src/components/ocr-composer.css'],
  ['./styles/ocr-detail.css', './src/components/ocr-detail.css'],
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
        !source.includes("from './action-dialog'") &&
        !source.includes("from './frosted-icon-button'") &&
        !source.includes("from './ghost-icon-button'") &&
        !source.includes("from './image-view'") &&
        !source.includes("from './image-uploader'") &&
        !source.includes("from './md-view'") &&
        !source.includes("from './md-render'") &&
        !source.includes("from './tag-bar'") &&
        !source.includes("from './card-tool-bar'") &&
        !source.includes("from './card-top-bar'") &&
        !source.includes("from './menu'"),
      `${absolutePath} must use the owning workspace package for shared components.`,
    )
  }
}

const sourceAssertions = [
  ['packages/weimo-ui-card/src/components/card.tsx', 'weimo-ui-markdown/components/md-view'],
  ['packages/weimo-ui-card/src/components/card.tsx', 'weimo-ui-tagtree/components/tag-bar'],
  ['packages/weimo-ui-card/src/components/ocr-card.tsx', 'weimo-ui-image/components/image-view'],
  ['packages/weimo-ui-card/src/components/ocr-composer.tsx', 'weimo-ui-image/components/image-uploader'],
  ['packages/weimo-ui-card/src/components/ocr-detail.tsx', 'weimo-ui-core/components/action-dialog'],
]
for (const [relativePath, dependencyPath] of sourceAssertions) {
  assert.match(
    readProjectFile(relativePath),
    new RegExp(`from ['"]${dependencyPath.replaceAll('/', '\\/')}['"]`, 'u'),
    `${relativePath} must consume ${dependencyPath}.`,
  )
}

console.log('weimo-ui-card package contract tests passed.')
