import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function readProjectFile(relativePath) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8')
}

const editorTypesSource = readProjectFile('src/components/md-editor/md-editor-types.ts')
const editorSource = readProjectFile('src/components/md-editor/md-editor.tsx')
const cardSource = readProjectFile('src/components/card.tsx')
const cardEditTransitionSource = readProjectFile(
  'src/components/use-card-edit-transition.ts',
)
const cardResolversSource = readProjectFile('src/components/card-resolvers.tsx')

assert.ok(
  editorTypesSource.includes('onContentHeightChange?: (height: number) => void'),
  'MdEditor must expose content-height changes to layout-owning parents.',
)

for (const snippet of [
  'const contentHeightChangeHandlerRef = useRef(onContentHeightChange)',
  'contentHeightChangeHandlerRef.current = onContentHeightChange',
  "rootRef.current?.querySelector<HTMLElement>('.md-editor__content')",
  'function notifyContentHeightChange()',
  'new ResizeObserver(notifyContentHeightChange)',
  'contentResizeObserver.observe(observedEditorContent)',
  'contentResizeObserver.disconnect()',
]) {
  assert.ok(
    editorSource.includes(snippet),
    `MdEditor must observe stable content-height changes: ${snippet}`,
  )
}

for (const snippet of [
  'function handleEditorContentHeightChange(editorContentHeight: number)',
  "if (mode !== 'edit') return",
  'if (!Number.isFinite(editorContentHeight) || editorContentHeight <= 0) return',
  'const nextContentExtraHeight = resolveEditorContentExtraHeight(',
]) {
  assert.ok(
    cardEditTransitionSource.includes(snippet),
    `Card edit transition must apply observed editor content height: ${snippet}`,
  )
}

assert.ok(
  !cardSource.includes('syncEditLayoutContentHeight'),
  'Card must not keep the stale draft-change measurement effect.',
)
assert.ok(
  cardResolversSource.includes('onContentHeightChange: (height: number) => void') &&
    cardResolversSource.includes('onContentHeightChange,'),
  'Card must pass its content-height handler through MdView editorProps.',
)
