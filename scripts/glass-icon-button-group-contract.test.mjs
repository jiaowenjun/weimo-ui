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
const groupRegistry = readJson('registry/glass-icon-button-group.json')
const rootGroupItem = rootRegistry.items.find(
  (item) => item.name === 'glass-icon-button-group',
)
const componentManifestSource = readProjectFile('src/docs/components-manifest.ts')
const groupSource = readProjectFile('src/components/glass-icon-button-group.tsx')
const groupCss = readProjectFile('src/components/glass-icon-button-group.css')
const iconButtonCss = readProjectFile('src/components/icon-button.css')
const buttonDocsSource = readProjectFile('src/docs/component-definitions/button.tsx')

assert.ok(
  packageJson.scripts?.test?.includes('scripts/glass-icon-button-group-contract.test.mjs'),
  'package.json test script must run glass-icon-button-group-contract.test.mjs.',
)
assert.equal(
  packageJson.exports?.['./components/glass-icon-button-group'],
  './src/components/glass-icon-button-group.tsx',
  'GlassIconButtonGroup must have a public package export.',
)

for (const snippet of [
  "id: 'glass-icon-button-group'",
  "name: 'GlassIconButtonGroup'",
  "registryName: 'glass-icon-button-group'",
  "packageExport: './components/glass-icon-button-group'",
  "group: 'controls-overlays'",
  'docs: false',
  'registry: true',
]) {
  assertIncludes(
    componentManifestSource,
    snippet,
    `GlassIconButtonGroup manifest entry must include ${snippet}.`,
  )
}

assert.ok(rootGroupItem, 'Root registry must include GlassIconButtonGroup.')
assert.deepEqual(
  groupRegistry,
  rootGroupItem,
  'registry/glass-icon-button-group.json must match registry.json payload.',
)
assert.deepEqual(
  groupRegistry.registryDependencies,
  ['@weimo/style', '@weimo/utils'],
  'GlassIconButtonGroup registry item must install shared style tokens and the cn utility.',
)
assert.deepEqual(
  groupRegistry.files.map((file) => file.path),
  [
    'src/components/glass-icon-button-group.tsx',
    'src/components/glass-icon-button-group.css',
    'src/components/icon-button-model.ts',
    'src/components/icon-button.css',
    'src/components/glass-surface.tsx',
    'src/components/glass-surface-model.ts',
    'src/components/glass-surface.css',
  ],
  'GlassIconButtonGroup registry item must ship the group plus the icon-button and glass-surface primitives.',
)

for (const snippet of [
  "import {\n  getGlassSurfaceClassName,\n  useGlassSurfaceBackgroundToneRef,\n} from './glass-surface'",
  "import { getIconButtonClassName, type IconButtonSize } from './icon-button-model'",
  "import { cn } from './lib/utils'",
  "import './glass-icon-button-group.css'",
  'export type GlassIconButtonGroupProps',
  'export const GlassIconButtonGroup =',
  'role ?? \'group\'',
  "getGlassSurfaceClassName('glass-icon-button-group', className)",
  'data-background-tone={backgroundTone ?? undefined}',
  'export type GlassIconGroupButtonProps',
  'export const GlassIconGroupButton =',
  "cn(getIconButtonClassName('glass', size), className)",
  'type = \'button\'',
]) {
  assertIncludes(
    groupSource,
    snippet,
    `GlassIconButtonGroup source must include ${snippet}.`,
  )
}

// 组内按钮不叠第二层玻璃表面：组件不得再包 GlassIconButton/Glass-surface 按钮。
assertOmits(
  groupSource,
  "from './glass-icon-button'",
  'GlassIconButtonGroup must compose plain icon-button--glass buttons instead of nested full glass icon buttons.',
)

const groupBlock = cssBlockFor(groupCss, '.glass-icon-button-group')

for (const snippet of [
  'display: inline-flex;',
  'align-items: center;',
  'gap: 4px;',
  'padding: 4px;',
  'border-radius: var(--radius-round);',
]) {
  assert.ok(
    groupBlock.includes(snippet),
    `.glass-icon-button-group block must include ${snippet}`,
  )
}

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
    `GlassIconButtonGroup CSS must not redefine ${omittedSnippet}; it inherits glass-surface and icon-button--glass feedback.`,
  )
}

for (const snippet of [
  '.glass-icon-button-group > .icon-button--glass:disabled {',
  'color: var(--color-text-disabled);',
  ".glass-icon-button-group[data-background-tone='light'] > .icon-button--glass:disabled {",
  'color: var(--color-text-disabled-on-light);',
  ".glass-icon-button-group[data-background-tone='dark'] > .icon-button--glass:disabled {",
  'color: var(--color-text-disabled-on-dark);',
]) {
  assertIncludes(
    groupCss,
    snippet,
    `GlassIconButtonGroup CSS must include ${snippet}.`,
  )
}

// 悬停反馈与玻璃图标按钮同源:组内按钮复用 icon-button--glass 的 ::after 蒙层,
// 蒙层色取组上继承的 --glass-surface-hover-bg(currentColor 12%),缺省才回落主题色。
assertIncludes(
  iconButtonCss,
  'background-color: var(--glass-surface-hover-bg, var(--color-bg-hover));',
  'icon-button--glass hover overlay must keep consuming the inherited glass-surface hover token.',
)

for (const snippet of [
  "import {\n  GlassIconButtonGroup,\n  GlassIconGroupButton,\n} from '../../components/glass-icon-button-group'",
  'function GlassIconButtonGroupPreviewGroup(',
  'function GlassIconButtonGroupPreview()',
  'label="玻璃图标按钮组"',
  '<GlassIconButtonGroupPreview />',
  '<GlassIconButtonGroupPreviewGroup disabled={disabled} />',
  'className="icon-preview__row"',
  'aria-label="GlassIconButtonGroup 玻璃按钮组预览"',
  '<GlassIconButtonGroup aria-label="玻璃图标按钮组">',
  '<GlassIconButtonGroup aria-label="小号玻璃图标按钮组">',
  "'玻璃图标按钮组',",
  "'GlassIconButtonGroup',",
]) {
  assertIncludes(
    buttonDocsSource,
    snippet,
    `Button docs definition must include ${snippet}.`,
  )
}

assert.equal(
  (buttonDocsSource.match(/<GlassIconGroupButton\b[^>\n]*disabled=\{disabled\}/g) ?? []).length,
  4,
  'Button docs group preview must demo a two-button default group and a two-button sm group, all wired to the disabled toggle.',
)
assert.equal(
  (buttonDocsSource.match(/<GlassIconGroupButton\b[^>\n]*size="sm"/g) ?? []).length,
  2,
  'Button docs group preview must demo the small group via two sm icon buttons.',
)
