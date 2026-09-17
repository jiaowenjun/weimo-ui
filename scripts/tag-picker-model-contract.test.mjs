import assert from 'node:assert/strict'
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
      verbatimModuleSyntax: true,
    },
    fileName: relativePath,
  }).outputText

  return import(`data:text/javascript;charset=utf-8,${encodeURIComponent(transpiled)}`)
}

const {
  applyTagPickerDraft,
  deriveTagPickerState,
  filterTagPickerOptions,
  normalizeTagPickerDraft,
  resolveTagPickerListFilterQuery,
  tagMatchesPickerQuery,
} = await loadTsModule('src/components/tag-picker/tag-picker-model.ts')

const tagOptions = ['工作/项目', '写作/日记', '研究/论文', '生活/灵感', '阅读/摘录']

assert.equal(normalizeTagPickerDraft('  ##工作/项目  '), '工作/项目')
assert.equal(normalizeTagPickerDraft('  # 写作  '), '写作')
assert.equal(normalizeTagPickerDraft(''), '')

assert.equal(tagMatchesPickerQuery('工作/项目', '工项'), true)
assert.equal(tagMatchesPickerQuery('工作/项目', '工作项目'), true)
assert.equal(tagMatchesPickerQuery('工作/项目', '项工'), false)
assert.deepEqual(filterTagPickerOptions(tagOptions, '研文'), ['研究/论文'])
assert.deepEqual(filterTagPickerOptions(tagOptions, ''), tagOptions)

assert.equal(
  resolveTagPickerListFilterQuery({
    mode: 'pick',
    draft: '工作/项目',
    targetTag: '',
    previousListFilterQuery: '',
    draftSource: 'sync-init',
  }),
  '',
)
assert.equal(
  resolveTagPickerListFilterQuery({
    mode: 'insert',
    draft: '工作/项目',
    targetTag: '',
    previousListFilterQuery: '工',
    draftSource: 'list-tap',
  }),
  '工',
)
assert.equal(
  resolveTagPickerListFilterQuery({
    mode: 'update',
    draft: '工作/项目',
    targetTag: '工作/项目',
    previousListFilterQuery: 'old',
    draftSource: 'input',
  }),
  '',
)

const insertState = deriveTagPickerState({
  mode: 'insert',
  targetTag: '',
  selectedTags: ['写作/日记'],
  rawDraft: '工作/项目',
  tagOptions,
  listFilterQuery: '',
  draftSource: 'input',
})

assert.equal(insertState.draft, '工作/项目')
assert.equal(insertState.listFilterQuery, '工作/项目')
assert.equal(insertState.confirmDisabled, false)

const insertBadgeState = deriveTagPickerState({
  mode: 'insert',
  targetTag: '',
  selectedTags: ['写作/日记'],
  rawDraft: '',
  tagOptions,
  listFilterQuery: '',
  draftSource: 'input',
})
assert.deepEqual(
  insertBadgeState.options.find((item) => item.tag === '写作/日记'),
  { tag: '写作/日记', disabled: true, optionBadge: '已选' },
)

const duplicateInsertState = deriveTagPickerState({
  mode: 'insert',
  targetTag: '',
  selectedTags: ['工作/项目'],
  rawDraft: '工作/项目',
  tagOptions,
  listFilterQuery: '',
  draftSource: 'input',
})
assert.equal(duplicateInsertState.confirmDisabled, true)

const updateState = deriveTagPickerState({
  mode: 'update',
  targetTag: '工作/项目',
  selectedTags: ['工作/项目', '写作/日记'],
  rawDraft: '生活/灵感',
  tagOptions,
  listFilterQuery: '',
  draftSource: 'input',
})
assert.equal(updateState.listFilterQuery, '生活/灵感')
assert.equal(updateState.confirmDisabled, false)

const updateBadgeState = deriveTagPickerState({
  mode: 'update',
  targetTag: '工作/项目',
  selectedTags: ['工作/项目', '写作/日记'],
  rawDraft: '#工作/项目',
  tagOptions,
  listFilterQuery: '',
  draftSource: 'input',
})
assert.deepEqual(
  updateBadgeState.options.find((item) => item.tag === '工作/项目'),
  { tag: '工作/项目', disabled: true, optionBadge: '原标签' },
)
assert.deepEqual(
  updateBadgeState.options.find((item) => item.tag === '写作/日记'),
  { tag: '写作/日记', disabled: true, optionBadge: '已选' },
)
assert.equal(updateBadgeState.confirmDisabled, true)

assert.equal(
  deriveTagPickerState({
    mode: 'update',
    targetTag: '工作/项目',
    selectedTags: ['工作/项目'],
    rawDraft: '',
    tagOptions,
    listFilterQuery: '',
    draftSource: 'input',
    allowEmptyRemove: true,
  }).confirmDisabled,
  false,
)
assert.equal(
  deriveTagPickerState({
    mode: 'update',
    targetTag: '工作/项目',
    selectedTags: ['工作/项目'],
    rawDraft: '',
    tagOptions,
    listFilterQuery: '',
    draftSource: 'input',
    allowEmptyRemove: false,
  }).confirmDisabled,
  true,
)
assert.equal(
  deriveTagPickerState({
    mode: 'pick',
    targetTag: '',
    selectedTags: [],
    rawDraft: '工作/项目',
    tagOptions,
    listFilterQuery: '',
    draftSource: 'input',
  }).confirmDisabled,
  false,
)
assert.equal(
  deriveTagPickerState({
    mode: 'pick',
    targetTag: '',
    selectedTags: [],
    rawDraft: '新标签',
    tagOptions,
    listFilterQuery: '',
    draftSource: 'input',
  }).confirmDisabled,
  true,
)

assert.deepEqual(
  applyTagPickerDraft({
    mode: 'insert',
    targetTag: '',
    selectedTags: ['写作/日记'],
    rawDraft: '工作/项目',
    tagOptions,
  }),
  { selectedTags: ['写作/日记', '工作/项目'], draft: '工作/项目', mode: 'insert' },
)
assert.deepEqual(
  applyTagPickerDraft({
    mode: 'pick',
    targetTag: '',
    selectedTags: [],
    rawDraft: '研究/论文',
    tagOptions,
  }),
  { selectedTags: ['研究/论文'], draft: '研究/论文', mode: 'pick' },
)
assert.deepEqual(
  applyTagPickerDraft({
    mode: 'update',
    targetTag: '工作/项目',
    selectedTags: ['工作/项目', '写作/日记'],
    rawDraft: '生活/灵感',
    tagOptions,
  }),
  { selectedTags: ['生活/灵感', '写作/日记'], draft: '生活/灵感', mode: 'update' },
)
assert.deepEqual(
  applyTagPickerDraft({
    mode: 'update',
    targetTag: '工作/项目',
    selectedTags: ['工作/项目', '写作/日记'],
    rawDraft: '',
    tagOptions,
    allowEmptyRemove: true,
  }),
  { selectedTags: ['写作/日记'], draft: '', mode: 'update' },
)
assert.equal(
  applyTagPickerDraft({
    mode: 'insert',
    targetTag: '',
    selectedTags: ['工作/项目'],
    rawDraft: '工作/项目',
    tagOptions,
  }),
  null,
)
assert.equal(
  applyTagPickerDraft({
    mode: 'pick',
    targetTag: '',
    selectedTags: [],
    rawDraft: '新标签',
    tagOptions,
  }),
  null,
)

const packageJson = JSON.parse(readProjectFile('package.json'))
assert.ok(
  packageJson.scripts?.test?.includes('scripts/tag-picker-model-contract.test.mjs'),
  'package.json test script must run tag-picker-model-contract.test.mjs.',
)
