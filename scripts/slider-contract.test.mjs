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

const componentCss = readProjectFile(
  'packages/weimo-ui-core/src/components/controls/slider/slider.css',
)
const corePackageJson = JSON.parse(readProjectFile('packages/weimo-ui-core/package.json'))
const rootPackageJson = JSON.parse(readProjectFile('package.json'))
const docsDefinitionSource = readProjectFile(
  'packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/slider.tsx',
)

// Slider 专属背景 token：定义在 .slider 内部（自定义属性只随滑块子树级联，
// 天然不被其他组件使用），值别名共享色板；绘制必须经专属 token。
for (const snippet of [
  '--slider-track-bg: var(--color-border);',
  '--slider-indicator-bg: color-mix(in srgb, var(--color-bg-primary), var(--color-bg-card) 15%);',
  '--slider-thumb-bg: color-mix(in srgb, var(--color-bg-primary), var(--color-bg-card) 15%);',
  'background: var(--slider-track-bg);',
  'background: var(--slider-indicator-bg);',
  'background: var(--slider-thumb-bg);',
]) {
  assert.ok(componentCss.includes(snippet), `Slider CSS must define/paint via ${snippet}`)
}
assert.ok(
  !componentCss.includes('background: var(--color-border)') &&
    !componentCss.includes('background: var(--color-bg-primary)'),
  'Slider backgrounds must paint only through its own --slider-* tokens.',
)

assert.equal(
  corePackageJson.exports?.['./components/slider'],
  './src/components/controls/slider/slider.tsx',
  'weimo-ui-core must export the Slider component entry.',
)
assert.equal(
  corePackageJson.exports?.['./styles/slider.css'],
  './src/components/controls/slider/slider.css',
  'weimo-ui-core must export the Slider stylesheet entry.',
)
assert.equal(
  rootPackageJson.exports?.['./components/slider'],
  './packages/weimo-ui-core/src/components/controls/slider/slider.tsx',
  'The workspace root must mirror the Slider component export.',
)

for (const snippet of [
  "import { borderColorToneMap } from 'weimo-ui-core/components/border-color'",
  "import { Slider } from 'weimo-ui-core/components/slider'",
  'items={sliderItems}',
  'label="滑块"',
  "token: '--slider-track-bg'",
  "token: '--slider-indicator-bg'",
  "token: '--slider-thumb-bg'",
  "value: 'hsl(0 0% 28%)'",
  "darkValue: 'hsl(0 0% 83%)'",
  "id: 'slider'",
  'preview: () => <SliderDemo />',
]) {
  assert.ok(docsDefinitionSource.includes(snippet), `Slider docs page must include ${snippet}.`)
}
