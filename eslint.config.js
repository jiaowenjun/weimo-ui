import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // dist is build output; liquid-glass-react is vendored upstream code
  // (rdev/liquid-glass-react 1.1.1, MIT) kept verbatim — its render-time
  // ref reads and effect setState are core to its design and must not be
  // rewritten to satisfy repo lint rules.
  globalIgnores(['dist', 'src/components/liquid-glass-react']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
])
