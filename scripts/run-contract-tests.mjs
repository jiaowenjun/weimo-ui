import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const scriptsDirectory = fileURLToPath(new URL('.', import.meta.url))
const contractTests = readdirSync(scriptsDirectory)
  .filter((file) => file.endsWith('.test.mjs'))
  .sort()

for (const testFile of contractTests) {
  const result = spawnSync(process.execPath, [testFile], {
    cwd: scriptsDirectory,
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}
