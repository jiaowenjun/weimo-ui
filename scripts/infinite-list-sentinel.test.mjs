import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import ts from 'typescript'

const root = fileURLToPath(new URL('..', import.meta.url))
const observerSource = readFileSync(
  join(root, 'src/lib/infinite-list-sentinel.ts'),
  'utf8',
)
const hookSource = readFileSync(
  join(root, 'src/lib/use-infinite-list-sentinel.ts'),
  'utf8',
)
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const context = { exports: {} }

vm.runInNewContext(
  ts.transpileModule(observerSource, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2023,
    },
  }).outputText,
  context,
)

const { observeInfiniteListSentinel } = context.exports
const sentinel = { id: 'load-more' }
let observerCreated = false

assert.equal(
  observeInfiniteListSentinel({
    createObserver: () => {
      observerCreated = true
      throw new Error('disabled observer must not be created')
    },
    enabled: false,
    onLoadMore: () => {},
    sentinel,
  }),
  undefined,
)
assert.equal(observerCreated, false)

let callback
let disconnected = false
let loadMoreCalls = 0
let observedElement = null
let observerOptions = null
const cleanup = observeInfiniteListSentinel({
  createObserver: (nextCallback, options) => {
    callback = nextCallback
    observerOptions = options

    return {
      disconnect: () => {
        disconnected = true
      },
      observe: (element) => {
        observedElement = element
      },
    }
  },
  enabled: true,
  onLoadMore: () => {
    loadMoreCalls += 1
  },
  sentinel,
})

assert.equal(observedElement, sentinel)
assert.deepEqual(JSON.parse(JSON.stringify(observerOptions)), {
  rootMargin: '240px 0px',
})

callback([{ isIntersecting: false }])
assert.equal(loadMoreCalls, 0)
callback([{ isIntersecting: false }, { isIntersecting: true }])
assert.equal(loadMoreCalls, 1)

cleanup()
assert.equal(disconnected, true)

for (const snippet of [
  "import { useEffect, useRef } from 'react'",
  'const sentinelRef = useRef<HTMLDivElement | null>(null)',
  'const enabled = Boolean(hasNextPage)',
  '!isFetchingNextPage',
  '!isFetchNextPageError',
  'observeInfiniteListSentinel({',
  'sentinel: sentinelRef.current',
  '[enabled, onLoadMore, rootMargin]',
  'return sentinelRef',
]) {
  assert.ok(
    hookSource.includes(snippet),
    `infinite-list sentinel hook must include ${snippet}.`,
  )
}

assert.equal(
  packageJson.exports?.['./lib/use-infinite-list-sentinel'],
  './src/lib/use-infinite-list-sentinel.ts',
)
