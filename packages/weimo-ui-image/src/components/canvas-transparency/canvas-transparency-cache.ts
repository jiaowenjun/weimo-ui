import {
  processCanvasTransparency,
  type CanvasTransparencyOptions,
  type CanvasTransparencyResult,
} from './canvas-transparency-model'

const CANVAS_TRANSPARENCY_CACHE_LIMIT = 32
const CANVAS_TRANSPARENCY_CACHE_VERSION = 1

export const DEFAULT_CANVAS_TRANSPARENCY_OPTIONS = {
  feather: 42,
  tolerance: 18,
} as const satisfies CanvasTransparencyOptions

type CanvasTransparencyProcessor = (
  source: string,
  options: CanvasTransparencyOptions,
) => Promise<CanvasTransparencyResult>

export type CachedCanvasTransparencyAsset = {
  blob: Blob
  url: string
  width: number
  height: number
}

export type CachedCanvasTransparencyAssets = {
  background: CanvasTransparencyResult['background']
  dark: CachedCanvasTransparencyAsset
  light: CachedCanvasTransparencyAsset
}

export type CanvasTransparencyAssetLease = {
  assets: CachedCanvasTransparencyAssets
  release: () => void
}

type CanvasTransparencyAssetCacheOptions = {
  createObjectURL?: (blob: Blob) => string
  decode?: (url: string) => Promise<void>
  maximumEntries?: number
  revokeObjectURL?: (url: string) => void
}

type CanvasTransparencyAssetEntry = {
  assets: CachedCanvasTransparencyAssets
  retainCount: number
}

function createCanvasTransparencyCacheKey(
  source: string,
  options: CanvasTransparencyOptions,
) {
  return JSON.stringify([
    CANVAS_TRANSPARENCY_CACHE_VERSION,
    source,
    options.tolerance,
    options.feather,
  ])
}

export function createCanvasTransparencyResultCache(
  processor: CanvasTransparencyProcessor,
  maximumEntries = CANVAS_TRANSPARENCY_CACHE_LIMIT,
) {
  const entryLimit = Math.max(1, Math.floor(maximumEntries))
  const resultCache = new Map<string, CanvasTransparencyResult>()
  const inFlightCache = new Map<string, Promise<CanvasTransparencyResult>>()
  let generation = 0

  function remember(key: string, result: CanvasTransparencyResult) {
    resultCache.delete(key)
    resultCache.set(key, result)

    while (resultCache.size > entryLimit) {
      const oldestKey = resultCache.keys().next().value
      if (oldestKey === undefined) break
      resultCache.delete(oldestKey)
    }
  }

  function get(source: string, options: CanvasTransparencyOptions) {
    const key = createCanvasTransparencyCacheKey(source, options)
    const cachedResult = resultCache.get(key)

    if (cachedResult) {
      remember(key, cachedResult)
      return Promise.resolve(cachedResult)
    }

    const inFlightResult = inFlightCache.get(key)
    if (inFlightResult) return inFlightResult

    const requestGeneration = generation
    const promise = processor(source, options)
      .then((result) => {
        if (requestGeneration === generation) remember(key, result)
        return result
      })
      .finally(() => {
        if (inFlightCache.get(key) === promise) inFlightCache.delete(key)
      })

    inFlightCache.set(key, promise)
    return promise
  }

  function clear() {
    generation += 1
    resultCache.clear()
    inFlightCache.clear()
  }

  return { clear, get }
}

async function decodeCanvasTransparencyAsset(url: string) {
  const image = new Image()

  image.src = url
  await image.decode()
}

export function createCanvasTransparencyAssetCache(
  processor: CanvasTransparencyProcessor,
  {
    createObjectURL = (blob) => URL.createObjectURL(blob),
    decode = decodeCanvasTransparencyAsset,
    maximumEntries = CANVAS_TRANSPARENCY_CACHE_LIMIT,
    revokeObjectURL = (url) => URL.revokeObjectURL(url),
  }: CanvasTransparencyAssetCacheOptions = {},
) {
  const entryLimit = Math.max(1, Math.floor(maximumEntries))
  const assetCache = new Map<string, CanvasTransparencyAssetEntry>()
  const inFlightCache = new Map<string, Promise<CanvasTransparencyAssetEntry>>()
  let generation = 0

  function revokeAssets(assets: CachedCanvasTransparencyAssets) {
    revokeObjectURL(assets.light.url)
    revokeObjectURL(assets.dark.url)
  }

  function trim() {
    while (assetCache.size > entryLimit) {
      let evictedKey: string | undefined

      for (const [key, entry] of assetCache) {
        if (entry.retainCount === 0) {
          evictedKey = key
          break
        }
      }

      if (evictedKey === undefined) return
      const evictedEntry = assetCache.get(evictedKey)

      assetCache.delete(evictedKey)
      if (evictedEntry) revokeAssets(evictedEntry.assets)
    }
  }

  function touch(key: string, entry: CanvasTransparencyAssetEntry) {
    assetCache.delete(key)
    assetCache.set(key, entry)
  }

  function createLease(
    key: string,
    entry: CanvasTransparencyAssetEntry,
  ): CanvasTransparencyAssetLease {
    let released = false

    entry.retainCount += 1
    trim()

    return {
      assets: entry.assets,
      release() {
        if (released) return

        released = true
        entry.retainCount = Math.max(0, entry.retainCount - 1)
        if (assetCache.get(key) === entry) trim()
      },
    }
  }

  function getEntry(source: string, options: CanvasTransparencyOptions) {
    const key = createCanvasTransparencyCacheKey(source, options)
    const cachedEntry = assetCache.get(key)

    if (cachedEntry) {
      touch(key, cachedEntry)
      return Promise.resolve(cachedEntry)
    }

    const inFlightEntry = inFlightCache.get(key)
    if (inFlightEntry) return inFlightEntry

    const requestGeneration = generation
    let createdUrls: string[] = []
    let urlsOwnedByCache = false
    const promise = processor(source, options)
      .then(async (result) => {
        const lightUrl = createObjectURL(result.light.blob)

        createdUrls.push(lightUrl)
        const darkUrl = createObjectURL(result.dark.blob)

        createdUrls.push(darkUrl)
        await Promise.all([decode(lightUrl), decode(darkUrl)])

        if (requestGeneration !== generation) {
          throw new Error('Canvas transparency cache was cleared during asset decoding.')
        }

        const entry: CanvasTransparencyAssetEntry = {
          assets: {
            background: result.background,
            dark: { ...result.dark, url: darkUrl },
            light: { ...result.light, url: lightUrl },
          },
          retainCount: 0,
        }

        assetCache.set(key, entry)
        urlsOwnedByCache = true
        return entry
      })
      .catch((error: unknown) => {
        if (!urlsOwnedByCache) {
          createdUrls.forEach((url) => revokeObjectURL(url))
          createdUrls = []
        }

        throw error
      })
      .finally(() => {
        if (inFlightCache.get(key) === promise) inFlightCache.delete(key)
      })

    inFlightCache.set(key, promise)
    return promise
  }

  function acquire(source: string, options: CanvasTransparencyOptions) {
    const key = createCanvasTransparencyCacheKey(source, options)

    return getEntry(source, options).then((entry) => createLease(key, entry))
  }

  function acquireCached(
    source: string,
    options: CanvasTransparencyOptions,
  ): CanvasTransparencyAssetLease | undefined {
    const key = createCanvasTransparencyCacheKey(source, options)
    const entry = assetCache.get(key)

    if (!entry) return undefined

    touch(key, entry)
    return createLease(key, entry)
  }

  function peek(source: string, options: CanvasTransparencyOptions) {
    return assetCache.get(createCanvasTransparencyCacheKey(source, options))?.assets
  }

  function clear() {
    generation += 1
    for (const entry of assetCache.values()) revokeAssets(entry.assets)
    assetCache.clear()
    inFlightCache.clear()
  }

  return { acquire, acquireCached, clear, peek }
}

const canvasTransparencyResultCache = createCanvasTransparencyResultCache(
  processCanvasTransparency,
)
const canvasTransparencyAssetCache = createCanvasTransparencyAssetCache(
  canvasTransparencyResultCache.get,
)

export const acquireCanvasTransparencyAssets = canvasTransparencyAssetCache.acquire
export const acquireCachedCanvasTransparencyAssets =
  canvasTransparencyAssetCache.acquireCached
export const getCachedCanvasTransparencyResult = canvasTransparencyResultCache.get
export const peekCachedCanvasTransparencyAssets = canvasTransparencyAssetCache.peek

export function clearCanvasTransparencyCache() {
  canvasTransparencyAssetCache.clear()
  canvasTransparencyResultCache.clear()
}
