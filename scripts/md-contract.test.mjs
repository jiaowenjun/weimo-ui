import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse'
import ts from 'typescript'
import { unified } from 'unified'

const root = fileURLToPath(new URL('..', import.meta.url))

function readProjectFile(relativePath) {
  const absolutePath = join(root, relativePath)

  assert.ok(existsSync(absolutePath), `${relativePath} must exist.`)

  return readFileSync(absolutePath, 'utf8')
}

function cssBlockFor(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{(?<block>[^}]*)\\}`))

  assert.ok(match?.groups?.block, `App.css must include ${selector}.`)

  return match.groups.block
}

function cssBlocksFor(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const matches = [...source.matchAll(new RegExp(`${escapedSelector}\\s*\\{(?<block>[^}]*)\\}`, 'g'))]

  assert.ok(matches.length > 0, `App.css must include ${selector}.`)

  return matches.map((match) => match.groups?.block ?? '').join('\n')
}

const mdRenderSource = readProjectFile('packages/weimo-ui-markdown/src/components/md-render/md-render.tsx')
const optionGridSource = readProjectFile('packages/weimo-ui-markdown/src/components/markdown/option-grid.ts')
const markdownSanitizeSource = readProjectFile('packages/weimo-ui-markdown/src/components/markdown/sanitize.ts')
const parenthesizedListSource = readProjectFile('packages/weimo-ui-markdown/src/components/markdown/parenthesized-list.ts')
const markdownImageRendererSource = readProjectFile(
  'packages/weimo-ui-markdown/src/components/markdown/image-renderer.ts',
)
const markdownImageSizeSource = readProjectFile('packages/weimo-ui-markdown/src/components/markdown/image-size.ts')
const markdownContentCss = readProjectFile('packages/weimo-ui-markdown/src/styles/markdown-content.css')
const mdEditorCss = readProjectFile('packages/weimo-ui-markdown/src/components/md-editor/md-editor.css')
const definitionSource = readProjectFile(
  'packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-markdown/markdown-styles.tsx',
)
const mdRenderDefinitionSource = readProjectFile(
  'packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-markdown/markdown-render.tsx',
)
const mdRenderSimpleDefinitionSource = readProjectFile(
  'packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-markdown/markdown-render-simple.tsx',
)
const mdRenderSimpleComponentSource = readProjectFile(
  'packages/weimo-ui-markdown/src/components/md-render-simple/md-render-simple.tsx',
)
const mdEditorSimpleDefinitionSource = readProjectFile(
  'packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-markdown/markdown-edit-simple.tsx',
)
const mdEditorSimpleComponentSource = readProjectFile(
  'packages/weimo-ui-markdown/src/components/md-editor-simple/md-editor-simple.tsx',
)
const mdEditorSimpleExtensionsSource = readProjectFile(
  'packages/weimo-ui-markdown/src/components/md-editor-simple/md-editor-simple-extensions.ts',
)
const useMdEditorSimpleSource = readProjectFile(
  'packages/weimo-ui-markdown/src/components/md-editor-simple/use-md-editor-simple.ts',
)
const mdEditorExtensionsSource = readProjectFile(
  'packages/weimo-ui-markdown/src/components/md-editor/md-editor-extensions.ts',
)
const markdownSampleSource = readProjectFile(
  'packages/weimo-ui-site/src/docs/catalog/fixtures/markdown-sample.ts',
)
const appCss = readProjectFile('packages/weimo-ui-site/src/app/app.css')
const tokensCss = readProjectFile('packages/weimo-ui-markdown/src/styles/tokens.css')
const packageJson = JSON.parse(readProjectFile('package.json'))
const markdownPackageJson = JSON.parse(readProjectFile('packages/weimo-ui-markdown/package.json'))
const rootRegistry = JSON.parse(readProjectFile('registry.json'))
const standaloneMdRenderRegistry = JSON.parse(readProjectFile('registry/md-render.json'))
const standaloneMdRenderSimpleRegistry = JSON.parse(readProjectFile('registry/md-render-simple.json'))
const standaloneMdEditorSimpleRegistry = JSON.parse(readProjectFile('registry/md-editor-simple.json'))
const styleRegistry = JSON.parse(readProjectFile('registry/style.json'))
const rootMdRenderItem = rootRegistry.items.find((item) => item.name === 'md-render')
const rootMdRenderSimpleItem = rootRegistry.items.find((item) => item.name === 'md-render-simple')
const rootMdEditorSimpleItem = rootRegistry.items.find((item) => item.name === 'md-editor-simple')
const rootStyleItem = rootRegistry.items.find((item) => item.name === 'style')

const tokenGridBlock = cssBlockFor(appCss, '.app-shell__content--token-grid')
const mdGroupEffectBlock = cssBlockFor(appCss, '.md-style-preview__group-effect')
const editorSelectionPseudoBlock = cssBlockFor(mdEditorCss, '.md-editor__content ::selection')
const mdSelectionSampleBlock = cssBlockFor(appCss, '.md-style-preview__selection-sample')
const mdSelectionHighlightBlock = cssBlockFor(appCss, '.md-style-preview__selection-highlight')
const mdSelectionPseudoBlock = cssBlockFor(
  appCss,
  '.md-style-preview__selection-sample ::selection',
)
const markdownRootBlock = cssBlockFor(markdownContentCss, '.weimo-markdown-content')
const markdownRenderRootBlock = cssBlockFor(markdownContentCss, '.weimo-card-markdown')
const tokensRootBlock = cssBlockFor(tokensCss, ':root')
const tokensDarkBlock = cssBlockFor(tokensCss, '.dark')
const markdownImageBlock = cssBlockFor(
  markdownContentCss,
  '.md-editor__content.weimo-markdown-content img',
)

const markdownColorTokens = [
  ['--md-color', 'hsl(0 0% 9%)', 'hsl(0 0% 98%)'],
  ['--md-paragraph-color', 'hsl(0 0% 9%)', 'hsl(0 0% 98%)'],
  ['--md-h1-color', 'hsl(0 0% 9%)', 'hsl(0 0% 98%)'],
  ['--md-quote-color', 'hsl(0 0% 28%)', 'hsl(0 0% 64%)'],
  ['--md-code-border-color', 'hsl(0 0% 88%)', 'hsl(0 0% 28%)'],
  ['--md-link-color', 'hsl(0 0% 15%)', 'hsl(0 0% 96%)'],
  ['--md-img-placeholder-color', 'hsl(0 0% 74%)', 'hsl(0 0% 35%)'],
  ['--md-table-frame-border-color', 'hsl(0 0% 88%)', 'hsl(0 0% 28%)'],
  ['--md-table-cell-border-color', 'hsl(0 0% 88%)', 'hsl(0 0% 28%)'],
  ['--md-table-header-color', 'hsl(0 0% 28%)', 'hsl(0 0% 64%)'],
  ['--md-math-hover-bg', 'hsl(40 12% 96%)', 'hsl(0 0% 20%)'],
  ['--md-selection-bg', 'hsl(0 0% 15% / 0.2)', 'hsl(0 0% 96% / 0.2)'],
]
const markdownStaticTokens = [
  ['--md-font-size', '16px'],
  ['--md-line-height', '1.6'],
  ['--md-h1-font-size', '16px'],
  ['--md-h1-line-height', '1.6'],
  ['--md-quote-pad-inline', '20px'],
  ['--md-list-indent', '1.35em'],
  ['--md-list-wide-marker-indent', '2em'],
  ['--md-code-font-family', '"SFMono-Regular", "Cascadia Code", "Liberation Mono", Menlo, Consolas, monospace'],
  ['--md-code-font-size', '14px'],
  ['--md-code-border-radius', '8px'],
  ['--md-img-placeholder-font-size', '14px'],
  ['--md-img-placeholder-border-radius', '8px'],
  ['--md-img-border-radius', '8px'],
  ['--md-list-img-gap', '1em'],
  ['--md-table-border-radius', '8px'],
  ['--md-table-font-size', '13px'],
  ['--md-math-border-radius', '8px'],
]
const markdownTokenNames = [
  ...markdownColorTokens.map(([token]) => token),
  ...markdownStaticTokens.map(([token]) => token),
]
const markdownReferencedTokens = [
  ...new Set(
    [
      ...markdownContentCss.matchAll(/var\((--[^,)]+)/g),
      ...mdEditorCss.matchAll(/var\((--md-[^,)]+)/g),
    ].map((match) => match[1]),
  ),
]
const markdownDefinedTokens = [
  ...tokensRootBlock.matchAll(/^\s*(--md-[a-z0-9-]+):/gm),
].map((match) => match[1])
const legacyMarkdownTokenNames = [
  '--markdown-heading-2-color',
  '--markdown-heading-2-font-size',
  '--markdown-heading-2-line-height',
  '--markdown-strong-color',
  '--markdown-strikethrough-color',
  '--markdown-task-checkbox-accent-color',
  '--markdown-code-block-color',
  '--markdown-code-block-font-family',
  '--markdown-code-block-font-size',
  '--markdown-code-block-padding',
  '--markdown-code-block-border-color',
  '--markdown-code-block-border-radius',
  '--markdown-divider-color',
  '--markdown-color-text-primary',
  '--markdown-color-text-secondary',
  '--markdown-color-text-placeholder',
  '--markdown-color-primary',
  '--markdown-color-border',
  '--markdown-color-border-divider',
  '--markdown-color-bg-hover',
  '--markdown-font-size-base',
  '--markdown-font-size-md',
  '--markdown-font-size-sm',
  '--markdown-font-line-height-reading',
  '--markdown-font-mono',
  '--markdown-radius-sm',
  '--markdown-space-section-gap',
  '--markdown-quote-padding',
  '--markdown-list-indent-compact',
  '--markdown-list-indent-wide',
  '--markdown-table-border-color',
  '--markdown-heading-3-color',
  '--markdown-heading-3-font-size',
  '--markdown-heading-3-line-height',
  '--markdown-heading-4-color',
  '--markdown-heading-4-font-size',
  '--markdown-heading-4-line-height',
  '--markdown-heading-5-color',
  '--markdown-heading-5-font-size',
  '--markdown-heading-5-line-height',
  '--markdown-heading-6-color',
  '--markdown-heading-6-font-size',
  '--markdown-heading-6-line-height',
]

assert.ok(
  !('./components/md' in packageJson.exports) &&
    !('./components/md' in markdownPackageJson.exports) &&
    !('./styles/md.css' in markdownPackageJson.exports) &&
    !existsSync(join(root, 'packages/weimo-ui-markdown/src/components/md.tsx')) &&
    !existsSync(join(root, 'packages/weimo-ui-markdown/src/components/md')),
  'The redundant Md wrapper and its public style entry must stay removed.',
)

assert.deepEqual(
  markdownReferencedTokens.sort(),
  [...markdownTokenNames].sort(),
  'Markdown rendering CSS must depend exclusively on the complete --md-* theme contract.',
)
assert.deepEqual(
  markdownDefinedTokens.sort(),
  [...markdownTokenNames].sort(),
  'Markdown token definitions must not contain unreferenced or undocumented theme variables.',
)
assert.ok(
  markdownReferencedTokens.every((token) => token.startsWith('--md-')),
  'Markdown rendering CSS must not depend on external component or shared style tokens.',
)
assert.ok(
  !tokensCss.includes('--markdown-') &&
    !markdownContentCss.includes('--markdown-') &&
    !definitionSource.includes('--markdown-') &&
    !Object.keys(styleRegistry.cssVars.light).some((key) => key.startsWith('markdown-')) &&
    !Object.keys(styleRegistry.cssVars.dark).some((key) => key.startsWith('markdown-')) &&
    !Object.keys(rootStyleItem.cssVars.light).some((key) => key.startsWith('markdown-')) &&
    !Object.keys(rootStyleItem.cssVars.dark).some((key) => key.startsWith('markdown-')),
  'Public Markdown token surfaces must not retain the old --markdown-* namespace.',
)
for (const token of legacyMarkdownTokenNames) {
  const key = token.slice(2)

  assert.ok(
    !tokensCss.includes(token) &&
      !markdownContentCss.includes(token) &&
      !definitionSource.includes(token) &&
      !(key in styleRegistry.cssVars.light) &&
      !(key in styleRegistry.cssVars.dark) &&
      !(key in rootStyleItem.cssVars.light) &&
      !(key in rootStyleItem.cssVars.dark),
    `The obsolete Markdown token ${token} must be absent from every public surface.`,
  )
}

for (const [token, lightValue, darkValue] of markdownColorTokens) {
  const key = token.slice(2)

  assert.ok(
    tokensRootBlock.includes(`${token}: ${lightValue};`) &&
      tokensDarkBlock.includes(`${token}: ${darkValue};`),
    `packages/weimo-ui-markdown/src/styles/tokens.css must define concrete light and dark values for ${token}.`,
  )
  assert.equal(styleRegistry.cssVars.light[key], lightValue, `registry/style.json must export the light ${token}.`)
  assert.equal(styleRegistry.cssVars.dark[key], darkValue, `registry/style.json must export the dark ${token}.`)
  assert.equal(rootStyleItem?.cssVars.light[key], lightValue, `registry.json must export the light ${token}.`)
  assert.equal(rootStyleItem?.cssVars.dark[key], darkValue, `registry.json must export the dark ${token}.`)
}

for (const [token, value] of markdownStaticTokens) {
  const key = token.slice(2)

  assert.ok(
    tokensRootBlock.includes(`${token}: ${value};`) && !value.includes('var('),
    `packages/weimo-ui-markdown/src/styles/tokens.css must define a concrete value for ${token}.`,
  )
  assert.equal(styleRegistry.cssVars.light[key], value, `registry/style.json must export ${token}.`)
  assert.equal(rootStyleItem?.cssVars.light[key], value, `registry.json must export ${token}.`)
}

assert.ok(
  mdRenderDefinitionSource.includes("from './markdown-styles'") &&
    mdRenderDefinitionSource.includes('<MarkdownStylePreview />') &&
    mdRenderDefinitionSource.includes('...markdownStyleSearchAliases'),
  'The Markdown render page must include the style preview and its search aliases.',
)

assert.ok(
  mdRenderSimpleDefinitionSource.includes("from './markdown-styles'") &&
    mdRenderSimpleDefinitionSource.includes('<MarkdownSimpleStylePreview />') &&
    mdRenderSimpleDefinitionSource.includes('...markdownSimpleStyleSearchAliases'),
  'The simplified Markdown render page must include the filtered style preview and its search aliases.',
)
assert.ok(
  mdRenderSimpleDefinitionSource.includes(
    "import { MdRenderSimple } from 'weimo-ui-markdown/components/md-render-simple'",
  ) &&
    mdRenderSimpleDefinitionSource.includes('label="简化Markdown渲染"') &&
    mdRenderSimpleDefinitionSource.includes('mdRenderSimpleSample') &&
    !mdRenderSimpleDefinitionSource.includes('mdRenderSample'),
  'The simplified Markdown render page must render the MdRenderSimple card with its own sample.',
)
assert.ok(
  mdEditorSimpleDefinitionSource.includes(
    "import { MdEditorSimple } from 'weimo-ui-markdown/components/md-editor-simple'",
  ) &&
    mdEditorSimpleDefinitionSource.includes('label="简化Markdown编辑器"') &&
    mdEditorSimpleDefinitionSource.includes('mdRenderSimpleSample') &&
    !mdEditorSimpleDefinitionSource.includes('MathEditor'),
  'The simplified Markdown edit page must render the MdEditorSimple card without the math editor card.',
)
assert.ok(
  mdEditorSimpleExtensionsSource.includes('code: false') &&
    mdEditorSimpleExtensionsSource.includes('strike: false') &&
    mdEditorSimpleExtensionsSource.includes('marked: new Marked()') &&
    mdEditorSimpleExtensionsSource.includes('markedOptions: { gfm: false }') &&
    mdEditorSimpleExtensionsSource.includes("markdownTokenName: 'codespan'"),
  'MdEditorSimple must ship its own extension pipeline that drops inline code, strike marks, and GFM parsing on a private marked instance.',
)
assert.ok(
  !mdEditorExtensionsSource.includes('isSimple') &&
    !mdEditorExtensionsSource.includes('MdEditorVariant') &&
    !mdEditorExtensionsSource.includes('new Marked()'),
  'The full MdEditor extension pipeline must stay variant-free; the simple preset lives in its own module.',
)
assert.ok(
  mdEditorSimpleComponentSource.includes("import { useMdEditorSimple } from './use-md-editor-simple'") &&
    mdEditorSimpleComponentSource.includes(
      "export type MdEditorSimpleHandle = Omit<MdEditorHandle, 'convertSelectionToInlineMath'>",
    ) &&
    mdEditorSimpleComponentSource.includes(
      "export type MdEditorSimpleProps = Omit<MdEditorProps, 'variant'>",
    ) &&
    mdEditorSimpleComponentSource.includes("MdEditorSimple.displayName = 'MdEditorSimple'") &&
    !mdEditorSimpleComponentSource.includes("components/md-editor'") &&
    !mdEditorSimpleComponentSource.includes('<MdEditor ') &&
    !mdEditorSimpleComponentSource.includes('useMdEditor('),
  'MdEditorSimple must be a standalone implementation that composes its own editor hook without wrapping MdEditor or exposing math helpers.',
)
assert.ok(
  useMdEditorSimpleSource.includes('createMdEditorSimpleExtensions') &&
    !useMdEditorSimpleSource.includes('mathDialog') &&
    !useMdEditorSimpleSource.includes('MathClick') &&
    !useMdEditorSimpleSource.includes('InlineMath') &&
    !useMdEditorSimpleSource.includes('BlockMath'),
  'useMdEditorSimple must compose the simple extension pipeline without carrying any math dialog state.',
)
assert.ok(
  mdRenderSource.includes("export type MdRenderVariant = 'default' | 'simple'") &&
    mdRenderSource.includes('variant?: MdRenderVariant') &&
    mdRenderSource.includes("variant = 'default'") &&
    mdRenderSource.includes(
      "rehypePlugins={variant === 'simple' ? simpleRehypePlugins : fullRehypePlugins}",
    ) &&
    mdRenderSource.includes(
      "remarkPlugins={variant === 'simple' ? simpleRemarkPlugins : fullRemarkPlugins}",
    ),
  'MdRender must expose a simple variant that swaps the markdown plugin pipeline.',
)
const simpleRemarkPluginsList =
  mdRenderSource.match(/const simpleRemarkPlugins: PluggableList = \[([^\]]*)\]/)?.[1] ?? ''
const simpleRehypePluginsList =
  mdRenderSource.match(/const simpleRehypePlugins: PluggableList = \[([^\]]*)\]/)?.[1] ?? ''
assert.ok(
  simpleRemarkPluginsList.includes('unwrapInlineCodeRemarkPlugin') &&
    !simpleRemarkPluginsList.includes('remarkGfm') &&
    !simpleRemarkPluginsList.includes('remarkMath'),
  'The simple remark pipeline must drop GFM tables and math while unwrapping inline code.',
)
assert.ok(
  !simpleRehypePluginsList.includes('rehypeKatex'),
  'The simple rehype pipeline must not render KaTeX.',
)
assert.ok(
  mdRenderSimpleComponentSource.includes(
    "import { MdRender, type MdRenderProps } from 'weimo-ui-markdown/components/md-render'",
  ) &&
    mdRenderSimpleComponentSource.includes('variant="simple"') &&
    mdRenderSimpleComponentSource.includes("MdRenderSimple.displayName = 'MdRenderSimple'"),
  'MdRenderSimple must stay a thin variant preset wrapper around MdRender.',
)
const mdRenderSimpleSampleMatch = markdownSampleSource.match(
  /export const mdRenderSimpleSample = `([^`]*)`/,
)
assert.ok(
  mdRenderSimpleSampleMatch &&
    !mdRenderSimpleSampleMatch[1].includes('$') &&
    !mdRenderSimpleSampleMatch[1].includes('| --- |'),
  'The simplified sample must not contain math or table syntax, and inline code backticks cannot enter its template literal.',
)

for (const snippet of [
  "import { MdRender } from 'weimo-ui-markdown/components/md-render'",
  "import { ComponentPreviewCard } from 'weimo-ui-card/components/component-preview-card'",
  'markdownStyleTokens',
  'markdownStyleTokenGroups',
  'markdownStyleSearchAliases',
  'getMarkdownStyleToken',
  'renderMarkdownTokenGroupPreview',
  '<ComponentPreviewCard',
  'items={group.tokens.map((token) => {',
  "darkValue: typeof item.value === 'string' ? undefined : item.value.dark",
  'token: item.token',
  'className="md-style-preview__group-effect"',
  '{renderMarkdownTokenGroupPreview(group, RenderMarkdown)}',
  "light: 'hsl(0 0% 9%)'",
  "dark: 'hsl(0 0% 98%)'",
  "value: '16px'",
  "value: '1.6'",
  "value: '20px'",
  "value: '14px'",
  "light: 'hsl(40 12% 96%)'",
  "dark: 'hsl(0 0% 20%)'",
  "light: 'hsl(0 0% 15% / 0.2)'",
  "dark: 'hsl(0 0% 96% / 0.2)'",
  'md-style-preview__selection-sample',
  'md-style-preview__selection-highlight',
]) {
  assert.ok(definitionSource.includes(snippet), `Markdown style docs must include ${snippet}.`)
}
assert.deepEqual(
  [...definitionSource.matchAll(/token: '(--[^']+)'/g)]
    .map((match) => match[1])
    .sort(),
  [...markdownTokenNames].sort(),
  'Markdown style docs must expose every Markdown theme token without external token names.',
)
const markdownGroupSource = definitionSource.slice(
  definitionSource.indexOf('const markdownStyleTokenGroups = ['),
  definitionSource.indexOf('function getMarkdownStyleToken'),
)
assert.deepEqual(
  [...markdownGroupSource.matchAll(/label: '([^']+)'/g)].map((match) => match[1]),
  [
    '内容容器',
    '段落',
    '标题',
    '引用块',
    '列表',
    '代码',
    '链接',
    '图片',
    '列表与图片布局',
    '表格',
    '数学公式',
    '编辑选区',
  ],
  'Markdown style docs must group tokens by each rendered Markdown semantic node.',
)
assert.equal(
  [...definitionSource.matchAll(/<ComponentPreviewCard/g)].length,
  1,
  'Markdown style docs must render every semantic group through the shared ComponentPreviewCard map.',
)
assert.deepEqual(
  [...markdownGroupSource.matchAll(/'(--md-[a-z0-9-]+)'/g)]
    .map((match) => match[1])
    .sort(),
  [...markdownTokenNames].sort(),
  'Every Markdown token must appear in exactly one semantic-node group.',
)
assert.ok(
  !definitionSource.includes('md-style-preview__scene') &&
    !definitionSource.includes('mdRenderSample') &&
    !definitionSource.includes("from '../../../../components/primitives/card'") &&
    definitionSource.includes("'Markdown渲染'") &&
    definitionSource.includes("'Markdown样式'"),
  'Markdown style docs must drop the real-render scene card and keep both search names.',
)
assert.ok(
  !definitionSource.includes('summary:') &&
    !definitionSource.includes('usedBy') &&
    !definitionSource.includes("title: '排版'") &&
    !definitionSource.includes("title: '结构'") &&
    !definitionSource.includes("title: '富内容'") &&
    !definitionSource.includes('md-style-preview__token-group') &&
    !definitionSource.includes('md-style-preview__token-values') &&
    !definitionSource.includes('md-style-preview__usage-scene') &&
    !definitionSource.includes('md-style-preview__group-header') &&
    !definitionSource.includes('md-style-preview__scene-header'),
  'Markdown style docs must stay visual-only beyond semantic group headings.',
)
assert.ok(
  !definitionSource.includes('二三级标题字号') &&
    !definitionSource.includes('heading--h2/h3') &&
    !definitionSource.includes("token: '--radius-xs'") &&
    !definitionSource.includes("preview: 'radius-xs'") &&
    !definitionSource.includes('--md-code-size') &&
    !definitionSource.includes('--weimo-md-code-size') &&
    !definitionSource.includes('--color-bg-md-math-hover') &&
    !definitionSource.includes("token: '--color-bg-page'") &&
    !definitionSource.includes("preview: 'bg-page'") &&
    !definitionSource.includes('代码、图片占位和 pre 背景') &&
    !definitionSource.includes('inline code、pre、image-placeholder'),
  'Markdown token detail must not document removed Markdown-only local font-size, radius-xs, math-hover, or code background tokens.',
)

for (const forbidden of [
  '<h3>Tokens</h3>',
  'md-style-preview__token-panel',
  'md-style-preview__section-header',
  "title: '正文排版'",
  "title: '引用与分隔'",
  "title: '代码与媒体'",
  "title: '数学公式'",
  '--weimo-markdown-inline-code-size',
  '--space-card-markdown-quote-padding',
  '--color-bg-markdown-math-hover',
  '引用左线',
  "usedBy: 'blockquote、table cell、hr'",
  "role: '表格内部分隔和 hr'",
  "usedBy: 'table cell、hr'",
  "role: '行内代码、表格内部分隔和 hr'",
  "usedBy: 'inline code、table cell、hr'",
  'markdownSelectorGroups',
  'renderMarkdownSelectorPreview',
  '<h3>Selectors</h3>',
  'md-style-preview__selector-grid',
  'md-style-preview__selector-group',
  'md-style-preview__selector-card',
]) {
  assert.ok(!definitionSource.includes(forbidden), `Markdown style docs must not include ${forbidden}.`)
}

assert.ok(
  mdRenderSource.includes("import 'weimo-ui-markdown/styles/markdown-content.css'") &&
    markdownRenderRootBlock.includes('width: 100%;') &&
    markdownRootBlock.includes('min-width: 0;'),
  'MdRender must own its shared content styles and preserve the removed wrapper layout.',
)

const markdownImageSizeTestContext = { exports: {} }
vm.runInNewContext(
  ts.transpileModule(markdownImageSizeSource, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2023,
    },
  }).outputText,
  markdownImageSizeTestContext,
)

const halfSizeImage = {
  naturalWidth: 400,
  style: { width: '' },
}
markdownImageSizeTestContext.exports.setMarkdownImageHalfIntrinsicWidth(halfSizeImage)
assert.equal(
  halfSizeImage.style.width,
  '200px',
  'Markdown images below the cap must render at half their intrinsic width.',
)

const cappedHalfSizeImage = {
  naturalWidth: 954,
  style: { width: '' },
}
const cachedWidth = markdownImageSizeTestContext.exports.setMarkdownImageHalfIntrinsicWidth(
  cappedHalfSizeImage,
  '/ocr/images/example/assets/imgs/formula.jpg',
)
assert.equal(
  cappedHalfSizeImage.style.width,
  '300px',
  'Markdown images must cap their half-intrinsic display width at 300px.',
)
assert.equal(cachedWidth, '300px')
assert.equal(
  markdownImageSizeTestContext.exports.getCachedMarkdownImageWidth(
    '/ocr/images/example/assets/imgs/formula.jpg',
  ),
  '300px',
  'Markdown image width must be reusable before a same-source image loads again.',
)

for (let index = 0; index <= 256; index += 1) {
  markdownImageSizeTestContext.exports.setMarkdownImageHalfIntrinsicWidth(
    { naturalWidth: 100, style: { width: '' } },
    `/ocr/images/cache-${index}.jpg`,
  )
}
assert.equal(
  markdownImageSizeTestContext.exports.getCachedMarkdownImageWidth(
    '/ocr/images/cache-0.jpg',
  ),
  undefined,
  'Markdown image width cache must evict old entries instead of growing without a bound.',
)
assert.equal(
  markdownImageSizeTestContext.exports.getCachedMarkdownImageWidth(
    '/ocr/images/cache-256.jpg',
  ),
  '50px',
)

assert.ok(
  mdRenderSource.includes('useState,') &&
    mdRenderSource.includes('getCachedMarkdownImageWidth(resolvedSrc)') &&
    mdRenderSource.includes("visibility: width ? 'visible' : 'hidden'") &&
    /setMarkdownImageHalfIntrinsicWidth\(\s*event\.currentTarget,\s*resolvedSrc,?\s*\)/u.test(
      mdRenderSource,
    ),
  'MdRender must apply cached widths on the first frame and hide cold images until sizing finishes.',
)

for (const snippet of [
  'export type MdRenderImageRenderProps = MarkdownImageRenderProps',
  'export type MdRenderImageRenderer = MarkdownImageRenderer',
  'export type MdRenderImageSrcResolver = MarkdownImageSrcResolver',
  'renderImage?: MdRenderImageRenderer',
  'renderImage(imageProps)',
  '<img {...imageProps} />',
]) {
  assert.ok(
    mdRenderSource.includes(snippet),
    `MdRender must expose a caller-controlled image renderer while preserving its img fallback: ${snippet}`,
  )
}
assert.ok(
  markdownImageRendererSource.includes('export type MarkdownImageRenderProps =') &&
    markdownImageRendererSource.includes("Omit<ComponentPropsWithoutRef<'img'>, 'src'>") &&
    markdownImageRendererSource.includes('src: string') &&
    markdownImageRendererSource.includes('export type MarkdownImageRenderer = (') &&
    markdownImageRendererSource.includes('props: MarkdownImageRenderProps') &&
    markdownImageRendererSource.includes('export type MarkdownImageSrcResolver ='),
  'MdRender and MdEditor must share a renderer contract without depending on each other.',
)
assert.ok(
  mdRenderSource.includes('const imageProps: MdRenderImageRenderProps = {') &&
    mdRenderSource.includes("className: 'weimo-card-markdown__image'") &&
    mdRenderSource.includes('src: resolvedSrc') &&
    mdRenderSource.includes("visibility: width ? 'visible' : 'hidden'") &&
    mdRenderSource.includes('width: width ?? undefined'),
  'MdRender must pass the same resolved source, class, and measured sizing props to custom and native image renderers.',
)
assert.ok(
  mdRenderSource.includes('function trailingOrderedListImageRemarkPlugin()'),
  'MdRender must expose a Remark transform for the trailing ordered-list and single-image layout.',
)

const parenthesizedListTestContext = { exports: {} }
vm.runInNewContext(
  ts.transpileModule(parenthesizedListSource, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2023,
    },
  }).outputText,
  parenthesizedListTestContext,
)

const {
  PAREN_DECIMAL_MARKER_STYLE,
  PAREN_UPPER_ROMAN_MARKER_STYLE,
  formatParenthesizedListMarker,
  normalizeParenthesizedListMarkdown,
  parseParenthesizedListMarker,
} = parenthesizedListTestContext.exports

for (const [source, expected] of [
  ['（Ⅰ）求值', { canonical: '(I)', level: 1, markerStyle: 'paren-upper-roman', start: 1 }],
  ['（Ⅱ）证明', { canonical: '(II)', level: 1, markerStyle: 'paren-upper-roman', start: 2 }],
  ['(IV) fourth', { canonical: '(IV)', level: 1, markerStyle: 'paren-upper-roman', start: 4 }],
  ['① 条件', { canonical: '(1)', level: 2, markerStyle: 'paren-decimal', start: 1 }],
  ['② 结论', { canonical: '(2)', level: 2, markerStyle: 'paren-decimal', start: 2 }],
  ['（i）条件', { canonical: '(1)', level: 2, markerStyle: 'paren-decimal', start: 1 }],
  ['(ii) conclusion', { canonical: '(2)', level: 2, markerStyle: 'paren-decimal', start: 2 }],
  ['(12) item', { canonical: '(12)', level: 2, markerStyle: 'paren-decimal', start: 12 }],
]) {
  const parsed = parseParenthesizedListMarker(source)

  assert.ok(parsed, `Expected ${source} to parse as a parenthesized list marker.`)
  assert.equal(
    JSON.stringify({
      canonical: formatParenthesizedListMarker(parsed.markerStyle, parsed.start),
      level: parsed.level,
      markerStyle: parsed.markerStyle,
      start: parsed.start,
    }),
    JSON.stringify(expected),
  )
  assert.ok(parsed.consumed > 0)
}

assert.equal(PAREN_UPPER_ROMAN_MARKER_STYLE, 'paren-upper-roman')
assert.equal(PAREN_DECIMAL_MARKER_STYLE, 'paren-decimal')

for (const source of ['（IIII）invalid', '(IC) invalid', '正文中的 (I) 不应匹配', '(0) invalid']) {
  assert.equal(parseParenthesizedListMarker(source), null)
}

assert.equal(
  normalizeParenthesizedListMarkdown(
    ['（Ⅰ）first', '', '（Ⅱ）second', '', '    ① child', '', '    ② child', '', '```md', '① code', '```'].join('\n'),
  ),
  ['(I) first', '', '(II) second', '', '(1) child', '', '(2) child', '', '```md', '① code', '```'].join('\n'),
)
assert.equal(
  normalizeParenthesizedListMarkdown(
    ['```md', '① code', '```not-a-close', '② still code', '````', '（Ⅰ）outside'].join('\n'),
  ),
  ['```md', '① code', '```not-a-close', '② still code', '````', '(I) outside'].join('\n'),
  'Parenthesized marker normalization must honor complete CommonMark closing fence lines.',
)
assert.equal(
  normalizeParenthesizedListMarkdown('（i） first\n(ii) second'),
  '(1) first\n(2) second',
  'Lowercase parenthesized Roman markers must normalize to parenthesized decimals.',
)
assert.equal(
  normalizeParenthesizedListMarkdown(
    ['    ```md', '① outside', '    ```'].join('\n'),
  ),
  ['    ```md', '(1) outside', '    ```'].join('\n'),
  'Four-space indented backticks must not open a fenced region.',
)

const markdownSanitizeTestContext = {
  exports: {},
  require: (specifier) => {
    if (specifier === 'rehype-sanitize') return { defaultSchema }

    throw new Error(`Unexpected require: ${specifier}`)
  },
}
vm.runInNewContext(
  ts.transpileModule(markdownSanitizeSource, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2023,
    },
  }).outputText,
  markdownSanitizeTestContext,
)

const markdownSanitizeSchema = markdownSanitizeTestContext.exports.markdownSanitizeSchema

for (const markerType of ['1', 'a', 'A', 'i', 'I']) {
  const sanitizedTree = unified()
    .use(rehypeSanitize, markdownSanitizeSchema)
    .runSync({
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'ol',
          properties: { type: markerType },
          children: [],
        },
      ],
    })

  assert.equal(
    sanitizedTree.children[0]?.properties?.type,
    markerType,
    `Markdown sanitization must preserve the valid ordered-list marker type ${markerType}.`,
  )
}

const sanitizedInvalidOrderedListType = unified()
  .use(rehypeSanitize, markdownSanitizeSchema)
  .runSync({
    type: 'root',
    children: [
      {
        type: 'element',
        tagName: 'ol',
        properties: { type: 'invalid' },
        children: [],
      },
    ],
  })

assert.equal(
  sanitizedInvalidOrderedListType.children[0]?.properties?.type,
  undefined,
  'Markdown sanitization must reject invalid ordered-list marker types.',
)

const optionGridTestContext = { exports: {} }
vm.runInNewContext(
  ts.transpileModule(optionGridSource, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2023,
    },
  }).outputText,
  optionGridTestContext,
)
const resolveOptionGridColumns = optionGridTestContext.exports.resolveOptionGridColumns
const hasOptionGridBlockContent =
  optionGridTestContext.exports.hasOptionGridBlockContent

function optionGridElement(tagName, classNames = []) {
  return {
    classList: {
      contains: (className) => classNames.includes(className),
    },
    tagName,
  }
}

function optionGridItem(elements) {
  return {
    querySelectorAll: () => elements,
  }
}

assert.equal(
  typeof hasOptionGridBlockContent,
  'function',
  'The shared option-grid model must classify rendered block content.',
)
assert.equal(
  hasOptionGridBlockContent(
    optionGridItem([
      optionGridElement('IMG', ['ProseMirror-separator']),
      optionGridElement('BR', ['ProseMirror-trailingBreak']),
    ]),
  ),
  false,
  'ProseMirror cursor placeholders after inline math must not force one option-grid column.',
)
for (const element of [
  optionGridElement('BR'),
  optionGridElement('IMG'),
  optionGridElement('OL'),
]) {
  assert.equal(
    hasOptionGridBlockContent(optionGridItem([element])),
    true,
    `${element.tagName} content must still force one option-grid column.`,
  )
}

const mdRenderTestContext = {
  exports: {},
  require: (specifier) => {
    if (specifier === 'react') {
      return {
        forwardRef: (render) => render,
        useEffect: () => {},
        useLayoutEffect: () => {},
        useRef: () => ({ current: null }),
        useState: (initialValue) => [initialValue, () => {}],
      }
    }
    if (specifier === 'react/jsx-runtime') {
      return {
        Fragment: Symbol('Fragment'),
        jsx: () => null,
        jsxs: () => null,
      }
    }
    if (
      specifier === 'weimo-ui-core/lib/utils' ||
      specifier === 'weimo-ui-core/components/lib/utils'
    ) {
      return { cn: (...values) => values.filter(Boolean).join(' ') }
    }
    if (specifier === '../markdown/centered-quote') {
      return {
        normalizeCenteredQuoteSyntax: (value) => value,
        WEIMO_CENTERED_QUOTE_MARKER: 'weimo-centered-quote:',
      }
    }
    if (specifier === '../markdown/image-size') {
      return markdownImageSizeTestContext.exports
    }
    if (specifier === '../markdown/option-grid') {
      return optionGridTestContext.exports
    }
    if (specifier === '../markdown/parenthesized-list') {
      return parenthesizedListTestContext.exports
    }
    if (specifier === '../markdown/sanitize') {
      return { markdownSanitizeSchema: {} }
    }
    if (specifier === 'weimo-ui-markdown/styles/markdown-content.css') {
      return {}
    }
    if (
      specifier === 'react-markdown' ||
      specifier === 'rehype-katex' ||
      specifier === 'rehype-raw' ||
      specifier === 'rehype-sanitize' ||
      specifier === 'remark-breaks' ||
      specifier === 'remark-gfm' ||
      specifier === 'remark-math'
    ) {
      return { default: () => null }
    }

    throw new Error(`Unexpected require: ${specifier}`)
  },
}
vm.runInNewContext(
  ts.transpileModule(
    `${mdRenderSource}\nexport { alphabeticOrderedListRemarkPlugin as __testAlphabeticOrderedListRemarkPlugin, trailingOrderedListImageRemarkPlugin as __testTrailingOrderedListImageRemarkPlugin, unwrapInlineCodeRemarkPlugin as __testUnwrapInlineCodeRemarkPlugin }`,
    {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2023,
      },
    },
  ).outputText,
  mdRenderTestContext,
)

const alphabeticOrderedListRemarkPlugin =
  mdRenderTestContext.exports.__testAlphabeticOrderedListRemarkPlugin
const trailingOrderedListImageRemarkPlugin =
  mdRenderTestContext.exports.__testTrailingOrderedListImageRemarkPlugin
const unwrapInlineCodeRemarkPlugin =
  mdRenderTestContext.exports.__testUnwrapInlineCodeRemarkPlugin
const inlineCodeTree = {
  type: 'root',
  children: [
    {
      type: 'paragraph',
      children: [
        { type: 'inlineCode', value: 'const token = true' },
        { type: 'strong', children: [{ type: 'inlineCode', value: 'nested' }] },
      ],
    },
  ],
}

unwrapInlineCodeRemarkPlugin()(inlineCodeTree)

assert.equal(
  inlineCodeTree.children[0].children[0].type,
  'text',
  'The simple variant must unwrap top-level inline code into plain text.',
)
assert.equal(
  inlineCodeTree.children[0].children[0].value,
  'const token = true',
  'Unwrapped inline code must keep its literal value.',
)
assert.equal(
  inlineCodeTree.children[0].children[1].children[0].type,
  'text',
  'The simple variant must unwrap nested inline code as well.',
)

assert.equal(
  typeof resolveOptionGridColumns,
  'function',
  'MdRender and MdEditor must share a deterministic option-grid column model.',
)
assert.equal(
  resolveOptionGridColumns({
    availableWidth: 500,
    columnGap: 20,
    maxColumns: 4,
    optionWidths: [100, 100, 100, 100],
  }),
  4,
  'Four short options must stay on one row when every max-content width fits its track.',
)
assert.equal(
  resolveOptionGridColumns({
    availableWidth: 500,
    columnGap: 20,
    maxColumns: 4,
    optionWidths: [150, 100, 100, 100],
  }),
  2,
  'A list must fall back from four to two columns when its longest option would wrap.',
)
assert.equal(
  resolveOptionGridColumns({
    availableWidth: 500,
    columnGap: 20,
    maxColumns: 4,
    optionWidths: [250, 100, 100, 100],
  }),
  1,
  'A list must fall back to one column when its longest option would wrap in two columns.',
)
assert.equal(
  resolveOptionGridColumns({
    availableWidth: 900,
    columnGap: 20,
    maxColumns: 2,
    optionWidths: [100, 100, 100, 100],
  }),
  2,
  'A list paired with an image must remain capped at two columns even when four would fit.',
)

function parseMarkdownWithAlphabeticLists(markdown) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(alphabeticOrderedListRemarkPlugin)

  return processor.runSync(processor.parse(markdown))
}

function parseMarkdownWithTrailingOrderedListImageLayout(markdown) {
  const tree = parseMarkdownWithAlphabeticLists(markdown)

  trailingOrderedListImageRemarkPlugin()(tree)

  return tree
}

const looseAlphabeticList = parseMarkdownWithAlphabeticLists(
  [
    'A. $f(0) = 0$',
    '',
    'B. $f(1) = 0$',
    '',
    'C. $f(x)$ 是偶函数',
    '',
    'D. $x = 0$ 为 $f(x)$ 的极小值点',
  ].join('\n'),
)

assert.equal(
  looseAlphabeticList.children.length,
  1,
  'MdRender must merge blank-line-separated alphabetic option paragraphs into one list.',
)
assert.equal(looseAlphabeticList.children[0]?.type, 'list')
assert.equal(looseAlphabeticList.children[0]?.children?.length, 4)
assert.equal(looseAlphabeticList.children[0]?.data?.hProperties?.type, 'A')
assert.equal(
  looseAlphabeticList.children[0]?.data?.hProperties?.['data-option-grid'],
  'true',
  'MdRender must mark an exact A-D option list as a view-only grid candidate.',
)

for (const markdown of [
  'A. first\nB. second\nC. third',
  'A. first\nB. second\nC. third\nD. fourth\nE. fifth',
  'B. second\nC. third\nD. fourth\nE. fifth',
  'a. first\nb. second\nc. third\nd. fourth',
  'I. first\nII. second\nIII. third\nIV. fourth',
]) {
  const list = parseMarkdownWithAlphabeticLists(markdown).children[0]

  assert.equal(
    list?.data?.hProperties?.['data-option-grid'],
    undefined,
    `MdRender must not mark a non-exact A-D list as an option grid: ${markdown}`,
  )
}

const tightAlphabeticList = parseMarkdownWithAlphabeticLists('A. first\nB. second')
const lowercaseAlphabeticList = parseMarkdownWithAlphabeticLists('a. first\n\nb. second')
const uppercaseRomanList = parseMarkdownWithAlphabeticLists(
  [
    'I. 求 $k$ 的取值范围；',
    'II. 证明 $k_1 \\cdot k_2$ 为一个定值；',
    'III. 求 $\\triangle OPQ$ 面积的最大值；',
    'IV. 求 $|PQ|$ 的最大值；',
    'V. 求点 $G$ 的轨迹方程；',
    'VI. 证明直线 $TQ$ 过定点；',
    'VII. 证明点 $H$ 在某定直线上。',
  ].join('\n'),
)
const offsetRomanList = parseMarkdownWithAlphabeticLists('IV. fourth\nV. fifth')
const lowercaseRomanList = parseMarkdownWithAlphabeticLists('i. first\n\nii. second')

assert.equal(tightAlphabeticList.children[0]?.type, 'list')
assert.equal(tightAlphabeticList.children[0]?.children?.length, 2)
assert.equal(lowercaseAlphabeticList.children[0]?.type, 'list')
assert.equal(lowercaseAlphabeticList.children[0]?.data?.hProperties?.type, 'a')
assert.equal(uppercaseRomanList.children[0]?.type, 'list')
assert.equal(uppercaseRomanList.children[0]?.children?.length, 7)
assert.equal(uppercaseRomanList.children[0]?.data?.hProperties?.type, 'I')
assert.equal(uppercaseRomanList.children[0]?.start, 1)
assert.equal(offsetRomanList.children[0]?.type, 'list')
assert.equal(offsetRomanList.children[0]?.data?.hProperties?.type, 'I')
assert.equal(offsetRomanList.children[0]?.start, 4)
assert.equal(lowercaseRomanList.children[0]?.type, 'list')
assert.equal(lowercaseRomanList.children[0]?.data?.hProperties?.type, 'i')

const parenthesizedQuestionTree = parseMarkdownWithAlphabeticLists(
  [
    '已知抛物线 $C: x^2 = 2py \\ (p > 0)$，直线 $y = x$ 截抛物线 $C$ 所得弦长为 $\\sqrt{2}$.',
    '',
    '（Ⅰ）求 $p$ 的值：',
    '',
    '（Ⅱ）若直角三角形 APB 的三个顶点在抛物线 $C$ 上，且直角顶点 $P$ 的横坐标为 1。',
    '',
    '① 若直线 $AB$ 经过点 $(0, 3)$，求点 $Q$ 的纵坐标；',
    '',
    '② 求 $\\dfrac{S_{\\triangle PAB}}{S_{\\triangle QAB}}$ 的最大值及此时点 $Q$ 的坐标。',
  ].join('\n'),
)
const parenthesizedQuestionList = parenthesizedQuestionTree.children[1]
const parenthesizedQuestionNestedList = parenthesizedQuestionList?.children?.[1]?.children?.[1]

assert.equal(parenthesizedQuestionList?.type, 'list')
assert.equal(parenthesizedQuestionList?.children?.length, 2)
assert.equal(parenthesizedQuestionList?.data?.hProperties?.type, 'I')
assert.equal(
  parenthesizedQuestionList?.data?.hProperties?.['data-marker-style'],
  'paren-upper-roman',
)
assert.equal(parenthesizedQuestionNestedList?.type, 'list')
assert.equal(parenthesizedQuestionNestedList?.children?.length, 2)
assert.equal(parenthesizedQuestionNestedList?.data?.hProperties?.type, '1')
assert.equal(
  parenthesizedQuestionNestedList?.data?.hProperties?.['data-marker-style'],
  'paren-decimal',
)
assert.equal(
  parenthesizedQuestionNestedList?.children?.[1]?.children?.[0]?.children?.some(
    (child) => child.type === 'inlineMath',
  ),
  true,
  'MdRender must preserve inline math while moving parenthesized option content into nested list items.',
)

const canonicalParenthesizedList = parseMarkdownWithAlphabeticLists(
  '(I) first\n\n(II) second\n\n(1) child one\n\n(2) child two',
)

assert.equal(canonicalParenthesizedList.children[0]?.type, 'list')
assert.equal(canonicalParenthesizedList.children[0]?.children?.[1]?.children?.[1]?.type, 'list')

for (const markdown of [
  '(1) first\n\n(2) second',
  '① first\n\n② second',
]) {
  const standaloneDecimalList = parseMarkdownWithAlphabeticLists(markdown).children[0]

  assert.equal(
    standaloneDecimalList?.type,
    'list',
    `MdRender must convert standalone parenthesized decimal items into a list: ${markdown}`,
  )
  assert.equal(standaloneDecimalList?.children?.length, 2)
  assert.equal(standaloneDecimalList?.data?.hProperties?.type, '1')
  assert.equal(
    standaloneDecimalList?.data?.hProperties?.['data-marker-style'],
    'paren-decimal',
  )
}

const hardBreakParenthesizedList = parseMarkdownWithAlphabeticLists(
  [
    '已知函数 $f(x) = a \\cdot 3^x + \\dfrac{1}{3^{x-1}}$ 是定义域为 $\\mathbb{R}$ 的偶函数.',
    '',
    '(I) 求 $a$ 的值；  ',
    '(II) 若 $g(x)=9^{x}+9^{-x}+mf(x)+m^{2}-1$，求函数 $g(x)$ 的最小值.',
  ].join('\n'),
)
const hardBreakParenthesizedListNode = hardBreakParenthesizedList.children[1]

assert.equal(
  hardBreakParenthesizedListNode?.type,
  'list',
  'MdRender must convert hard-break-separated parenthesized Roman markers into a list.',
)
assert.equal(hardBreakParenthesizedListNode?.children?.length, 2)
assert.equal(
  hardBreakParenthesizedListNode?.data?.hProperties?.['data-marker-style'],
  'paren-upper-roman',
)

const lowercaseRomanNestedListTree = parseMarkdownWithAlphabeticLists(
  [
    '(I) 求 $f(p)$ 的最大值点 $p_0$.',
    '',
    '(II) 判断是否检验余下产品。',
    '',
    '（i）求 $EX$；',
    '',
    '（ii）给出决策。',
  ].join('\n'),
)
const lowercaseRomanParentList = lowercaseRomanNestedListTree.children[0]
const lowercaseRomanChildList = lowercaseRomanParentList?.children?.[1]?.children?.[1]

assert.equal(lowercaseRomanParentList?.type, 'list')
assert.equal(lowercaseRomanParentList?.data?.hProperties?.['data-marker-style'], 'paren-upper-roman')
assert.equal(lowercaseRomanChildList?.type, 'list')
assert.equal(lowercaseRomanChildList?.children?.length, 2)
assert.equal(lowercaseRomanChildList?.data?.hProperties?.['data-marker-style'], 'paren-decimal')

for (const markdown of [
  'A. first\n\nC. third',
  'A. first\n\nb. second',
  'A. only one option',
  'I. first\n\nIII. third',
  'I. first\n\nii. second',
  'I. first\n\nIIII. invalid fourth',
  '（Ⅰ）first\n\n（Ⅲ）third',
  '(I) only one parent item',
  '```md\nA. code\n\nB. code\n```',
]) {
  const tree = parseMarkdownWithAlphabeticLists(markdown)

  assert.notEqual(
    tree.children[0]?.type,
    'list',
    `MdRender must not treat non-sequential, mixed-case, single, or fenced content as an alphabetic list: ${markdown}`,
  )
}

const trailingOrderedListImageTree = parseMarkdownWithTrailingOrderedListImageLayout(
  [
    '题干',
    '',
    'A. first',
    'B. second',
    'C. third',
    'D. fourth',
    '',
    '![Image](/ocr/images/example.jpg)',
  ].join('\n'),
)
const trailingOrderedListImageLayout = trailingOrderedListImageTree.children.at(-1)

assert.equal(trailingOrderedListImageLayout?.type, 'listImagePair')
assert.equal(trailingOrderedListImageLayout?.data?.hName, 'div')
assert.deepEqual(
  Array.from(trailingOrderedListImageLayout?.data?.hProperties?.className ?? []),
  ['weimo-card-markdown__list-image-pair'],
)
assert.deepEqual(
  Array.from(trailingOrderedListImageLayout?.children ?? [], (child) => child.type),
  ['list', 'paragraph'],
  'MdRender must preserve list-before-image reading order inside the layout wrapper.',
)

for (const markdown of [
  '题干\n\n![Image](/ocr/images/example.jpg)',
  'A. first\nB. second\n\n![Image](/ocr/images/example.jpg) caption',
  '- first\n- second\n\n![Image](/ocr/images/example.jpg)',
  'A. first\nB. second\n\n![Image](/ocr/images/example.jpg)\n\n尾注',
]) {
  const tree = parseMarkdownWithTrailingOrderedListImageLayout(markdown)

  assert.ok(
    tree.children.every((child) => child.type !== 'listImagePair'),
    `MdRender must not infer a list-image layout outside the exact trailing ordered-list + single-image shape: ${markdown}`,
  )
}

const markdownListImagePairBlock = cssBlockFor(
  markdownContentCss,
  '.weimo-card-markdown__list-image-pair',
)
const markdownListImagePairImageBlock = cssBlockFor(
  markdownContentCss,
  '.weimo-card-markdown__list-image-pair > .weimo-card-markdown__p',
)
assert.ok(
  markdownRenderRootBlock.includes('container-name: weimo-markdown-content;') &&
    markdownRenderRootBlock.includes('container-type: inline-size;') &&
    !markdownRootBlock.includes('container-name:') &&
    !markdownRootBlock.includes('container-type:'),
  'MdRender alone must establish the inline-size container used by the view-only list-image fallback.',
)
assert.ok(
  markdownListImagePairBlock.includes('display: grid;') &&
    markdownListImagePairBlock.includes(
      'grid-template-columns: minmax(0, 1fr) fit-content(50%);',
    ) &&
    markdownListImagePairBlock.includes('align-items: start;'),
  'The trailing list-image wrapper must keep the list flexible and cap the natural image column at half the content width.',
)
assert.ok(
  markdownListImagePairImageBlock.includes('justify-self: end;'),
  'The trailing list-image wrapper must right-align its image paragraph.',
)
assert.match(
  markdownContentCss,
  /@container weimo-markdown-content \(max-width: 40rem\)\s*\{[\s\S]*?\.weimo-card-markdown__list-image-pair\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\);[\s\S]*?\.weimo-card-markdown__list-image-pair > \.weimo-card-markdown__p\s*\{[^}]*justify-self:\s*center;/,
  'The list-image layout must restore the centered stacked image below 40rem.',
)
assert.match(
  markdownContentCss,
  /\.weimo-card-markdown__list--ol\[data-option-grid="true"\][^{]*\.md-editor__content\.weimo-markdown-content ol\[data-option-grid="true"\][^{]*\{[^}]*display:\s*grid;[^}]*align-items:\s*baseline;[^}]*column-gap:\s*2em;[^}]*row-gap:\s*0\.25em;/s,
  'Exact A-D lists must establish the same baseline-aligned grid in MdRender and MdEditor.',
)
assert.match(
  markdownContentCss,
  /\.weimo-card-markdown__list--ol\[data-option-grid="true"\] > \.weimo-card-markdown__list-item \+ \.weimo-card-markdown__list-item[^{]*\{[^}]*margin-top:\s*0;/s,
  'Option-grid rows must replace adjacent-list margins with the grid row gap.',
)
assert.match(
  markdownContentCss,
  /\.weimo-card-markdown__list--ol\[data-option-grid="true"\]\[data-option-columns="1"\][^{]*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\);/s,
  'Measured A-D lists must support a one-column fallback.',
)
assert.match(
  markdownContentCss,
  /\.weimo-card-markdown__list--ol\[data-option-grid="true"\]\[data-option-columns="2"\][^{]*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/s,
  'Measured A-D lists must support a two-column layout.',
)
assert.match(
  markdownContentCss,
  /\.weimo-card-markdown__list--ol\[data-option-grid="true"\]\[data-option-columns="4"\][^{]*\{[^}]*grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\);/s,
  'Measured A-D lists must support a four-column layout.',
)
assert.match(
  markdownContentCss,
  /@container weimo-markdown-content \(max-width: 40rem\)\s*\{[\s\S]*?\.weimo-card-markdown__list--ol\[data-option-grid="true"\]\[data-option-columns\][^{]*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\);/,
  'Narrow Markdown containers must keep measured A-D lists in one column.',
)
assert.ok(
  !markdownContentCss.includes(
    '@container weimo-markdown-content (min-width: 40.0625rem)',
  ) &&
    !markdownContentCss.includes(
      '@container weimo-markdown-content (min-width: 64rem)',
    ),
  'Option-grid columns must no longer be selected only from fixed minimum-width breakpoints.',
)
assert.match(
  markdownContentCss,
  /\.md-editor__content\.weimo-markdown-content ol\[data-option-grid="true"\] > li \+ li\s*\{[^}]*margin-top:\s*0;/s,
  'MdEditor option-grid rows must replace adjacent-list margins with the shared row gap.',
)

assert.match(
  markdownContentCss,
  /\.weimo-card-markdown__list--ol\[data-marker-type="A"\][^{]*\{[^}]*list-style-type:\s*upper-alpha;/s,
  'MdRender uppercase alphabetic lists must use upper-alpha markers.',
)
assert.match(
  markdownContentCss,
  /\.weimo-card-markdown__list--ol\[data-marker-type="A"\][^{]*\.md-editor__content\.weimo-markdown-content ol\[data-marker-type="A"\][^{]*\{[^}]*padding-left:\s*var\(--md-list-wide-marker-indent\);/s,
  'MdRender and MdEditor uppercase alphabetic lists must reserve wide Safari-safe marker indentation.',
)
assert.match(
  markdownContentCss,
  /\.weimo-card-markdown__list--ol\[data-marker-type="a"\][^{]*\{[^}]*list-style-type:\s*lower-alpha;/s,
  'MdRender lowercase alphabetic lists must use lower-alpha markers.',
)
assert.match(
  markdownContentCss,
  /\.weimo-card-markdown__list--ol\[data-marker-type="a"\][^{]*\.md-editor__content\.weimo-markdown-content ol\[data-marker-type="a"\][^{]*\{[^}]*padding-left:\s*var\(--md-list-wide-marker-indent\);/s,
  'MdRender and MdEditor lowercase alphabetic lists must reserve wide Safari-safe marker indentation.',
)
assert.match(
  markdownContentCss,
  /\.weimo-card-markdown__list--ol\[data-marker-type="I"\][^{]*\{[^}]*list-style-type:\s*upper-roman;/s,
  'MdRender uppercase Roman lists must restore visible upper-roman markers after the global list reset.',
)
assert.match(
  markdownContentCss,
  /\.weimo-card-markdown__list--ol\[data-marker-type="i"\][^{]*\{[^}]*list-style-type:\s*lower-roman;/s,
  'MdRender lowercase Roman lists must restore visible lower-roman markers after the global list reset.',
)
assert.match(
  markdownContentCss,
  /\.weimo-card-markdown__list--ol\[data-marker-type="I"\][^{]*\.md-editor__content\.weimo-markdown-content ol\[type="I"\][^{]*\{[^}]*padding-left:\s*var\(--md-list-wide-marker-indent\);/s,
  'MdRender and MdEditor uppercase Roman lists must share wide-marker indentation.',
)
assert.match(
  markdownContentCss,
  /\.weimo-card-markdown__list--ol\[data-marker-type="i"\][^{]*\.md-editor__content\.weimo-markdown-content ol\[type="i"\][^{]*\{[^}]*padding-left:\s*var\(--md-list-wide-marker-indent\);/s,
  'MdRender and MdEditor lowercase Roman lists must share wide-marker indentation.',
)
assert.ok(
  mdRenderSource.includes('data-marker-type={type}') &&
    mdRenderSource.includes("node?.properties?.['data-option-grid']") &&
    mdRenderSource.includes('node?.properties?.dataOptionGrid') &&
    mdRenderSource.includes('data-option-columns={optionGrid === \'true\' ? \'1\' : undefined}') &&
    mdRenderSource.includes('ul({ children, className })') &&
    mdRenderSource.includes('className={cn('),
  'MdRender lists must expose marker and option-grid attributes and preserve GFM task-list classes for shared styling.',
)
assert.ok(
  mdRenderSource.includes("from '../markdown/option-grid'") &&
    mdRenderSource.includes("closest('.weimo-card-markdown__list-image-pair')") &&
    mdRenderSource.includes('new ownerWindow.ResizeObserver') &&
    mdRenderSource.includes('ownerDocument.fonts.ready') &&
    optionGridSource.includes('cloneNode(true)') &&
    optionGridSource.includes("whiteSpace = 'nowrap'") &&
    optionGridSource.includes('getBoundingClientRect().width'),
  'MdRender must use the shared rendered max-content measurement and remeasure after resizing and font loading.',
)
assert.ok(
  markdownRootBlock.includes('overflow-x: clip;') &&
    markdownRootBlock.includes('overflow-y: visible;') &&
    !markdownRootBlock.includes('overflow: hidden;'),
  'MdRender must preserve horizontal clipping while allowing first-line KaTeX ink to overflow vertically.',
)
assert.ok(
  markdownContentCss.includes(
    '.weimo-card-markdown__image,\n  .md-editor__content.weimo-markdown-content img {',
  ) &&
    markdownImageBlock.includes('max-width: 100%;') &&
    markdownImageBlock.includes('margin-inline: auto;') &&
    !/(^|\n)\s*border\s*:/u.test(markdownImageBlock) &&
    !markdownImageBlock.includes('width: 50%;') &&
    mdRenderSource.includes('setMarkdownImageHalfIntrinsicWidth,') &&
    (mdRenderSource.includes('onLoad={(event) =>') ||
      mdRenderSource.includes('onLoad: (event) =>')) &&
    /setMarkdownImageHalfIntrinsicWidth\(\s*event\.currentTarget,\s*resolvedSrc,?\s*\)/u.test(
      mdRenderSource,
    ),
  'MdRender images must use half their intrinsic width, stay centered, and remain capped by the content width.',
)

for (const snippet of [
  '.md-style-preview__group-effect',
  '.md-style-preview__content-wrapper',
  '.md-style-preview__image',
  '.md-style-preview__math .katex',
]) {
  assert.ok(appCss.includes(snippet), `App.css must include ${snippet}.`)
}

for (const forbidden of [
  '.md-style-preview__scene',
  '.md-style-preview__token-panel',
  '.md-style-preview__section-header',
  '.md-style-preview__mini-type--md',
  '.md-style-preview__mini-radius--xs',
  '.md-style-preview__debug-panel',
  '.md-style-preview__selector-grid',
  '.md-style-preview__selector-group',
  '.md-style-preview__selector-card',
  '.md-style-preview__token-grid',
  '.md-style-preview__token-group',
  '.md-style-preview__token-card',
  '.md-style-preview__token-values',
  '.md-style-preview__usage-scene',
  '.md-style-preview__group-header',
  '.md-style-preview__scene-header',
  '.md-style-preview__render',
  '.md-style-preview__effect',
  '.md-style-preview__mini-border',
  '.md-style-preview__mini-padding',
  '.md-style-preview__mini-gap',
]) {
  assert.ok(!appCss.includes(forbidden), `App.css must remove ${forbidden}.`)
}

assert.ok(
  tokenGridBlock.includes('display: grid;') &&
    tokenGridBlock.includes('grid-template-columns: minmax(0, 1fr);') &&
    !definitionSource.includes('className="md-style-preview"') &&
    !appCss.includes('\n.md-style-preview {'),
  'Markdown style cards must use the content-level token grid without a preview wrapper.',
)
assert.ok(
  !definitionSource.includes('md-style-preview__render'),
  'Markdown style docs must not reintroduce an inner render wrapper.',
)
assert.ok(
  mdGroupEffectBlock.includes('min-height: 112px;') &&
    !mdGroupEffectBlock.includes('border:') &&
    !mdGroupEffectBlock.includes('background:') &&
    !mdGroupEffectBlock.includes('box-shadow:'),
  'Markdown token groups must use a borderless, background-free ComponentPreviewCard preview area.',
)
const mdContentWrapperBlock = cssBlockFor(appCss, '.md-style-preview__content-wrapper')
assert.ok(
  mdContentWrapperBlock.includes('width: 80%;') &&
    mdContentWrapperBlock.includes('margin-inline: auto;') &&
    mdContentWrapperBlock.includes('padding: 16px;') &&
    mdContentWrapperBlock.includes('border: 1px solid var(--color-border);') &&
    mdContentWrapperBlock.includes('border-radius: var(--radius-sm);') &&
    definitionSource.includes('className="md-style-preview__content-wrapper"'),
  'Markdown token group previews must center a padded, 80%-width rounded border wrapper around the rendered content.',
)
assert.ok(
  definitionSource.includes("case '代码':") &&
    definitionSource.includes('行内 `const token = true` 示例') &&
    definitionSource.includes("case '标题':") &&
    definitionSource.includes('# 一级标题') &&
    definitionSource.includes("case '表格':") &&
    definitionSource.includes('| 节点 | 状态 |'),
  'Markdown style docs must preview grouped tokens through their combined semantic Markdown nodes.',
)

assert.ok(
  definitionSource.includes("case '编辑选区':") &&
    definitionSource.includes('md-style-preview__selection-copy') &&
    definitionSource.includes('选中一段文字'),
  'Markdown style docs must preview the selection tone as real selectable editor text.',
)
assert.ok(
  editorSelectionPseudoBlock.includes('background: var(--md-selection-bg);'),
  'MdEditor selected text must use the Markdown-owned --md-selection-bg token.',
)
assert.ok(
  mdSelectionPseudoBlock.includes('background: var(--md-selection-bg);') &&
    mdSelectionHighlightBlock.includes('background: var(--md-selection-bg);'),
  'The Markdown style selection sample must support live drag selection with the real token.',
)
assert.ok(
  mdSelectionSampleBlock.includes('height: 80px;') &&
    mdSelectionSampleBlock.includes('color: var(--color-text-primary);') &&
    mdSelectionSampleBlock.includes('user-select: text;') &&
    mdSelectionHighlightBlock.includes('padding-block: 0.4em;') &&
    !mdSelectionHighlightBlock.includes('border-radius:'),
  'The selection sample must render real text with a full-line-height highlight band and no rounded corners.',
)

assert.ok(
  !existsSync(join(root, 'registry/md.json')) &&
    !rootRegistry.items.some((item) => item.name === 'md'),
  'The standalone Md registry item must stay removed.',
)
assert.ok(rootMdRenderItem, 'Root registry must include the @weimo/md-render item.')
assert.ok(
  rootMdRenderSimpleItem,
  'Root registry must include the @weimo/md-render-simple item.',
)
assert.deepEqual(
  standaloneMdRenderSimpleRegistry,
  rootMdRenderSimpleItem,
  'registry/md-render-simple.json must match the root registry md-render-simple payload.',
)
assert.ok(
  rootMdRenderSimpleItem.registryDependencies.includes('@weimo/md-render') &&
    !rootMdRenderSimpleItem.dependencies.includes('remark-math') &&
    !rootMdRenderSimpleItem.dependencies.includes('rehype-katex') &&
    !rootMdRenderSimpleItem.dependencies.includes('remark-gfm'),
  'The MdRenderSimple registry item must reuse MdRender instead of shipping its own math or table pipeline.',
)
assert.ok(
  rootMdEditorSimpleItem,
  'Root registry must include the @weimo/md-editor-simple item.',
)
assert.deepEqual(
  standaloneMdEditorSimpleRegistry,
  rootMdEditorSimpleItem,
  'registry/md-editor-simple.json must match the root registry md-editor-simple payload.',
)
assert.ok(
  rootMdEditorSimpleItem.registryDependencies.includes('@weimo/md-editor') &&
    !rootMdEditorSimpleItem.dependencies.includes('@tiptap/extension-table') &&
    !rootMdEditorSimpleItem.dependencies.includes('@tiptap/extension-mathematics'),
  'The MdEditorSimple registry item must reuse MdEditor instead of shipping its own math or table extensions.',
)
assert.deepEqual(
  standaloneMdRenderRegistry,
  rootMdRenderItem,
  'registry/md-render.json must match the root registry md-render payload.',
)
assert.ok(
  rootMdRenderItem.files.some(
    (file) => file.path === 'packages/weimo-ui-markdown/src/styles/markdown-content.css',
  ),
  'MdRender registry item must ship the shared Markdown content styles it imports.',
)
