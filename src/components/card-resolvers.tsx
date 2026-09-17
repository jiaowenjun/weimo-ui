import type { ComponentPropsWithoutRef, CSSProperties, ReactNode, TransitionEvent } from 'react'
import type { Editor } from '@tiptap/core'
import { Trash2 } from 'lucide-react'

import type { CardToolBarProps } from './card-tool-bar'
import type { CardTopBarProps } from './card-top-bar'
import type {
  CardMode,
  ResolvedCardModeState,
} from './card-edit-state-machine'
import type { CardLayoutMeasurements } from './card-layout-measurement'
import { DeferredMdEditorToolbar } from './deferred-md-editor-toolbar'
import type { MdViewProps } from './md-view'
import type { TagBarProps } from './tag-bar'
import type { ActionMenuItem } from './menu'
import { getCardSurfaceClassName } from './card-surface'
import type {
  CardDraft,
  CardEditBehavior,
  CardEditorOptions,
  CardLabels,
  CardNote,
  CardProps,
} from './card'

const CARD_DEFAULT_EDITOR_BOTTOM_SAFE_AREA = 'var(--weimo-card-editable-default-editor-bottom-safe-area)'

export type ResolvedCardEditBehavior = {
  actionSlot?: ReactNode
  onCancel: () => void
  topBarOnCancel: () => void
}

export type ResolvedCardLabels = Required<CardLabels>

export type ResolvedCardContentState = {
  content: string
  tags: string[]
  title?: string
}

export type ResolvedCardToolBarState = {
  ariaHidden: true | undefined
  dataLayout: 'true' | 'false'
  dataVisible: 'true' | 'false'
  disabled: CardToolBarProps['disabled']
  saveDisabled: CardToolBarProps['saveDisabled']
}

export type ResolvedCardToolBarProps = Omit<CardToolBarProps, 'onSave'> & {
  'data-layout': ResolvedCardToolBarState['dataLayout']
  'data-visible': ResolvedCardToolBarState['dataVisible']
}

export type ResolvedCardArticleProps = ComponentPropsWithoutRef<'article'> & {
  'data-height-lock': 'true' | 'false'
  'data-custom-content': 'true' | 'false'
  'data-editing': 'true' | 'false'
  'data-edit-layout': 'true' | 'false'
  'data-mode': CardMode
  'data-view-measure': 'false'
}

export type ResolvedCardContainerProps = ComponentPropsWithoutRef<'div'> & {
  className: string
}

export type ResolvedCardContentProps = ResolvedCardContainerProps

export type ResolvedCardTagsProps = ResolvedCardContainerProps

export type ResolvedCardAfterTagsProps = ResolvedCardContainerProps

export type ResolvedCardContainerSlotProps = {
  content: ResolvedCardContentProps
  tags: ResolvedCardTagsProps
  afterTags: ResolvedCardAfterTagsProps
}

export type CardStyle = CSSProperties & {
  '--weimo-card-editable-active-edit-extra-height'?: string
  '--weimo-card-editable-after-tags-height'?: string
  '--weimo-card-editable-after-tags-reserve'?: string
  '--weimo-card-editable-animated-height'?: string
  '--weimo-card-editable-content-extra-height'?: string
  '--weimo-card-editable-requested-edit-extra-height'?: string
  '--weimo-card-editable-tags-bottom-offset'?: string
  '--weimo-card-editable-tags-height'?: string
  '--weimo-card-editable-tags-top-offset'?: string
  '--weimo-card-editable-view-height'?: string
  '--weimo-card-transition-duration'?: string
}

export function resolveCardCssLength(value: number | string) {
  return typeof value === 'number' ? `${value}px` : value
}

export function resolveCardEditBehavior(
  editBehavior: CardEditBehavior | undefined,
  defaultCancelHandler: () => void,
): ResolvedCardEditBehavior {
  const onCancel = editBehavior?.onCancel ?? defaultCancelHandler

  return {
    actionSlot: editBehavior?.actionSlot,
    onCancel,
    topBarOnCancel: onCancel,
  }
}

export function resolveCardLabels(labels: CardLabels | undefined): ResolvedCardLabels {
  return {
    more: '更多操作',
    edit: '编辑',
    delete: '删除',
    editTitle: '编辑笔记',
    save: '保存',
    cancel: '取消',
    addTag: '标签',
    placeholder: '',
    emptyTitle: '优选好题',
    titlePlaceholder: '编辑标题',
    ...labels,
  }
}

export function resolveCardEditorBottomSafeArea(editor: CardEditorOptions | undefined) {
  return editor?.bottomSafeArea === undefined
    ? CARD_DEFAULT_EDITOR_BOTTOM_SAFE_AREA
    : resolveCardCssLength(editor.bottomSafeArea)
}

export function resolveCardStyle(
  baseStyle: CSSProperties | undefined,
  cardTransitionMs: number,
  animatedHeight: string | null,
  activeEditExtraHeight: string | null,
  activeLayout: CardLayoutMeasurements | null,
  editorBottomSafeArea: string,
): CardStyle {
  return {
    ...baseStyle,
    '--weimo-card-transition-duration': `${cardTransitionMs}ms`,
    ...(animatedHeight
      ? { '--weimo-card-editable-animated-height': animatedHeight }
      : {}),
    ...(activeEditExtraHeight
      ? {
          '--weimo-card-editable-active-edit-extra-height':
            activeEditExtraHeight,
        }
      : {}),
    ...(activeLayout
      ? {
          '--weimo-card-editable-content-extra-height': activeLayout.contentExtraHeight,
          '--weimo-card-editable-requested-edit-extra-height':
            editorBottomSafeArea,
          '--weimo-card-editable-after-tags-height': activeLayout.afterTagsHeight,
          '--weimo-card-editable-after-tags-reserve': activeLayout.afterTagsReserve,
          '--weimo-card-editable-tags-bottom-offset': activeLayout.tagsBottomOffset,
          '--weimo-card-editable-tags-height': activeLayout.tagsHeight,
          '--weimo-card-editable-tags-top-offset': activeLayout.tagsTopOffset,
          '--weimo-card-editable-view-height': activeLayout.viewHeight,
        }
      : {}),
  }
}

export function resolveCardArticleProps(
  className: string | undefined,
  hasCustomContent: boolean,
  animatedHeight: string | null,
  isEditing: boolean,
  usesEditLayout: boolean,
  mode: CardMode,
  onTransitionEnd: (event: TransitionEvent<HTMLElement>) => void,
  style: CardStyle,
): ResolvedCardArticleProps {
  return {
    className: getCardSurfaceClassName('weimo-card weimo-card-editable', className),
    'data-height-lock': animatedHeight ? 'true' : 'false',
    'data-custom-content': hasCustomContent ? 'true' : 'false',
    'data-editing': isEditing ? 'true' : 'false',
    'data-edit-layout': usesEditLayout ? 'true' : 'false',
    'data-mode': mode,
    'data-view-measure': 'false',
    onTransitionEnd,
    style,
  }
}

export function resolveCardContainerProps(className: string): ResolvedCardContainerProps {
  return { className }
}

export function resolveCardContentProps(): ResolvedCardContentProps {
  return resolveCardContainerProps('weimo-card-editable__content')
}

export function resolveCardTagsProps(): ResolvedCardTagsProps {
  return resolveCardContainerProps('weimo-card-editable__tags')
}

export function resolveCardContainerSlotProps(): ResolvedCardContainerSlotProps {
  return {
    content: resolveCardContentProps(),
    tags: resolveCardTagsProps(),
    afterTags: resolveCardAfterTagsProps(),
  }
}

export function resolveCardDisplayMenuItems(
  onDelete: CardProps['onDelete'],
  extraDisplayMenuItems: ActionMenuItem[] | undefined,
  labels: ResolvedCardLabels,
  disabled: boolean | undefined,
  onDeleteSelect: () => void,
): ActionMenuItem[] | undefined {
  const deleteMenuItems: ActionMenuItem[] = onDelete
    ? [
        {
          key: 'delete-separator',
          type: 'separator',
        },
        {
          key: 'delete',
          label: labels.delete,
          icon: <Trash2 />,
          variant: 'destructive',
          disabled,
          onSelect: onDeleteSelect,
        },
      ]
    : []

  const items = [...(extraDisplayMenuItems ?? []), ...deleteMenuItems]

  return items.length > 0 ? items : undefined
}

export function resolveCardTopBarProps(
  displayActionSlot: ReactNode | undefined,
  displayActionPrefixSlot: ReactNode | undefined,
  displayActionGroupClassName: string | undefined,
  isEditing: boolean,
  createdAtText: ReactNode,
  displayTitle: ReactNode | undefined,
  editTitle: ReactNode,
  displayMenuItems: ActionMenuItem[] | undefined,
  disabled: boolean | undefined,
  labels: ResolvedCardLabels,
  editBehavior: ResolvedCardEditBehavior,
  onEnterEdit: () => void,
): CardTopBarProps {
  if (isEditing) {
    return {
      mode: 'edit',
      actionSlot: editBehavior.actionSlot,
      cancelLabel: labels.cancel,
      disabled,
      editTitle,
      onCancel: editBehavior.topBarOnCancel,
    }
  }

  return {
    mode: 'display',
    actionLabel: labels.more,
    actionGroupClassName: displayActionGroupClassName,
    actionPrefixSlot: displayActionPrefixSlot,
    actionSlot: displayActionSlot,
    createdAtText,
    title: displayTitle,
    disabled,
    displayMenuItems,
    editActionLabel: labels.edit,
    onAction: onEnterEdit,
  }
}

export function resolveCardContentState(
  mode: CardMode,
  note: CardNote,
  draft: CardDraft,
): ResolvedCardContentState {
  if (mode === 'view') {
    return { content: note.content, tags: note.tags ?? [], title: note.title }
  }

  return { content: draft.content, tags: draft.tags, title: draft.title }
}

export function resolveCardEditorProps(
  disabled: boolean | undefined,
  editor: CardEditorOptions | undefined,
  editBehavior: ResolvedCardEditBehavior,
  onEditorChange: (editor: Editor | null) => void,
  onContentHeightChange: (height: number) => void,
  labels: ResolvedCardLabels,
): MdViewProps['editorProps'] {
  return {
    disabled,
    editorClassName: editor?.className,
    autoFocus: false,
    onCancel: editBehavior.onCancel,
    onContentHeightChange,
    onEditorChange,
    placeholder: labels.placeholder,
  }
}

export function resolveCardMdViewProps(
  modeState: ResolvedCardModeState,
  value: string,
  onChange: (content: string) => void,
  editorBottomSafeArea: string,
  editorProps: MdViewProps['editorProps'],
  renderProps: MdViewProps['renderProps'],
): MdViewProps {
  return {
    editorBottomSafeArea,
    editorProps,
    mode: modeState.viewMode,
    onChange,
    preloadEditor: modeState.preloadEditor,
    renderProps,
    value,
  }
}

export function resolveCardTagBarProps(
  disabled: boolean | undefined,
  isEditing: boolean,
  labels: ResolvedCardLabels,
  isTagClickEnabled: CardProps['isTagClickEnabled'],
  onTagClick: CardProps['onTagClick'],
  onTagsChange: (tags: string[]) => void,
  tagOptions: string[] | undefined,
  tags: string[],
): TagBarProps {
  return {
    addLabel: labels.addTag,
    disabled,
    editable: isEditing,
    emptyLabel: '无',
    isTagClickEnabled,
    onTagClick,
    onTagsChange,
    tagOptions: tagOptions ?? [],
    tags,
  }
}

export function resolveCardToolBarState(
  disabled: boolean | undefined,
  isEditing: boolean,
  usesEditLayout: boolean,
  draftContent: string,
  saveDisabledOverride: CardProps['saveDisabled'],
): ResolvedCardToolBarState {
  return {
    ariaHidden: isEditing ? undefined : true,
    dataLayout: usesEditLayout ? 'true' : 'false',
    dataVisible: isEditing ? 'true' : 'false',
    disabled: disabled || !isEditing,
    saveDisabled: saveDisabledOverride ?? (!isEditing || draftContent.trim().length === 0),
  }
}

export function resolveCardEditorToolbarSlot(
  canUseMarkdownEditor: boolean,
  usesEditLayout: boolean,
  visibleEditorInstance: Editor | null,
  formatMarkdown: CardEditorOptions['formatMarkdown'],
  showContentFormatButton: CardEditorOptions['showContentFormatButton'],
  showInlineMathButton: CardEditorOptions['showInlineMathButton'],
  showHeadingButton: CardEditorOptions['showHeadingButton'],
  showQuoteButton: CardEditorOptions['showQuoteButton'],
  showCenteredQuoteButton: CardEditorOptions['showCenteredQuoteButton'],
  disabled: boolean | undefined,
  mode: CardMode,
  isEnteringEditAnimation: boolean,
): CardToolBarProps['toolbarSlot'] {
  if (!canUseMarkdownEditor || !usesEditLayout || !visibleEditorInstance) return null

  return (
    <DeferredMdEditorToolbar
      disabled={disabled || mode !== 'edit'}
      editor={visibleEditorInstance}
      formatMarkdown={formatMarkdown}
      showContentFormatButton={showContentFormatButton}
      showInlineMathButton={showInlineMathButton}
      showHeadingButton={showHeadingButton}
      showQuoteButton={showQuoteButton}
      showCenteredQuoteButton={showCenteredQuoteButton}
      suppressActiveBackground={isEnteringEditAnimation}
    />
  )
}

export function resolveCardToolBarProps(
  toolBarState: ResolvedCardToolBarState,
  labels: ResolvedCardLabels,
  toolbarSlot: CardToolBarProps['toolbarSlot'],
): ResolvedCardToolBarProps {
  return {
    'aria-hidden': toolBarState.ariaHidden,
    'aria-label': 'Markdown 编辑器操作栏',
    className: 'weimo-card-editable__bottom-bar',
    'data-layout': toolBarState.dataLayout,
    'data-visible': toolBarState.dataVisible,
    disabled: toolBarState.disabled,
    saveDisabled: toolBarState.saveDisabled,
    saveLabel: labels.save,
    toolbarSlot,
  }
}

export function resolveCardAfterTagsProps(): ResolvedCardAfterTagsProps {
  return resolveCardContainerProps('weimo-card-editable__after-tags')
}
