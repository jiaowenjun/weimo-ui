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

const manifestSource = readProjectFile('src/docs/components-manifest.ts')
const definitionsIndexSource = readProjectFile('src/docs/component-definitions/index.ts')
const definitionSource = readProjectFile('src/docs/component-definitions/tag-picker.tsx')
const registryItem = JSON.parse(readProjectFile('registry/tag-picker.json'))
const rootRegistry = JSON.parse(readProjectFile('registry.json'))
const rootItem = rootRegistry.items.find((item) => item.name === 'tag-picker')
const smokeSource = readProjectFile('scripts/registry-smoke.test.mjs')
const packageJson = JSON.parse(readProjectFile('package.json'))

assert.ok(
  manifestSource.includes("id: 'tag-picker'") &&
  manifestSource.includes("name: 'TagPicker'") &&
  manifestSource.includes("registryName: 'tag-picker'") &&
  manifestSource.includes("packageExport: './components/tag-picker'") &&
  !manifestSource.includes("@/components/ui/tag-picker") &&
  !manifestSource.includes("ui/components/tag-picker"),
  'components-manifest.ts must list TagPicker without detail-page import snippets.',
)
assert.ok(
  definitionsIndexSource.includes("import { tagPickerDefinition } from './tag-picker'") &&
  definitionsIndexSource.includes("'tag-picker': tagPickerDefinition"),
  'component-definitions index must export tagPickerDefinition.',
)
assert.ok(
  definitionSource.includes("id: 'tag-picker'") &&
  definitionSource.includes('summary:') &&
  definitionSource.includes('status:') &&
  definitionSource.includes('props:') &&
  definitionSource.includes('preview:') &&
  !definitionSource.includes('code:') &&
  !definitionSource.includes('variantPreviews:'),
  'TagPicker docs definition must have the simplified detail-page definition shape.',
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
  'prefix="+"',
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
  !definitionSource.includes("from '../../components/coss/button'") &&
  !definitionSource.includes('tag-picker-preview__trigger') &&
  !definitionSource.includes('<Button') &&
  !definitionSource.includes('选择标签'),
  'TagPicker docs preview must use only tag chips as triggers, without the old select-tag button.',
)
for (const propName of [
  'open',
  'mode',
  'tagOptions',
  'selectedTags',
  'targetTag',
  'initialDraft',
  'allowEmptyRemove',
  'title',
  'onOpenChange',
  'onApply',
]) {
  assert.ok(
    definitionSource.includes(`name: '${propName}'`),
    `TagPicker docs props must document ${propName}.`,
  )
}

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
  ['@weimo/style', '@weimo/utils', '@weimo/glass-icon-button'],
)
for (const filePath of [
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
  'src/components/coss/dialog.tsx',
  'src/components/coss/dialog.css',
  'src/components/coss/input-group.tsx',
  'src/components/coss/input-group.css',
  'src/components/coss/scroll-area.tsx',
  'src/components/coss/scroll-area.css',
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
assert.ok(
  packageJson.scripts?.test?.includes('scripts/tag-picker-docs-registry-contract.test.mjs'),
  'package.json test script must run tag-picker-docs-registry-contract.test.mjs.',
)
