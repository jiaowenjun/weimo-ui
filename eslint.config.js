import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // dist is build output.
  globalIgnores([
    'dist',
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
