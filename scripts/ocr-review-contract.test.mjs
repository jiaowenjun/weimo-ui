import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

function readProjectFile(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8')
}

function readJson(relativePath) {
  return JSON.parse(readProjectFile(relativePath))
}

function assertNotExists(relativePath, message) {
  assert.ok(!existsSync(join(root, relativePath)), message)
}

const packageJson = readJson('package.json')
const manifest = readProjectFile('src/docs/components-manifest.ts')
const definitionsIndex = readProjectFile('src/docs/component-definitions/index.ts')
const ocrDetailSource = readProjectFile('src/components/ocr-detail.tsx')
const ocrDetailContract = readProjectFile('scripts/ocr-detail-contract.test.mjs')
const registryContract = readProjectFile('scripts/registry-contract.test.mjs')
const registrySmoke = readProjectFile('scripts/registry-smoke.test.mjs')
const rootRegistry = readJson('registry.json')
const registryFiles = new Set(
  readdirSync(join(root, 'registry')).filter((file) => file.endsWith('.json')),
)

assert.ok(
  packageJson.scripts?.test?.includes('scripts/ocr-review-contract.test.mjs'),
  'package.json test script must keep the OcrReview removal guard.',
)
assert.ok(
  !Object.hasOwn(packageJson.exports ?? {}, './components/ocr-review'),
  'package.json must not expose the removed ./components/ocr-review export.',
)
assert.ok(
  !packageJson.scripts?.test
    ?.replace('scripts/ocr-review-contract.test.mjs', '')
    .includes('ocr-review'),
  'package.json test script must not keep OcrReview behavior contracts beyond the removal guard.',
)

assert.ok(
  !manifest.includes("id: 'ocr-review'") &&
    !manifest.includes("name: 'OcrReview'") &&
    !manifest.includes("registryName: 'ocr-review'") &&
    !manifest.includes("packageExport: './components/ocr-review'"),
  'Component manifest must not list removed OcrReview.',
)
assert.ok(
  !definitionsIndex.includes("import { ocrReviewDefinition } from './ocr-review'") &&
    !definitionsIndex.includes("'ocr-review': ocrReviewDefinition"),
  'component-definitions/index.ts must not wire the removed OcrReview docs definition.',
)

assertNotExists('src/components/ocr-review.tsx', 'Removed OcrReview source must not exist.')
assertNotExists('src/components/ocr-review.css', 'Removed OcrReview CSS must not exist.')
assertNotExists(
  'src/docs/component-definitions/ocr-review.tsx',
  'Removed OcrReview docs definition must not exist.',
)

const registryItem = rootRegistry.items.find((item) => item.name === 'ocr-review')

assert.ok(!registryItem, 'Root registry must not include the removed @weimo/ocr-review item.')
assert.ok(
  !registryFiles.has('ocr-review.json'),
  'Removed OcrReview must not have registry/ocr-review.json.',
)
assert.ok(
  !JSON.stringify(rootRegistry).includes('ocr-review'),
  'registry.json must not keep OcrReview names or file payloads.',
)

for (const [sourceName, source] of [
  ['ocr-detail-contract.test.mjs', ocrDetailContract],
  ['registry-contract.test.mjs', registryContract],
  ['registry-smoke.test.mjs', registrySmoke],
]) {
  assert.ok(
    !source.includes('ocr-review') && !source.includes('OcrReview'),
    `${sourceName} must not keep removed OcrReview assertions or smoke installs.`,
  )
}

assert.ok(
  !ocrDetailSource.includes("from './ocr-review'") &&
    !ocrDetailSource.includes('OcrReview') &&
    !ocrDetailSource.includes('ocr-review'),
  'OcrDetail must remain standalone after OcrReview is removed.',
)
