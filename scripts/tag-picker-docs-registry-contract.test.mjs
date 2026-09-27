import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

function readProjectFile(relativePath) {
  const absolutePath = join(root, relativePath)
  assert.ok(existsSync(absolutePath), `${relativePath} must exist.`)
  return readFileSync(absolutePath, 'utf8')
}

const manifestSource = readProjectFile('packages/weimo-ui-site/src/docs/components-manifest.ts')
const definitionsIndexSource = readProjectFile('packages/weimo-ui-site/src/docs/catalog/definitions.ts')
const definitionSource = readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-tagtree/tag.tsx')
const pageSource = readProjectFile('packages/weimo-ui-tagtree/src/tag-page.tsx')
const registryItem = JSON.parse(readProjectFile('registry/tag-picker.json'))
const rootRegistry = JSON.parse(readProjectFile('registry.json'))
const rootItem = rootRegistry.items.find((item) => item.name === 'tag-picker')
const smokeSource = readProjectFile('scripts/registry-smoke.test.mjs')

assert.ok(
  manifestSource.includes("id: 'tag-picker'") &&
  manifestSource.includes("name: 'TagPicker'") &&
  manifestSource.includes("registryName: 'tag-picker'") &&
  manifestSource.includes("packageExport: './components/tag-picker'") &&
  manifestSource.includes('docs: false') &&
  !manifestSource.includes("@/components/ui/tag-picker") &&
  !manifestSource.includes("ui/components/tag-picker"),
  'components-manifest.ts must keep TagPicker registry-only after the Tag page merge.',
)
assert.ok(
  definitionsIndexSource.includes("import { tagDefinition } from './packages/weimo-ui-tagtree/tag'") &&
  definitionsIndexSource.includes('tag: tagDefinition') &&
  !definitionsIndexSource.includes('tag-picker'),
  'component-definitions index must export the merged Tag definition for TagPicker.',
)
assert.ok(
  definitionSource.includes("id: 'tag'") &&
  definitionSource.includes('summary:') &&
  definitionSource.includes('status:') &&
  definitionSource.includes('preview:') &&
  !definitionSource.includes('code:') &&
  !definitionSource.includes('variantPreviews:') &&
  !definitionSource.includes('props:'),
  'TagPicker docs definition must have the simplified preview-only definition shape.',
)
for (const snippet of [
  "import { useState } from 'react'",
  'TagPicker,',
  'type TagPickerApplyPayload',
  "mode = 'insert'",
  "setPickerMode(mode === 'pick' ? 'pick' : tag ? 'update' : 'insert')",
  'tagOptions={tagOptions}',
  'selectedTags={selectedTags}',
  'onApply={handleApply}',
  'const [tagSlots, setTagSlots]',
  'const [activeSlotIndex, setActiveSlotIndex]',
  'function openTagPicker',
  'prefix={<Plus aria-hidden="true" />}',
  '标签',
  'nextSlots.push(\'\')',
  "const tagOptions = [",
  "'工作/项目'",
  "'杂项/待整理'",
  'TagPickerDemo',
]) {
  assert.ok(
    pageSource.includes(snippet),
    `TagPicker docs definition must include ${snippet}.`,
  )
}
assert.ok(
  !pageSource.includes("from 'weimo-ui-core/components/coss/button'") &&
  !pageSource.includes('tag-picker-preview__trigger') &&
  !pageSource.includes('<Button') &&
  !pageSource.includes('选择标签'),
  'TagPicker docs preview must use only tag chips as triggers, without the old select-tag button.',
)

assert.ok(rootItem, 'Root registry must include tag-picker item.')
assert.deepEqual(
  registryItem,
  rootItem,
  'registry/tag-picker.json must match the root registry tag-picker payload.',
)
assert.equal(registryItem.name, 'tag-picker')
assert.equal(registryItem.type, 'registry:ui')
assert.deepEqual(registryItem.categories, ['input', 'overlay'])
assert.deepEqual(registryItem.dependencies, ['@base-ui/react', 'lucide-react'])
assert.deepEqual(
  registryItem.registryDependencies,
  ['@weimo/style', '@weimo/utils', '@weimo/frosted-icon-button'],
)
for (const filePath of [
  'packages/weimo-ui-tagtree/src/components/tag-picker.tsx',
  'packages/weimo-ui-tagtree/src/components/tag-picker/index.tsx',
  'packages/weimo-ui-tagtree/src/components/tag-picker/tag-picker.tsx',
  'packages/weimo-ui-tagtree/src/components/tag-picker/use-tag-picker.ts',
  'packages/weimo-ui-tagtree/src/components/tag-picker/tag-picker-model.ts',
  'packages/weimo-ui-tagtree/src/components/tag-picker/tag-picker.css',
  'packages/weimo-ui-core/src/components/action-dialog.tsx',
  'packages/weimo-ui-core/src/components/action-dialog.css',
  'packages/weimo-ui-core/src/components/float-bar.tsx',
  'packages/weimo-ui-core/src/components/float-bar.css',
  'packages/weimo-ui-core/src/components/bottom-bar.tsx',
  'packages/weimo-ui-core/src/components/bottom-bar.css',
  'packages/weimo-ui-core/src/components/coss/dialog.tsx',
  'packages/weimo-ui-core/src/components/coss/dialog.css',
  'packages/weimo-ui-tagtree/src/components/coss/input-group.tsx',
  'packages/weimo-ui-tagtree/src/components/coss/input-group.css',
  'packages/weimo-ui-tagtree/src/components/coss/scroll-area.tsx',
  'packages/weimo-ui-tagtree/src/components/coss/scroll-area.css',
]) {
  assert.ok(
    registryItem.files.some((file) => file.path === filePath),
    `TagPicker registry item must ship ${filePath}.`,
  )
}

assert.ok(
  smokeSource.includes('TagPicker') &&
  smokeSource.includes('@/components/ui/tag-picker') &&
  smokeSource.includes("await runShadcnAdd(consumerDir, '@weimo/tag-picker')") &&
  smokeSource.includes("hits.includes('tag-picker.json')") &&
  smokeSource.includes("src/components/ui/tag-picker.tsx") &&
  smokeSource.includes("src/components/ui/tag-picker/tag-picker.tsx") &&
  smokeSource.includes("src/components/ui/action-dialog.tsx") &&
  smokeSource.includes("src/components/ui/float-bar.tsx") &&
  smokeSource.includes("src/components/ui/bottom-bar.tsx") &&
  smokeSource.includes("src/components/ui/coss/dialog.tsx") &&
  smokeSource.includes("src/components/ui/coss/input-group.tsx") &&
  smokeSource.includes("src/components/ui/coss/scroll-area.tsx"),
  'registry smoke test must install and typecheck TagPicker from the custom registry.',
)
