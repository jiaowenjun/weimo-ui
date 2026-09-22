import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

function readProjectFile(relativePath) {
  const absolutePath = join(root, relativePath)

  assert.ok(existsSync(absolutePath), `${relativePath} must exist.`)

  return readFileSync(absolutePath, 'utf8')
}

const packageJson = JSON.parse(readProjectFile('package.json'))
const source = readProjectFile('src/components/card-composer.tsx')
const composerShellSource = readProjectFile('src/components/composer-shell.tsx')
const cssSource = readProjectFile('src/components/card-composer.css')
const appCss = readProjectFile('src/App.css')
const manifestSource = readProjectFile('src/docs/components-manifest.ts')
const definitionsIndexSource = readProjectFile('src/docs/component-definitions/index.ts')
const definitionSource = readProjectFile('src/docs/component-definitions/tagged-card.tsx')
const registry = JSON.parse(readProjectFile('registry.json'))
const registryItem = readProjectFile('registry/card-composer.json')

assert.ok(
  packageJson.scripts?.test?.includes('node scripts/card-composer-contract.test.mjs'),
  'package test script must run the CardComposer contract.',
)
assert.equal(
  packageJson.exports?.['./components/card-composer'],
  './src/components/card-composer.tsx',
  'package.json must expose ./components/card-composer.',
)

for (const snippet of [
  "import { X } from 'lucide-react'",
  "import { useEffect, useRef, useState } from 'react'",
  "import type { ReactNode } from 'react'",
  "import { Card, type CardProps } from './card'",
  "import { ComposerShell } from './composer-shell'",
  "import { GhostIconButton } from './ghost-icon-button'",
  'export type CardComposerRenderCard = (props: CardProps) => ReactNode',
  'export type CardComposerProps = CardProps & {',
  'clientId: string',
  'isClosing?: boolean',
  'onExitAnimationEnd?: () => void',
  'onViewTransitionEnd?: () => void',
  'renderCard?: CardComposerRenderCard',
  'type CardComposerAutoFocusState = {',
  'const wrapperRef = useRef<HTMLDivElement | null>(null)',
  'const [autoFocusState, setAutoFocusState] =',
  '!isClosing &&',
  'autoFocusState.clientId === clientId && autoFocusState.ready',
  'function allowInitialEditAutoFocus()',
  'window.requestAnimationFrame',
  'const animations = wrapper.getAnimations()',
  'Promise.allSettled(animations.map((animation) => animation.finished))',
  'function blurComposerEditor()',
  'activeElement.blur()',
  'function handleComposerClose()',
  'if (isClosing) return',
  'blurComposerEditor()',
  'const externalCancel = editBehavior?.onCancel ?? onCancel',
  'externalCancel?.()',
  'const composerEditActionSlot = (',
  '<GhostIconButton',
  'aria-label={labels?.cancel ?? \'取消\'}',
  'className="weimo-card__header-icon-button"',
  'disabled={disabled || isClosing}',
  'onClick={handleComposerClose}',
  '<X />',
  'const composerCardProps: CardProps = {',
  '...cardProps',
  'disabled: disabled || isClosing',
  'labels: {',
  'editTitle: labels?.editTitle ?? \'新建笔记\'',
  'editBehavior: {',
  '...editBehavior',
  'actionSlot: editBehavior?.actionSlot ?? composerEditActionSlot',
  'onCancel: handleComposerClose',
  'initialEditAutoFocus',
  'const ComposerCard = renderCard ?? Card',
  '<ComposerShell',
  'isClosing={isClosing}',
  'onExitAnimationEnd={onExitAnimationEnd}',
  'onViewTransitionEnd={onViewTransitionEnd}',
  'ref={wrapperRef}',
  '<ComposerCard {...composerCardProps} />',
  '</ComposerShell>',
]) {
  assert.ok(source.includes(snippet), `CardComposer source must include: ${snippet}`)
}

for (const forbiddenSnippet of [
  'const CARD_COMPOSER_TRANSITION_MS = 180',
  'function finishExitAnimation(cancelled: boolean)',
  'function handleTransitionEnd(event: TransitionEvent<HTMLDivElement>)',
  "className=\"weimo-card-composer\"",
  "className=\"weimo-card-composer__frame\"",
  "import './card-composer.css'",
]) {
  assert.ok(!source.includes(forbiddenSnippet), `CardComposer source must delegate shell mechanics instead of keeping: ${forbiddenSnippet}`)
}

for (const snippet of [
  "import { forwardRef, useEffect, useRef } from 'react'",
  "import type { ComponentPropsWithoutRef, ReactNode, TransitionEvent } from 'react'",
  "import './card-composer.css'",
  'const COMPOSER_SHELL_TRANSITION_MS = 180',
  'export type ComposerShellProps = Omit<',
  "ComponentPropsWithoutRef<'div'>",
  'children: ReactNode',
  'isClosing?: boolean',
  'onExitAnimationEnd?: () => void',
  'onViewTransitionEnd?: () => void',
  'export const ComposerShell = forwardRef<HTMLDivElement, ComposerShellProps>(',
  'function ComposerShell(',
  'const wrapperRef = useRef<HTMLDivElement | null>(null)',
  'function setWrapperNode(node: HTMLDivElement | null)',
  'function finishExitAnimation(cancelled: boolean)',
  'fallbackTimer = window.setTimeout(',
  'COMPOSER_SHELL_TRANSITION_MS',
  'Promise.allSettled(',
  'animation.finished.then(() => undefined)',
  'function handleTransitionEnd(event: TransitionEvent<HTMLDivElement>)',
  'onTransitionEnd?.(event)',
  "if (event.propertyName !== 'height') return",
  "const card = event.target.closest('.weimo-card')",
  "if (card?.getAttribute('data-mode') !== 'view') return",
  'onViewTransitionEnd?.()',
  'className={',
  "'weimo-card-composer'",
  "data-state={isClosing ? 'closing' : undefined}",
  'ref={setWrapperNode}',
  '<div className="weimo-card-composer__frame">',
]) {
  assert.ok(composerShellSource.includes(snippet), `ComposerShell source must include: ${snippet}`)
}

for (const snippet of [
  '.weimo-card-composer {',
  'display: grid;',
  'grid-template-rows: 1fr;',
  'margin-bottom: var(--space-gutter);',
  'overflow: hidden;',
  'animation: weimo-card-composer-enter 180ms cubic-bezier(0.2, 0, 0, 1) both;',
  ".weimo-card-composer[data-state='closing'] {",
  'pointer-events: none;',
  'animation: weimo-card-composer-exit 180ms cubic-bezier(0.2, 0, 0, 1) both;',
  '.weimo-card-composer__frame {',
  'min-height: 0;',
  'overflow: hidden;',
  '@keyframes weimo-card-composer-enter',
  'grid-template-rows: 0fr;',
  'margin-bottom: 0;',
  'opacity: 0;',
  'transform: translateY(-8px);',
  '@keyframes weimo-card-composer-exit',
  '@media (prefers-reduced-motion: reduce)',
]) {
  assert.ok(cssSource.includes(snippet), `CardComposer CSS must include: ${snippet}`)
}

for (const snippet of [
  "id: 'card-composer'",
  "name: 'CardComposer'",
  "registryName: 'card-composer'",
  "packageExport: './components/card-composer'",
  "group: 'content-markdown'",
  'docs: false',
]) {
  assert.ok(manifestSource.includes(snippet), `CardComposer manifest must include: ${snippet}`)
}

assert.ok(
  definitionsIndexSource.includes("import { taggedCardDefinition } from './tagged-card'") &&
    definitionsIndexSource.includes("'tagged-card': taggedCardDefinition") &&
    !definitionsIndexSource.includes('card-composer'),
  'CardComposer preview must be wired through the merged tagged-card definition.',
)

for (const snippet of [
  "import { CardComposer } from '../../components/card-composer'",
  "import type { CardDraft, CardProps } from '../../components/card'",
  'className="card-composer-docs-preview"',
  "id: 'tagged-card'",
  '<CardComposerDemo />',
]) {
  assert.ok(definitionSource.includes(snippet), `CardComposer docs must include: ${snippet}`)
}

for (const snippet of [
  '.card-composer-docs-preview {',
  'width: min(100%, 960px);',
  'min-width: 0;',
  'align-self: center;',
  'justify-self: stretch;',
  '.card-composer-docs-preview .weimo-card-composer {',
  'width: 100%;',
  'margin-bottom: 0;',
  '.card-composer-docs-preview .weimo-card {',
  'width: 100%;',
  'max-width: none;',
]) {
  assert.ok(appCss.includes(snippet), `CardComposer docs layout CSS must include: ${snippet}`)
}

assert.ok(
  registry.items.some((item) => item.name === 'card-composer'),
  'Root registry must include the @weimo/card-composer item.',
)
assert.ok(
  registryItem.includes('"name": "card-composer"') &&
    registryItem.includes('"src/components/card-composer.tsx"') &&
    registryItem.includes('"src/components/composer-shell.tsx"') &&
    registryItem.includes('"src/components/card-composer.css"') &&
    registryItem.includes('"@weimo/card"') &&
    registryItem.includes('"@weimo/ghost-icon-button"'),
  'CardComposer registry item must ship the composer shell and depend on Card plus the cancel button.',
)
