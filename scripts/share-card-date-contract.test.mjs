import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'

const sourcePath = new URL('../src/components/share-card-date.ts', import.meta.url)

assert.ok(existsSync(sourcePath), 'src/components/share-card-date.ts must exist.')

const source = readFileSync(sourcePath, 'utf8')

assert.ok(
  source.includes("from 'lunar-javascript'"),
  'ShareCard date helper must use lunar-javascript for lunar conversion.',
)
assert.ok(
  source.includes('getFullYear()') &&
    source.includes('getMonth() + 1') &&
    source.includes('getDate()'),
  'ShareCard date helper must format from local Date fields instead of UTC fields.',
)

const tempRoot = new URL('../node_modules/.tmp/', import.meta.url)
mkdirSync(tempRoot, { recursive: true })

const outputDir = mkdtempSync(join(tempRoot.pathname, 'weimo-share-card-date-'))
const outputPath = join(outputDir, 'share-card-date.mjs')

try {
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2023,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      verbatimModuleSyntax: true,
    },
    fileName: 'share-card-date.ts',
  })

  writeFileSync(outputPath, transpiled.outputText)

  const {
    formatShareCardDate,
    formatShareCardLunarDate,
    formatShareCardSolarDate,
  } = await import(pathToFileURL(outputPath).href)

  const sampleDate = new Date(2026, 4, 2)
  const solar = formatShareCardSolarDate(sampleDate)
  const lunar = formatShareCardLunarDate(sampleDate)

  assert.equal(solar, '2026/05/02')
  assert.equal(formatShareCardDate(sampleDate, false), '2026/05/02')
  assert.equal(formatShareCardDate(undefined, false), '')
  assert.equal(formatShareCardDate(new Date(Number.NaN), false), '')
  assert.match(lunar, /年/)
  assert.ok(lunar.length >= 6, 'Lunar date should include year, month, and day text.')
  assert.equal(formatShareCardDate(sampleDate, true), lunar)
} finally {
  rmSync(outputDir, { recursive: true, force: true })
}
