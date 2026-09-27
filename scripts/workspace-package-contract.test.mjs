import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'

const root = fileURLToPath(new URL('..', import.meta.url))

function readProjectFile(relativePath) {
  const absolutePath = join(root, relativePath)
  assert.ok(existsSync(absolutePath), `${relativePath} must exist.`)
  return readFileSync(absolutePath, 'utf8')
}

function readProjectJson(relativePath) {
  return JSON.parse(readProjectFile(relativePath))
}

function collectSourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name)
    return entry.isDirectory() ? collectSourceFiles(entryPath) : [entryPath]
  }).filter((file) => /\.(?:css|ts|tsx)$/u.test(file))
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

function workspaceDependencies(packageJson) {
  return Object.entries({
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.peerDependencies,
  })
    .filter(([, version]) => String(version).startsWith('workspace:'))
    .sort(([left], [right]) => left.localeCompare(right))
}

const packageRules = [
  {
    name: 'weimo-ui-core',
    workspaceDependencies: [],
    forbiddenRelativeImports: [],
    requiredExports: {
      './components/coss/button': './src/components/coss/button.tsx',
      './components/coss/dialog': './src/components/coss/dialog.tsx',
      './components/coss/switch': './src/components/coss/switch.tsx',
      './components/coss/table': './src/components/coss/table.tsx',
      './components/coss/tabs': './src/components/coss/tabs.tsx',
      './components/coss/toolbar': './src/components/coss/toolbar.tsx',
      './components/coss/tooltip': './src/components/coss/tooltip.tsx',
      './styles/button.css': './src/components/coss/button.css',
      './styles/switch.css': './src/components/coss/switch.css',
      './styles/tooltip.css': './src/components/coss/tooltip.css',
    },
  },
  {
    name: 'weimo-ui-tagtree',
    workspaceDependencies: [['weimo-ui-core', 'workspace:*']],
    forbiddenRelativeImports: [],
    requiredExports: {
      '.': './src/index.ts',
      './page': './src/tag-page.tsx',
      './components/coss/breadcrumb': './src/components/coss/breadcrumb.tsx',
      './components/coss/input-group': './src/components/coss/input-group.tsx',
      './components/coss/scroll-area': './src/components/coss/scroll-area.tsx',
      './styles/page.css': './src/tag-page.css',
    },
  },
  {
    name: 'weimo-ui-markdown',
    workspaceDependencies: [['weimo-ui-core', 'workspace:*']],
    forbiddenRelativeImports: [],
    requiredExports: {
      '.': './src/index.ts',
      './styles/tokens.css': './src/styles/tokens.css',
      './styles/markdown-content.css': './src/components/markdown-content.css',
      './styles/md.css': './src/components/md.css',
      './styles/md-view.css': './src/components/md-view.css',
      './styles/md-editor.css': './src/components/md-editor/md-editor.css',
    },
  },
  {
    name: 'weimo-ui-image',
    workspaceDependencies: [['weimo-ui-core', 'workspace:*']],
    forbiddenRelativeImports: [
      "from './lib/",
      "from '../lib/",
      "from './action-dialog'",
      "from './frosted-icon-button'",
      "from './menu'",
    ],
    requiredExports: {
      '.': './src/index.ts',
      './components/canvas-transparency-cache': './src/components/canvas-transparency-cache.ts',
      './styles/image-uploader.css': './src/components/image-uploader.css',
      './styles/image-view.css': './src/components/image-view.css',
    },
  },
  {
    name: 'weimo-ui-stats',
    workspaceDependencies: [['weimo-ui-core', 'workspace:*']],
    forbiddenRelativeImports: [
      "from './lib/",
      "from '../lib/",
      "from './coss/",
      "from '../coss/",
    ],
    requiredExports: {
      '.': './src/index.ts',
      './styles/heatmap.css': './src/components/heatmap/heatmap.css',
      './styles/stat-group.css': './src/components/stat-group.css',
    },
  },
  {
    name: 'weimo-ui-card',
    workspaceDependencies: [
      ['weimo-ui-core', 'workspace:*'],
      ['weimo-ui-image', 'workspace:*'],
      ['weimo-ui-markdown', 'workspace:*'],
      ['weimo-ui-tagtree', 'workspace:*'],
    ],
    forbiddenRelativeImports: [
      "from './lib/",
      "from './action-dialog'",
      "from './frosted-icon-button'",
      "from './ghost-icon-button'",
      "from './image-view'",
      "from './image-uploader'",
      "from './md-view'",
      "from './md-render'",
      "from './menu'",
    ],
    requiredExports: {
      '.': './src/index.ts',
      './components/editable-capsule': './src/components/editable-capsule.tsx',
      './components/tag-bar': './src/components/tag-bar.tsx',
      './components/tag-picker': './src/components/tag-picker.tsx',
      './components/tag-picker-model': './src/components/tag-picker/tag-picker-model.ts',
      './styles/card.css': './src/components/card.css',
      './styles/card-composer.css': './src/components/card-composer.css',
      './styles/card-tool-bar.css': './src/components/card-tool-bar.css',
      './styles/card-top-bar.css': './src/components/card-top-bar.css',
      './styles/ocr-card.css': './src/components/ocr-card.css',
      './styles/ocr-composer.css': './src/components/ocr-composer.css',
      './styles/ocr-detail.css': './src/components/ocr-detail.css',
      './styles/tag-bar.css': './src/components/tag-bar.css',
      './styles/tag-picker.css': './src/components/tag-picker/tag-picker.css',
    },
  },
]

const rootPackageJson = readProjectJson('package.json')
const workspace = readProjectFile('pnpm-workspace.yaml')
const { componentManifest, componentPackages } = await loadTsModule(
  'packages/weimo-ui-site/src/docs/components-manifest.ts',
)

assert.match(workspace, /packages:\s*\n\s+- 'packages\/\*'/u)
assert.deepEqual(
  packageRules.map((rule) => rule.name),
  componentPackages.map((packageItem) => packageItem.id),
  'Workspace package rules must cover every component package in catalog order.',
)

for (const [exportName, target] of Object.entries(rootPackageJson.exports)) {
  assert.ok(
    existsSync(join(root, target.replace(/^\.\//u, ''))),
    `Root export ${exportName} target ${target} must exist.`,
  )
}

for (const rule of packageRules) {
  const packageRoot = join(root, 'packages', rule.name)
  const packageJson = readProjectJson(`packages/${rule.name}/package.json`)
  const ownedItems = componentManifest.filter((item) => item.packageName === rule.name)
  const sourceFiles = collectSourceFiles(join(packageRoot, 'src'))
  const source = sourceFiles.map((file) => readFileSync(file, 'utf8')).join('\n')

  assert.equal(packageJson.name, rule.name)
  assert.equal(packageJson.private, true)
  assert.ok(rootPackageJson.files.includes(`packages/${rule.name}/src`))
  assert.deepEqual(
    workspaceDependencies(packageJson),
    rule.workspaceDependencies,
    `${rule.name} workspace dependencies must match its package boundary.`,
  )

  for (const [exportName, target] of Object.entries(packageJson.exports)) {
    assert.ok(
      existsSync(join(packageRoot, target.replace(/^\.\//u, ''))),
      `${rule.name} export ${exportName} target ${target} must exist.`,
    )
  }
  for (const [exportName, target] of Object.entries(rule.requiredExports)) {
    assert.equal(
      packageJson.exports?.[exportName],
      target,
      `${rule.name} public export ${exportName} must resolve to ${target}.`,
    )
  }
  for (const item of ownedItems) {
    const packageTarget = packageJson.exports?.[item.packageExport]

    assert.ok(packageTarget, `${rule.name} must export ${item.packageExport}.`)
    assert.equal(
      rootPackageJson.exports?.[item.packageExport],
      `./packages/${rule.name}/${packageTarget.replace(/^\.\//u, '')}`,
      `Root export ${item.packageExport} must point directly at ${rule.name}.`,
    )
  }
  for (const item of componentManifest.filter((item) => item.packageName !== rule.name)) {
    assert.ok(
      !packageJson.exports?.[item.packageExport],
      `${item.packageExport} belongs to ${item.packageName}, not ${rule.name}.`,
    )
  }

  for (const file of sourceFiles) {
    const fileSource = readFileSync(file, 'utf8')
    assert.doesNotMatch(fileSource, /from\s+['"](?:\.\.\/)+src\//u)
    assert.doesNotMatch(fileSource, /from\s+['"]@\//u)
    assert.doesNotMatch(fileSource, /from\s+['"]weimo-ui['"]/u)
  }
  for (const snippet of rule.forbiddenRelativeImports) {
    assert.ok(
      !source.includes(snippet),
      `${rule.name} must consume the owning workspace package instead of ${snippet}.`,
    )
  }

  const allowedImports = new Set([
    rule.name,
    ...rule.workspaceDependencies.map(([dependency]) => dependency),
  ])
  for (const match of source.matchAll(/from\s+['"](weimo-ui-[^/'"]+)/gu)) {
    assert.ok(
      allowedImports.has(match[1]),
      `${rule.name} source must not import undeclared workspace package ${match[1]}.`,
    )
  }
  for (const [dependency] of rule.workspaceDependencies) {
    assert.match(
      source,
      new RegExp(`from ['"]${dependency}(?:/|['"])`, 'u'),
      `${rule.name} must consume declared workspace dependency ${dependency}.`,
    )
  }
}

assert.ok(!rootPackageJson.dependencies?.['weimo-ui-core'])
assert.equal(
  rootPackageJson.exports?.['./styles/tokens.css'],
  './packages/weimo-ui-markdown/src/styles/tokens.css',
)
assert.equal(
  readProjectJson('packages/weimo-ui-core/package.json').exports?.['./styles/tokens.css'],
  './src/styles/tokens.css',
)
assert.match(
  readProjectFile('packages/weimo-ui-core/src/components/coss/dialog.tsx'),
  /export function DialogPanel\b/u,
)

const markdownTokens = readProjectFile('packages/weimo-ui-markdown/src/styles/tokens.css')
const coreTokens = readProjectFile('packages/weimo-ui-core/src/styles/tokens.css')
assert.match(markdownTokens, /@import ['"]weimo-ui-core\/styles\/tokens\.css['"];?/u)
assert.match(markdownTokens, /--md-color:/u)
assert.doesNotMatch(coreTokens, /--md-/u)

for (const [relativePath, dependencyPath] of [
  ['packages/weimo-ui-card/src/components/card.tsx', 'weimo-ui-markdown/components/md-view'],
  ['packages/weimo-ui-card/src/components/ocr-card.tsx', 'weimo-ui-image/components/image-view'],
  ['packages/weimo-ui-card/src/components/ocr-composer.tsx', 'weimo-ui-image/components/image-uploader'],
  ['packages/weimo-ui-card/src/components/ocr-detail.tsx', 'weimo-ui-core/components/action-dialog'],
  ['packages/weimo-ui-card/src/components/tag-picker/tag-picker.tsx', 'weimo-ui-tagtree/components/coss/input-group'],
  ['packages/weimo-ui-card/src/components/tag-picker/tag-picker.tsx', 'weimo-ui-tagtree/components/coss/scroll-area'],
  ['packages/weimo-ui-image/src/components/image-view.tsx', 'weimo-ui-core/components/action-dialog'],
  ['packages/weimo-ui-image/src/components/image-uploader.tsx', 'weimo-ui-core/lib/utils'],
  ['packages/weimo-ui-stats/src/components/heatmap/heatmap.tsx', 'weimo-ui-core/components/heat-color'],
  ['packages/weimo-ui-stats/src/components/stat-group.tsx', 'weimo-ui-core/lib/utils'],
]) {
  assert.match(
    readProjectFile(relativePath),
    new RegExp(`from ['"]${dependencyPath.replaceAll('/', '\\/')}['"]`, 'u'),
    `${relativePath} must consume ${dependencyPath}.`,
  )
}

const tagtreeIndex = readProjectFile('packages/weimo-ui-tagtree/src/index.ts')
const tagtreePage = readProjectFile('packages/weimo-ui-tagtree/src/tag-page.tsx')
assert.match(tagtreeIndex, /TagTreePage/u)
assert.match(tagtreePage, /export function TagTreePage/u)
assert.match(tagtreePage, /from ['"]weimo-ui-core\/components\/component-preview-card['"]/u)
assert.equal(tagtreePage.match(/<ComponentPreviewCard\b/gu)?.length, 3)

const sitePackageJson = readProjectJson('packages/weimo-ui-site/package.json')
const siteSourceFiles = collectSourceFiles(join(root, 'packages/weimo-ui-site/src'))
const siteSource = siteSourceFiles
  .map((file) => `// ${relative(root, file)}\n${readFileSync(file, 'utf8')}`)
  .join('\n')
const siteDependencies = Object.keys(sitePackageJson.dependencies ?? {})
  .filter((dependency) => dependency.startsWith('weimo-ui-'))
  .sort()

assert.equal(sitePackageJson.name, 'weimo-ui-site')
assert.equal(sitePackageJson.private, true)
assert.deepEqual(siteDependencies, packageRules.map((rule) => rule.name).sort())
for (const relativePath of [
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
  assert.ok(existsSync(join(root, relativePath)), `${relativePath} must exist.`)
}
assert.equal(rootPackageJson.scripts.dev, 'pnpm --filter weimo-ui-site dev')
assert.equal(rootPackageJson.scripts.build, 'pnpm --filter weimo-ui-site build')
assert.equal(rootPackageJson.scripts.preview, 'pnpm --filter weimo-ui-site preview')
assert.ok(rootPackageJson.files.includes('packages/weimo-ui-site'))
assert.match(readProjectFile('packages/weimo-ui-site/vite.config.ts'), /base: '\/weimo-ui\/'/u)
assert.match(readProjectFile('packages/weimo-ui-site/vite.config.ts'), /port: 5176/u)
assert.match(readProjectFile('.github/workflows/deploy-pages.yml'), /packages\/weimo-ui-site\/dist/u)
assert.doesNotMatch(siteSource, /from\s+['"]weimo-ui(?:\/|['"])/u)
assert.doesNotMatch(siteSource, /from\s+['"](?:\.\.\/)+[^'"]*packages\/weimo-ui-/u)
assert.doesNotMatch(siteSource, /from\s+['"][^'"]*\/src\//u)
for (const dependency of siteDependencies) {
  assert.match(siteSource, new RegExp(`from ['"]${dependency}(?:/|['"])`, 'u'))
}

console.log('Workspace package contract tests passed.')
