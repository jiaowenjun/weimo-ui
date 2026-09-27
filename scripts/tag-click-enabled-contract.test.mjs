import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const root = fileURLToPath(new URL('..', import.meta.url))

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8')
}

const tagBar = read('packages/weimo-ui-card/src/components/tag-bar.tsx')
const card = read('packages/weimo-ui-card/src/components/card.tsx')
const cardResolvers = read('packages/weimo-ui-card/src/components/card-resolvers.tsx')
const ocrCard = read('packages/weimo-ui-card/src/components/ocr-card.tsx')

assert.ok(tagBar.includes('isTagClickEnabled?: (tag: string) => boolean'))
assert.ok(tagBar.includes('isTagClickEnabled = () => true'))
assert.ok(tagBar.includes('!isTagClickEnabled(tag)'))
assert.ok(tagBar.includes('if (!isTagClickEnabled(tag)) return'))
assert.ok(card.includes('isTagClickEnabled?: (tag: string) => boolean'))
assert.ok(card.includes('isTagClickEnabled,'))
assert.ok(cardResolvers.includes('isTagClickEnabled: CardProps[\'isTagClickEnabled\']'))
assert.ok(cardResolvers.includes('isTagClickEnabled,'))
assert.ok(ocrCard.includes('isTagClickEnabled?: (tag: string) => boolean'))
assert.ok(ocrCard.includes('isTagClickEnabled,'))
