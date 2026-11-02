import { useEffect, useState } from 'react'

import { ActionDialog, type ActionDialogProps } from 'weimo-ui-core/components/action-dialog'
import { cn } from 'weimo-ui-core/lib/utils'
import { WdfCard, type WdfCardProps } from 'weimo-ui-editor/components/wdf-card'
import {
  ImageView,
  ImageViewDisplayModeMenu,
  type ImageViewDisplayMode,
} from 'weimo-ui-image/components/image-view'
import type { WdfDocument } from 'weimo-wdf'

import { documentToMarkdown, markdownToDocument } from '../../lib/markdown-bridge'
import { TagBar } from '../tags/tag-bar'

import 'weimo-ui-core/styles/tokens.css'
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
  tagOptions?: string[]
  value?: string
  defaultValue?: string
  onChange?: (markdown: string, draft: OcrDetailDraft) => void
  onOpenChange?: (open: boolean) => void
  onSave?: (markdown: string, draft: OcrDetailDraft) => void
  onCancel?: () => void
  placeholder?: string
  disabled?: boolean
  cardProps?: Omit<
    WdfCardProps,
    'value' | 'defaultValue' | 'onChange' | 'onSave' | 'title' | 'bottomBar' | 'defaultMode' | 'editStyle'
  >
}

const DEFAULT_OCR_DETAIL_IMAGE_ALT = 'OCR source image'
const DEFAULT_OCR_DETAIL_PLACEHOLDER = 'Review and correct OCR markdown...'
const DEFAULT_OCR_DETAIL_CREATED_AT_TEXT = 'OCR Markdown'
const DEFAULT_OCR_DETAIL_TITLE_LABEL = '标题'

/**
 * OcrDetail:OCR 校对对话框——左原图右文字,对照修错。文字编辑交给
 * WdfCard(恒编辑态、行内样式——对话框内不应再弹第二层对话框),
 * 标题为对话框内受控输入行,标签栏挂在 WdfCard bottomBar。
 *
 * 与旧版的差异:markdown 经 weimo-wdf/markdown 桥进出(对外仍是
 * markdown 字符串);标题编辑从旧 Card 内建机制改为显式输入行。
 */
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
  tagOptions,
  tags: tagsProp = [],
  title: titleProp = '',
  toolbarRightSlot,
  value,
  ...props
}: OcrDetailProps) {
  const isControlled = value !== undefined
  const [internalMarkdown, setInternalMarkdown] = useState(() => value ?? defaultValue ?? '')
  const [imageDisplayMode, setImageDisplayMode] = useState<ImageViewDisplayMode>('fit-width')
  const [title, setTitle] = useState(titleProp)
  const [tags, setTags] = useState(tagsProp)
  const markdown = isControlled ? value ?? '' : internalMarkdown

  useEffect(() => {
    if (isControlled) setInternalMarkdown(value ?? '')
  }, [isControlled, value])

  useEffect(() => {
    setTitle(titleProp)
  }, [titleProp])

  useEffect(() => {
    setTags(tagsProp)
  }, [tagsProp])

  function emitChange(nextMarkdown: string, nextTitle: string, nextTags: string[]) {
    onChange?.(nextMarkdown, { title: nextTitle, markdown: nextMarkdown, tags: nextTags })
  }

  function handleCardChange(nextDocument: WdfDocument) {
    const nextMarkdown = documentToMarkdown(nextDocument)

    if (!isControlled) setInternalMarkdown(nextMarkdown)
    emitChange(nextMarkdown, title, tags)
  }

  function handleCardSave(nextDocument: WdfDocument) {
    const nextMarkdown = documentToMarkdown(nextDocument)
    const draft = { title, markdown: nextMarkdown, tags }

    if (!isControlled) setInternalMarkdown(nextMarkdown)
    onSave?.(nextMarkdown, draft)
    onOpenChange?.(false)
  }

  function handleTitleChange(nextTitle: string) {
    setTitle(nextTitle)
    emitChange(markdown, nextTitle, tags)
  }

  function handleTagsChange(nextTags: string[]) {
    setTags(nextTags)
    emitChange(markdown, title, nextTags)
  }

  function handleRequestOpenChange(open: boolean) {
    if (!open) {
      const activeElement = document.activeElement
      if (activeElement instanceof HTMLElement) activeElement.blur()
      onCancel?.()
    }
    onOpenChange?.(open)
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
      floatBarFrameClassName="ocr-detail__toolbar-frame"
      onOpenChange={handleRequestOpenChange}
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
          <label className="ocr-detail__title-row">
            <span className="ocr-detail__title-label">{DEFAULT_OCR_DETAIL_TITLE_LABEL}</span>
            <input
              className="ocr-detail__title-input"
              disabled={disabled}
              onChange={(event) => handleTitleChange(event.target.value)}
              value={title}
            />
          </label>
          <WdfCard
            {...cardProps}
            bottomBar={
              <TagBar
                disabled={disabled}
                editable
                onTagsChange={handleTagsChange}
                tagOptions={tagOptions}
                tags={tags}
              />
            }
            defaultMode="edit"
            editStyle="inline"
            editorProps={{ placeholder, ...cardProps.editorProps }}
            onChange={handleCardChange}
            onSave={handleCardSave}
            title={title || DEFAULT_OCR_DETAIL_CREATED_AT_TEXT}
            value={markdownToDocument(markdown)}
          />
        </div>
      </div>
    </ActionDialog>
  )
}
