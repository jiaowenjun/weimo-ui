import { BookOpenCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { Card, type CardDraft, type CardEditorOptions, type CardInitialMode, type CardLabels } from './card'
import { ImageView, type ImageViewProps } from './image-view'
import { cn } from './lib/utils'
import type { MdRenderImageRenderer, MdRenderImageSrcResolver } from './md-render'
import type { ActionMenuItem } from './menu'
import { OcrDetail, type OcrDetailDraft } from './ocr-detail'

import './ocr-card.css'

export type OcrCardNote = {
  createdAtText: ReactNode
  title?: string
  imageSrc?: string
  imageAlt?: string
  imageWidth: number
  imageHeight: number
  markdown?: string
  tags?: string[]
}

export type OcrCardDraft = {
  title?: string
  markdown?: string
  tags: string[]
}

export type OcrCardImageViewProps = Omit<
  ImageViewProps,
  'src' | 'alt' | 'imageWidth' | 'imageHeight' | 'placeholder'
>

export type OcrCardLabels = CardLabels & {
  imagePlaceholder?: ReactNode
  openDetail?: string
}

export type OcrCardProps = Omit<ComponentPropsWithoutRef<'article'>, 'children' | 'onChange'> & {
  actionSlot?: ReactNode
  disabled?: boolean
  displayMenuItems?: ActionMenuItem[]
  editor?: CardEditorOptions
  imageViewProps?: OcrCardImageViewProps
  initialEditAutoFocus?: boolean
  initialMode?: CardInitialMode
  isTagClickEnabled?: (tag: string) => boolean
  labels?: OcrCardLabels
  markdownImageRenderer?: MdRenderImageRenderer
  markdownImageSrcResolver?: MdRenderImageSrcResolver
  note: OcrCardNote
  onCancel?: () => void
  onDelete?: () => void
  onDraftChange?: (draft: OcrCardDraft) => void
  onSave?: (draft: OcrCardDraft) => void
  onTagClick?: (tag: string) => void
  tagOptions?: string[]
  transitionDurationMs?: number
}

type ResolvedOcrCardLabels = CardLabels & Required<Pick<
  OcrCardLabels,
  'imagePlaceholder' | 'openDetail'
>>

function resolveOcrCardLabels(labels: OcrCardLabels | undefined): ResolvedOcrCardLabels {
  return {
    imagePlaceholder: 'No image selected',
    openDetail: '校对',
    ...labels,
  }
}

export function OcrCard({
  actionSlot,
  className,
  disabled,
  displayMenuItems,
  editor,
  imageViewProps = {},
  initialEditAutoFocus,
  initialMode,
  isTagClickEnabled,
  labels: labelsProp,
  markdownImageRenderer,
  markdownImageSrcResolver,
  note,
  onCancel,
  onDelete,
  onDraftChange,
  onSave,
  onTagClick,
  tagOptions,
  transitionDurationMs,
  ...props
}: OcrCardProps) {
  const labels = resolveOcrCardLabels(labelsProp)
  const { imagePlaceholder, openDetail, ...cardLabels } = labels
  const hasMarkdownResult = Boolean(note.markdown?.trim())
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailMarkdown, setDetailMarkdown] = useState(() => note.markdown ?? '')
  const {
    className: imageViewClassName,
    ...restImageViewProps
  } = imageViewProps

  useEffect(() => {
    if (!hasMarkdownResult) {
      setDetailOpen(false)
    }
  }, [hasMarkdownResult])

  const isImageViewMode = !hasMarkdownResult

  function resolveOcrDraft(cardDraft: CardDraft): OcrCardDraft {
    return {
      title: cardDraft.title,
      markdown: cardDraft.content,
      tags: cardDraft.tags,
    }
  }

  function handleDraftChange(cardDraft: CardDraft) {
    onDraftChange?.(resolveOcrDraft(cardDraft))
  }

  function handleSave(cardDraft: CardDraft) {
    onSave?.(resolveOcrDraft(cardDraft))
  }

  function resolveOcrDetailDraft(detailDraft: OcrDetailDraft): OcrCardDraft {
    return {
      title: detailDraft.title,
      markdown: detailDraft.markdown,
      tags: detailDraft.tags,
    }
  }

  function openDetailDialog() {
    setDetailMarkdown(note.markdown ?? '')
    setDetailOpen(true)
  }

  function resolveDetailMenuItems(): ActionMenuItem[] {
    if (!hasMarkdownResult) return []

    const items: ActionMenuItem[] = [
      {
        key: 'review',
        label: openDetail,
        icon: <BookOpenCheck aria-hidden="true" />,
        disabled,
        onSelect: openDetailDialog,
      },
    ]

    if (displayMenuItems?.[0] && displayMenuItems[0].type !== 'separator') {
      items.push({
        key: 'review-separator',
        type: 'separator',
      })
    }

    return items
  }

  const resolvedDisplayMenuItems = [
    ...resolveDetailMenuItems(),
    ...(displayMenuItems ?? []),
  ]

  function handleDetailMarkdownChange(markdown: string, detailDraft: OcrDetailDraft) {
    setDetailMarkdown(markdown)
    onDraftChange?.(resolveOcrDetailDraft(detailDraft))
  }

  function handleDetailMarkdownSave(markdown: string, detailDraft: OcrDetailDraft) {
    setDetailMarkdown(markdown)
    onSave?.(resolveOcrDetailDraft(detailDraft))
  }

  const contentSlot = isImageViewMode ? (
    <ImageView
      {...restImageViewProps}
      alt={note.imageAlt}
      className={cn('weimo-ocr-card__image', imageViewClassName)}
      imageHeight={note.imageHeight}
      imageWidth={note.imageWidth}
      placeholder={imagePlaceholder}
      src={note.imageSrc}
    />
  ) : undefined

  return (
    <>
      <Card
        {...props}
        className={cn('weimo-ocr-card', className)}
        contentSlot={contentSlot}
        disabled={disabled}
        displayActionGroupClassName="weimo-ocr-card__header-actions"
        displayActionPrefixSlot={actionSlot}
        displayMenuItems={resolvedDisplayMenuItems}
        editor={editor}
        initialEditAutoFocus={initialEditAutoFocus}
        initialMode={initialMode}
        isTagClickEnabled={isTagClickEnabled}
        labels={cardLabels}
        renderProps={{
          renderImage: markdownImageRenderer,
          resolveImageSrc: markdownImageSrcResolver,
        }}
        note={{
          content: note.markdown ?? '',
          createdAtText: note.createdAtText,
          tags: note.tags ?? [],
          title: note.title,
        }}
        onCancel={onCancel}
        onDelete={onDelete}
        onDraftChange={handleDraftChange}
        onSave={handleSave}
        onTagClick={onTagClick}
        saveDisabled={isImageViewMode ? false : undefined}
        tagOptions={tagOptions}
        transitionDurationMs={transitionDurationMs}
      />
      {hasMarkdownResult ? (
        <OcrDetail
          cardProps={{
            editor,
            tagOptions,
            renderProps: {
              renderImage: markdownImageRenderer,
              resolveImageSrc: markdownImageSrcResolver,
            },
          }}
          disabled={disabled}
          imageAlt={note.imageAlt}
          imageSrc={note.imageSrc}
          onCancel={onCancel}
          onChange={handleDetailMarkdownChange}
          onOpenChange={setDetailOpen}
          onSave={handleDetailMarkdownSave}
          open={detailOpen}
          tags={note.tags ?? []}
          title={note.title ?? ''}
          value={detailMarkdown}
        />
      ) : null}
    </>
  )
}
