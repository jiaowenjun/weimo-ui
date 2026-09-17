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

function blockFor(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))

  assert.ok(match, `${selector} block must exist.`)

  return match[1]
}

function assertIncludes(block, snippet, message) {
  assert.ok(block.includes(snippet), message)
}

const source = readProjectFile('src/components/stat-group.tsx')
const css = readProjectFile('src/components/stat-group.css')
const packageJson = JSON.parse(readProjectFile('package.json'))
const manifest = readProjectFile('src/docs/components-manifest.ts')
const definitionsIndex = readProjectFile('src/docs/component-definitions/index.ts')
const docsDefinition = readProjectFile('src/docs/component-definitions/stat-group.tsx')
const rootRegistry = JSON.parse(readProjectFile('registry.json'))
const standaloneRegistry = JSON.parse(readProjectFile('registry/stat-group.json'))
const registryItem = rootRegistry.items.find((item) => item.name === 'stat-group')

const rootBlock = blockFor(css, '.stat-group')
const itemBlock = blockFor(css, '.stat-group__item')
const valueBlock = blockFor(css, '.stat-group__value')
const labelBlock = blockFor(css, '.stat-group__label')

assert.ok(
  source.includes("import type { ComponentPropsWithoutRef, ReactNode } from 'react'"),
  'StatGroup must use plain div props plus ReactNode metric fields.',
)
assert.ok(
  source.includes("import { cn } from './lib/utils'") &&
    source.includes("import './stat-group.css'") &&
    !source.includes("from './stat-block'") &&
    !source.includes('StatBlock') &&
    !source.includes('StatBlockLabelResolver'),
  'StatGroup must own its metric block markup internally and avoid public StatBlock coupling.',
)
assert.ok(
  source.includes('export type StatGroupItem = {') &&
    source.includes('key?: string') &&
    source.includes('value: ReactNode') &&
    source.includes('label: ReactNode'),
  'StatGroup must expose item objects with final display value and label slots.',
)
assert.ok(
  source.includes("export type StatGroupProps = ComponentPropsWithoutRef<'div'> & {") &&
    source.includes('items?: StatGroupItem[]'),
  'StatGroup must expose optional items plus div props.',
)
assert.ok(
  source.includes('export function StatGroup') &&
    source.includes("className={cn('stat-group', className)}") &&
    source.includes('role={role ?? ') &&
    source.includes("role ?? 'group'") &&
    source.includes('items.map((item, index) =>') &&
    source.includes("className=\"stat-group__item\"") &&
    source.includes('<span className="stat-group__value">{item.value}</span>') &&
    source.includes('<span className="stat-group__label">{item.label}</span>') &&
    source.includes('{children}'),
  'StatGroup must render item data through internal metric markup while preserving children composition.',
)
assert.ok(
  !source.includes('note_count') &&
    !source.includes('wordCount') &&
    !source.includes('activeDays') &&
    !source.includes('Intl.NumberFormat'),
  'StatGroup must not own memo stats formatting or Skyline data-model concerns.',
)

assertIncludes(rootBlock, 'display: flex;', 'StatGroup root must use the Skyline metrics row flex layout.')
assertIncludes(rootBlock, 'flex-direction: row;', 'StatGroup metrics must render horizontally.')
assertIncludes(rootBlock, 'justify-content: space-between;', 'StatGroup must preserve Skyline three-column spacing.')
assertIncludes(rootBlock, 'width: 100%;', 'StatGroup must fill the caller-owned metrics width by default.')
assertIncludes(rootBlock, 'max-width: 243px;', 'StatGroup must mirror the 486rpx heatmap content width as 243px.')
assertIncludes(rootBlock, 'margin: 0 auto 12px;', 'StatGroup must mirror 24rpx bottom spacing as 12px.')
assertIncludes(rootBlock, 'gap: 16px;', 'StatGroup must keep a minimum responsive gap between metrics.')
assertIncludes(itemBlock, 'flex: 0 1 auto;', 'StatGroup items must not force equal-width three-column layout.')
assertIncludes(itemBlock, 'display: flex;', 'StatGroup item must use the former StatBlock flex layout.')
assertIncludes(itemBlock, 'flex-direction: column;', 'StatGroup item must stack value above label.')
assertIncludes(itemBlock, 'align-items: flex-start;', 'StatGroup item must keep Skyline left alignment.')
assertIncludes(
  valueBlock,
  'font-size: var(--font-size-stat);',
  'StatGroup value must use the shared statistic text token.',
)
assertIncludes(valueBlock, 'font-weight: 600;', 'StatGroup value must keep Skyline weight.')
assertIncludes(valueBlock, 'line-height: 1;', 'StatGroup value must keep tight numeric line height.')
assertIncludes(valueBlock, 'letter-spacing: -0.05em;', 'StatGroup value must keep Skyline numeric tracking.')
assertIncludes(
  valueBlock,
  'color: var(--color-text-secondary);',
  'StatGroup value must use the shared muted text token.',
)
assertIncludes(labelBlock, 'font-size: var(--font-size-sm);', 'StatGroup label must use shared small text.')
assertIncludes(labelBlock, 'line-height: 1;', 'StatGroup label must keep compact Skyline line height.')
assertIncludes(labelBlock, 'margin-top: 8px;', 'StatGroup label must mirror 16rpx spacing as 8px.')
assertIncludes(labelBlock, 'margin-left: 1px;', 'StatGroup label must mirror the slight Skyline inset.')
assertIncludes(
  labelBlock,
  'color: var(--color-text-placeholder);',
  'StatGroup label must use the shared placeholder text token.',
)

assert.equal(
  packageJson.exports?.['./components/stat-group'],
  './src/components/stat-group.tsx',
  'package.json must export StatGroup.',
)
assert.ok(
  manifest.includes("id: 'stat-group'") &&
    manifest.includes("name: 'StatGroup'") &&
    manifest.includes("registryName: 'stat-group'") &&
    manifest.includes("packageExport: './components/stat-group'"),
  'Component manifest must include StatGroup.',
)
assert.ok(
  definitionsIndex.includes("import { statGroupDefinition } from './stat-group'") &&
    definitionsIndex.includes("'stat-group': statGroupDefinition"),
  'StatGroup docs definition must be wired into component-definitions/index.ts.',
)
assert.ok(
  docsDefinition.includes("import { StatGroup } from '../../components/stat-group'") &&
    docsDefinition.includes("id: 'stat-group'") &&
    docsDefinition.includes('const wordMetric = formatWordCountMetric(12345)') &&
    docsDefinition.includes('items={sidebarStatsItems}') &&
    docsDefinition.includes("label: '笔记'") &&
    docsDefinition.includes('value: wordMetric.value') &&
    docsDefinition.includes('label: wordMetric.label') &&
    docsDefinition.includes("label: '天'") &&
    !docsDefinition.includes('label: getWordCountUnit'),
  'StatGroup docs page must render the Skyline trio from preformatted display metrics.',
)
assert.ok(registryItem, 'Root registry must include the @weimo/stat-group item.')
assert.deepEqual(
  standaloneRegistry,
  registryItem,
  'registry/stat-group.json must match registry.json payload.',
)
assert.deepEqual(
  registryItem.files.map((file) => file.path),
  ['src/components/stat-group.tsx', 'src/components/stat-group.css'],
  'StatGroup registry item must ship the component and sidecar CSS.',
)
assert.deepEqual(
  registryItem.registryDependencies,
  ['@weimo/style', '@weimo/utils'],
  'StatGroup registry item must depend only on shared style and cn utility.',
)
assert.ok(
  !packageJson.exports?.['./components/stat-block'] &&
    !manifest.includes("id: 'stat-block'") &&
    !definitionsIndex.includes("from './stat-block'") &&
    !rootRegistry.items.some((item) => item.name === 'stat-block'),
  'StatBlock must not remain a public package, docs, or registry component.',
)
