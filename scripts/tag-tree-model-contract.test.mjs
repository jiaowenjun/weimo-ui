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
  buildVisibleRows,
  collectSelectedAncestorTags,
  resolveTagLabel,
  stageTagTreeRows,
  toggleExpandedTag,
} = await loadTsModule('src/components/tag-tree/tag-tree-model.ts')

const nodes = [
  {
    tag: 'writing',
    label: '写作',
    children: [
      { tag: 'writing/daily' },
      { tag: 'writing/ideas', label: '灵感' },
    ],
  },
  {
    tag: 'research',
    children: [
      { tag: 'research/papers', label: '论文' },
      { tag: 'research/quotes', label: '摘录' },
    ],
  },
]

assert.equal(resolveTagLabel({ tag: 'writing/daily' }), 'daily')
assert.equal(resolveTagLabel({ tag: '', label: '' }), '未命名')

assert.deepEqual(
  [...collectSelectedAncestorTags(nodes, 'research/quotes')],
  ['research'],
  'Selected child must collect its parent ancestor tag.',
)

assert.deepEqual(
  buildVisibleRows(nodes, new Set(['writing']), 'writing/daily').map((row) => ({
    tag: row.tag,
    depth: row.depth,
    expanded: row.expanded,
    selected: row.selected,
    label: row.label,
  })),
  [
    { tag: 'writing', depth: 0, expanded: true, selected: false, label: '写作' },
    { tag: 'writing/daily', depth: 1, expanded: false, selected: true, label: 'daily' },
    { tag: 'writing/ideas', depth: 1, expanded: false, selected: false, label: '灵感' },
    { tag: 'research', depth: 0, expanded: false, selected: false, label: 'research' },
  ],
  'Visible rows must include only expanded branches and preserve labels.',
)

assert.deepEqual(toggleExpandedTag(['writing'], 'writing'), [])
assert.deepEqual(toggleExpandedTag(['writing'], 'research'), ['writing', 'research'])

const previousRows = buildVisibleRows(nodes, new Set(['writing']), 'writing/daily')
const nextRows = buildVisibleRows(nodes, new Set([]), 'writing/daily')
const stagedRows = stageTagTreeRows(nextRows, previousRows)

assert.ok(
  stagedRows.some(
    (row) => row.tag === 'writing/ideas' && row.animationState === 'removing',
  ),
  'Rows missing from the next view must be staged as removing.',
)
assert.ok(
  stagedRows.some((row) => row.tag === 'writing' && row.animationState === undefined),
  'Surviving rows must not be marked as entering or removing.',
)
