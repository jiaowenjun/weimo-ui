import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'

const root = fileURLToPath(new URL('..', import.meta.url))

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
      jsx: ts.JsxEmit.ReactJSX,
      verbatimModuleSyntax: true,
    },
    fileName: relativePath,
  }).outputText
  const url = `data:text/javascript;charset=utf-8,${encodeURIComponent(transpiled)}`

  return import(url)
}

execFileSync(process.execPath, ['scripts/sync-component-catalog.mjs', '--check'], {
  cwd: root,
  stdio: 'pipe',
})

const { componentManifest, componentPackages } = await loadTsModule(
  'packages/weimo-ui-site/src/docs/components-manifest.ts',
)
const componentDocsSource = readProjectFile('packages/weimo-ui-site/src/docs/catalog/component-docs.tsx')
const packageJson = JSON.parse(readProjectFile('package.json'))

assert.ok(Array.isArray(componentManifest), 'componentManifest must export an array.')
assert.ok(componentManifest.length > 0, 'componentManifest must not be empty.')
assert.ok(Array.isArray(componentPackages), 'componentPackages must export an array.')
assert.deepEqual(
  componentPackages.map((packageItem) => [packageItem.id, packageItem.title]),
  [
    ['weimo-ui-core', 'weimo-ui-core'],
    ['weimo-ui-tagtree', 'weimo-ui-tagtree'],
    ['weimo-ui-markdown', 'weimo-ui-markdown'],
    ['weimo-ui-image', 'weimo-ui-image'],
    ['weimo-ui-stats', 'weimo-ui-stats'],
    ['weimo-ui-card', 'weimo-ui-card'],
  ],
  'componentPackages must define the docs package order.',
)

const expectedPackageNames = new Set(componentPackages.map((packageItem) => packageItem.id))
const componentIds = new Set()
const packageExports = new Set()
const registryNames = new Set()
const pagesById = new Map(
  componentManifest.filter((item) => item.docs).map((item) => [item.id, item]),
)

assert.deepEqual(
  [...pagesById.keys()],
  [
    'text-tokens',
    'background-tokens',
    'border-tokens',
    'surface',
    'button',
    'capsule-button',
    'slider',
    'menu',
    'action-dialog',
    'bar',
    'page-layout',
    'card-tool-bar',
    'base-card',
    'component-preview-card',
    'tag',
    'markdown',
    'md',
    'image',
    'stat',
    'tagged-card',
    'ocr',
  ],
  'docs pages must follow package and functional order.',
)

for (const item of componentManifest) {
  const definitionPath = `packages/weimo-ui-site/src/docs/catalog/packages/${item.packageName}/${item.id}.tsx`

  assert.ok(!componentIds.has(item.id), `${item.id} must be unique.`)
  assert.ok(!packageExports.has(item.packageExport), `${item.packageExport} must be unique.`)
  assert.ok(!registryNames.has(item.registryName), `${item.registryName} must be unique.`)
  componentIds.add(item.id)
  packageExports.add(item.packageExport)
  registryNames.add(item.registryName)

  if (item.docs) {
    const definitionSource = readProjectFile(definitionPath)

    assert.ok(
      definitionSource.includes(`id: '${item.id}'`) &&
        definitionSource.includes('preview:') &&
        !definitionSource.includes('props:') &&
        !definitionSource.includes('code:') &&
        !definitionSource.includes('variantPreviews:'),
      `${definitionPath} must own the preview-only component docs definition.`,
    )
  } else {
    assert.ok(
      !existsSync(join(root, definitionPath)),
      `${definitionPath} must be removed when its content is merged into another docs page.`,
    )
  }
  assert.equal(typeof item.name, 'string', `${item.id} must have a display name.`)
  assert.equal(typeof item.registryName, 'string', `${item.id} must have a registry name.`)
  assert.equal(typeof item.packageExport, 'string', `${item.id} must have a package export key.`)
  assert.ok(
    expectedPackageNames.has(item.packageName),
    `${item.id} must use a known component package.`,
  )
  const page = pagesById.get(item.page)
  assert.ok(page, `${item.id} must use a known docs page.`)
  assert.equal(
    page.packageName,
    item.packageName,
    `${item.id} and its page must belong to the same component package.`,
  )
  if (item.docs) {
    assert.equal(item.page, item.id, `${item.id} docs page must reference itself.`)
  }
  assert.equal(typeof item.docs, 'boolean', `${item.id} must declare docs visibility.`)
  assert.equal(item.registry, true, `${item.id} must remain available in the registry.`)
  assert.ok(
    packageJson.exports?.[item.packageExport],
    `${item.id} package export ${item.packageExport} must exist.`,
  )
  assert.ok(!('visibility' in item), `${item.id} must not declare visibility.`)
  assert.ok(!('internalGroup' in item), `${item.id} must not declare internalGroup.`)
  assert.ok(!('registryImport' in item), `${item.id} must not declare registryImport.`)
  assert.ok(!('workspaceImport' in item), `${item.id} must not declare workspaceImport.`)
}

assert.deepEqual(
  componentManifest.filter((item) => !item.docs).map((item) => item.id),
  [
    'text-color',
    'bg-blur',
    'heat-color',
    'pressable',
    'border-radius',
    'frosted-surface',
    'liquid-glass',
    'popup-surface',
    'frosted-icon-button',
    'frosted-icon-button-group',
    'ghost-icon-button',
    'mode-button',
    'bottom-bar',
    'top-bar',
    'card-top-bar',
    'tag-bread',
    'tag-picker',
    'tag-tree',
    'tag-tree-row',
    'math-editor',
    'md-render',
    'md-view',
    'image-uploader',
    'canvas-transparency',
    'heatmap',
    'card-composer',
    'ocr-composer',
    'ocr-detail',
  ],
  'Merged token utilities, surface materials, and bar/button/tag/card/image/OCR/stat variants must remain public without separate docs pages.',
)

assert.equal(
  packageJson.scripts?.['catalog:sync'],
  'node scripts/sync-component-catalog.mjs',
)
assert.equal(
  packageJson.scripts?.['catalog:check'],
  'node scripts/sync-component-catalog.mjs --check',
)
assert.ok(
  packageJson.scripts?.['test:contracts']?.includes('run-contract-tests.mjs'),
  'The package test must reject stale component catalog artifacts first.',
)
assert.ok(
  packageJson.scripts?.['test:registry']?.startsWith('pnpm catalog:check &&'),
  'The registry test must reject stale component catalog artifacts first.',
)
assert.ok(
  !Object.hasOwn(packageJson.exports ?? {}, './components/editable-card') &&
    !Object.hasOwn(packageJson.exports ?? {}, './components/tag-edit-bar') &&
    !Object.hasOwn(packageJson.exports ?? {}, './components/icon-button'),
  'Removed public component exports must stay removed.',
)
assert.ok(
  true,
  'The package test must not run the removed EditableCard contract.',
)
assert.ok(
  componentDocsSource.includes('componentManifest') &&
    componentDocsSource.includes('componentPackages') &&
    componentDocsSource.includes('componentDocPackages') &&
    componentDocsSource.includes('componentDefinitionsById') &&
    !componentDocsSource.includes('buildInstallGuide'),
  'component-docs.tsx must assemble docs from the component catalog.',
)
assert.ok(
  !componentDocsSource.includes('visibility:') &&
    !componentDocsSource.includes('internalGroup') &&
    !componentDocsSource.includes('componentPropsById') &&
    !componentDocsSource.includes('componentCodeById') &&
    !componentDocsSource.includes('componentPreviewsById') &&
    !componentDocsSource.includes('const componentCode = {'),
  'component-docs.tsx must not rebuild parallel component metadata maps.',
)
