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
  buildHeatmapCells,
  buildHeatmapColumns,
  buildHeatmapMonthLabels,
  formatHeatmapDateKey,
  getHeatmapLevel,
} = await loadTsModule('src/components/heatmap/heatmap-model.ts')

const today = '2026-06-18'
const dailyCounts = [
  { date: '2026-03-23', count: 0 },
  { date: '2026-03-24', count: 1 },
  { date: '2026-03-25', count: 3 },
  { date: '2026-03-26', count: 5 },
  { date: '2026-03-27', count: 6 },
  { date: '2026-06-18', count: 2 },
]

assert.equal(
  formatHeatmapDateKey(new Date(2026, 5, 8)),
  '2026-06-08',
  'formatHeatmapDateKey must format local dates as YYYY-MM-DD.',
)

assert.deepEqual(
  [-1, 0, 1, 2, 3, 4, 5, 6].map(getHeatmapLevel),
  [0, 0, 1, 2, 2, 3, 3, 4],
  'Heat levels must preserve Skyline thresholds.',
)

const cells = buildHeatmapCells(dailyCounts, today, '2026-03-25')

assert.equal(cells.length, 91, 'Fixed 13-week range must generate 91 cells.')
assert.equal(
  cells[0].date,
  '2026-03-23',
  'Range must start on Monday 12 weeks before today week.',
)
assert.equal(
  cells.at(-1).date,
  '2026-06-21',
  'Range must end on Sunday of the today week.',
)

assert.deepEqual(
  cells.slice(0, 7).map((cell) => cell.date),
  [
    '2026-03-23',
    '2026-03-24',
    '2026-03-25',
    '2026-03-26',
    '2026-03-27',
    '2026-03-28',
    '2026-03-29',
  ],
  'Each visible week must run Monday through Sunday.',
)

assert.deepEqual(
  cells.slice(0, 5).map((cell) => ({
    date: cell.date,
    count: cell.count,
    level: cell.level,
    isToday: cell.isToday,
    isActive: cell.isActive,
  })),
  [
    { date: '2026-03-23', count: 0, level: 0, isToday: false, isActive: false },
    { date: '2026-03-24', count: 1, level: 1, isToday: false, isActive: false },
    { date: '2026-03-25', count: 3, level: 2, isToday: false, isActive: true },
    { date: '2026-03-26', count: 5, level: 3, isToday: false, isActive: false },
    { date: '2026-03-27', count: 6, level: 4, isToday: false, isActive: false },
  ],
  'Cells must merge counts, levels, and active flags.',
)

assert.deepEqual(
  cells.find((cell) => cell.date === '2026-06-18'),
  {
    date: '2026-06-18',
    count: 2,
    level: 2,
    isToday: true,
    isActive: false,
  },
  'Today must be flagged and keep its count-derived level.',
)

const columns = buildHeatmapColumns(cells)

assert.equal(columns.length, 13, 'Cells must group into 13 columns.')
assert.ok(
  columns.every((column) => column.cells.length === 7),
  'Every column must contain exactly seven cells.',
)
assert.deepEqual(
  columns.map((column) => column.index),
  Array.from({ length: 13 }, (_, index) => index),
  'Column indexes must be stable and zero-based.',
)
assert.equal(
  columns.at(-1).cells.some((cell) => cell.date === today),
  true,
  'The final column must contain the ISO week for today.',
)

assert.deepEqual(
  buildHeatmapMonthLabels(cells),
  [
    { name: '4月', columnIndex: 1 },
    { name: '5月', columnIndex: 5 },
    { name: '6月', columnIndex: 10 },
  ],
  'Month labels must appear on columns containing the first day of a month.',
)

const packageJson = JSON.parse(readProjectFile('package.json'))

assert.ok(
  packageJson.scripts?.test?.includes('scripts/heatmap-model-contract.test.mjs'),
  'package.json test script must run heatmap-model-contract.test.mjs.',
)
