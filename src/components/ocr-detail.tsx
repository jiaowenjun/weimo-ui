import { useEffect, useState } from 'react'

import { ActionDialog, type ActionDialogProps } from './action-dialog'
import { Card, type CardDraft, type CardProps } from './card'
import { ImageView, ImageViewDisplayModeMenu, type ImageViewDisplayMode } from './image-view'
import { cn } from './lib/utils'

import './ocr-detail.css'

export type OcrDetailDraft = {
  title: string
  markdown: string
  tags: string[]
}

export type OcrDetailProps = Omit<
  ActionDialogProps,
  'children' | 'title' | 'showCloseButton' | 'onOpenChange'
> & {
  imageSrc?: string
  imageAlt?: string
  title?: string
  tags?: string[]
  value?: string
  defaultValue?: string
  onChange?: (markdown: string, draft: OcrDetailDraft) => void
  onOpenChange?: (open: boolean) => void
  onSave?: (markdown: string, draft: OcrDetailDraft) => void
  onCancel?: () => void
  placeholder?: string
  disabled?: boolean
  cardProps?: Omit<
    CardProps,
    'note' | 'onDraftChange' | 'onSave' | 'onCancel' | 'disabled'
  >
}

const DEFAULT_OCR_DETAIL_IMAGE_ALT = 'OCR source image'
const DEFAULT_OCR_DETAIL_PLACEHOLDER = 'Review and correct OCR markdown...'
const DEFAULT_OCR_DETAIL_CREATED_AT_TEXT = 'OCR Markdown'

export function OcrDetail({
  cardProps = {},
  className,
  defaultValue,
  disabled,
  imageAlt = DEFAULT_OCR_DETAIL_IMAGE_ALT,
  imageSrc,
  onCancel,
  onChange,
  onOpenChange,
  onSave,
  placeholder = DEFAULT_OCR_DETAIL_PLACEHOLDER,
  tags = [],
  title = '',
  toolbarRightSlot,
  value,
  ...props
}: OcrDetailProps) {
  const isControlled = value !== undefined
  const [internalMarkdown, setInternalMarkdown] = useState(() => value ?? defaultValue ?? '')
  const [imageDisplayMode, setImageDisplayMode] = useState<ImageViewDisplayMode>('fit-width')
  const markdown = isControlled ? value ?? '' : internalMarkdown

  useEffect(() => {
    if (isControlled) setInternalMarkdown(value ?? '')
  }, [isControlled, value])

  function resolveOcrDetailDraft(draft: CardDraft): OcrDetailDraft {
    return {
      title: draft.title ?? '',
      markdown: draft.content,
      tags: draft.tags,
    }
  }

  function handleDraftChange(draft: CardDraft) {
    const detailDraft = resolveOcrDetailDraft(draft)

    if (!isControlled) setInternalMarkdown(detailDraft.markdown)
    onChange?.(detailDraft.markdown, detailDraft)
  }

  function handleSave(draft: CardDraft) {
    const detailDraft = resolveOcrDetailDraft(draft)

    if (!isControlled) setInternalMarkdown(detailDraft.markdown)
    onSave?.(detailDraft.markdown, detailDraft)
    onOpenChange?.(false)
  }

  function handleCancel() {
    onCancel?.()
    onOpenChange?.(false)
  }

  function renderToolbarRightSlot() {
    return (
      <>
        <ImageViewDisplayModeMenu
          displayMode={imageDisplayMode}
          onDisplayModeChange={setImageDisplayMode}
        />
        {toolbarRightSlot}
      </>
    )
  }

  return (
    <ActionDialog
      className={cn('ocr-detail', className)}
      floatBarClassName="ocr-detail__image-toolbar"
      onOpenChange={onOpenChange}
      title={null}
      toolbarRightSlot={renderToolbarRightSlot()}
      {...props}
      showCloseButton={false}
    >
      <div className="ocr-detail__content">
        <div className="ocr-detail__image-pane">
          {imageSrc ? (
            <ImageView
              alt={imageAlt}
              className="ocr-detail__image-view"
              displayMode={imageDisplayMode}
              open={props.open}
              src={imageSrc}
            />
          ) : (
            <div className="ocr-detail__empty-image" role="note">
              No image selected
            </div>
          )}
        </div>
        <div className="ocr-detail__card-pane">
          <Card
            {...cardProps}
            disabled={disabled}
            initialMode={cardProps.initialMode ?? 'edit'}
            labels={{
              ...cardProps.labels,
              placeholder,
            }}
            note={{
              createdAtText: DEFAULT_OCR_DETAIL_CREATED_AT_TEXT,
              content: markdown,
              title,
              tags,
            }}
            onCancel={handleCancel}
            onDraftChange={handleDraftChange}
            onSave={handleSave}
          />
        </div>
      </div>
    </ActionDialog>
  )
}
