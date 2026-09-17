import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import ts from 'typescript'

const root = fileURLToPath(new URL('..', import.meta.url))

function readProjectFile(relativePath) {
  const absolutePath = join(root, relativePath)

  assert.ok(existsSync(absolutePath), `${relativePath} must exist.`)

  return readFileSync(absolutePath, 'utf8')
}

function deferred() {
  let reject
  let resolve
  const promise = new Promise((resolvePromise, rejectPromise) => {
    reject = rejectPromise
    resolve = resolvePromise
  })

  return { promise, reject, resolve }
}

function resultFor(label) {
  return {
    background: [255, 255, 255],
    dark: { blob: { label: `${label}-dark` }, height: 20, width: 30 },
    light: { blob: { label: `${label}-light` }, height: 20, width: 30 },
  }
}

const cacheSource = readProjectFile('src/components/canvas-transparency-cache.ts')
const packageJson = JSON.parse(readProjectFile('package.json'))

assert.ok(
  packageJson.scripts?.test?.includes(
    'node scripts/canvas-transparency-cache.test.mjs',
  ),
  'package test script must run the Canvas transparency cache contract.',
)
assert.ok(
  cacheSource.includes('const CANVAS_TRANSPARENCY_CACHE_LIMIT = 32') &&
    cacheSource.includes('const CANVAS_TRANSPARENCY_CACHE_VERSION = 1'),
  'Canvas transparency results must use a versioned 32-image cache.',
)
for (const forbiddenSnippet of [
  'blob.size',
  'MAX_BYTES',
  'maximumBytes',
  'maxBytes',
]) {
  assert.ok(
    !cacheSource.includes(forbiddenSnippet),
    `Canvas transparency caching must not impose a byte limit: ${forbiddenSnippet}`,
  )
}

const testContext = {
  exports: {},
  require: (specifier) => {
    if (specifier === './canvas-transparency-model') {
      return {
        processCanvasTransparency: () => {
          throw new Error('The singleton processor must not run during cache model tests.')
        },
      }
    }

    throw new Error(`Unexpected require: ${specifier}`)
  },
}

vm.runInNewContext(
  ts.transpileModule(cacheSource, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2023,
    },
  }).outputText,
  testContext,
)

const {
  createCanvasTransparencyAssetCache,
  createCanvasTransparencyResultCache,
} = testContext.exports

assert.equal(
  typeof createCanvasTransparencyResultCache,
  'function',
  'Canvas transparency caching must expose a focused cache model for deterministic tests.',
)
assert.equal(
  typeof createCanvasTransparencyAssetCache,
  'function',
  'Canvas transparency caching must expose a decoded asset cache model for deterministic tests.',
)

const sharedWork = deferred()
let sharedCalls = 0
const sharedCache = createCanvasTransparencyResultCache(() => {
  sharedCalls += 1
  return sharedWork.promise
})
const sharedOptions = { feather: 42, tolerance: 18 }
const firstSharedRequest = sharedCache.get('/same.jpg', sharedOptions)
const secondSharedRequest = sharedCache.get('/same.jpg', sharedOptions)

assert.equal(firstSharedRequest, secondSharedRequest, 'Concurrent identical work must share one Promise.')
assert.equal(sharedCalls, 1)
sharedWork.resolve(resultFor('shared'))
const sharedResult = await firstSharedRequest
assert.equal(await sharedCache.get('/same.jpg', sharedOptions), sharedResult)
assert.equal(sharedCalls, 1, 'Completed identical work must come from the result cache.')

let parameterCalls = 0
const parameterCache = createCanvasTransparencyResultCache(async (src, options) => {
  parameterCalls += 1
  return resultFor(`${src}-${options.tolerance}-${options.feather}`)
})

await parameterCache.get('/parameter.jpg', { tolerance: 18, feather: 42 })
await parameterCache.get('/parameter.jpg', { tolerance: 19, feather: 42 })
await parameterCache.get('/parameter.jpg', { tolerance: 18, feather: 43 })
assert.equal(parameterCalls, 3, 'Every output-affecting processing parameter must participate in the key.')

const lruCalls = new Map()
const lruCache = createCanvasTransparencyResultCache(async (src) => {
  lruCalls.set(src, (lruCalls.get(src) ?? 0) + 1)
  return resultFor(src)
}, 2)

await lruCache.get('/a.jpg', sharedOptions)
await lruCache.get('/b.jpg', sharedOptions)
await lruCache.get('/a.jpg', sharedOptions)
await lruCache.get('/c.jpg', sharedOptions)
await lruCache.get('/b.jpg', sharedOptions)
assert.equal(lruCalls.get('/a.jpg'), 1, 'A cache hit must refresh the LRU position.')
assert.equal(lruCalls.get('/b.jpg'), 2, 'The least recently used result must be evicted first.')
assert.equal(lruCalls.get('/c.jpg'), 1)

let retryCalls = 0
const retryCache = createCanvasTransparencyResultCache(async () => {
  retryCalls += 1
  if (retryCalls === 1) throw new Error('expected processing failure')
  return resultFor('retry')
})

await assert.rejects(retryCache.get('/retry.jpg', sharedOptions), /expected processing failure/)
assert.equal((await retryCache.get('/retry.jpg', sharedOptions)).light.blob.label, 'retry-light')
assert.equal(retryCalls, 2, 'Failed processing must not remain in either cache.')

const oldWork = deferred()
const currentWork = deferred()
let clearCalls = 0
const clearCache = createCanvasTransparencyResultCache(() => {
  clearCalls += 1
  return clearCalls === 1 ? oldWork.promise : currentWork.promise
})
const oldRequest = clearCache.get('/private.jpg', sharedOptions)
clearCache.clear()
const currentRequest = clearCache.get('/private.jpg', sharedOptions)

assert.notEqual(oldRequest, currentRequest, 'Clearing must detach pending work from future consumers.')
oldWork.resolve(resultFor('old-session'))
await oldRequest
currentWork.resolve(resultFor('current-session'))
const currentResult = await currentRequest
assert.equal(await clearCache.get('/private.jpg', sharedOptions), currentResult)
assert.equal(clearCalls, 2, 'Old pending work must not repopulate a cleared cache.')

const createdAssetUrls = []
const decodedAssetUrls = []
const revokedAssetUrls = []
let assetProcessorCalls = 0
const assetCache = createCanvasTransparencyAssetCache(
  async (src) => {
    assetProcessorCalls += 1
    return resultFor(src)
  },
  {
    createObjectURL(blob) {
      const url = `blob:${blob.label}`
      createdAssetUrls.push(url)
      return url
    },
    decode: async (url) => {
      decodedAssetUrls.push(url)
    },
    maximumEntries: 1,
    revokeObjectURL(url) {
      revokedAssetUrls.push(url)
    },
  },
)

assert.equal(
  assetCache.peek('/asset-a.jpg', sharedOptions),
  undefined,
  'Cold Canvas asset keys must not expose a synchronous value.',
)
const firstAssetLease = await assetCache.acquire('/asset-a.jpg', sharedOptions)
const firstAssets = firstAssetLease.assets

assert.equal(
  assetCache.peek('/asset-a.jpg', sharedOptions),
  firstAssets,
  'Decoded Canvas assets must be synchronously reusable after the first load.',
)
assert.deepEqual(
  [firstAssets.light.url, firstAssets.dark.url],
  ['blob:/asset-a.jpg-light', 'blob:/asset-a.jpg-dark'],
)
assert.deepEqual(decodedAssetUrls, createdAssetUrls)
assert.equal(assetProcessorCalls, 1)

const secondAssetLease = assetCache.acquireCached('/asset-a.jpg', sharedOptions)

assert.ok(secondAssetLease, 'Warm Canvas assets must support synchronous leasing before paint.')
assert.equal(secondAssetLease.assets, firstAssets)
secondAssetLease.release()

const secondKeyLease = await assetCache.acquire('/asset-b.jpg', sharedOptions)

assert.equal(assetProcessorCalls, 2)
assert.equal(
  assetCache.peek('/asset-a.jpg', sharedOptions),
  firstAssets,
  'Asset LRU pressure must not revoke a URL held by an active Canvas instance.',
)
firstAssetLease.release()
assert.equal(
  assetCache.peek('/asset-a.jpg', sharedOptions),
  undefined,
  'Asset LRU eviction must remove inactive decoded entries.',
)
assert.deepEqual(
  revokedAssetUrls,
  ['blob:/asset-a.jpg-light', 'blob:/asset-a.jpg-dark'],
  'Asset LRU eviction must revoke both theme URLs exactly once.',
)

assetCache.clear()
assert.deepEqual(
  revokedAssetUrls,
  [
    'blob:/asset-a.jpg-light',
    'blob:/asset-a.jpg-dark',
    'blob:/asset-b.jpg-light',
    'blob:/asset-b.jpg-dark',
  ],
  'Clearing the Canvas cache must revoke retained theme URLs.',
)
secondKeyLease.release()

const failedAssetUrls = []
const failedAssetCache = createCanvasTransparencyAssetCache(
  async () => resultFor('failed'),
  {
    createObjectURL: (blob) => `blob:${blob.label}`,
    decode: async (url) => {
      if (url.endsWith('-dark')) throw new Error('expected decode failure')
    },
    revokeObjectURL: (url) => failedAssetUrls.push(url),
  },
)

await assert.rejects(
  failedAssetCache.acquire('/failed.jpg', sharedOptions),
  /expected decode failure/,
)
assert.equal(failedAssetCache.peek('/failed.jpg', sharedOptions), undefined)
assert.deepEqual(
  failedAssetUrls,
  ['blob:failed-light', 'blob:failed-dark'],
  'Failed Canvas asset decoding must revoke every URL and leave no warm entry.',
)

console.log('canvas transparency cache contract passed')
