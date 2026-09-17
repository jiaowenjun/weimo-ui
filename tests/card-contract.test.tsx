import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import {
  reduceCardMode,
  resolveCardModeState,
  resolveInitialCardMode,
} from '../src/components/card-edit-state-machine'
import {
  resolveCardArticleProps,
  resolveCardContentState,
  resolveCardDisplayMenuItems,
  resolveCardLabels,
  resolveCardToolBarState,
} from '../src/components/card-resolvers'
import {
  isCardInlineMathShortcut,
  isCardSaveShortcut,
  type CardSaveShortcutEvent,
} from '../src/components/card-save-shortcut'
import { Card, type CardNote } from '../src/components/card'

const note: CardNote = {
  content: 'Original content',
  createdAtText: '2026-07-22',
  tags: ['contract'],
  title: 'Original title',
}

function shortcutEvent(
  overrides: Partial<CardSaveShortcutEvent> = {},
): CardSaveShortcutEvent {
  return {
    altKey: false,
    ctrlKey: false,
    key: 's',
    metaKey: false,
    shiftKey: false,
    ...overrides,
  }
}

describe('Card state and resolver contracts', () => {
  it('keeps edit-mode transitions explicit and ignores invalid events', () => {
    expect(resolveInitialCardMode('view')).toBe('view')
    expect(resolveInitialCardMode('edit')).toBe('edit')
    expect(reduceCardMode('view', { type: 'request-edit' })).toBe('preparing-edit')
    expect(reduceCardMode('preparing-edit', { type: 'editor-ready' })).toBe('edit')
    expect(reduceCardMode('edit', { type: 'request-view' })).toBe('view')
    expect(reduceCardMode('view', { type: 'request-view' })).toBe('view')

    expect(resolveCardModeState('preparing-edit')).toEqual({
      isEditing: false,
      isPreparingEdit: true,
      preloadEditor: true,
      viewMode: 'view',
    })
    expect(resolveCardModeState('edit')).toEqual({
      isEditing: true,
      isPreparingEdit: false,
      preloadEditor: false,
      viewMode: 'edit',
    })
  })

  it.each([
    ['Meta-S', shortcutEvent({ key: 'S', metaKey: true }), true, false],
    ['Ctrl-S', shortcutEvent({ ctrlKey: true }), true, false],
    ['Meta-E', shortcutEvent({ key: 'e', metaKey: true }), false, true],
    ['Ctrl-E', shortcutEvent({ key: 'E', ctrlKey: true }), false, true],
    ['plain S', shortcutEvent(), false, false],
    ['modified save', shortcutEvent({ ctrlKey: true, shiftKey: true }), false, false],
  ])('recognizes %s without accepting adjacent shortcuts', (_label, event, save, math) => {
    expect(isCardSaveShortcut(event)).toBe(save)
    expect(isCardInlineMathShortcut(event)).toBe(math)
  })

  it('resolves public labels, visible content, toolbar state, and delete actions', () => {
    expect(resolveCardLabels({ save: 'Commit' })).toMatchObject({
      cancel: '取消',
      delete: '删除',
      save: 'Commit',
      titlePlaceholder: '编辑标题',
    })

    const draft = { content: 'Draft content', tags: ['draft'], title: 'Draft title' }
    expect(resolveCardContentState('view', note, draft)).toEqual({
      content: note.content,
      tags: note.tags,
      title: note.title,
    })
    expect(resolveCardContentState('edit', note, draft)).toEqual(draft)

    expect(resolveCardToolBarState(false, true, true, '  ', undefined)).toEqual({
      ariaHidden: undefined,
      dataLayout: 'true',
      dataVisible: 'true',
      disabled: false,
      saveDisabled: true,
    })
    expect(resolveCardToolBarState(false, true, false, 'draft', true).saveDisabled).toBe(true)

    const onDelete = vi.fn()
    const items = resolveCardDisplayMenuItems(
      onDelete,
      [{ key: 'copy', label: '复制' }],
      resolveCardLabels(undefined),
      false,
      onDelete,
    )
    expect(items?.map((item) => item.key)).toEqual(['copy', 'delete-separator', 'delete'])
    const deleteItem = items?.find((item) => item.key === 'delete')
    if (deleteItem && 'onSelect' in deleteItem) {
      deleteItem.onSelect?.(undefined as never)
    }
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('exposes mode and layout state through stable article data attributes', () => {
    const transitionEnd = vi.fn()
    const props = resolveCardArticleProps(
      'contract-card',
      true,
      '320px',
      true,
      true,
      'edit',
      transitionEnd,
      { '--weimo-card-transition-duration': '181ms' },
    )

    expect(props).toMatchObject({
      'data-custom-content': 'true',
      'data-edit-layout': 'true',
      'data-editing': 'true',
      'data-height-lock': 'true',
      'data-mode': 'edit',
    })
    expect(props.className).toContain('contract-card')
  })
})

describe('Card public behavior', () => {
  it('saves the latest title draft and returns to view mode', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()
    const onSave = vi.fn()
    render(
      <Card
        contentSlot={<div>Custom content</div>}
        initialEditAutoFocus={false}
        initialMode="edit"
        note={note}
        onDraftChange={onDraftChange}
        onSave={onSave}
      />,
    )

    const article = screen.getByRole('article')
    expect(article).toHaveAttribute('data-mode', 'edit')
    const title = screen.getByRole('textbox', { name: '编辑标题' })
    await user.clear(title)
    await user.type(title, 'Updated title')
    await user.click(screen.getByRole('button', { name: '保存' }))

    expect(onDraftChange).toHaveBeenLastCalledWith({
      content: note.content,
      tags: note.tags,
      title: 'Updated title',
    })
    expect(onSave).toHaveBeenCalledWith({
      content: note.content,
      tags: note.tags,
      title: 'Updated title',
    })
    await waitFor(() => expect(article).toHaveAttribute('data-mode', 'view'))
    expect(screen.getByText('Original title')).toBeInTheDocument()
  })

  it('cancels edits without publishing the draft', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    const onSave = vi.fn()
    render(
      <Card
        contentSlot={<div>Custom content</div>}
        initialEditAutoFocus={false}
        initialMode="edit"
        note={note}
        onCancel={onCancel}
        onSave={onSave}
      />,
    )

    await user.type(screen.getByRole('textbox', { name: '编辑标题' }), ' changed')
    await user.click(screen.getByRole('button', { name: '取消' }))

    expect(onCancel).toHaveBeenCalledOnce()
    expect(onSave).not.toHaveBeenCalled()
    await waitFor(() => expect(screen.getByRole('article')).toHaveAttribute('data-mode', 'view'))
    expect(screen.getByText('Original title')).toBeInTheDocument()
  })

  it('uses Mod-S as the public save shortcut and honors preventDefault from callers', () => {
    const onSave = vi.fn()
    const { rerender } = render(
      <Card
        contentSlot={<div>Custom content</div>}
        initialMode="edit"
        note={note}
        onSave={onSave}
      />,
    )
    const article = screen.getByRole('article')

    fireEvent.keyDown(article, { ctrlKey: true, key: 's' })
    expect(onSave).toHaveBeenCalledWith({
      content: note.content,
      tags: note.tags,
      title: note.title,
    })

    const blockedSave = vi.fn()
    rerender(
      <Card
        contentSlot={<div>Custom content</div>}
        initialMode="edit"
        note={note}
        onKeyDownCapture={(event) => event.preventDefault()}
        onSave={blockedSave}
      />,
    )
    fireEvent.keyDown(screen.getByRole('article'), { metaKey: true, key: 's' })
    expect(blockedSave).not.toHaveBeenCalled()
  })

  it('enters edit mode from card content but ignores interactive descendants', async () => {
    render(
      <Card
        contentSlot={<button type="button">Interactive content</button>}
        initialEditAutoFocus={false}
        note={note}
      />,
    )
    const article = screen.getByRole('article')

    fireEvent.doubleClick(screen.getByRole('button', { name: 'Interactive content' }))
    expect(article).toHaveAttribute('data-mode', 'view')

    fireEvent.doubleClick(screen.getByText('Interactive content').parentElement as HTMLElement)
    await waitFor(() => expect(article).toHaveAttribute('data-mode', 'edit'))
  })

  it('disables all edit actions when the component is disabled', () => {
    render(
      <Card
        contentSlot={<div>Custom content</div>}
        disabled
        initialMode="edit"
        note={note}
        onSave={vi.fn()}
      />,
    )

    expect(screen.getByRole('textbox', { name: '编辑标题' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '取消' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '保存' })).toBeDisabled()
  })
})
