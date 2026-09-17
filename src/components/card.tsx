import { useEffect, useRef } from 'react'
import type {
  ChangeEvent,
  ComponentPropsWithoutRef,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  TransitionEvent,
} from 'react'

import type { CardInitialMode } from './card-edit-state-machine'
import { isCardInlineMathShortcut, isCardSaveShortcut } from './card-save-shortcut'
import { CardToolBar } from './card-tool-bar'
import { CardTopBar } from './card-top-bar'
import {
  resolveCardArticleProps,
  resolveCardContainerSlotProps,
  resolveCardContentState,
  resolveCardDisplayMenuItems,
  resolveCardEditBehavior,
  resolveCardEditorBottomSafeArea,
  resolveCardEditorProps,
  resolveCardEditorToolbarSlot,
  resolveCardLabels,
  resolveCardMdViewProps,
  resolveCardStyle,
  resolveCardTagBarProps,
  resolveCardToolBarProps,
  resolveCardToolBarState,
  resolveCardTopBarProps,
} from './card-resolvers'
import { MdView, type MdViewHandle } from './md-view'
import type { MdViewProps } from './md-view'
import { TagBar } from './tag-bar'
import type { ActionMenuItem } from './menu'
import { useCardDraft } from './use-card-draft'
import { useCardEditTransition } from './use-card-edit-transition'

import './card.css'
import './card-editable.css'

const CARD_TRANSITION_MS = 181
const CARD_BODY_DOUBLE_CLICK_IGNORE_SELECTOR = [
  'a',
  'button',
  'input',
  'textarea',
  'select',
  'summary',
  '[contenteditable="true"]',
  '[role="button"]',
  '[role="link"]',
  '.weimo-card-markdown__scroll-block',
].join(', ')

export type { CardInitialMode, CardMode } from './card-edit-state-machine'

export type CardNote = {
  content: string
  createdAtText: ReactNode
  tags?: string[]
  title?: string
}

export type CardDraft = {
  content: string
  tags: string[]
  title?: string
}

export type CardLabels = {
  more?: string
  edit?: string
  delete?: string
  editTitle?: ReactNode
  save?: string
  cancel?: string
  addTag?: string
  placeholder?: string
  emptyTitle?: string
  titlePlaceholder?: string
}

export type CardEditorOptions = {
  className?: string
  bottomSafeArea?: number | string
  formatContentOnSave?: boolean
  formatMarkdown?: (markdown: string) => string
  showContentFormatButton?: boolean
  showCenteredQuoteButton?: boolean
  showHeadingButton?: boolean
  showInlineMathButton?: boolean
  showQuoteButton?: boolean
}

export type CardEditBehavior = {
  actionSlot?: ReactNode
  onCancel?: () => void
}

export type CardProps = Omit<
  ComponentPropsWithoutRef<'article'>,
  'children' | 'onChange'
> & {
  afterTagsSlot?: ReactNode
  contentSlot?: ReactNode
  renderProps?: MdViewProps['renderProps']
  displayActionSlot?: ReactNode
  displayActionPrefixSlot?: ReactNode
  displayActionGroupClassName?: string
  editBehavior?: CardEditBehavior
  note: CardNote
  onCancel?: () => void
  onDraftChange?: (draft: CardDraft) => void
  onDelete?: () => void
  displayMenuItems?: ActionMenuItem[]
  isTagClickEnabled?: (tag: string) => boolean
  onSave?: (draft: CardDraft) => void
  onTagClick?: (tag: string) => void
  saveDisabled?: boolean
  tagOptions?: string[]
  labels?: CardLabels
  editor?: CardEditorOptions
  initialMode?: CardInitialMode
  initialEditAutoFocus?: boolean
  disabled?: boolean
  transitionDurationMs?: number
}

function shouldIgnoreCardBodyDoubleClick(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest(CARD_BODY_DOUBLE_CLICK_IGNORE_SELECTOR) !== null
  )
}

export function Card({
  afterTagsSlot,
  className,
  contentSlot,
  renderProps,
  disabled,
  displayActionSlot,
  displayActionPrefixSlot,
  displayActionGroupClassName,
  displayMenuItems: displayMenuItemsProp,
  editBehavior,
  editor,
  initialEditAutoFocus = true,
  initialMode = 'view',
  isTagClickEnabled,
  labels: labelsProp,
  note,
  onCancel,
  onDraftChange,
  onDelete,
  onKeyDownCapture,
  onSave,
  onTagClick,
  onTransitionEnd,
  saveDisabled,
  style,
  tagOptions,
  transitionDurationMs = CARD_TRANSITION_MS,
  ...props
}: CardProps) {
  const cardDraft = useCardDraft(note, onDraftChange)
  const cardTransitionMs = transitionDurationMs
  const hasCustomContent = contentSlot !== undefined
  const canUseMarkdownEditor = !hasCustomContent
  const editorBottomSafeArea = resolveCardEditorBottomSafeArea(editor)
  const mdViewRef = useRef<MdViewHandle | null>(null)
  const editTransition = useCardEditTransition({
    canUseMarkdownEditor,
    editorBottomSafeArea,
    initialEditAutoFocus,
    initialMode,
    mdViewRef,
    transitionDurationMs: cardTransitionMs,
  })
  const {
    activeEditExtraHeight,
    animatedHeight,
    editLayout,
    editorInstance,
    enterEdit,
    exitEdit,
    handleEditorChange,
    handleEditorContentHeightChange,
    handleHeightTransitionEnd: handleEditHeightTransitionEnd,
    isEnteringEditAnimation,
    mode,
    modeState,
    refs,
  } = editTransition
  const {
    afterTagsRef,
    articleRef,
    contentRef,
    tagsRef,
    toolbarRef,
  } = refs
  const activeLayout = editLayout
  const usesEditLayout = activeLayout !== null
  const isEditing = modeState.isEditing
  const visibleEditorInstance = editorInstance
  const resolvedEditBehavior = resolveCardEditBehavior(
    editBehavior,
    handleCancel,
  )
  const articleStyle = resolveCardStyle(
    style,
    cardTransitionMs,
    animatedHeight,
    activeEditExtraHeight,
    activeLayout,
    editorBottomSafeArea,
  )
  const articleProps = resolveCardArticleProps(
    className,
    hasCustomContent,
    animatedHeight,
    isEditing,
    usesEditLayout,
    mode,
    handleHeightTransitionEnd,
    articleStyle,
  )
  const containerSlotProps = resolveCardContainerSlotProps()
  const cardContentState = resolveCardContentState(
    mode,
    note,
    cardDraft.draft,
  )
  const labels = resolveCardLabels(labelsProp)
  const titleEnabled = note.title !== undefined
  const displayTitle = titleEnabled
    ? cardContentState.title?.trim() || labels.emptyTitle
    : undefined
  const editTitle = titleEnabled ? (
    <input
      aria-label={labels.titlePlaceholder}
      className="weimo-card-top-bar__title-input"
      disabled={disabled}
      onChange={handleTitleChange}
      placeholder={labels.titlePlaceholder}
      type="text"
      value={cardDraft.draft.title ?? ''}
    />
  ) : labels.editTitle
  const editorProps = resolveCardEditorProps(
    disabled,
    editor,
    resolvedEditBehavior,
    handleEditorChange,
    handleEditorContentHeightChange,
    labels,
  )
  const mdViewProps = resolveCardMdViewProps(
    modeState,
    cardContentState.content,
    handleContentChange,
    editorBottomSafeArea,
    editorProps,
    renderProps,
  )
  const toolBarState = resolveCardToolBarState(
    disabled,
    isEditing,
    usesEditLayout,
    cardDraft.draft.content,
    saveDisabled,
  )
  const editorToolbarSlot = resolveCardEditorToolbarSlot(
    canUseMarkdownEditor,
    usesEditLayout,
    visibleEditorInstance,
    editor?.formatMarkdown,
    editor?.showContentFormatButton,
    editor?.showInlineMathButton,
    editor?.showHeadingButton,
    editor?.showQuoteButton,
    editor?.showCenteredQuoteButton,
    disabled,
    mode,
    isEnteringEditAnimation,
  )
  const toolBarProps = resolveCardToolBarProps(
    toolBarState,
    labels,
    editorToolbarSlot,
  )
  const tagBarProps = resolveCardTagBarProps(
    disabled,
    isEditing,
    labels,
    isTagClickEnabled,
    onTagClick,
    handleTagsChange,
    tagOptions,
    cardContentState.tags,
  )
  const displayMenuItems = resolveCardDisplayMenuItems(
    onDelete,
    displayMenuItemsProp,
    labels,
    disabled,
    handleDelete,
  )
  const topBarProps = resolveCardTopBarProps(
    displayActionSlot,
    displayActionPrefixSlot,
    displayActionGroupClassName,
    isEditing,
    note.createdAtText,
    displayTitle,
    editTitle,
    displayMenuItems,
    disabled,
    labels,
    resolvedEditBehavior,
    handleEnterEdit,
  )

  function handleEnterEdit() {
    if (disabled || mode !== 'view') return

    cardDraft.resetFromNote(note, false)
    enterEdit()
  }

  function handleBodyDoubleClick(event: MouseEvent<HTMLDivElement>) {
    if (mode !== 'view' || disabled) return
    if (shouldIgnoreCardBodyDoubleClick(event.target)) return

    handleEnterEdit()
  }

  function handleDelete() {
    if (disabled) return

    onDelete?.()
  }

  function handleCancel() {
    cardDraft.resetFromNote(note, false)
    exitEdit()
    onCancel?.()
  }

  function handleHeightTransitionEnd(event: TransitionEvent<HTMLElement>) {
    onTransitionEnd?.(event)
    handleEditHeightTransitionEnd(event)
  }

  function handleContentChange(content: string) {
    cardDraft.updateContent(content)
  }

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    cardDraft.updateTitle(event.currentTarget.value)
  }

  function handleTagsChange(tags: string[]) {
    cardDraft.updateTags(tags)
  }

  function handleCardKeyDownCapture(event: KeyboardEvent<HTMLElement>) {
    onKeyDownCapture?.(event)
    if (event.defaultPrevented) return
    if (mode !== 'edit') return

    if (isCardSaveShortcut(event)) {
      event.preventDefault()
      event.stopPropagation()

      if (toolBarState.disabled || toolBarState.saveDisabled) return

      handleSave()
      return
    }

    if (!isCardInlineMathShortcut(event)) return
    if (!editor?.showInlineMathButton || !editorInstance?.isFocused) return

    event.preventDefault()
    event.stopPropagation()

    if (disabled) return

    mdViewRef.current?.convertSelectionToInlineMath()
  }

  function handleSave() {
    let nextDraft = cardDraft.current

    if (editor?.formatContentOnSave && editorInstance) {
      const formattedContent = mdViewRef.current?.formatContent({
        formatMarkdown: editor.formatMarkdown,
      }) ?? cardDraft.current.content
      nextDraft = {
        ...cardDraft.current,
        content: formattedContent,
      }
    }

    onSave?.(nextDraft)
    exitEdit()
  }

  useEffect(() => {
    if (mode !== 'view') return

    cardDraft.resetFromNote(note, false)
  }, [mode, note])

  return (
    <article
      ref={articleRef}
      {...articleProps}
      {...props}
      onKeyDownCapture={handleCardKeyDownCapture}
    >
      <CardTopBar {...topBarProps} />
      <div
        ref={contentRef}
        onDoubleClick={handleBodyDoubleClick}
        {...containerSlotProps.content}
      >
        {hasCustomContent ? contentSlot : (
          <MdView
            ref={mdViewRef}
            {...mdViewProps}
          />
        )}
      </div>
      <div ref={tagsRef} {...containerSlotProps.tags}>
        <TagBar {...tagBarProps} />
      </div>
      {afterTagsSlot ? (
        <div
          ref={afterTagsRef}
          {...containerSlotProps.afterTags}
        >
          {afterTagsSlot}
        </div>
      ) : null}
      <CardToolBar
        ref={toolbarRef}
        {...toolBarProps}
        onSave={handleSave}
      />
    </article>
  )
}
