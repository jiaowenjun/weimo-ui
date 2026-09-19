import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = new URL('..', import.meta.url)
const rootPath = fileURLToPath(root)
const registry = JSON.parse(readFileSync(new URL('../registry.json', import.meta.url), 'utf8'))
const nodeBinDir = dirname(process.execPath)
const packageManagerCli = process.env.npm_execpath
const packageManagerName = process.env.npm_config_user_agent?.split('/')[0]
const packageRunnerCommand = packageManagerCli ? process.execPath : 'pnpm'
const packageRunnerArgsPrefix = packageManagerCli ? [packageManagerCli] : []

execFileSync(process.execPath, ['scripts/sync-component-catalog.mjs', '--check'], {
  cwd: rootPath,
  stdio: 'pipe',
})

assert.ok(packageManagerCli || packageRunnerCommand === 'pnpm', 'registry contract must be run through a package manager.')

function packageRunnerArgs(command, args) {
  if (command === 'dlx' && packageManagerName === 'npm') {
    const npmPackageArgs = args[0].startsWith('shadcn@')
      ? ['--package', args[0], '--package', 'ajv-formats']
      : ['--package', args[0]]

    return [...packageRunnerArgsPrefix, 'exec', '--yes', ...npmPackageArgs, '--', args[0].split('@')[0], ...args.slice(1)]
  }

  return [...packageRunnerArgsPrefix, command, ...args]
}

function assertRegistryItem(item, source) {
  assert.ok(item.name, `${source} needs a name.`)
  assert.ok(item.type, `${source} needs a type.`)

  if (item.type === 'registry:style') {
    assert.equal(item.name, 'style', `${source} style item must be named "style".`)
    assert.ok(item.cssVars?.theme, `${source} style item must define @theme css variables.`)
    assert.ok(item.cssVars?.light, `${source} style item must define light css variables.`)
    assert.ok(item.cssVars?.dark, `${source} style item must define dark css variables.`)
  }

  if (item.type === 'registry:ui' || item.type === 'registry:lib') {
    assert.ok(
      Array.isArray(item.files) && item.files.length > 0,
      `${source} must include file payloads so shadcn build can emit installable JSON.`,
    )
  }

  if (item.type === 'registry:ui') {
    assert.ok(
      item.registryDependencies?.includes('@weimo/style'),
      `${source} must depend on @weimo/style so shared tokens are installed with component CSS.`,
    )
  }

  if (item.cssVars) {
    assert.equal(typeof item.cssVars, 'object', `${source} cssVars must be an object.`)
    assert.ok('theme' in item.cssVars, `${source} cssVars must include theme.`)
    assert.ok('light' in item.cssVars, `${source} cssVars must include light.`)
    assert.ok('dark' in item.cssVars, `${source} cssVars must include dark.`)
  }

  for (const dependency of item.registryDependencies ?? []) {
    assert.match(
      dependency,
      /^@weimo\//,
      `${source} registry dependency "${dependency}" must use the @weimo namespace so it resolves against the configured custom registry.`,
    )
  }
}

function assertNoSharedCssVars(item, source, sharedCssVarKeys) {
  if (item.type !== 'registry:ui' || !item.cssVars) {
    return
  }

  for (const group of ['theme', 'light', 'dark']) {
    const duplicateKeys = Object.keys(item.cssVars[group] ?? {}).filter((key) =>
      sharedCssVarKeys[group].has(key),
    )

    assert.deepEqual(
      duplicateKeys,
      [],
      `${source} must not duplicate @weimo/style ${group} cssVars: ${duplicateKeys.join(', ')}`,
    )
  }
}

assert.equal(registry.name, 'weimo-ui')
assert.ok(registry.homepage, 'Root registry must declare a homepage.')
assert.ok(
  Array.isArray(registry.items) || Array.isArray(registry.include),
  'Root registry must declare items or include.',
)

const items = registry.items ?? []
const rootStyleItem = items.find((item) => item.name === 'style')

assert.ok(rootStyleItem, 'Root registry must include the @weimo/style item.')
assert.equal(rootStyleItem.type, 'registry:style')

const rootSharedCssVarKeys = {
  theme: new Set(Object.keys(rootStyleItem.cssVars?.theme ?? {})),
  light: new Set(Object.keys(rootStyleItem.cssVars?.light ?? {})),
  dark: new Set(Object.keys(rootStyleItem.cssVars?.dark ?? {})),
}

for (const item of items) {
  assertRegistryItem(item, item.name)
  assertNoSharedCssVars(item, item.name, rootSharedCssVarKeys)
}

const itemFiles = readdirSync(new URL('../registry/', import.meta.url))
  .filter((file) => file.endsWith('.json'))
  .sort()
const rootItemsByName = new Map(items.map((item) => [item.name, item]))
const CardItem = rootItemsByName.get('card')
const cardComposerItem = rootItemsByName.get('card-composer')
const mdRenderItem = rootItemsByName.get('md-render')
const mdEditorItem = rootItemsByName.get('md-editor')
const canvasTransparencyItem = rootItemsByName.get('canvas-transparency')
const imageUploaderItem = rootItemsByName.get('image-uploader')
const imageViewItem = rootItemsByName.get('image-view')
const ocrCardItem = rootItemsByName.get('ocr-card')
const ocrDetailItem = rootItemsByName.get('ocr-detail')
const tagPickerItem = rootItemsByName.get('tag-picker')
const topBarItem = rootItemsByName.get('top-bar')

assert.ok(itemFiles.includes('style.json'), 'Registry item files must include style.json.')
assert.ok(!rootItemsByName.has('editable-card'), 'Removed @weimo/editable-card item must not be listed in the root registry.')
assert.ok(!itemFiles.includes('editable-card.json'), 'Removed EditableCard must not have registry/editable-card.json.')
assert.ok(!rootItemsByName.has('icon-button'), 'Removed @weimo/icon-button item must not be listed in the root registry after the split.')
assert.ok(!itemFiles.includes('icon-button.json'), 'Removed IconButton must not have registry/icon-button.json after the split.')
assert.ok(CardItem, 'Root registry must include the @weimo/card item.')
assert.ok(itemFiles.includes('card.json'), 'Registry item files must include card.json.')
assert.ok(cardComposerItem, 'Root registry must include the @weimo/card-composer item.')
assert.ok(itemFiles.includes('card-composer.json'), 'Registry item files must include card-composer.json.')
assert.ok(
  !rootItemsByName.has('composer-shell'),
  'Internal ComposerShell must not be listed as a standalone registry item.',
)
assert.ok(!rootItemsByName.has('share-card'), 'Removed @weimo/share-card item must not be listed in the root registry.')
assert.ok(!itemFiles.includes('share-card.json'), 'Removed ShareCard must not have registry/share-card.json.')
assert.ok(!rootItemsByName.has('image-detail'), 'Removed @weimo/image-detail item must not be listed in the root registry.')
assert.ok(!itemFiles.includes('image-detail.json'), 'Removed ImageDetail must not have registry/image-detail.json.')
assert.ok(!rootItemsByName.has('image-detail-view'), 'Removed @weimo/image-detail-view item must not be listed in the root registry.')
assert.ok(!itemFiles.includes('image-detail-view.json'), 'Removed ImageDetailView must not have registry/image-detail-view.json.')
assert.ok(canvasTransparencyItem, 'Root registry must include the @weimo/canvas-transparency item.')
assert.ok(itemFiles.includes('canvas-transparency.json'), 'Registry item files must include canvas-transparency.json.')
assert.ok(imageUploaderItem, 'Root registry must include the @weimo/image-uploader item.')
assert.ok(imageViewItem, 'Root registry must include the @weimo/image-view item.')
assert.ok(ocrCardItem, 'Root registry must include the @weimo/ocr-card item.')
assert.ok(itemFiles.includes('ocr-card.json'), 'Registry item files must include ocr-card.json.')
assert.ok(ocrDetailItem, 'Root registry must include the @weimo/ocr-detail item.')
assert.ok(itemFiles.includes('ocr-detail.json'), 'Registry item files must include ocr-detail.json.')
assert.ok(tagPickerItem, 'Root registry must include the @weimo/tag-picker item.')
assert.ok(!rootItemsByName.has('tag-edit-bar'), 'Removed @weimo/tag-edit-bar item must not be listed in the root registry.')
assert.ok(!itemFiles.includes('tag-edit-bar.json'), 'Removed TagEditBar must not have registry/tag-edit-bar.json.')
const promotedRegistryNames = [
  'canvas-transparency',
  'image-view',
  'ocr-card',
  'ocr-composer',
  'ocr-detail',
  'float-bar',
  'bottom-bar',
  'card-top-bar',
  'ghost-icon-button',
  'glass-icon-button',
  'text-button',
  'mode-button',
  'card-tool-bar',
  'action-dialog',
  'tag-tree-row',
  'chip',
  'chip-button',
  'tag-bar',
  'md',
  'md-editor',
  'md-render',
  'md-view',
  'math-editor',
  'heat-color',
  'bg-blur',
  'bg-color',
  'pressable',
  'text-color',
  'font-size',
  'token-preview-card',
  'border-color',
  'border-radius',
  'card-surface',
  'glass-surface',
  'popup-surface',
]

for (const name of promotedRegistryNames) {
  assert.ok(rootItemsByName.has(name), `Root registry must include @weimo/${name}.`)
  assert.ok(itemFiles.includes(`${name}.json`), `Registry item files must include ${name}.json.`)
}
assert.ok(topBarItem, 'Root registry must include the @weimo/top-bar item.')
for (const filePath of [
  'src/components/image-view.tsx',
  'src/components/image-view.css',
]) {
  assert.ok(
    imageViewItem.files.some((file) => file.path === filePath),
    `ImageView registry item must ship ${filePath}.`,
  )
}
assert.deepEqual(
  imageViewItem.registryDependencies,
  ['@weimo/style', '@weimo/utils', '@weimo/action-dialog', '@weimo/glass-icon-button', '@weimo/menu'],
  'ImageView registry item must install detail dialog and display-mode menu internals.',
)
assert.deepEqual(
  imageViewItem.dependencies,
  ['lucide-react'],
  'ImageView registry item must install lucide-react for display-mode icons.',
)
assert.deepEqual(
  ocrCardItem.registryDependencies,
  [
    '@weimo/style',
    '@weimo/utils',
    '@weimo/card',
    '@weimo/image-view',
    '@weimo/ocr-detail',
  ],
  'OcrCard registry item must install Card, OcrDetail, ImageView, style, and utils.',
)
assert.deepEqual(
  ocrCardItem.dependencies,
  ['lucide-react'],
  'OcrCard registry item must install lucide-react for its header icons.',
)
for (const filePath of [
  'src/components/ocr-card.tsx',
  'src/components/ocr-card.css',
]) {
  assert.ok(
    ocrCardItem.files.some((file) => file.path === filePath),
    `OcrCard registry item must ship ${filePath}.`,
  )
}
assert.deepEqual(
  CardItem.registryDependencies,
  ['@weimo/style', '@weimo/utils'],
  'Card registry item must keep only shared style and utils registry dependencies.',
)
for (const filePath of [
  'src/components/card-composer.tsx',
  'src/components/composer-shell.tsx',
  'src/components/card-composer.css',
]) {
  assert.ok(
    cardComposerItem.files.some((file) => file.path === filePath),
    `CardComposer registry item must ship ${filePath}.`,
  )
}
assert.deepEqual(
  CardItem.dependencies.filter((dependency) =>
    dependency.startsWith('remark-') || dependency === 'unified',
  ),
  ['remark-gfm', 'remark-math', 'remark-parse', 'remark-stringify', 'remark-breaks', 'unified'],
  'Card registry item must install all unified and remark packages used by MdView and MdRender.',
)
for (const [item, itemName] of [
  [CardItem, 'Card'],
]) {
  assert.ok(
    item.files.some((file) => file.path === 'src/components/markdown-content.css'),
    `${itemName} registry item must ship shared Markdown content CSS.`,
  )
}
for (const [item, itemName] of [
  [CardItem, 'Card'],
  [mdRenderItem, 'MdRender'],
  [mdEditorItem, 'MdEditor'],
]) {
  assert.ok(
    item.files.some((file) => file.path === 'src/components/markdown-image-size.ts'),
    `${itemName} registry item must ship the shared Markdown intrinsic image sizing helper.`,
  )
}
const mdRenderCarrierItems = items.filter((item) =>
  item.files?.some((file) => file.path === 'src/components/md-render.tsx'),
)

for (const item of mdRenderCarrierItems) {
  assert.ok(
    item.files.some((file) => file.path === 'src/components/markdown-image-renderer.ts'),
    `${item.name} registry item must ship the shared Markdown image renderer contract.`,
  )
  assert.ok(
    item.dependencies.includes('rehype-raw') &&
      item.dependencies.includes('rehype-sanitize'),
    `${item.name} registry item must install raw HTML parsing and sanitizing for MdRender.`,
  )
  assert.ok(
    item.files.some((file) => file.path === 'src/components/markdown-parenthesized-list.ts'),
    `${item.name} registry item must ship the parenthesized list grammar used by MdRender.`,
  )
  assert.ok(
    item.files.some((file) => file.path === 'src/components/markdown-sanitize.ts'),
    `${item.name} registry item must ship the sanitizer schema used by MdRender.`,
  )
  assert.ok(
    item.files.some((file) => file.path === 'src/components/markdown-option-grid.ts'),
    `${item.name} registry item must ship the shared option-grid measurement.`,
  )
}

const mdEditorCarrierItems = items.filter((item) =>
  item.files?.some((file) => file.path === 'src/components/md-editor/md-editor-extensions.ts'),
)

for (const item of mdEditorCarrierItems) {
  for (const filePath of [
    'src/components/markdown-image-renderer.ts',
    'src/components/markdown-parenthesized-list.ts',
    'src/components/md-editor/md-editor-content-format.ts',
    'src/components/md-editor/md-editor-table.ts',
    'src/components/md-editor/md-editor-ordered-list.ts',
    'src/components/md-editor/md-editor-option-grid.ts',
    'src/components/md-editor/md-editor-list-image-layout.ts',
    'src/components/md-editor/md-editor-image-view.tsx',
    'src/components/markdown-option-grid.ts',
  ]) {
    assert.ok(
      item.files.some((file) => file.path === filePath),
      `${item.name} registry item must ship ${filePath} for MdEditor Markdown support.`,
    )
  }

  assert.ok(
    item.dependencies?.includes('@tiptap/extension-list'),
    `${item.name} registry item must install @tiptap/extension-list for its custom ordered-list nodes.`,
  )
}
assert.ok(
  rootItemsByName.has('md-render') && itemFiles.includes('md-render.json'),
  'MdRender must have a standalone public registry item.',
)
for (const filePath of [
  'src/components/card-top-bar.tsx',
  'src/components/card-top-bar.css',
  'src/components/mode-button.tsx',
  'src/components/mode-button.css',
]) {
  assert.ok(
    CardItem.files.some((file) => file.path === filePath),
    `Card registry item must ship internal ${filePath}.`,
  )
}
for (const filePath of [
  'src/components/card.tsx',
  'src/components/card-resolvers.tsx',
  'src/components/deferred-md-editor-toolbar.tsx',
  'src/components/card-editable.css',
  'src/components/card.css',
  'src/components/card-top-bar.tsx',
  'src/components/card-top-bar.css',
  'src/components/mode-button.tsx',
  'src/components/mode-button.css',
  'src/components/card-tool-bar.tsx',
  'src/components/card-tool-bar.css',
  'src/components/md-view.tsx',
  'src/components/md-render.tsx',
  'src/components/markdown-content.css',
  'src/components/markdown-centered-quote.ts',
  'src/components/markdown-image-size.ts',
  'src/components/md-editor.tsx',
  'src/components/md-editor/index.tsx',
  'src/components/md-editor/md-editor-types.ts',
  'src/components/md-editor/md-editor.tsx',
  'src/components/md-editor/md-editor-toolbar.tsx',
  'src/components/md-editor/use-md-editor.ts',
  'src/components/md-editor/md-editor-extensions.ts',
  'src/components/md-editor/md-editor-centered-quote.ts',
  'src/components/md-editor/md-editor-image.ts',
  'src/components/md-editor/md-editor-markdown.ts',
  'src/components/md-editor/md-editor-save-keymap.ts',
  'src/components/md-editor/math-editor.tsx',
  'src/components/md-editor/md-editor.css',
  'src/components/tag-bar.tsx',
  'src/components/tag-bar.css',
  'src/components/chip-button.tsx',
  'src/components/chip-button.css',
  'src/components/chip-surface.tsx',
  'src/components/chip-surface-model.ts',
  'src/components/chip-surface.css',
  'src/components/glass-surface.tsx',
  'src/components/glass-surface-model.ts',
  'src/components/glass-surface.css',
  'src/components/animated-inline-size.tsx',
  'src/components/animated-inline-size-model.ts',
  'src/components/animated-inline-size.css',
  'src/components/tag-picker.tsx',
  'src/components/tag-picker/index.tsx',
  'src/components/tag-picker/tag-picker.tsx',
  'src/components/tag-picker/use-tag-picker.ts',
  'src/components/tag-picker/tag-picker-model.ts',
  'src/components/tag-picker/tag-picker.css',
  'src/components/action-dialog.tsx',
  'src/components/action-dialog.css',
  'src/components/float-bar.tsx',
  'src/components/float-bar.css',
  'src/components/bottom-bar.tsx',
  'src/components/bottom-bar.css',
  'src/components/glass-icon-button.tsx',
  'src/components/ghost-icon-button.tsx',
  'src/components/icon-button-model.ts',
  'src/components/icon-button.css',
  'src/components/menu.tsx',
  'src/components/menu.css',
  'src/components/menu/menu-variants.ts',
  'src/components/coss/dialog.tsx',
  'src/components/coss/dialog.css',
  'src/components/coss/button.tsx',
  'src/components/coss/button.css',
  'src/components/coss/input-group.tsx',
  'src/components/coss/input-group.css',
  'src/components/coss/scroll-area.tsx',
  'src/components/coss/scroll-area.css',
  'src/components/coss/tabs.tsx',
  'src/components/coss/tabs.css',
  'src/components/coss/toolbar.tsx',
  'src/components/coss/tooltip.tsx',
  'src/components/coss/tooltip.css',
]) {
  assert.ok(
    CardItem.files.some((file) => file.path === filePath),
    `Card registry item must ship internal ${filePath}.`,
  )
}
assert.ok(
  CardItem.dependencies?.includes('@tiptap/pm'),
  'Card registry item must install @tiptap/pm for internal MdEditor centered quote ProseMirror decorations.',
)
assert.ok(
  CardItem.dependencies?.includes('@base-ui/react'),
  'Card registry item must install @base-ui/react for MdEditor, TagPicker, and ActionDialog internals.',
)
for (const filePath of [
  'src/components/canvas-transparency.tsx',
  'src/components/canvas-transparency-cache.ts',
  'src/components/canvas-transparency-model.ts',
]) {
  assert.ok(
    canvasTransparencyItem.files.some((file) => file.path === filePath),
    `CanvasTransparency registry item must ship ${filePath}.`,
  )
}
assert.ok(
  !canvasTransparencyItem.dependencies || canvasTransparencyItem.dependencies.length === 0,
  'CanvasTransparency registry item must not add package dependencies.',
)
assert.deepEqual(
  canvasTransparencyItem.registryDependencies,
  ['@weimo/style'],
  'CanvasTransparency registry item must install only the shared style item.',
)
for (const filePath of [
  'src/components/image-uploader.tsx',
  'src/components/image-uploader.css',
]) {
  assert.ok(
    imageUploaderItem.files.some((file) => file.path === filePath),
    `ImageUploader registry item must ship ${filePath}.`,
  )
}
assert.ok(
  !imageUploaderItem.dependencies || imageUploaderItem.dependencies.length === 0,
  'ImageUploader registry item must let ImageView own package dependencies.',
)
assert.deepEqual(
  imageUploaderItem.registryDependencies,
  ['@weimo/style', '@weimo/utils', '@weimo/image-view'],
  'ImageUploader registry item must install ImageView.',
)
for (const filePath of [
  'src/components/bottom-bar.tsx',
  'src/components/bottom-bar.css',
]) {
  assert.ok(
    tagPickerItem.files.some((file) => file.path === filePath),
    `TagPicker registry item must ship internal ${filePath}.`,
  )
}
for (const filePath of [
  'src/components/tag-picker.tsx',
  'src/components/tag-picker/index.tsx',
  'src/components/tag-picker/tag-picker.tsx',
  'src/components/tag-picker/use-tag-picker.ts',
  'src/components/tag-picker/tag-picker-model.ts',
  'src/components/tag-picker/tag-picker.css',
  'src/components/glass-surface.tsx',
  'src/components/glass-surface-model.ts',
  'src/components/glass-surface.css',
  'src/components/action-dialog.tsx',
  'src/components/action-dialog.css',
  'src/components/float-bar.tsx',
  'src/components/float-bar.css',
  'src/components/bottom-bar.tsx',
  'src/components/bottom-bar.css',
  'src/components/coss/dialog.tsx',
  'src/components/coss/dialog.css',
  'src/components/coss/input-group.tsx',
  'src/components/coss/input-group.css',
  'src/components/coss/scroll-area.tsx',
  'src/components/coss/scroll-area.css',
]) {
  assert.ok(
    tagPickerItem.files.some((file) => file.path === filePath),
    `TagPicker registry item must ship internal ${filePath}.`,
  )
}
for (const filePath of ['src/components/tag-edit-bar.tsx', 'src/components/tag-edit-bar.css']) {
  assert.ok(
    !tagPickerItem.files.some((file) => file.path === filePath),
    `TagPicker registry item must not ship removed TagEditBar file ${filePath}.`,
  )
}
for (const filePath of ['src/components/float-bar.tsx', 'src/components/float-bar.css']) {
  assert.ok(
    !topBarItem.files.some((file) => file.path === filePath),
    `TopBar registry item must not ship unused internal ${filePath}.`,
  )
}

for (const file of itemFiles) {
  const item = JSON.parse(readFileSync(new URL(`../registry/${file}`, import.meta.url), 'utf8'))
  const rootItem = rootItemsByName.get(item.name)

  assert.ok(rootItem, `registry/${file} must also be present in root registry items.`)
  assert.deepEqual(item, rootItem, `registry/${file} must match the root registry payload.`)
  assertRegistryItem(item, `registry/${file}`)
  assertNoSharedCssVars(item, `registry/${file}`, rootSharedCssVarKeys)
}

const outputDir = mkdtempSync(join(tmpdir(), 'weimo-registry-contract-'))

try {
  execFileSync(
    packageRunnerCommand,
    packageRunnerArgs('dlx', [
      'shadcn@latest',
      'build',
      'registry.json',
      '--output',
      outputDir,
    ]),
    {
      cwd: root,
      env: {
        ...process.env,
        PATH: `${nodeBinDir}:${process.env.PATH}`,
      },
      stdio: 'pipe',
    },
  )

  const builtItems = readdirSync(outputDir).filter((file) => file.endsWith('.json') && file !== 'registry.json')

  assert.ok(builtItems.length > 0, 'shadcn build must emit item JSON files.')

  for (const file of builtItems) {
    const built = JSON.parse(readFileSync(join(outputDir, file), 'utf8'))

    if (built.type === 'registry:ui' || built.type === 'registry:lib') {
      assert.ok(
        Array.isArray(built.files) && built.files.length > 0,
        `${file} must include file contents after shadcn build.`,
      )
    }
  }
} finally {
  rmSync(outputDir, { recursive: true, force: true })
}
