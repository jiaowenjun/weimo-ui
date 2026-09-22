import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import ts from 'typescript'

const root = fileURLToPath(new URL('..', import.meta.url))

function readProjectFile(relativePath) {
  const absolutePath = join(root, relativePath)

  assert.ok(existsSync(absolutePath), `${relativePath} must exist.`)

  return readFileSync(absolutePath, 'utf8')
}

function blockFor(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return blockForPattern(source, `${escapedSelector}(?:\\s*,[^{}]*)?`, selector)
}

function blockForPattern(source, selectorPattern, label) {
  const match = source.match(new RegExp(`${selectorPattern}\\s*\\{([^}]*)\\}`))

  assert.ok(match, `${label} block must exist.`)

  return match[1]
}

function assertIncludes(block, snippet, message) {
  assert.ok(block.includes(snippet), message)
}

const cardCss = readProjectFile('src/components/card.css')
const cardTopBarCss = readProjectFile('src/components/card-top-bar.css')
const markdownContentCss = readProjectFile('src/components/markdown-content.css')
const CardSource = readProjectFile('src/components/card.tsx')
const CardResolversSource = readProjectFile('src/components/card-resolvers.tsx')
const cardPropsSource = CardSource.slice(
  CardSource.indexOf('export type CardProps'),
  CardSource.indexOf('function shouldIgnoreCardBodyDoubleClick'),
)
const mdRenderSource = readProjectFile('src/components/md-render.tsx')
const markdownSanitizeSource = readProjectFile(
  'src/components/markdown-sanitize.ts',
)
const indexCss = readProjectFile('src/index.css')
const sharedTokenCss = readProjectFile('src/styles/tokens.css')
const docsMarkdownSampleSource = readProjectFile('src/docs/component-definitions/markdown-sample.ts')
const registry = JSON.parse(readProjectFile('registry.json'))
const styleRegistry = JSON.parse(readProjectFile('registry/style.json'))
const packageJson = JSON.parse(readProjectFile('package.json'))
const CardItem = registry.items.find((item) => item.name === 'card')

const markdownSanitizeContext = {
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
  markdownSanitizeContext,
)
const { markdownSanitizeSchema } = markdownSanitizeContext.exports
const sanitizedRawTableMarkup = renderToStaticMarkup(
  createElement(
    ReactMarkdown,
    {
      components: {
        table: ({ children }) =>
          createElement('table', { className: 'mapped-table' }, children),
      },
      rehypePlugins: [
        rehypeRaw,
        [rehypeSanitize, markdownSanitizeSchema],
      ],
    },
    '<table border="1" style="margin:auto" onclick="alert(1)"><tr><td>64<script>alert(2)</script></td><td>16</td></tr></table>',
  ),
)

assert.equal(
  sanitizedRawTableMarkup,
  '<table class="mapped-table"><tbody><tr><td>64</td><td>16</td></tr></tbody></table>',
  'MdRender raw HTML support must reach the table component mapping while removing style, event handlers, and scripts.',
)

const canonicalMathTableMarkup = renderToStaticMarkup(
  createElement(
    ReactMarkdown,
    {
      rehypePlugins: [
        rehypeRaw,
        [rehypeSanitize, markdownSanitizeSchema],
        rehypeKatex,
      ],
      remarkPlugins: [remarkGfm, remarkMath],
    },
    [
      String.raw`| $\alpha$ | 0.1 |`,
      '| :---: | :---: |',
      String.raw`| $x_{\alpha}$ | 2.706 |`,
    ].join('\n'),
  ),
)
assert.ok(
  canonicalMathTableMarkup.includes('<table>') &&
    canonicalMathTableMarkup.includes('<th style="text-align:center">') &&
    canonicalMathTableMarkup.includes('<td style="text-align:center">') &&
    canonicalMathTableMarkup.includes('class="katex"') &&
    canonicalMathTableMarkup.includes('encoding="application/x-tex">\\alpha</annotation>') &&
    canonicalMathTableMarkup.includes('encoding="application/x-tex">x_{\\alpha}</annotation>'),
  'MdRender must send canonical GFM table formulas through KaTeX inside table cells.',
)

const sanitizedMarkdownMetadataMarkup = renderToStaticMarkup(
  createElement(
    ReactMarkdown,
    {
      components: {
        blockquote: ({ children, node }) =>
          createElement(
            'blockquote',
            {
              'data-centered':
                node?.properties?.dataWeimoCentered ??
                node?.properties?.['data-weimo-centered'],
            },
            children,
          ),
        ol: ({ children, node }) =>
          createElement(
            'ol',
            {
              'data-marker-style':
                node?.properties?.dataMarkerStyle ??
                node?.properties?.['data-marker-style'],
              'data-option-grid':
                node?.properties?.dataOptionGrid ??
                node?.properties?.['data-option-grid'],
            },
            children,
          ),
      },
      rehypePlugins: [
        rehypeRaw,
        [rehypeSanitize, markdownSanitizeSchema],
      ],
    },
    '<blockquote data-weimo-centered="true"><ol data-marker-style="paren-upper-roman" data-option-grid="true"><li>first</li></ol></blockquote>',
  ),
)

assert.match(
  sanitizedMarkdownMetadataMarkup,
  /data-centered="true"/,
  'Markdown sanitizing must preserve the centered-quote metadata consumed by MdRender.',
)
assert.match(
  sanitizedMarkdownMetadataMarkup,
  /data-marker-style="paren-upper-roman"/,
  'Markdown sanitizing must preserve the parenthesized-list marker metadata consumed by MdRender.',
)
assert.match(
  sanitizedMarkdownMetadataMarkup,
  /data-option-grid="true"/,
  'Markdown sanitizing must preserve the exact A-D option-grid metadata consumed by MdRender.',
)

const cardBlock = blockFor(cardCss, '.weimo-card')
const headerBlock = blockFor(cardTopBarCss, '.weimo-card__header')
const headerMainBlock = blockFor(cardTopBarCss, '.weimo-card__header-main')
const headerActionBlock = blockFor(cardTopBarCss, '.weimo-card__header-action')
const timeBlock = blockFor(cardTopBarCss, '.weimo-card__time')
const bodyBlock = blockFor(cardCss, '.weimo-card__body')
const trailingResetBlock = blockForPattern(
  cardCss,
  '\\.weimo-card__header:last-child,\\s*\\n\\s*\\.weimo-card__body:last-child,\\s*\\n\\s*\\.weimo-card__tags:last-child',
  'Card trailing margin reset',
)
const markdownBlock = blockFor(markdownContentCss, '.weimo-markdown-content')
const markdownParagraphBlock = blockFor(markdownContentCss, '.weimo-card-markdown__p')
const markdownHeadingBlock = blockFor(markdownContentCss, '.weimo-card-markdown__heading')
const markdownBlockquoteBlock = blockFor(markdownContentCss, '.weimo-card-markdown__blockquote')
const markdownCenteredBlockquoteBlock = blockFor(
  markdownContentCss,
  '.weimo-card-markdown__blockquote--centered',
)
const markdownTopLevelSpacingBlock = blockForPattern(
  markdownContentCss,
  '\\.weimo-markdown-content > :is\\([\\s\\S]*?\\.weimo-card-markdown__hr[\\s\\S]*?\\) \\+ :is\\([\\s\\S]*?\\.tiptap-mathematics-render\\[data-type="block-math"\\][\\s\\S]*?\\)',
  'Shared Markdown top-level block spacing',
)
const markdownUnorderedListBlock = blockFor(markdownContentCss, '.weimo-card-markdown__list--ul')
const markdownListBlock = blockForPattern(
  markdownContentCss,
  '\\.weimo-card-markdown__list,\\s*\\.md-editor__content\\.weimo-markdown-content :where\\(ul, ol\\)',
  'Shared Markdown list indentation',
)
const markdownTaskListBlock = blockForPattern(
  markdownContentCss,
  '\\.weimo-card-markdown__list--ul\\.contains-task-list,\\s*\\.md-editor__content\\.weimo-markdown-content ul\\[data-type="taskList"\\]',
  'Shared Markdown task-list indentation',
)
const markdownOrderedListBlock = blockForPattern(
  markdownContentCss,
  '\\.weimo-card-markdown__list--ol:not\\(\\[type\\]\\),\\s*\\.md-editor__content\\.weimo-markdown-content ol:not\\(\\[type\\]\\)',
  'Markdown untyped ordered list marker type',
)
const markdownUpperAlphaOrderedListBlock = blockForPattern(
  markdownContentCss,
  '\\.weimo-card-markdown__list--ol\\[data-marker-type="A"\\],\\s*\\.md-editor__content\\.weimo-markdown-content ol\\[data-marker-type="A"\\]',
  'Markdown uppercase alpha ordered list marker type',
)
const markdownLowerAlphaOrderedListBlock = blockForPattern(
  markdownContentCss,
  '\\.weimo-card-markdown__list--ol\\[data-marker-type="a"\\],\\s*\\.md-editor__content\\.weimo-markdown-content ol\\[data-marker-type="a"\\]',
  'Markdown lowercase alpha ordered list marker type',
)
const markdownUpperRomanOrderedListBlock = blockFor(
  markdownContentCss,
  '.weimo-card-markdown__list--ol[data-marker-type="I"]',
)
const markdownLowerRomanOrderedListBlock = blockFor(
  markdownContentCss,
  '.weimo-card-markdown__list--ol[data-marker-type="i"]',
)
const markdownParenthesizedRomanListBlock = blockFor(
  markdownContentCss,
  '.weimo-card-markdown__list--ol[data-marker-style="paren-upper-roman"]',
)
const markdownParenthesizedRomanCounterStyleBlock = blockFor(
  markdownContentCss,
  '@counter-style weimo-paren-upper-roman',
)
const markdownParenthesizedDecimalListBlock = blockFor(
  markdownContentCss,
  '.weimo-card-markdown__list--ol[data-marker-style="paren-decimal"]',
)
const markdownParenthesizedDecimalCounterStyleBlock = blockFor(
  markdownContentCss,
  '@counter-style weimo-paren-decimal',
)
const markdownScrollBlock = blockFor(markdownContentCss, '.weimo-card-markdown__scroll-block')
const markdownEditorTableWrapperBlock = blockFor(
  markdownContentCss,
  '.md-editor__content.weimo-markdown-content .tableWrapper',
)
const markdownTableBlock = blockFor(markdownContentCss, '.weimo-card-markdown__table')
const markdownInlineCodeSurfaceBlock = blockForPattern(
  markdownContentCss,
  '\\.weimo-markdown-content :not\\(pre\\) > :where\\(\\.weimo-card-markdown__code, code\\)',
  'Markdown inline code surface',
)
const markdownPreBlock = blockFor(markdownContentCss, '.weimo-card-markdown__pre')
const markdownImagePlaceholderBlock = blockFor(markdownContentCss, '.weimo-card-markdown__image-placeholder')
assert.ok(
  !cardBlock.includes('gap: var(--space-card-section-gap);'),
  'Card section rhythm must not rely on parent flex gap after skyline alignment.',
)
assertIncludes(
  headerBlock,
  'margin-bottom: calc(var(--space-card-section-gap) - (var(--size-icon-button-sm) - var(--font-size-sm)) / 2);',
  'Card header must compensate for the visual height delta between sm IconButton and sm timestamp text.',
)
assertIncludes(
  headerBlock,
  'color: var(--color-text-placeholder);',
  'Card header must set placeholder text color for all header text.',
)
assertIncludes(
  headerMainBlock,
  'min-width: 0;',
  'Card header main content must be allowed to shrink next to the right action slot.',
)
assertIncludes(
  headerActionBlock,
  'flex: none;',
  'Card header right action slot must keep action controls from shrinking.',
)
assert.ok(
  !timeBlock.includes('color:'),
  'Card timestamp must inherit the shared CardHeader placeholder color.',
)
assertIncludes(
  timeBlock,
  'font-size: var(--font-size-sm);',
  'Card timestamp must keep the skyline small text size.',
)
assert.ok(
  !cardCss.includes('weimo-card__action') && !CardSource.includes('weimo-card__action'),
  'Card must not keep action styles for removed internally rendered header actions.',
)
assert.ok(
  cardTopBarCss.includes('\nbutton.icon-button.weimo-card__header-icon-button {\n  color: var(--color-text-placeholder);\n}\n'),
  'CardTopBar CSS must use a selector that beats the IconButton base color.',
)
assert.ok(
  CardSource.includes("import { CardTopBar } from './card-top-bar'") &&
    CardSource.includes("} from './card-resolvers'") &&
    CardSource.includes('<CardTopBar') &&
    CardSource.includes('<CardTopBar {...topBarProps} />') &&
    CardResolversSource.includes('export function resolveCardTopBarProps(') &&
    CardResolversSource.includes("mode: 'display'") &&
    !CardSource.includes("import { Ellipsis } from 'lucide-react'"),
  'Card must delegate its display top bar to CardTopBar.',
)
assertIncludes(
  bodyBlock,
  'margin: 0 0 var(--space-card-section-gap);',
  'Card body must own the following section gap after parent gap removal.',
)
assertIncludes(
  trailingResetBlock,
  'margin-bottom: 0;',
  'Card partial/custom composition must not leave a trailing section margin.',
)
assert.ok(
  !cardCss.includes('.weimo-card--compact'),
  'Card styles must not keep the removed compact size selector.',
)
assert.ok(
    !cardCss.includes('.weimo-card--glass') &&
    !CardSource.includes('VariantProps') &&
    !CardSource.includes('cva(') &&
    !/\bvariant\s*[,:?]/.test(cardPropsSource) &&
    !CardSource.includes('weimo-card--glass'),
  'Card must not keep the unused glass variant API or styles.',
)
assert.ok(CardItem, 'registry.json must include the @weimo/card item.')
assert.ok(
  CardItem.files.some((file) => file.path === 'src/components/card-resolvers.tsx'),
  'Card registry item must ship private Card resolver helpers.',
)
assert.ok(
  !cardCss.includes('weimo-share-card'),
  'Card CSS must not ship removed ShareCard styles.',
)
assert.ok(
  mdRenderSource.includes("import ReactMarkdown, { type Components } from 'react-markdown'"),
  'MdRender must render through react-markdown.',
)
assert.ok(
  mdRenderSource.includes("import rehypeKatex from 'rehype-katex'") &&
    mdRenderSource.includes("import rehypeRaw from 'rehype-raw'") &&
    mdRenderSource.includes("import rehypeSanitize from 'rehype-sanitize'") &&
    mdRenderSource.includes("import { markdownSanitizeSchema } from './markdown-sanitize'") &&
    mdRenderSource.includes("import remarkGfm from 'remark-gfm'") &&
    mdRenderSource.includes("import remarkMath from 'remark-math'") &&
    mdRenderSource.includes("import remarkBreaks from 'remark-breaks'"),
  'MdRender must use GFM, sanitized raw HTML, math, KaTeX, and line-break markdown plugins.',
)
assert.ok(
  mdRenderSource.includes(
    'rehypePlugins={[rehypeRaw, [rehypeSanitize, markdownSanitizeSchema], rehypeKatex]}',
  ),
  'MdRender must parse raw HTML before sanitizing it and rendering KaTeX.',
)
assert.ok(
  /remarkPlugins=\{\[\s*remarkGfm,\s*remarkMath,\s*alphabeticOrderedListRemarkPlugin,\s*trailingOrderedListImageRemarkPlugin,\s*markCenteredBlockquotes,\s*remarkBreaks,?\s*\]\}/.test(
    mdRenderSource,
  ),
  'MdRender must enable remark-breaks after centered quote marking so single newlines render as <br> without introducing a leading centered-quote break.',
)
assert.ok(
  mdRenderSource.includes('export type MdRenderProps') &&
    mdRenderSource.includes('export const MdRender = forwardRef<HTMLDivElement, MdRenderProps>') &&
    mdRenderSource.includes("MdRender.displayName = 'MdRender'") &&
    mdRenderSource.includes('content: string'),
  'MdRender must live in md-render.tsx after removing the public Card re-export and keep a ref-capable root.',
)
assert.ok(
  mdRenderSource.includes('normalizeCenteredQuoteSyntax') &&
    mdRenderSource.includes('markCenteredBlockquotes') &&
    mdRenderSource.includes('WEIMO_CENTERED_QUOTE_MARKER') &&
    mdRenderSource.includes('data-weimo-centered') &&
    mdRenderSource.includes('dataWeimoCentered'),
  'MdRender must preserve Skyline >= centered quote semantics without visible marker text.',
)
assert.ok(
  mdRenderSource.includes('weimo-card-markdown__scroll-block') &&
    mdRenderSource.includes('weimo-card-markdown__table'),
  'MdRender table rendering must include a horizontal scroll wrapper.',
)
assert.ok(
  mdRenderSource.includes('sanitizeMarkdownHref') &&
    mdRenderSource.includes('weimo-card-markdown__link-text'),
  'MdRender must degrade unsafe links to styled inline text.',
)
assert.ok(
  mdRenderSource.includes('weimo-card-markdown__image-placeholder') &&
    mdRenderSource.includes('[图片'),
  'MdRender must render image placeholders instead of remote images.',
)
assert.ok(
  mdRenderSource.includes('export type MdRenderImageSrcResolver') &&
    mdRenderSource.includes('resolveImageSrc?: MdRenderImageSrcResolver') &&
    mdRenderSource.includes('const resolvedSrc = src ? resolveImageSrc?.(src) : undefined') &&
    mdRenderSource.includes('weimo-card-markdown__image'),
  'MdRender must keep image placeholders by default while allowing caller-approved image rendering.',
)
assert.ok(
  cardCss.startsWith('@import "./markdown-content.css";'),
  'Card CSS must import the shared Markdown prose stylesheet before component styles.',
)
assert.ok(
  markdownContentCss.startsWith('@import "katex/dist/katex.min.css";'),
  'Shared Markdown CSS must import KaTeX styles so Card and MdEditor share math styling.',
)
assert.ok(
  /}\s*\.weimo-markdown-content > \.katex-display,\s*\.weimo-markdown-content \.tiptap-mathematics-render\[data-type="block-math"\] \.katex-display\s*\{\s*margin: 0;\s*\}/.test(
    markdownContentCss,
  ) &&
    /\.weimo-markdown-content > :is\([\s\S]*?\.tiptap-mathematics-render\[data-type="block-math"\][\s\S]*?\) \+ \.katex-display\s*\{\s*margin-top: 1em;\s*\}/.test(
      markdownContentCss,
    ),
  'Shared Markdown CSS must bridge unlayered KaTeX display margins back into the uniform block rhythm.',
)
assert.ok(
  mdRenderSource.includes("cn('weimo-card-markdown weimo-markdown-content', className)"),
  'MdRender root must opt into the shared Markdown prose class.',
)
assert.ok(
  !cardCss.includes('.weimo-card-markdown__p') &&
    !cardCss.includes('.weimo-card-markdown__heading') &&
    !cardCss.includes('.weimo-card-markdown__blockquote') &&
    !cardCss.includes('.weimo-card-markdown__table'),
  'Card CSS must not keep duplicated Markdown prose rules.',
)
assertIncludes(
  markdownBlock,
  'font-size: var(--md-font-size);',
  'Markdown root must use its node-semantic content text size.',
)
assertIncludes(
  markdownBlock,
  'line-height: var(--md-line-height);',
  'Markdown root must use its node-semantic content line height.',
)
assert.ok(
  markdownInlineCodeSurfaceBlock.includes('font-size: var(--md-code-font-size);') &&
    markdownImagePlaceholderBlock.includes('font-size: var(--md-img-placeholder-font-size);') &&
    !markdownContentCss.includes('--md-code-size') &&
    !markdownContentCss.includes('--weimo-md-code-size'),
  'Markdown inline code and image placeholders must use separate node-semantic size tokens.',
)
assertIncludes(
  markdownInlineCodeSurfaceBlock,
  'border: 1px solid var(--md-code-border-color);',
  'Markdown inline code must use its node-semantic border token.',
)
assert.ok(
  !markdownInlineCodeSurfaceBlock.includes('var(--md-code-block-border-color)'),
  'Markdown inline code must not use the Markdown code-block border token.',
)
for (const [block, label] of [
  [markdownInlineCodeSurfaceBlock, 'inline code'],
  [markdownPreBlock, 'pre'],
  [markdownImagePlaceholderBlock, 'image placeholder'],
]) {
  assert.ok(
    !block.includes('background:') && !block.includes('background-color:'),
    `Markdown ${label} must not paint a background color.`,
  )
}
assertIncludes(
  markdownParagraphBlock,
  'text-align: justify;',
  'Markdown paragraphs must keep Skyline justified reading text.',
)
assertIncludes(
  markdownParagraphBlock,
  'text-justify: inter-ideograph;',
  'Markdown paragraphs must keep CJK inter-ideograph justification.',
)
assertIncludes(
  markdownHeadingBlock,
  'text-align: center;',
  'Markdown headings must match Skyline centered memo headings.',
)
assert.ok(
    !markdownContentCss.includes('.weimo-card-markdown__heading--h2') &&
    !markdownContentCss.includes('--md-h2-') &&
    !markdownContentCss.includes('--md-h3-') &&
    !markdownContentCss.includes('--md-h4-') &&
    !markdownContentCss.includes('--md-h5-') &&
    !markdownContentCss.includes('--md-h6-'),
  'Markdown heading theme tokens must stop at level one.',
)
assertIncludes(
  markdownBlockquoteBlock,
  'padding: 0 var(--md-quote-pad-inline);',
  'Markdown blockquotes must keep horizontal quote padding.',
)
assert.ok(
  !markdownBlockquoteBlock.includes('border-left:') && !markdownCenteredBlockquoteBlock.includes('border-left:'),
  'Markdown blockquotes must not render a left border line.',
)
assertIncludes(
  markdownCenteredBlockquoteBlock,
  'text-align: center;',
  'Markdown centered blockquotes must center their text.',
)
assertIncludes(
  markdownScrollBlock,
  'overflow-x: auto;',
  'Markdown table scroll wrapper must prevent wide tables from expanding cards.',
)
assert.ok(
  markdownScrollBlock.includes('width: fit-content;') &&
    markdownScrollBlock.includes('max-width: 100%;') &&
    markdownScrollBlock.includes('margin-inline: auto;') &&
    markdownTableBlock.includes('width: max-content;') &&
    !markdownTableBlock.includes('width: 100%;'),
  'Rendered Markdown tables must size to their content and center the complete framed table.',
)
for (const [block, label] of [
  [markdownScrollBlock, 'rendered Markdown table outer frame'],
  [markdownEditorTableWrapperBlock, 'MdEditor table outer frame'],
]) {
  assertIncludes(
    block,
    'border: 1px solid var(--md-table-frame-border-color);',
    `${label} must use the node-semantic Markdown table border token.`,
  )
  assert.ok(
    !block.includes('var(--md-code-block-border-color)'),
    `${label} must not use the Markdown code-block border token.`,
  )
}
assertIncludes(
  markdownTopLevelSpacingBlock,
  'margin-top: 1em;',
  'Markdown top-level body blocks must use a uniform 1em vertical gap.',
)
assertIncludes(
  markdownUnorderedListBlock,
  'list-style-type: disc;',
  'Markdown unordered lists must show standard bullet markers.',
)
assertIncludes(
  sharedTokenCss,
  '--md-list-indent: 1.35em;',
  'Shared style tokens must define the standard Markdown list padding.',
)
assertIncludes(
  sharedTokenCss,
  '--md-list-wide-marker-indent: 2em;',
  'Shared style tokens must define the wide-marker ordered-list padding.',
)
assertIncludes(
  markdownListBlock,
  'padding-left: var(--md-list-indent);',
  'Standard lists in MdRender and MdEditor must share compact indentation.',
)
assertIncludes(
  markdownTaskListBlock,
  'padding-left: 0;',
  'Task lists in MdRender and MdEditor must share zero list indentation.',
)
assertIncludes(
  markdownOrderedListBlock,
  'list-style-type: decimal;',
  'Markdown ordered lists without a type attribute must keep decimal markers.',
)
assertIncludes(
  markdownUpperAlphaOrderedListBlock,
  'list-style-type: upper-alpha;',
  'Markdown uppercase alpha typed ordered lists must restore visible markers for both MdRender and MdEditor.',
)
assertIncludes(
  markdownUpperAlphaOrderedListBlock,
  'padding-left: var(--md-list-wide-marker-indent);',
  'Markdown uppercase alpha typed ordered lists must reserve enough marker space for Safari in both MdRender and MdEditor.',
)
assertIncludes(
  markdownLowerAlphaOrderedListBlock,
  'list-style-type: lower-alpha;',
  'Markdown lowercase alpha typed ordered lists must restore visible markers for both MdRender and MdEditor.',
)
assertIncludes(
  markdownLowerAlphaOrderedListBlock,
  'padding-left: var(--md-list-wide-marker-indent);',
  'Markdown lowercase alpha typed ordered lists must reserve enough marker space for Safari in both MdRender and MdEditor.',
)
assertIncludes(
  markdownUpperRomanOrderedListBlock,
  'list-style-type: upper-roman;',
  'MdRender uppercase Roman lists must restore visible markers after the global list reset.',
)
assertIncludes(
  markdownUpperRomanOrderedListBlock,
  'padding-left: var(--md-list-wide-marker-indent);',
  'MdRender and MdEditor uppercase Roman lists must share wide-marker indentation.',
)
assertIncludes(
  markdownLowerRomanOrderedListBlock,
  'list-style-type: lower-roman;',
  'MdRender lowercase Roman lists must restore visible markers after the global list reset.',
)
assertIncludes(
  markdownLowerRomanOrderedListBlock,
  'padding-left: var(--md-list-wide-marker-indent);',
  'MdRender and MdEditor lowercase Roman lists must share wide-marker indentation.',
)
assertIncludes(
  markdownParenthesizedRomanListBlock,
  'padding-left: var(--md-list-wide-marker-indent);',
  'Parenthesized Roman lists must use the shared wide-marker indentation.',
)
assertIncludes(
  markdownParenthesizedRomanListBlock,
  'list-style-type: weimo-paren-upper-roman;',
  'Parenthesized Roman lists must use the Safari-compatible custom counter style.',
)
for (const declaration of [
  'system: extends upper-roman;',
  'prefix: "(";',
  'suffix: ") ";',
]) {
  assertIncludes(
    markdownParenthesizedRomanCounterStyleBlock,
    declaration,
    `The parenthesized Roman counter style must include ${declaration}`,
  )
}
assertIncludes(
  markdownParenthesizedDecimalListBlock,
  'list-style-type: weimo-paren-decimal;',
  'Parenthesized decimal lists must use the Safari-compatible custom counter style.',
)
assertIncludes(
  markdownParenthesizedDecimalListBlock,
  'padding-left: var(--md-list-wide-marker-indent);',
  'Parenthesized decimal lists must use the shared wide-marker indentation.',
)
for (const declaration of [
  'system: extends decimal;',
  'prefix: "(";',
  'suffix: ") ";',
]) {
  assertIncludes(
    markdownParenthesizedDecimalCounterStyleBlock,
    declaration,
    `The parenthesized decimal counter style must include ${declaration}`,
  )
}
assert.ok(
  !markdownContentCss.includes('counter(list-item,') &&
    !markdownContentCss.includes('[data-marker-style="paren-upper-roman"] > li::marker') &&
    !markdownContentCss.includes('[data-marker-style="paren-decimal"] > li::marker'),
  'Parenthesized lists must not rely on Safari-incompatible ::marker content overrides.',
)
assert.ok(
  !markdownContentCss.includes('--space-card-markdown-heavy-gap') &&
    !markdownContentCss.includes('var(--space-card-markdown-heavy-gap)') &&
    !markdownContentCss.includes('--space-card-markdown-quote-padding') &&
    !markdownContentCss.includes('--md-section-gap'),
  'Markdown block spacing and quote spacing must not keep old card-markdown-specific token names.',
)
assert.ok(
  markdownContentCss.indexOf('margin-top: 1em;') >
    markdownContentCss.indexOf(
      '.weimo-card-markdown__table-body .weimo-card-markdown__table-row:last-child .weimo-card-markdown__table-cell',
    ),
  'Markdown top-level block spacing must be declared after block margin resets so every block type keeps the same gap.',
)
assert.ok(
  !/\.weimo-card-markdown__(?:scroll-block|table-head)\s*\{[^}]*background\s*:/.test(
    markdownContentCss,
  ),
  'Markdown tables must inherit the Card background instead of painting a separate table background.',
)
assert.ok(
  docsMarkdownSampleSource.includes('$\\\\int_0^1 x^2\\\\,dx = \\\\frac{1}{3}$') &&
    docsMarkdownSampleSource.includes('$$\n\\\\int_0^1 x^2\\\\,dx = \\\\frac{1}{3}\n$$'),
  'Shared markdown docs preview sample must include inline and block math examples.',
)
assert.ok(
  docsMarkdownSampleSource.includes('export const mdRenderSample') &&
    existsSync(join(root, 'src/docs/component-definitions/tagged-card.tsx')),
  'Shared markdown docs preview sample must remain with Card docs.',
)
assert.deepEqual(
  CardItem.files.some((file) => file.path === 'src/components/card.css'),
  true,
  'Card registry item must keep shipping shared card shell CSS.',
)
for (const snippet of [
  '--color-text-placeholder: hsl(0 0% 74%);',
  '--color-text-placeholder: hsl(0 0% 35%);',
]) {
  assert.ok(sharedTokenCss.includes(snippet), `src/styles/tokens.css must include ${snippet}`)
}

assert.ok(
  indexCss.includes('@import "./styles/tokens.css";'),
  'src/index.css must consume shared tokens through src/styles/tokens.css.',
)
assert.equal(
  packageJson.exports?.['./styles/tokens.css'],
  './src/styles/tokens.css',
  'package.json must export shared tokens for workspace consumers.',
)

const rootStyleItem = registry.items.find((item) => item.name === 'style')

assert.ok(rootStyleItem, 'registry.json must include the @weimo/style item.')
assert.deepEqual(styleRegistry, rootStyleItem, 'registry/style.json must match the root style item.')
assert.equal(
  rootStyleItem.cssVars.light['color-text-placeholder'],
  'hsl(0 0% 74%)',
  'Root registry light theme must export color-text-placeholder.',
)
assert.equal(
  rootStyleItem.cssVars.dark['color-text-placeholder'],
  'hsl(0 0% 35%)',
  'Root registry dark theme must export color-text-placeholder.',
)
assert.equal(
  styleRegistry.cssVars.light['color-text-placeholder'],
  'hsl(0 0% 74%)',
  'Standalone style registry light theme must export color-text-placeholder.',
)
assert.equal(
  styleRegistry.cssVars.dark['color-text-placeholder'],
  'hsl(0 0% 35%)',
  'Standalone style registry dark theme must export color-text-placeholder.',
)
assert.ok(
  packageJson.scripts?.test?.includes('scripts/card-style-contract.test.mjs'),
  'package.json test script must run card-style-contract.test.mjs.',
)
