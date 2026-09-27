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

function assertTextButtonDocsControl(relativePath, labels) {
  const source = readProjectFile(relativePath)

  assert.ok(
    source.includes("import { TextButton } from 'weimo-ui-core/components/text-button'"),
    `${relativePath} must import TextButton for docs text controls.`,
  )
  assert.ok(
    !source.includes("import { Button } from 'weimo-ui-core/components/coss/button'"),
    `${relativePath} must not import coss Button for docs text controls.`,
  )
  assert.ok(/<TextButton\b/.test(source), `${relativePath} must render TextButton.`)
  assert.ok(!/<Button\b/.test(source), `${relativePath} must not render coss Button.`)

  for (const label of labels) {
    assert.ok(source.includes(label), `${relativePath} must keep ${label}.`)
  }
}

for (const [relativePath, labels] of [
  ['packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/action-dialog.tsx', ['打开内部对话框']],
  ['packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-markdown/markdown.tsx', ['打开公式对话框']],
  ['packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-core/button.tsx', ['文本按钮']],
]) {
  assertTextButtonDocsControl(relativePath, labels)
}

const cardToolBarSource = readProjectFile('packages/weimo-ui-site/src/docs/catalog/packages/weimo-ui-card/card-tool-bar.tsx')

assert.ok(
  cardToolBarSource.includes("import { TextButton } from 'weimo-ui-core/components/text-button'"),
  'CardToolBar docs must import TextButton for the save-disabled text toggle.',
)
assert.ok(
  cardToolBarSource.includes("import { Button } from 'weimo-ui-core/components/coss/button'"),
  'CardToolBar docs may keep coss Button for icon toolbar render slots.',
)
assert.ok(
  /<TextButton[\s\S]*?className="internal-card-tool-bar-preview__toggle"[\s\S]*?<\/TextButton>/.test(cardToolBarSource) &&
    cardToolBarSource.includes('禁用保存') &&
    cardToolBarSource.includes('启用保存'),
  'CardToolBar docs save-disabled text toggle must render TextButton.',
)
assert.ok(
  cardToolBarSource.includes('render={<Button variant="ghost" />}'),
  'CardToolBar docs icon toolbar render slots must keep coss ghost Button.',
)
