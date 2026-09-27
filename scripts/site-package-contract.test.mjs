import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const siteRoot = join(root, 'packages/weimo-ui-site')

function readProjectFile(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8')
}

function readProjectJson(relativePath) {
  return JSON.parse(readProjectFile(relativePath))
}

function collectSourceFiles(directory) {
  return readdirSync(directory)
    .flatMap((entry) => {
      const absolutePath = join(directory, entry)
      return statSync(absolutePath).isDirectory()
        ? collectSourceFiles(absolutePath)
        : [absolutePath]
    })
    .filter((file) => /\.(?:css|ts|tsx)$/u.test(file))
}

const rootPackageJson = readProjectJson('package.json')
const sitePackageJson = readProjectJson('packages/weimo-ui-site/package.json')
const workspace = readProjectFile('pnpm-workspace.yaml')
const viteConfig = readProjectFile('packages/weimo-ui-site/vite.config.ts')
const deployWorkflow = readProjectFile('.github/workflows/deploy-pages.yml')
const siteSourceFiles = collectSourceFiles(join(siteRoot, 'src'))
const siteSource = siteSourceFiles
  .map((file) => `// ${relative(root, file)}\n${readFileSync(file, 'utf8')}`)
  .join('\n')
const internalDependencies = Object.keys(sitePackageJson.dependencies ?? {})
  .filter((dependency) => dependency.startsWith('weimo-ui-'))
  .sort()

assert.equal(sitePackageJson.name, 'weimo-ui-site')
assert.equal(sitePackageJson.private, true)
assert.match(workspace, /packages\/\*/u)
assert.deepEqual(internalDependencies, [
  'weimo-ui-card',
  'weimo-ui-core',
  'weimo-ui-image',
  'weimo-ui-markdown',
  'weimo-ui-stats',
  'weimo-ui-tagtree',
])

for (const path of [
  'packages/weimo-ui-site/index.html',
  'packages/weimo-ui-site/public/favicon.svg',
  'packages/weimo-ui-site/src/main.tsx',
  'packages/weimo-ui-site/src/App.tsx',
  'packages/weimo-ui-site/src/components/coss/card.tsx',
  'packages/weimo-ui-site/src/components/coss/command.tsx',
  'packages/weimo-ui-site/src/components/coss/switch.tsx',
  'packages/weimo-ui-site/src/docs/components-manifest.ts',
  'packages/weimo-ui-site/vite.config.ts',
]) {
  assert.ok(existsSync(join(root, path)), `${path} must exist.`)
}

for (const oldPath of [
  'index.html',
  'public/favicon.svg',
  'src/main.tsx',
  'src/App.tsx',
  'src/App.css',
  'src/index.css',
  'src/components/coss/card.tsx',
  'src/components/coss/command.tsx',
  'src/components/coss/switch.tsx',
  'src/docs',
  'vite.config.ts',
]) {
  assert.equal(existsSync(join(root, oldPath)), false, `${oldPath} must move into weimo-ui-site.`)
}

assert.equal(rootPackageJson.scripts.dev, 'pnpm --filter weimo-ui-site dev')
assert.equal(rootPackageJson.scripts.build, 'pnpm --filter weimo-ui-site build')
assert.equal(rootPackageJson.scripts.preview, 'pnpm --filter weimo-ui-site preview')
assert.ok(rootPackageJson.files.includes('packages/weimo-ui-site'))
assert.match(viteConfig, /base: '\/weimo-ui\/'/u)
assert.match(viteConfig, /port: 5176/u)
assert.match(deployWorkflow, /packages\/weimo-ui-site\/dist/u)

assert.doesNotMatch(siteSource, /from\s+['"]weimo-ui(?:\/|['"])/u)
assert.doesNotMatch(siteSource, /from\s+['"](?:\.\.\/)+[^'"]*packages\/weimo-ui-/u)
assert.doesNotMatch(siteSource, /from\s+['"][^'"]*\/src\//u)

for (const dependency of internalDependencies) {
  assert.match(
    siteSource,
    new RegExp(`from ['"]${dependency}(?:/|['"])`, 'u'),
    `site source must consume ${dependency}.`,
  )
}

console.log('site package contract passed')
