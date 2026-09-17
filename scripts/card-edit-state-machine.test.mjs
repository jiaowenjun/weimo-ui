import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import ts from 'typescript'

const root = fileURLToPath(new URL('..', import.meta.url))
const source = readFileSync(
  join(root, 'src/components/card-edit-state-machine.ts'),
  'utf8',
)
const context = { exports: {} }

vm.runInNewContext(
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2023,
    },
  }).outputText,
  context,
)

const {
  reduceCardMode,
  resolveCardModeState,
  resolveInitialCardMode,
} = context.exports
const toPlainObject = (value) => JSON.parse(JSON.stringify(value))

assert.equal(resolveInitialCardMode('view'), 'view')
assert.equal(resolveInitialCardMode('edit'), 'edit')

const requestEdit = { type: 'request-edit' }
const editorReady = { type: 'editor-ready' }
const requestView = { type: 'request-view' }

assert.equal(reduceCardMode('view', requestEdit), 'preparing-edit')
assert.equal(reduceCardMode('preparing-edit', editorReady), 'edit')
assert.equal(reduceCardMode('edit', requestView), 'view')

for (const [mode, event] of [
  ['view', editorReady],
  ['view', requestView],
  ['preparing-edit', requestEdit],
  ['preparing-edit', requestView],
  ['edit', requestEdit],
  ['edit', editorReady],
]) {
  assert.equal(
    reduceCardMode(mode, event),
    mode,
    `${mode} must ignore ${event.type}.`,
  )
}

assert.deepEqual(toPlainObject(resolveCardModeState('view')), {
  isEditing: false,
  isPreparingEdit: false,
  preloadEditor: false,
  viewMode: 'view',
})
assert.deepEqual(toPlainObject(resolveCardModeState('preparing-edit')), {
  isEditing: false,
  isPreparingEdit: true,
  preloadEditor: true,
  viewMode: 'view',
})
assert.deepEqual(toPlainObject(resolveCardModeState('edit')), {
  isEditing: true,
  isPreparingEdit: false,
  preloadEditor: false,
  viewMode: 'edit',
})
