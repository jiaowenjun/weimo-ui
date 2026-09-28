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
const definitionSource = readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-card/tag-bar.tsx')
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
  manifestSource.includes("packageName: 'weimo-ui-card'") &&
  manifestSource.includes("page: 'tag-bar'") &&
  manifestSource.includes('docs: false') &&
  !manifestSource.includes("@/components/ui/tag-picker") &&
  !manifestSource.includes("ui/components/tag-picker"),
  'components-manifest.ts must keep TagPicker registry-only under the card-group tag-bar page.',
)
assert.ok(
  definitionsIndexSource.includes("import { tagBarDefinition } from './packages/weimo-ui-card/tag-bar'") &&
  definitionsIndexSource.includes("'tag-bar': tagBarDefinition") &&
  !definitionsIndexSource.includes('tag-picker'),
  'component-definitions index must export the merged card-group TagBar definition for TagPicker.',
)
assert.ok(
  definitionSource.includes("id: 'tag-bar'") &&
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
  "import { TagPicker, type TagPickerApplyPayload, type TagPickerMode } from 'weimo-ui-card/components/tag-picker'",
  "import { TagBar } from 'weimo-ui-card/components/tag-bar'",
  "const [pickerMode, setPickerMode] = useState<TagPickerMode>('insert')",
  "setPickerMode(tag ? 'update' : 'insert')",
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
    definitionSource.includes(snippet),
    `TagPicker docs definition must include ${snippet}.`,
  )
}
assert.ok(
  !definitionSource.includes("from 'weimo-ui-core/components/coss/button'") &&
  !definitionSource.includes('tag-picker-preview__trigger') &&
  !definitionSource.includes('<Button'),
  'TagPicker docs preview must use only tag chips as triggers, without the old select-tag button.',
)
assert.ok(
  !pageSource.includes('TagPicker') && !pageSource.includes('TagBar'),
  'Tagtree tag page must not keep the moved TagPicker/TagBar demos.',
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
  'packages/weimo-ui-card/src/components/tag-picker.tsx',
  'packages/weimo-ui-card/src/components/tags/tag-picker/index.tsx',
  'packages/weimo-ui-card/src/components/tags/tag-picker/tag-picker.tsx',
  'packages/weimo-ui-card/src/components/tags/tag-picker/use-tag-picker.ts',
  'packages/weimo-ui-card/src/components/tags/tag-picker/tag-picker-model.ts',
  'packages/weimo-ui-card/src/components/tags/tag-picker/tag-picker.css',
  'packages/weimo-ui-core/src/components/composites/action-dialog/action-dialog.tsx',
  'packages/weimo-ui-core/src/components/composites/action-dialog/action-dialog.css',
  'packages/weimo-ui-core/src/components/layout/bars/float-bar.tsx',
  'packages/weimo-ui-core/src/components/layout/bars/float-bar.css',
  'packages/weimo-ui-core/src/components/layout/bars/bottom-bar.tsx',
  'packages/weimo-ui-core/src/components/layout/bars/bottom-bar.css',
  'packages/weimo-ui-core/src/components/primitives/dialog.tsx',
  'packages/weimo-ui-core/src/components/primitives/dialog.css',
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
  smokeSource.includes("src/components/ui/tags/tag-picker/tag-picker.tsx") &&
  smokeSource.includes("src/components/ui/action-dialog.tsx") &&
  smokeSource.includes("src/components/ui/float-bar.tsx") &&
  smokeSource.includes("src/components/ui/bottom-bar.tsx") &&
  smokeSource.includes("src/components/ui/coss/dialog.tsx") &&
  smokeSource.includes("src/components/ui/coss/input-group.tsx") &&
  smokeSource.includes("src/components/ui/coss/scroll-area.tsx"),
  'registry smoke test must install and typecheck TagPicker from the custom registry.',
)
