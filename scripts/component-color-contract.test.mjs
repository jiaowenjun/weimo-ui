import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const componentsRoots = [
  join(root, 'packages/weimo-ui-core/src/components'),
  join(root, 'packages/weimo-ui-core/src/styles/variants'),
  join(root, 'packages/weimo-ui-card/src/components'),
  join(root, 'packages/weimo-ui-image/src/components'),
  join(root, 'packages/weimo-ui-stats/src/components'),
  join(root, 'packages/weimo-ui-markdown/src/components'),
  join(root, 'packages/weimo-ui-tagtree/src/components'),
]

function readProjectFile(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8')
}

function readJson(relativePath) {
  return JSON.parse(readProjectFile(relativePath))
}

function listCssFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = join(directory, entry.name)

    if (entry.isDirectory()) {
      return listCssFiles(absolutePath)
    }

    if (!entry.isFile() || !entry.name.endsWith('.css')) {
      return []
    }

    return [absolutePath]
  })
}

const rawColorPattern = /#[\da-f]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/gi
const allowlistedTokenFiles = new Set(['packages/weimo-ui-core/src/styles/tokens.css'])
const allowlistedComponentColors = new Map([
  [
    // 热力图背景色 token 随 HeatColor 迁入 stats:亮暗两主题的字面量值与 utilities 同文件交付
    'packages/weimo-ui-stats/src/components/heatmap/heat-color.css',
    new Set([
      'hsl(0 0% 94%)',
      'hsl(18 62% 89%)',
      'hsl(18 62% 78%)',
      'hsl(18 62% 65%)',
      'hsl(18 62% 52%)',
      'hsl(0 0% 19%)',
      'hsl(23 31% 22%)',
      'hsl(23 42% 32%)',
      'hsl(23 50% 44%)',
      'hsl(23 68% 56%)',
    ]),
  ],
  [
    // 今日环描边色随 Heatmap 迁入 stats:亮暗两主题的字面量值与组件同文件交付
    'packages/weimo-ui-stats/src/components/heatmap/heatmap.css',
    new Set(['hsl(18.1 71.9% 46.1% / 0.55)', 'hsl(0 0% 100% / 0.38)']),
  ],
  [
    'packages/weimo-ui-core/src/components/composites/cards/component-preview-card.css',
    new Set([
      'hsl(18.1 71.9% 46.1% / 0.72)',
      'hsl(222.2 47.4% 11.2% / 0.72)',
      'hsl(0 0% 100% / 0.68)',
      'hsl(0 0% 100% / 0.16)',
    ]),
  ],
  [
    'packages/weimo-ui-core/src/components/controls/capsule/capsule-frame.css',
    // hsl(var(--primary)) 是 token 组合而非裸色值:--color-primary 仅存在于
    // @theme inline(按需发射,组件 var() 引用解析失效),solid 前景必须直连
    // 底层通道 --primary。
    new Set(['hsl(var(--primary)']),
  ],
  [
    'packages/weimo-ui-core/src/components/surfaces/frosted-surface/frosted-surface.css',
    // 磨砂投影是 tone 驱动(data-background-tone)而非主题驱动,且透明同形影是
    // tone 翻转时 box-shadow alpha 插值的形状载体:引用 var(--shadow-card) 会
    // 在暗主题(其值为 none)破坏 tone/主题独立与插值连续性。亮态字面量与
    // --shadow-card 数值对齐、互不引用,frosted-surface-contract 已锁两侧同步。
    new Set(['hsl(0 0% 0% / 0)', 'hsl(0 0% 0% / 0.04)', 'hsl(0 0% 0% / 0.06)']),
  ],
])
const cssFiles = componentsRoots.flatMap(listCssFiles)
const tokensCss = readProjectFile('packages/weimo-ui-core/src/styles/tokens.css')
const rootRegistry = readJson('registry.json')
const styleRegistry = readJson('registry/style.json')
const rootStyleItem = rootRegistry.items.find((item) => item.name === 'style')
const hslOnlyTokenSources = [
  'packages/weimo-ui-core/src/styles/tokens.css',
  'packages/weimo-ui-core/src/styles/variants/background/bg-blur.ts',
  'packages/weimo-ui-core/src/styles/variants/background/bg-color.ts',
  'packages/weimo-ui-core/src/styles/variants/border/border-color.ts',
  'packages/weimo-ui-stats/src/components/heatmap/heat-color.tsx',
  'packages/weimo-ui-core/src/styles/variants/typography/text-color.ts',
  'registry/style.json',
]
const nonHslColorPattern = /#[\da-f]{3,8}\b|rgba?\(/i
const removedColorAliases = [
  '--color-brand',
  '--color-brand-foreground',
  '--color-brand-strong',
  '--color-fg-strong',
  '--color-text-muted',
  '--color-text-muted-subtle',
  '--color-danger',
]

assert.ok(cssFiles.length > 0, 'Component color contract must inspect component CSS files.')
assert.ok(rootStyleItem, 'Root registry must include the shared style item.')

for (const relativePath of hslOnlyTokenSources) {
  assert.doesNotMatch(
    readProjectFile(relativePath),
    nonHslColorPattern,
    `${relativePath} color token values must use hsl().`,
  )
}

assert.doesNotMatch(
  JSON.stringify(rootStyleItem),
  nonHslColorPattern,
  'registry.json style token values must use hsl().',
)

const violations = []
const removedAliasViolations = []

for (const file of cssFiles) {
  assert.ok(statSync(file).isFile(), `${file} must be a CSS file.`)

  const relativePath = relative(root, file)

  assert.ok(
    !allowlistedTokenFiles.has(relativePath),
    'Component color contract must not inspect shared token files.',
  )

  const source = readFileSync(file, 'utf8')

  for (const token of removedColorAliases) {
    if (source.includes(`var(${token})`)) {
      removedAliasViolations.push(`${relativePath}: var(${token})`)
    }
  }

  for (const match of source.matchAll(rawColorPattern)) {
    if (allowlistedComponentColors.get(relativePath)?.has(match[0])) continue

    const before = source.slice(0, match.index)
    const line = before.split('\n').length

    violations.push(`${relativePath}:${line}: ${match[0]}`)
  }
}

for (const token of removedColorAliases) {
  assert.ok(
    !tokensCss.includes(`${token}:`),
    `${token} must be removed from shared UI tokens; use the canonical --color-text-* or action tokens instead.`,
  )
  assert.ok(
    !tokensCss.includes(`var(${token})`),
    `shared UI tokens must not reference removed ${token}.`,
  )
}

for (const [source, styleItem] of [
  ['registry.json', rootStyleItem],
  ['registry/style.json', styleRegistry],
]) {
  for (const group of ['theme', 'light', 'dark']) {
    const cssVars = styleItem.cssVars?.[group] ?? {}

    for (const token of removedColorAliases) {
      assert.ok(
        !(token.slice(2) in cssVars),
        `${source} ${group} cssVars must not expose removed ${token}.`,
      )
    }

    for (const [key, value] of Object.entries(cssVars)) {
      assert.ok(
        typeof value !== 'string' ||
          removedColorAliases.every((token) => !value.includes(`var(${token})`)),
        `${source} ${group} cssVar ${key} must not reference a removed color alias.`,
      )
    }
  }
}

assert.deepEqual(
  removedAliasViolations,
  [],
  `Component CSS must use canonical --color-text-* or action tokens instead of removed color aliases:\n${removedAliasViolations.join('\n')}`,
)

assert.deepEqual(
  violations,
  [],
  `Component CSS must consume shared color tokens instead of raw color values:\n${violations.join('\n')}`,
)
