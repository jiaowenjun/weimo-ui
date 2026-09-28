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

const componentSource = readProjectFile(
  'packages/weimo-ui-core/src/components/controls/labeled-switch/labeled-switch.tsx',
)
const componentCss = readProjectFile(
  'packages/weimo-ui-core/src/components/controls/labeled-switch/labeled-switch.css',
)
const corePackageJson = JSON.parse(readProjectFile('packages/weimo-ui-core/package.json'))
const rootPackageJson = JSON.parse(readProjectFile('package.json'))
const docsDefinitionSource = readProjectFile(
  'packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/labeled-switch.tsx',
)

// 带状态标签的开关：docs 标题栏的启用/编辑态等状态切换共用机制，从站点级
// PreviewToggle 下沉为 core 正式组件（coss Switch + labelOn/labelOff 双文案）。
for (const snippet of [
  "import { Switch } from 'weimo-ui-core/components/coss/switch'",
  'export function LabeledSwitch(',
  'ariaLabel: string',
  'labelOn: ReactNode',
  'labelOff: ReactNode',
  '{checked ? labelOn : labelOff}',
  'aria-label={ariaLabel}',
  'checked={checked}',
  'onCheckedChange={onCheckedChange}',
]) {
  assert.ok(componentSource.includes(snippet), `LabeledSwitch component must include ${snippet}.`)
}

for (const snippet of [
  '@layer components',
  '.labeled-switch {',
  'gap: 6px;',
  '.labeled-switch__label {',
  'color: var(--color-text-secondary);',
  'font-size: var(--font-size-xs);',
  'line-height: 1.2;',
]) {
  assert.ok(componentCss.includes(snippet), `LabeledSwitch CSS must include ${snippet}.`)
}

assert.equal(
  corePackageJson.exports?.['./components/labeled-switch'],
  './src/components/controls/labeled-switch/labeled-switch.tsx',
  'weimo-ui-core must export the LabeledSwitch component entry.',
)
assert.equal(
  corePackageJson.exports?.['./styles/labeled-switch.css'],
  './src/components/controls/labeled-switch/labeled-switch.css',
  'weimo-ui-core must export the LabeledSwitch stylesheet entry.',
)
assert.equal(
  rootPackageJson.exports?.['./components/labeled-switch'],
  './packages/weimo-ui-core/src/components/controls/labeled-switch/labeled-switch.tsx',
  'The workspace root must mirror the LabeledSwitch component export.',
)

for (const snippet of [
  "import { LabeledSwitch } from 'weimo-ui-core/components/labeled-switch'",
  "import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'",
  '<ComponentPreviewCard align="center" label="开关">',
  '<LabeledSwitch',
  'ariaLabel="启用"',
  'labelOn="已启用"',
  'labelOff="已禁用"',
  "id: 'labeled-switch'",
  'preview: () => <LabeledSwitchDemo />',
]) {
  assert.ok(docsDefinitionSource.includes(snippet), `LabeledSwitch docs page must include ${snippet}.`)
}

assert.ok(
  !existsSync(join(root, 'packages/weimo-ui-site/src/docs/previews/preview-toggle.tsx')),
  'The site-level PreviewToggle must stay removed; the labeled switch lives in weimo-ui-core.',
)
