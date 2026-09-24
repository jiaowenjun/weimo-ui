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

async function loadTooltipFormatter() {
  const helperStart = componentSource.indexOf(
    'export function formatHeatmapTooltip',
  )
  const helperEnd = componentSource.indexOf(
    '\n\nexport function Heatmap',
    helperStart,
  )

  assert.notEqual(
    helperStart,
    -1,
    'Heatmap must export formatHeatmapTooltip.',
  )
  assert.notEqual(
    helperEnd,
    -1,
    'formatHeatmapTooltip must stay outside the component body.',
  )

  const helperSource = componentSource.slice(helperStart, helperEnd)
  const transpiled = ts.transpileModule(helperSource, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      verbatimModuleSyntax: true,
    },
    fileName: 'format-heatmap-tooltip.ts',
  }).outputText

  return import(`data:text/javascript;charset=utf-8,${encodeURIComponent(transpiled)}`)
}

const componentSource = readProjectFile(
  'src/components/heatmap/heatmap.tsx',
)
const componentCss = readProjectFile(
  'src/components/heatmap/heatmap.css',
)
const heatColorLevelsSource = readProjectFile(
  'src/components/heatmap/heat-color.tsx',
)
const tooltipSource = readProjectFile('src/components/coss/tooltip.tsx')
const tooltipCss = readProjectFile('src/components/coss/tooltip.css')
const popupSurfaceCss = readProjectFile('src/components/popup-surface.css')
const registryItem = JSON.parse(readProjectFile('registry/heatmap.json'))
const packageJson = JSON.parse(readProjectFile('package.json'))

const { formatHeatmapTooltip } = await loadTooltipFormatter()

assert.equal(
  formatHeatmapTooltip({ date: '2026-06-15', count: 0 }),
  '2026-06-15',
  'Zero-count heatmap cells must show only the date in the tooltip.',
)
assert.equal(
  formatHeatmapTooltip({ date: '2026-06-16', count: 3 }),
  '2026-06-16，3 条记录',
  'Positive-count heatmap cells must show the date and count in the tooltip.',
)

assert.ok(
  tooltipSource.includes("from '@base-ui/react/tooltip'") &&
    tooltipSource.includes('export function TooltipProvider') &&
    tooltipSource.includes('export function Tooltip') &&
    tooltipSource.includes('export function TooltipTrigger') &&
    tooltipSource.includes('export function TooltipPopup') &&
    tooltipSource.includes('BaseTooltip.Portal') &&
    tooltipSource.includes('BaseTooltip.Positioner') &&
    tooltipSource.includes('BaseTooltip.Popup'),
  'coss tooltip primitive must compose Base UI Tooltip provider, root, trigger, portal, positioner, and popup.',
)
assert.ok(
  tooltipCss.includes('.coss-tooltip__popup') &&
    tooltipCss.includes('z-index: 60;') &&
    tooltipCss.includes('font-size: var(--font-size-xs);') &&
    tooltipCss.includes("@import '../popup-surface.css';") &&
    popupSurfaceCss.includes('color: var(--color-text-primary);') &&
    popupSurfaceCss.includes('border: 1px solid transparent;') &&
    popupSurfaceCss.includes('border-color: var(--color-border);') &&
    popupSurfaceCss.includes('background: var(--color-bg-card);'),
  'coss tooltip CSS must define compact high-layer layout and delegate theme-aware material to PopupSurface.',
)
assert.ok(
  tooltipSource.includes('className="coss-tooltip__positioner"') &&
    tooltipSource.includes('data-slot="tooltip-positioner"'),
  'coss tooltip positioner must expose a stable high-layer wrapper for stacking diagnostics.',
)
assert.ok(
  tooltipCss.includes('.coss-tooltip__positioner') &&
    tooltipCss.includes('z-index: 60;'),
  'coss tooltip positioner must sit above fixed sidebars so heatmap tooltips are not covered.',
)
assert.ok(
  !tooltipCss.includes('background: var(--color-text-primary);') &&
    !tooltipCss.includes('color: var(--color-bg-card);'),
  'coss tooltip default colors must use a light surface in light mode and a dark surface in dark mode.',
)

assert.ok(
  componentSource.includes("from '../coss/tooltip'") &&
    componentSource.includes('<TooltipProvider') &&
    componentSource.includes('<Tooltip') &&
    componentSource.includes('TooltipTrigger') &&
    componentSource.includes('render={') &&
    componentSource.includes('<TooltipPopup>') &&
    componentSource.includes('{formatHeatmapTooltip(cell)}') &&
    componentSource.includes('export function formatHeatmapTooltip'),
  'Heatmap must wrap every cell button with coss Tooltip primitives and exported tooltip formatting.',
)
assert.ok(
  componentSource.includes('<button') &&
    componentSource.includes('type="button"') &&
    componentSource.includes('onClick={() => onDateSelect?.(cell.date, cell)}') &&
    componentSource.includes('aria-label={formatCellAriaLabel(cell)}'),
  'Tooltip integration must keep the actual heatmap trigger as the semantic clickable button.',
)
assert.ok(
  componentCss.includes('.heatmap__cell'),
  'Heatmap CSS must style the cell trigger.',
)
assert.ok(
  heatColorLevelsSource.includes('export function getHeatColorClassName') &&
    heatColorLevelsSource.includes('export function HeatColor') &&
    heatColorLevelsSource.includes('heatColorMap') &&
    heatColorLevelsSource.includes('heat-color--'),
  'Heatmap heat colors must live in the public HeatColor component module.',
)
assert.ok(
  !componentSource.includes('heatmap__cell-tooltip') &&
    !componentCss.includes('.heatmap__cell-tooltip') &&
    !componentCss.includes('anchor-name:'),
  'Heatmap must use the coss Tooltip default style without heatmap-specific popup hooks.',
)

assert.ok(
  registryItem.dependencies?.includes('@base-ui/react'),
  'Heatmap registry item must install @base-ui/react for coss Tooltip.',
)
assert.deepEqual(
  registryItem.registryDependencies,
  ['@weimo/style', '@weimo/utils'],
  'Heatmap registry item must keep only existing shared registry dependencies because tooltip files ship with the item.',
)
assert.ok(
  registryItem.files.some((file) => file.path === 'src/components/coss/tooltip.tsx') &&
    registryItem.files.some((file) => file.path === 'src/components/coss/tooltip.css'),
  'Heatmap registry item must ship the coss tooltip primitive files.',
)
assert.ok(
  registryItem.files.some((file) => file.path === 'src/components/heatmap/heat-color.tsx'),
  'Heatmap registry item must ship the public HeatColor implementation.',
)
assert.ok(
  packageJson.scripts?.test?.includes('scripts/heatmap-tooltip-contract.test.mjs'),
  'package.json test script must run heatmap-tooltip-contract.test.mjs.',
)
