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

const { componentGroups, componentManifest } = await loadTsModule(
  'src/docs/components-manifest.ts',
)
const componentDocsSource = readProjectFile('src/docs/component-docs.tsx')
const packageJson = JSON.parse(readProjectFile('package.json'))

assert.ok(Array.isArray(componentManifest), 'componentManifest must export an array.')
assert.ok(componentManifest.length > 0, 'componentManifest must not be empty.')
assert.ok(Array.isArray(componentGroups), 'componentGroups must export an array.')
assert.deepEqual(
  componentGroups.map((group) => [group.id, group.title]),
  [
    ['token-style', 'Token / 样式'],
    ['surface-material', 'Surface / 材质'],
    ['controls-overlays', '控件 / 弹层'],
    ['layout-bars', '布局 / 栏位'],
    ['tags-navigation', '标签 / 导航'],
    ['content-markdown', '内容 / Markdown'],
    ['media-ocr', '媒体 / OCR'],
    ['data-visualization', '数据 / 可视化'],
  ],
  'componentGroups must define the docs grouping order.',
)

const expectedGroupIds = new Set(componentGroups.map((group) => group.id))
const componentIds = new Set()
const packageExports = new Set()
const registryNames = new Set()

for (const groupId of expectedGroupIds) {
  const groupNames = componentManifest
    .filter((item) => item.group === groupId && item.docs)
    .map((item) => item.name)
  const sortedGroupNames = [...groupNames].sort((left, right) =>
    left.localeCompare(right, 'en'),
  )

  assert.deepEqual(
    groupNames,
    sortedGroupNames,
    `${groupId} docs components must be sorted by component name.`,
  )
}

for (const item of componentManifest) {
  const definitionPath = `src/docs/component-definitions/${item.id}.tsx`

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
  assert.ok(expectedGroupIds.has(item.group), `${item.id} must use a known docs group.`)
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
    'component-preview-card',
    'text-color',
    'pressable',
    'heat-color',
    'bg-blur',
    'border-radius',
    'glass-surface',
    'popup-surface',
    'ghost-icon-button',
    'glass-icon-button',
    'mode-button',
    'bottom-bar',
    'card-tool-bar',
    'card-top-bar',
    'sidebar',
    'top-bar',
    'chip-button',
    'tag-bread',
    'tag-picker',
    'tag-tree',
    'tag-tree-row',
    'canvas-transparency',
    'image-uploader',
    'heatmap',
  ],
  'Merged token utilities, surface materials, and bar/button/chip/tag/image/stat variants must remain public without separate docs pages.',
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
  packageJson.scripts?.test?.startsWith('pnpm catalog:check &&'),
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
  !packageJson.scripts?.test?.includes('scripts/editable-card-contract.test.mjs'),
  'The package test must not run the removed EditableCard contract.',
)
assert.ok(
  componentDocsSource.includes('componentManifest') &&
    componentDocsSource.includes('componentGroups') &&
    componentDocsSource.includes('componentDocGroups') &&
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
