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

function readJson(relativePath) {
  return JSON.parse(readProjectFile(relativePath))
}

function blockFor(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))

  assert.ok(match, `${selector} block must exist.`)

  return match[1]
}

function assertIncludes(source, snippet, message) {
  assert.ok(source.includes(snippet), message)
}

function countOccurrences(source, snippet) {
  return source.split(snippet).length - 1
}

const source = readProjectFile('src/components/tag-bread.tsx')
const css = readProjectFile('src/components/tag-bread.css')
const surfaceCss = readProjectFile('src/components/chip-surface.css')
const appCss = readProjectFile('src/App.css')
const indexCss = readProjectFile('src/index.css')
const cossBreadcrumbSource = readProjectFile('src/components/coss/breadcrumb.tsx')
const cossBreadcrumbCss = readProjectFile('src/components/coss/breadcrumb.css')
const packageJson = readJson('package.json')
const manifest = readProjectFile('src/docs/components-manifest.ts')
const definitionsIndex = readProjectFile('src/docs/component-definitions/index.ts')
const docsDefinition = readProjectFile('src/docs/component-definitions/tag.tsx')
const rootRegistry = readJson('registry.json')
const standaloneRegistry = readJson('registry/tag-bread.json')
const registryItem = rootRegistry.items.find((item) => item.name === 'tag-bread')
const smokeSource = readProjectFile('scripts/registry-smoke.test.mjs')

const rootBlock = blockFor(surfaceCss, '.chip-surface')
const glassSurfaceBlock = blockFor(surfaceCss, '.chip-surface[data-variant="glass"]')
const glassLayerBlock = blockFor(surfaceCss, '.chip-surface::after')
const listBlock = blockFor(css, '.tag-bread .coss-breadcrumb__list')
const itemBlock = blockFor(css, '.tag-bread .coss-breadcrumb__item')
const lastItemBlock = blockFor(css, '.tag-bread .coss-breadcrumb__item:last-of-type')
const linkBlock = blockFor(css, '.tag-bread .coss-breadcrumb__link')
const pageBlock = blockFor(css, '.tag-bread .coss-breadcrumb__page')
const tagBreadItemBlock = blockFor(css, '.tag-bread__item')
const prefixBlock = blockFor(css, '.tag-bread__prefix')
const cossRootBlock = blockFor(cossBreadcrumbCss, '.coss-breadcrumb')
const cossListBlock = blockFor(cossBreadcrumbCss, '.coss-breadcrumb__list')
const cossLinkBlock = blockFor(cossBreadcrumbCss, '.coss-breadcrumb__link')
const cossLinkHoverBlock = blockFor(cossBreadcrumbCss, '.coss-breadcrumb__link:hover')
const cossPageBlock = blockFor(cossBreadcrumbCss, '.coss-breadcrumb__page')
const cossSeparatorBlock = blockFor(
  cossBreadcrumbCss,
  '.coss-breadcrumb__separator,\n  .coss-breadcrumb__ellipsis',
)
const docsPreviewEllipsisBlock = blockFor(
  appCss,
  '.tag-bread-docs-preview__ellipsis',
)

assert.ok(
  packageJson.scripts?.test?.includes('scripts/tag-bread-contract.test.mjs'),
  'package.json test script must run tag-bread-contract.test.mjs.',
)
assert.equal(
  packageJson.exports?.['./components/tag-bread'],
  './src/components/tag-bread.tsx',
  'package.json must export TagBread.',
)
assert.ok(
  manifest.includes("id: 'tag-bread'") &&
    manifest.includes("name: 'TagBread'") &&
    manifest.includes("registryName: 'tag-bread'") &&
    manifest.includes("packageExport: './components/tag-bread'") &&
    manifest.includes('docs: false'),
  'Component manifest must keep TagBread registry-only after the Tag page merge.',
)
assert.ok(
  definitionsIndex.includes("import { tagDefinition } from './tag'") &&
    definitionsIndex.includes('tag: tagDefinition') &&
    !definitionsIndex.includes('tag-bread'),
  'TagBread preview must be wired into component-definitions/index.ts through the merged Tag definition.',
)

for (const snippet of [
  "import { Hash } from 'lucide-react'",
  "import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from 'react'",
  'Breadcrumb,',
  'BreadcrumbItem,',
  'BreadcrumbLink,',
  'BreadcrumbList,',
  'BreadcrumbPage,',
  'BreadcrumbSeparator,',
  "from './coss/breadcrumb'",
  "from './animated-inline-size'",
  "from './animated-inline-size-model'",
  "from './chip-surface-model'",
  "import './chip-surface.css'",
  "import './tag-bread.css'",
  'type TagBreadCrumb = {',
  'label: string',
  'path: string',
  'export type TagBreadProps = Omit<',
  "ComponentPropsWithoutRef<'nav'>,",
  "'children' | 'prefix' | 'onSelect'",
  'tag: string',
  'onSelect?: (tag: string) => void',
  'prefix?: ReactNode',
  'separator?: ReactNode',
  'function buildTagBreadCrumbs(tag: string): TagBreadCrumb[]',
  "const segments = tag",
  ".split('/')",
  '.map((segment) => segment.trim())',
  '.filter(Boolean)',
  "path: segments.slice(0, index + 1).join('/')",
  'export function TagBread',
  'tag,',
  'onSelect,',
  'prefix = <Hash aria-hidden="true" />',
  "separator = '/'",
  'const crumbs = buildTagBreadCrumbs(tag)',
  'function handleCrumbClick(event: MouseEvent<HTMLAnchorElement>, path: string) {',
  'event.preventDefault()',
  'onSelect?.(path)',
  'const isPage = index === crumbs.length - 1',
  "getChipSurfaceClassName('glass-surface', 'tag-bread', className)",
  "useGlassSurfaceBackgroundToneRef<HTMLElement>(true)",
  "import './glass-surface.css'",
  "getChipSurfaceAttributes({ variant: 'glass', textSize: 'base' })",
  'useAnimatedInlineSize(tag)',
  '<AnimatedInlineSizeMeasure measureRef={measureRef}>',
  '<Breadcrumb',
  '<BreadcrumbList>',
  '<BreadcrumbItem',
  '<BreadcrumbLink',
  'href=""',
  'onClick={',
  '? (event) => handleCrumbClick(event, crumb.path)',
  '<BreadcrumbPage',
  '<BreadcrumbSeparator className="tag-bread__separator">',
]) {
  assertIncludes(source, snippet, `TagBread source must include ${snippet}.`)
}
assert.ok(
  !source.includes("from './chip-button'") &&
    !source.includes('ChipButton') &&
    !source.includes('<nav') &&
    !source.includes('export type TagBreadItem') &&
    !source.includes('items: TagBreadItem[]') &&
    !source.includes('item.href') &&
    !source.includes('current?: boolean'),
  'TagBread must compose coss Breadcrumb rather than ChipButton or handwritten nav markup.',
)

for (const snippet of [
  "import { ChevronRight, MoreHorizontal } from 'lucide-react'",
  "import type { ComponentProps, ReactElement } from 'react'",
  "import { mergeProps } from '@base-ui/react/merge-props'",
  "import { useRender } from '@base-ui/react/use-render'",
  "import { cn } from '../lib/utils'",
  "import './breadcrumb.css'",
  'export function Breadcrumb',
  'aria-label="breadcrumb"',
  'data-slot="breadcrumb"',
  'export function BreadcrumbList',
  'data-slot="breadcrumb-list"',
  'export function BreadcrumbLink',
  'defaultTagName: \'a\'',
  "'data-slot': 'breadcrumb-link'",
  'export function BreadcrumbPage',
  'aria-current="page"',
  'export function BreadcrumbSeparator',
  'role="presentation"',
  'export function BreadcrumbEllipsis',
  '<MoreHorizontal',
]) {
  assertIncludes(cossBreadcrumbSource, snippet, `coss Breadcrumb source must include ${snippet}.`)
}

assertIncludes(rootBlock, 'display: inline-flex;', 'TagBread root must be an inline surface.')
assertIncludes(rootBlock, 'max-width: 100%;', 'TagBread root must fit narrow containers.')
assertIncludes(rootBlock, 'justify-content: flex-start;', 'TagBread must keep its prefix and breadcrumb trail left-aligned during width transitions.')
assertIncludes(rootBlock, '--animated-inline-size-transition-duration: 180ms;', 'TagBread must inherit the shared 180ms width transition duration.')
assertIncludes(rootBlock, 'inline-size var(--animated-inline-size-transition-duration) cubic-bezier(0.2, 0, 0, 1)', 'TagBread must animate measured breadcrumb-width changes through ChipSurface.')
assertIncludes(glassSurfaceBlock, 'border-color: var(--glass-surface-border);', 'TagBread must use the standard glass surface border token.')
assertIncludes(rootBlock, 'border-radius: var(--radius-round);', 'TagBread glass surface must be pill-shaped.')
assert.ok(
  !glassLayerBlock.includes('background: var(--glass-gradient);') && !surfaceCss.includes('--glass-gradient'),
  'TagBread glass layer must not depend on a shared glass background gradient token.',
)
assertIncludes(glassSurfaceBlock, 'backdrop-filter: blur(var(--glass-blur));', 'TagBread must enable the glass blur.')
assertIncludes(glassSurfaceBlock, '-webkit-backdrop-filter: blur(var(--glass-blur));', 'TagBread must support Safari glass blur.')
assert.ok(
  !glassSurfaceBlock.includes('box-shadow') && !surfaceCss.includes('--glass-shadow'),
  'TagBread glass surface must not use glass shadow effects.',
)
assertIncludes(cossListBlock, 'color: var(--color-text-secondary);', 'coss Breadcrumb list must own TagBread text color even when the shared chip surface sets root color.')
assertIncludes(listBlock, 'min-width: 0;', 'TagBread list must shrink inside constrained callers.')
assertIncludes(listBlock, 'flex-wrap: nowrap;', 'TagBread list must keep the trail on one line.')
assertIncludes(listBlock, 'gap: 6px;', 'TagBread breadcrumb list gap must not change when ChipButton gap changes.')
assertIncludes(listBlock, 'font-size: var(--font-size-base);', 'TagBread text must use the base font size token.')
assert.ok(!listBlock.includes('font-size: var(--font-size-sm);'), 'TagBread text must not use the small font size token.')
assertIncludes(itemBlock, 'flex: none;', 'TagBread items must not shrink until Chinese text wraps.')
assertIncludes(itemBlock, 'white-space: nowrap;', 'TagBread items must keep each tag segment on one line.')
assertIncludes(tagBreadItemBlock, 'align-items: center;', 'TagBread prefix and label must be vertically centered instead of baseline-aligned.')
assertIncludes(lastItemBlock, 'flex: 1 1 auto;', 'TagBread final segment must shrink instead of being hard-clipped.')
assertIncludes(lastItemBlock, 'min-width: 0;', 'TagBread final segment must allow text overflow handling.')
assertIncludes(linkBlock, 'white-space: inherit;', 'TagBread links must inherit the no-wrap item contract.')
assertIncludes(pageBlock, 'display: block;', 'TagBread current page must expose a block box for clipped overflow.')
assertIncludes(pageBlock, 'flex: 1 1 auto;', 'TagBread current page must shrink within the final breadcrumb item.')
assertIncludes(pageBlock, 'min-width: 0;', 'TagBread current page must allow the text box to become narrower than its content.')
assertIncludes(pageBlock, 'max-width: 100%;', 'TagBread current page must stay inside the final breadcrumb item.')
assertIncludes(pageBlock, 'white-space: inherit;', 'TagBread current page must inherit the no-wrap item contract.')
assertIncludes(pageBlock, 'overflow: hidden;', 'TagBread current page must clip through text overflow, not container clipping.')
assertIncludes(pageBlock, 'text-overflow: clip;', 'TagBread current page overflow must be clipped without an ellipsis.')
assert.ok(
  !pageBlock.includes('text-overflow: ellipsis;'),
  'TagBread current page overflow must not render an ellipsis.',
)
assertIncludes(prefixBlock, 'display: inline-flex;', 'TagBread prefix must align the default hash icon.')
assertIncludes(tagBreadItemBlock, 'gap: 2px;', 'TagBread item prefix gap must not change when ChipButton gap changes.')
assertIncludes(prefixBlock, 'align-self: center;', 'TagBread prefix must stay vertically centered if breadcrumb item alignment changes.')
assertIncludes(prefixBlock, 'align-items: center;', 'TagBread prefix icon must be vertically centered inside the prefix slot.')
assertIncludes(prefixBlock, 'justify-content: center;', 'TagBread prefix icon must be horizontally centered inside the prefix slot.')
assertIncludes(prefixBlock, 'width: 14px;', 'TagBread prefix icon slot must stay compact.')
assertIncludes(prefixBlock, 'height: 14px;', 'TagBread prefix icon slot must stay compact.')
assertIncludes(prefixBlock, 'color: var(--color-text-subtle);', 'TagBread prefix color must match the coss Breadcrumb separator token.')
assert.ok(!prefixBlock.includes('color: var(--color-primary);'), 'TagBread prefix must not use primary color when separators use muted color.')
assertIncludes(cossRootBlock, 'display: block;', 'coss Breadcrumb root must own a stable class.')
assertIncludes(cossListBlock, 'display: flex;', 'coss Breadcrumb list must provide the documented flex trail.')
assertIncludes(cossLinkBlock, 'color: inherit;', 'coss Breadcrumb must own link text color.')
assertIncludes(cossLinkHoverBlock, 'color: var(--color-text-primary);', 'coss Breadcrumb must own link hover color.')
assertIncludes(cossPageBlock, 'color: var(--color-text-primary);', 'coss Breadcrumb must own page text color.')
assertIncludes(cossSeparatorBlock, 'color: var(--color-text-subtle);', 'coss Breadcrumb separator must expose the muted color token TagBread prefix follows.')
assert.ok(
  indexCss.includes('@layer base {') &&
    indexCss.includes('  a {\n    color: inherit;\n  }'),
  'Global anchor reset must live in @layer base so coss Breadcrumb component hover styles can override it.',
)
assert.ok(
  !indexCss.includes('\na {\n  color: inherit;\n}'),
  'Global anchor reset must not stay unlayered because it overrides coss Breadcrumb hover styles.',
)
assert.ok(
  !css.includes('.tag-bread__link') &&
    !css.includes('.tag-bread__crumb') &&
    !css.includes('.tag-bread__page') &&
    !css.includes('hover'),
  'TagBread CSS must not override coss Breadcrumb text or hover styles.',
)

assert.ok(
    docsDefinition.includes("import { TagBread } from '../../components/tag-bread'") &&
    docsDefinition.includes("import { CalendarDays, Folder, Hash } from 'lucide-react'") &&
    docsDefinition.includes("from '../../components/chip-surface-model'") &&
    docsDefinition.includes('const tagBreadDocsSurfaceAttributes = getChipSurfaceAttributes({') &&
    docsDefinition.includes("variant: 'glass'") &&
    docsDefinition.includes("textSize: 'base'") &&
    docsDefinition.includes('className={getChipSurfaceClassName(') &&
    docsDefinition.includes("'tag-bread-docs-preview__ellipsis'") &&
    docsDefinition.includes("import { GhostIconButton } from '../../components/ghost-icon-button'") &&
    !docsDefinition.includes("import { Button } from '../../components/coss/button'") &&
    docsDefinition.includes("import {") &&
    docsDefinition.includes("BreadcrumbEllipsis,") &&
    docsDefinition.includes("BreadcrumbItem,") &&
    docsDefinition.includes("BreadcrumbLink,") &&
    docsDefinition.includes("BreadcrumbList,") &&
    docsDefinition.includes("BreadcrumbPage,") &&
    docsDefinition.includes("BreadcrumbSeparator,") &&
    docsDefinition.includes("} from '../../components/coss/breadcrumb'") &&
    docsDefinition.includes('Menu,') &&
    docsDefinition.includes('MenuItem,') &&
    docsDefinition.includes('MenuPopup,') &&
    docsDefinition.includes('MenuTrigger,') &&
    docsDefinition.includes("} from '../../components/menu'") &&
    !docsDefinition.includes('TagBreadItem') &&
    docsDefinition.includes("id: 'tag'") &&
    docsDefinition.includes('summary:') &&
    docsDefinition.includes('function TagBreadDemo') &&
    docsDefinition.includes('className="tag-bread-docs-preview"') &&
    docsDefinition.includes('tag="文学/古代/诗词"') &&
    docsDefinition.includes('onSelect={() => {}}') &&
    docsDefinition.includes('<Breadcrumb') &&
    docsDefinition.includes('aria-label="coss 省略面包屑示例"') &&
    docsDefinition.includes('{...tagBreadDocsSurfaceAttributes}') &&
    docsDefinition.includes('<span className="tag-bread__prefix">') &&
    docsDefinition.includes('<Hash aria-hidden="true" />') &&
    docsDefinition.includes('<BreadcrumbItem className="tag-bread__item">') &&
    docsDefinition.includes('<BreadcrumbLink className="tag-bread__link" href="/">') &&
    docsDefinition.includes('<Menu>') &&
    docsDefinition.includes('<MenuTrigger') &&
    docsDefinition.includes('render={') &&
    docsDefinition.includes('<GhostIconButton') &&
    docsDefinition.includes('aria-label="展开省略的面包屑层级"') &&
    docsDefinition.includes('className="tag-bread-docs-preview__ellipsis-trigger"') &&
    docsDefinition.includes('size="sm"') &&
    !docsDefinition.includes('variant="ghost"') &&
    docsDefinition.includes('<BreadcrumbEllipsis />') &&
    docsDefinition.includes('<MenuPopup align="start">') &&
    docsDefinition.includes('<MenuItem render={<a href="/docs" />}>Docs</MenuItem>') &&
    docsDefinition.includes('<MenuItem render={<a href="/particles" />}>Particles</MenuItem>') &&
    docsDefinition.includes('<BreadcrumbLink className="tag-bread__link" href="/docs/components">') &&
    docsDefinition.includes('<BreadcrumbPage className="tag-bread__page">Breadcrumb</BreadcrumbPage>') &&
    !docsDefinition.includes("href: '#writing'"),
  'TagBread docs definition must preview the tag-string API and the coss ellipsis breadcrumb example.',
)

assert.equal(
  countOccurrences(docsDefinition, '<BreadcrumbSeparator className="tag-bread__separator">'),
  3,
  'TagBread docs ellipsis preview must render every separator as the shared slash separator.',
)
assert.ok(
  docsPreviewEllipsisBlock.includes('max-width: 100%;'),
  'TagBread docs ellipsis preview root must stay constrained inside the preview panel.',
)
assert.ok(
  !appCss.includes('.tag-bread-docs-preview__ellipsis .coss-breadcrumb__list') &&
    !appCss.includes('.tag-bread-docs-preview__ellipsis .coss-breadcrumb__item') &&
    !appCss.includes('.tag-bread-docs-preview__ellipsis .coss-breadcrumb__link') &&
    !appCss.includes('.tag-bread-docs-preview__ellipsis .coss-breadcrumb__page') &&
    !appCss.includes('.tag-bread-docs-preview__ellipsis .coss-breadcrumb__separator svg'),
  'TagBread docs ellipsis preview must reuse TagBread glass and separator styles instead of overriding coss Breadcrumb locally.',
)

assert.ok(registryItem, 'Root registry must include the @weimo/tag-bread item.')
assert.deepEqual(
  standaloneRegistry,
  registryItem,
  'registry/tag-bread.json must match registry.json payload.',
)
assert.equal(registryItem.name, 'tag-bread')
assert.equal(registryItem.type, 'registry:ui')
assert.deepEqual(registryItem.categories, ['navigation', 'tag'])
assert.deepEqual(registryItem.dependencies, ['@base-ui/react', 'lucide-react'])
assert.deepEqual(registryItem.registryDependencies, ['@weimo/style', '@weimo/utils'])
assert.deepEqual(
  registryItem.files.map((file) => file.path),
  [
    'src/components/tag-bread.tsx',
    'src/components/tag-bread.css',
    'src/components/chip-surface.tsx',
    'src/components/chip-surface-model.ts',
    'src/components/chip-surface.css',
    'src/components/animated-inline-size.tsx',
    'src/components/animated-inline-size-model.ts',
    'src/components/animated-inline-size.css',
    'src/components/coss/breadcrumb.tsx',
    'src/components/coss/breadcrumb.css',
    'src/components/glass-surface.tsx',
    'src/components/glass-surface-model.ts',
    'src/components/glass-surface.css',
  ],
  'TagBread registry item must ship the component, sidecar CSS, shared chip surface internals, and local coss Breadcrumb.',
)

assert.ok(
  smokeSource.includes('TagBread') &&
    smokeSource.includes('@/components/ui/tag-bread') &&
    smokeSource.includes("await runShadcnAdd(consumerDir, '@weimo/tag-bread')") &&
    smokeSource.includes("hits.includes('tag-bread.json')") &&
    smokeSource.includes("src/components/ui/tag-bread.tsx") &&
    smokeSource.includes("src/components/ui/coss/breadcrumb.tsx"),
  'registry smoke test must install and typecheck TagBread from the custom registry.',
)
