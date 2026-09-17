import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const root = fileURLToPath(new URL('..', import.meta.url))

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8')
}

const tagBar = read('src/components/tag-bar.tsx')
const card = read('src/components/card.tsx')
const cardResolvers = read('src/components/card-resolvers.tsx')
const ocrCard = read('src/components/ocr-card.tsx')
const packageJson = JSON.parse(read('package.json'))

assert.ok(
  packageJson.scripts?.test?.includes('scripts/tag-click-enabled-contract.test.mjs'),
  'UI test script must run the tag-click-enabled contract.',
)
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
