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

const packageJson = JSON.parse(readProjectFile('package.json'))
const readmeSource = readProjectFile('README.md')
const manifestSource = readProjectFile('src/docs/components-manifest.ts')
const pressableDemoSource = readProjectFile('src/docs/component-definitions/pressable-demo.tsx')
const mdDefinitionSource = readProjectFile('src/docs/component-definitions/md.tsx')
const appCss = readProjectFile('src/App.css')

assert.ok(
  packageJson.scripts?.test?.includes('scripts/token-style-detail-contract.test.mjs'),
  'package.json test script must run the Token / 样式 detail-page contract.',
)

for (const snippet of [
  '## Token / 样式 详情页规范',
  'Token / 样式 分组下的组件详情页只用于展示底层 token 值。',
  '真实使用场景可以出现在预览区，包括可交互的真实使用场景，但只能作为 token 值的可视化载体。',
  '页面主轴必须是 token 名称、亮/暗值、utility/helper 映射和最小必要说明。',
  '可交互场景必须明确绑定正在展示的 token，并且只展示真实 CSS 中存在的 hover、active、highlighted 等状态。',
  '不要把 Token / 样式 详情页写成组件 API、业务用法或 selector 行为文档。',
]) {
  assert.ok(readmeSource.includes(snippet), `README must document token-style detail-page rule: ${snippet}`)
}

assert.ok(
  manifestSource.includes("group: 'token-style'"),
  'components manifest must keep the Token / 样式 group explicit.',
)

for (const snippet of [
  'const pressableTokenGroups',
  'scenarioRows',
  'pressable-preview__scenario-grid',
  'pressable-preview__scenario',
  'data-token={scenario.token}',
  'pressablePreviewStateLabels',
  'pressable-preview__state-strip',
  'pressable-preview__state-chip',
  "getPressableToken('feedback')",
  "getPressableBgColorTone('feedback')",
  '--glass-surface-hover-bg',
  '--chip-surface-hover-background',
]) {
  assert.ok(pressableDemoSource.includes(snippet), `Pressable token-first preview must include ${snippet}.`)
}

for (const snippet of [
  "import { useState } from 'react'",
  'hoveredSampleKey',
  'activeSampleKey',
  'onPointerEnter',
  'onPointerDown',
  'data-state={stateLabel}',
  'states?: readonly PressablePreviewState[]',
  "const pressableHoverStates = ['idle', 'hover']",
  "const pressableHoverActiveStates = ['idle', 'hover', 'active']",
  "const pressableHighlightedStates = ['idle', 'highlighted']",
  'const scenarioStates = scenario.states ?? pressableHoverStates',
  "const scenarioSupportsActive = scenarioStates.some((state) => state === 'active')",
]) {
  assert.ok(
    pressableDemoSource.includes(snippet),
    `Pressable token-style preview must use interactive scenarios to expose token states through ${snippet}.`,
  )
}

for (const forbiddenPressedPreviewSnippet of [
  "state: 'pressed'",
  'pressedSampleKey',
  'setPressedSampleKey',
  'lockedSampleKey',
  'aria-pressed',
  'data-pressed',
  'setLockedSampleKey',
]) {
  assert.ok(
    !pressableDemoSource.includes(forbiddenPressedPreviewSnippet),
    `Pressable token-style preview must not invent pressed state through ${forbiddenPressedPreviewSnippet}.`,
  )
}

for (const snippet of [
  'markdownStyleTokenGroups',
  'renderMarkdownTokenPreview',
  'values: readonly MarkdownStyleTokenValue[]',
  'md-style-preview__token-values',
  '<dt>{value.label}</dt>',
  '<code>{value.value}</code>',
  'aria-label="Markdown 渲染相关 token 按排版、结构和富内容分组。"',
  "title: '排版'",
  "title: '结构'",
  "title: '富内容'",
  'md-style-preview__token-grid',
  'md-style-preview__token-group',
  'md-style-preview__usage-scene',
  'aria-label="Markdown token 值真实场景预览"',
  '<Md content={mdRenderSample} />',
  '--color-text-primary',
  '--font-line-height-reading',
  '--font-size-md',
  '--color-bg-hover',
  "role: '行内代码、表格外框、表格内部分隔和 hr'",
  "usedBy: 'inline code、table outer、table cell、hr'",
  '代码、表格滚动框、图片和可编辑数学节点圆角',
  'code、pre、scroll-block、img、.tiptap-mathematics-render',
  "value: 'hsl(0 0% 9%)'",
  "value: 'hsl(0 0% 98%)'",
  "value: '15px'",
  "value: '20px'",
  "value: '14px'",
  "value: 'hsl(40 12% 96%)'",
  "value: 'hsl(0 0% 20%)'",
]) {
  assert.ok(mdDefinitionSource.includes(snippet), `Md token-first preview must include ${snippet}.`)
}

for (const forbidden of [
  '<h3>Tokens</h3>',
  'md-style-preview__token-panel',
  'md-style-preview__section-header',
  "title: '正文排版'",
  "title: '引用与分隔'",
  "title: '代码与媒体'",
  "title: '数学公式'",
  '--color-bg-markdown-math-hover',
  '--md-inline-code-size',
  '--weimo-md-inline-code-size',
  '--color-bg-md-math-hover',
  "token: '--color-bg-page'",
  "preview: 'bg-page'",
  '代码、图片占位和 pre 背景',
  'inline code、pre、image-placeholder',
  "token: '--radius-xs'",
  '引用左线',
  "usedBy: 'blockquote、table cell、hr'",
  'markdownSelectorGroups',
  'renderMarkdownSelectorPreview',
  '<h3>Selectors</h3>',
  'md-style-preview__selector-grid',
  'md-style-preview__selector-group',
  'md-style-preview__selector-card',
]) {
  assert.ok(
    !mdDefinitionSource.includes(forbidden),
    `Md token-style preview must not become a selector behavior document through ${forbidden}.`,
  )
}

for (const snippet of [
  '.pressable-preview__scenario-grid',
  '.pressable-preview__scenario',
  '.pressable-preview__scenario[data-token="--glass-surface-hover-bg"]',
  '.pressable-preview__state-strip',
  '.pressable-preview__state-chip',
  '.pressable-preview__scenario:is(:hover, :focus-visible)',
  '.md-style-preview__token-grid',
  '.md-style-preview__token-group',
  '.md-style-preview__usage-scene',
  '.md-style-preview__token-card',
  '.md-style-preview__token-values',
  '.md-style-preview__token-value',
]) {
  assert.ok(appCss.includes(snippet), `App.css must include token-first preview style ${snippet}.`)
}

for (const forbidden of [
  '.md-style-preview__token-panel',
  '.md-style-preview__section-header',
  '.md-style-preview__selector-grid',
  '.md-style-preview__selector-card',
]) {
  assert.ok(!appCss.includes(forbidden), `App.css must remove old non-token-first style ${forbidden}.`)
}
