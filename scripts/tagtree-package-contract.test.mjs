import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const packageRoot = join(root, 'packages/weimo-ui-tagtree')

function readProjectFile(relativePath) {
  const absolutePath = join(root, relativePath)
  assert.ok(existsSync(absolutePath), `${relativePath} must exist.`)
  return readFileSync(absolutePath, 'utf8')
}

const packageJson = JSON.parse(readProjectFile('packages/weimo-ui-tagtree/package.json'))
const rootPackageJson = JSON.parse(readProjectFile('package.json'))
const workspace = readProjectFile('pnpm-workspace.yaml')

assert.equal(packageJson.name, 'weimo-ui-tagtree')
assert.equal(packageJson.private, true)
assert.ok(rootPackageJson.files.includes('packages/weimo-ui-tagtree/src'))
assert.match(workspace, /packages:\s*\n\s+- 'packages\/\*'/u)

const workspaceDependencies = Object.entries({
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
  ...packageJson.peerDependencies,
}).filter(([, version]) => String(version).startsWith('workspace:'))

assert.deepEqual(
  workspaceDependencies,
  [['weimo-ui-core', 'workspace:*']],
  'weimo-ui-tagtree must have weimo-ui-core as its only workspace dependency.',
)
for (const dependencyName of [
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.devDependencies ?? {}),
  ...Object.keys(packageJson.peerDependencies ?? {}),
]) {
  assert.ok(
    !dependencyName.startsWith('weimo-ui-') || dependencyName === 'weimo-ui-core',
    `weimo-ui-tagtree must not depend on workspace package ${dependencyName}.`,
  )
}

for (const [exportName, target] of [
  ['.', './src/index.ts'],
  ['./page', './src/tag-page.tsx'],
  ['./components/tag-bar', './src/components/tag-bar.tsx'],
  ['./components/tag-bread', './src/components/tag-bread.tsx'],
  ['./components/tag-picker', './src/components/tag-picker.tsx'],
  ['./components/tag-tree', './src/components/tag-tree.tsx'],
  ['./components/tag-tree-row', './src/components/tag-tree-row.tsx'],
  ['./components/capsule-button', './src/components/capsule-button.tsx'],
  ['./components/coss/breadcrumb', './src/components/coss/breadcrumb.tsx'],
  ['./components/coss/input-group', './src/components/coss/input-group.tsx'],
  ['./components/coss/scroll-area', './src/components/coss/scroll-area.tsx'],
  ['./styles/page.css', './src/tag-page.css'],
]) {
  assert.equal(packageJson.exports?.[exportName], target, `${exportName} must resolve to ${target}.`)
  assert.ok(existsSync(join(packageRoot, target.slice(2))), `${target} must exist.`)
}

const indexSource = readProjectFile('packages/weimo-ui-tagtree/src/index.ts')
const pageSource = readProjectFile('packages/weimo-ui-tagtree/src/tag-page.tsx')
assert.ok(indexSource.includes('TagTreePage'), 'tagtree package root must export TagTreePage.')
assert.ok(pageSource.includes('export function TagTreePage'), 'tagtree page must export TagTreePage.')
assert.ok(
  pageSource.includes("from 'weimo-ui-core/components/component-preview-card'") &&
    pageSource.includes('<ComponentPreviewCard'),
  'tagtree page previews must use ComponentPreviewCard from weimo-ui-core.',
)
assert.equal(
  pageSource.match(/<ComponentPreviewCard\b/gu)?.length,
  5,
  'tagtree page must render each component-example block in a ComponentPreviewCard.',
)
assert.ok(
  !pageSource.includes('function PreviewCard'),
  'tagtree page examples must use ComponentPreviewCard directly instead of a local preview-card wrapper.',
)

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
}

console.log('weimo-ui-tagtree package contract tests passed.')
