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

function assertIncludes(source, snippet, message) {
  assert.ok(source.includes(snippet), message)
}

function assertOmits(source, snippet, message) {
  assert.ok(!source.includes(snippet), message)
}

function cssBlockFor(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))

  assert.ok(match, `${selector} block must exist.`)

  return match[1]
}

const packageJson = readJson('package.json')
const rootRegistry = readJson('registry.json')
const groupRegistry = readJson('registry/frosted-icon-button-group.json')
const rootGroupItem = rootRegistry.items.find(
  (item) => item.name === 'frosted-icon-button-group',
)
const componentManifestSource = readProjectFile('src/docs/components-manifest.ts')
const groupSource = readProjectFile('src/components/frosted-icon-button-group.tsx')
const glassIconButtonSource = readProjectFile('src/components/frosted-icon-button.tsx')
const groupCss = readProjectFile('src/components/frosted-icon-button-group.css')
const iconButtonCss = readProjectFile('src/components/icon-button.css')
const buttonDocsSource = readProjectFile('src/docs/component-definitions/button.tsx')

assert.ok(
  packageJson.scripts?.test?.includes('scripts/frosted-icon-button-group-contract.test.mjs'),
  'package.json test script must run frosted-icon-button-group-contract.test.mjs.',
)
assert.equal(
  packageJson.exports?.['./components/frosted-icon-button-group'],
  './src/components/frosted-icon-button-group.tsx',
  'FrostedIconButtonGroup must have a public package export.',
)

for (const snippet of [
  "id: 'frosted-icon-button-group'",
  "name: 'FrostedIconButtonGroup'",
  "registryName: 'frosted-icon-button-group'",
  "packageExport: './components/frosted-icon-button-group'",
  "group: 'controls-overlays'",
  'docs: false',
  'registry: true',
]) {
  assertIncludes(
    componentManifestSource,
    snippet,
    `FrostedIconButtonGroup manifest entry must include ${snippet}.`,
  )
}

assert.ok(rootGroupItem, 'Root registry must include FrostedIconButtonGroup.')
assert.deepEqual(
  groupRegistry,
  rootGroupItem,
  'registry/frosted-icon-button-group.json must match registry.json payload.',
)
assert.deepEqual(
  groupRegistry.registryDependencies,
  ['@weimo/style', '@weimo/utils'],
  'FrostedIconButtonGroup registry item must install shared style tokens and the cn utility.',
)
assert.deepEqual(
  groupRegistry.files.map((file) => file.path),
  [
    'src/components/frosted-icon-button-group.tsx',
    'src/components/frosted-icon-button-group.css',
    'src/components/icon-button-model.ts',
    'src/components/icon-button.css',
    'src/components/frosted-surface.tsx',
    'src/components/frosted-surface-model.ts',
    'src/components/frosted-surface.css',
  ],
  'FrostedIconButtonGroup registry item must ship the group plus the icon-button and frosted-surface primitives.',
)

for (const snippet of [
  "import {\n  getFrostedSurfaceClassName,\n  useFrostedSurfaceBackgroundToneRef,\n} from './frosted-surface'",
  "import { getIconButtonClassName, type IconButtonSize } from './icon-button-model'",
  "import { cn } from './lib/utils'",
  "import './frosted-icon-button-group.css'",
  'export type FrostedIconButtonGroupProps',
  'export const FrostedIconButtonGroup =',
  'bordered?: boolean',
  'bordered = true',
  "role ?? 'group'",
  `getFrostedSurfaceClassName(\n        'frosted-icon-button-group',\n        bordered ? 'frosted-surface--bordered' : undefined,\n        className,\n      )`,
  'data-background-tone={backgroundTone ?? undefined}',
  'export type FrostedIconGroupButtonProps',
  'export const FrostedIconGroupButton =',
  "cn(getIconButtonClassName('glass', size), className)",
  'type = \'button\'',
]) {
  assertIncludes(
    groupSource,
    snippet,
    `FrostedIconButtonGroup source must include ${snippet}.`,
  )
}

// 组内按钮不叠第二层玻璃表面：组件不得再包 FrostedIconButton/Glass-surface 按钮。
assertOmits(
  groupSource,
  "from './frosted-icon-button'",
  'FrostedIconButtonGroup must compose plain icon-button--frosted buttons instead of nested full glass icon buttons.',
)

const groupBlock = cssBlockFor(groupCss, '.frosted-icon-button-group')

for (const snippet of [
  'display: inline-flex;',
  'align-items: center;',
  'gap: 0;',
  'padding: 0;',
  'border-radius: var(--radius-round);',
]) {
  assert.ok(
    groupBlock.includes(snippet),
    `.frosted-icon-button-group block must include ${snippet}`,
  )
}

// 组高度与同级单个图标按钮严格一致:按钮盒纵向外溢 1px 抵消上下玻璃描边占位,
// 首尾按钮横向外溢 1px 让内收后的悬停圆与端帽半圆同心,中间按钮不重叠。
const groupButtonBlock = cssBlockFor(groupCss, '.frosted-icon-button-group > .icon-button')
const groupFirstButtonBlock = cssBlockFor(
  groupCss,
  '.frosted-icon-button-group > .icon-button:first-child',
)
const groupLastButtonBlock = cssBlockFor(
  groupCss,
  '.frosted-icon-button-group > .icon-button:last-child',
)

assert.ok(
  groupButtonBlock.includes('margin-block: -1px;'),
  'Grouped icon buttons must cancel the 1px glass border height so the pill matches a standalone button.',
)
assert.ok(
  groupFirstButtonBlock.includes('margin-inline-start: -1px;'),
  'The first grouped button must overflow 1px toward the end cap so the inset hover circle stays concentric with it.',
)
assert.ok(
  groupLastButtonBlock.includes('margin-inline-end: -1px;'),
  'The last grouped button must overflow 1px toward the end cap so the inset hover circle stays concentric with it.',
)

// 悬停蒙层内收分档:默认档 4px 等距环,sm/xs 维持 2px 紧凑环。
const groupHoverBlock = cssBlockFor(
  groupCss,
  '.frosted-icon-button-group > .icon-button--frosted::after',
)
const groupSmHoverBlock = cssBlockFor(
  groupCss,
  '.frosted-icon-button-group > .icon-button--sm.icon-button--frosted::after',
)
const groupXsHoverBlock = cssBlockFor(
  groupCss,
  '.frosted-icon-button-group > .icon-button--xs.icon-button--frosted::after',
)

assert.ok(
  groupHoverBlock.includes('inset: 4px;'),
  'Default-sized grouped hover circles must inset 4px from the button box so the highlight keeps an equidistant 4px gap to the group border.',
)
assert.ok(
  groupSmHoverBlock.includes('inset: 2px;'),
  'Small grouped hover circles must keep the compact 2px inset ring.',
)
assert.ok(
  groupXsHoverBlock.includes('inset: 2px;'),
  'Grouped xs hover circles must keep the 2px inset so the highlight stays larger than the 12px icon.',
)

// 反馈与材质完全继承：组不自建悬停/按压/边框/模糊,半径走共享 round token。
for (const omittedSnippet of [
  '999px',
  ':hover',
  ':active',
  'transform: scale',
  '--glass-surface-hover-bg:',
  'border:',
  'backdrop-filter',
]) {
  assertOmits(
    groupCss,
    omittedSnippet,
    `FrostedIconButtonGroup CSS must not redefine ${omittedSnippet}; it inherits frosted-surface and icon-button--frosted feedback.`,
  )
}

for (const snippet of [
  '.frosted-icon-button-group > .icon-button--frosted:disabled {',
  'color: var(--color-text-disabled);',
  ".frosted-icon-button-group[data-background-tone='light'] > .icon-button--frosted:disabled {",
  'color: var(--color-text-disabled-on-light);',
  ".frosted-icon-button-group[data-background-tone='dark'] > .icon-button--frosted:disabled {",
  'color: var(--color-text-disabled-on-dark);',
]) {
  assertIncludes(
    groupCss,
    snippet,
    `FrostedIconButtonGroup CSS must include ${snippet}.`,
  )
}

// 组无 :disabled 伪类,经 :has 从子按钮推导:全部按钮禁用时组描边
// 对齐磨砂图标按钮的禁用边框 token(icon-button--frosted:disabled 同款三档);
// .frosted-surface--bordered 修饰类保证描边只出现在 opt-in 边框组上(默认无边框)。
const groupDisabledBorderBlocks = [
  [
    '.frosted-icon-button-group.frosted-surface--bordered:not(:has(> .icon-button--frosted:not(:disabled)))',
    'border-color: var(--color-border-disabled);',
  ],
  [
    ".frosted-icon-button-group.frosted-surface--bordered[data-background-tone='light']:not(:has(> .icon-button--frosted:not(:disabled)))",
    'border-color: var(--color-border-disabled-on-light);',
  ],
  [
    ".frosted-icon-button-group.frosted-surface--bordered[data-background-tone='dark']:not(:has(> .icon-button--frosted:not(:disabled)))",
    'border-color: var(--color-border-disabled-on-dark);',
  ],
]

for (const [selector, snippet] of groupDisabledBorderBlocks) {
  assert.ok(
    cssBlockFor(groupCss, selector).includes(snippet),
    `FrostedIconButtonGroup disabled border must mirror the glass icon button token: ${selector} must set ${snippet}`,
  )
}

// 悬停反馈与磨砂图标按钮同源:组内按钮复用 icon-button--frosted 的 ::after 蒙层,
// 蒙层色取组上继承的 --glass-surface-hover-bg(currentColor 12%),缺省才回落主题色。
assertIncludes(
  iconButtonCss,
  'background-color: var(--glass-surface-hover-bg, var(--color-bg-hover));',
  'icon-button--frosted hover overlay must keep consuming the inherited frosted-surface hover token.',
)

// 磨砂材质基类默认无边框:磨砂图标按钮的禁用描边必须落在 .frosted-surface--bordered
// 修饰类上,无边框实例在任何状态都保持透明描边。
for (const snippet of [
  'bordered?: boolean',
  'bordered = true',
  "bordered ? 'frosted-surface--bordered' : undefined",
]) {
  assertIncludes(
    glassIconButtonSource,
    snippet,
    `FrostedIconButton must stroke by default and only go borderless when the caller opts out: ${snippet}.`,
  )
}
const glassDisabledBlock = cssBlockFor(iconButtonCss, '.icon-button--frosted:disabled')

assert.ok(
  !glassDisabledBlock.includes('border-color'),
  'The base .icon-button--frosted:disabled block must not set border-color; borderless instances would lose the transparent stroke.',
)
assert.ok(
  cssBlockFor(
    iconButtonCss,
    '.icon-button--frosted.frosted-surface--bordered:disabled',
  ).includes('border-color: var(--icon-button-disabled-border);'),
  'The glass icon button disabled stroke must only land on bordered instances via the .frosted-surface--bordered modifier.',
)

for (const snippet of [
  "import {\n  FrostedIconButtonGroup,\n  FrostedIconGroupButton,\n} from '../../components/frosted-icon-button-group'",
  'function FrostedIconButtonGroupPreviewGroup(',
  'function FrostedIconButtonGroupPreview()',
  'label="磨砂图标按钮组"',
  '<FrostedIconButtonGroupPreview />',
  '<FrostedIconButtonGroupPreviewGroup disabled={disabled} />',
  'className="icon-preview__row"',
  'aria-label="FrostedIconButtonGroup 磨砂按钮组预览"',
  '<FrostedIconButtonGroup aria-label="磨砂图标按钮组">',
  '<FrostedIconButtonGroup aria-label="小号磨砂图标按钮组">',
  "'磨砂图标按钮组',",
  "'FrostedIconButtonGroup',",
]) {
  assertIncludes(
    buttonDocsSource,
    snippet,
    `Button docs definition must include ${snippet}.`,
  )
}

assert.equal(
  (buttonDocsSource.match(/<FrostedIconGroupButton\b[^>\n]*disabled=\{disabled\}/g) ?? []).length,
  4,
  'Button docs group preview must demo the default group and the two-button sm group, all wired to the disabled toggle.',
)
assert.equal(
  (buttonDocsSource.match(/<FrostedIconGroupButton\b[^>\n]*size="sm"/g) ?? []).length,
  2,
  'Button docs group preview must demo the small group via two sm icon buttons.',
)
