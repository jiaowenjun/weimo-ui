import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const packageRoot = join(root, 'packages/weimo-ui-markdown')

function readProjectFile(relativePath) {
  const absolutePath = join(root, relativePath)
  assert.ok(existsSync(absolutePath), `${relativePath} must exist.`)
  return readFileSync(absolutePath, 'utf8')
}

const packageJson = JSON.parse(readProjectFile('packages/weimo-ui-markdown/package.json'))
const rootPackageJson = JSON.parse(readProjectFile('package.json'))
const workspace = readProjectFile('pnpm-workspace.yaml')

assert.equal(packageJson.name, 'weimo-ui-markdown')
assert.equal(packageJson.private, true)
assert.ok(rootPackageJson.files.includes('packages/weimo-ui-markdown/src'))
assert.match(workspace, /packages:\s*\n\s+- 'packages\/\*'/u)

const workspaceDependencies = Object.entries({
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
  ...packageJson.peerDependencies,
}).filter(([, version]) => String(version).startsWith('workspace:'))

assert.deepEqual(
  workspaceDependencies,
  [['weimo-ui-core', 'workspace:*']],
  'weimo-ui-markdown must have weimo-ui-core as its only workspace dependency.',
)
for (const dependencyName of [
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.devDependencies ?? {}),
  ...Object.keys(packageJson.peerDependencies ?? {}),
]) {
  assert.ok(
    !dependencyName.startsWith('weimo-ui-') || dependencyName === 'weimo-ui-core',
    `weimo-ui-markdown must not depend on workspace package ${dependencyName}.`,
  )
}

for (const [exportName, target] of [
  ['.', './src/index.ts'],
  ['./components/md', './src/components/md.tsx'],
  ['./components/md-editor', './src/components/md-editor.tsx'],
  ['./components/md-render', './src/components/md-render.tsx'],
  ['./components/md-view', './src/components/md-view.tsx'],
  ['./components/math-editor', './src/components/math-editor.tsx'],
  ['./styles/tokens.css', './src/styles/tokens.css'],
  ['./styles/markdown-content.css', './src/components/markdown-content.css'],
  ['./styles/md.css', './src/components/md.css'],
  ['./styles/md-view.css', './src/components/md-view.css'],
  ['./styles/md-editor.css', './src/components/md-editor/md-editor.css'],
]) {
  assert.equal(packageJson.exports?.[exportName], target, `${exportName} must resolve to ${target}.`)
  assert.ok(existsSync(join(packageRoot, target.slice(2))), `${target} must exist.`)
}

const markdownTokens = readProjectFile('packages/weimo-ui-markdown/src/styles/tokens.css')
const coreTokens = readProjectFile('packages/weimo-ui-core/src/styles/tokens.css')
assert.match(markdownTokens, /@import ['"]weimo-ui-core\/styles\/tokens\.css['"];?/u)
assert.match(markdownTokens, /--md-color:/u)
assert.doesNotMatch(coreTokens, /--md-/u)

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

console.log('weimo-ui-markdown package contract tests passed.')
