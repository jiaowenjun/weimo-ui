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
  globalIgnores([
    'dist',
    'packages/weimo-ui-core/src/components/surfaces/liquid-glass/liquid-glass-react',
  ]),
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
    rules: {
      // This workspace publishes component modules and documentation definitions,
      // not Vite refresh boundaries. They intentionally export helpers/constants
      // alongside components.
      'react-refresh/only-export-components': 'off',
      // These compiler diagnostics reject established controlled-component and
      // animation patterns used throughout the public component API. Keep the
      // rules-of-hooks checks from react-hooks.configs.flat.recommended enabled.
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      // Transition effects intentionally capture stable snapshots across phases;
      // their dependency lists are maintained as part of the state machine.
      'react-hooks/exhaustive-deps': 'off',
    },
  },
])
