import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const cardSource = readFileSync(
  join(root, 'packages/weimo-ui-card/src/components/card/card.tsx'),
  'utf8',
)
const mdRenderSource = readFileSync(
  join(root, 'packages/weimo-ui-markdown/src/components/md-render/md-render.tsx'),
  'utf8',
)

assert.ok(
  cardSource.includes('[data-markdown-table-scroll="true"]'),
  'Card must identify Markdown table scroll containers through the public semantic marker.',
)
assert.ok(
  !cardSource.includes('weimo-card-markdown__scroll-block'),
  'Card must not depend on Markdown internal class names in its event selectors.',
)
assert.ok(
  mdRenderSource.includes('data-markdown-table-scroll="true"'),
  'MdRender must publish the Markdown table scroll semantic marker consumed by Card.',
)

console.log('Card/Markdown boundary contract tests passed.')
