import { BookOpenCheck, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { ActionMenu, type ActionMenuItem } from 'weimo-ui-core/components/menu'
import { getCardSurfaceClassName } from 'weimo-ui-core/components/card-surface'
import { cn } from 'weimo-ui-core/lib/utils'
import { WdfCard, type WdfCardProps } from 'weimo-ui-editor/components/wdf-card'
import { ImageView, type ImageViewProps } from 'weimo-ui-image/components/image-view'
import type { WdfDocument } from 'weimo-wdf'

import { documentToMarkdown, markdownToDocument } from '../../lib/markdown-bridge'
import { OcrDetail, type OcrDetailDraft } from '../ocr-detail/ocr-detail'
import { TagBar } from '../tags/tag-bar'

import 'weimo-ui-core/styles/tokens.css'
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
  markdown: string
  tags: string[]
}

export type OcrCardImageViewProps = Omit<
  ImageViewProps,
  'src' | 'alt' | 'imageWidth' | 'imageHeight' | 'placeholder'
>

export type OcrCardLabels = {
  imagePlaceholder?: ReactNode
  openDetail?: string
  delete?: string
  menu?: string
}

export type OcrCardProps = Omit<
  ComponentPropsWithoutRef<'article'>,
  'children' | 'onChange' | 'title'
> & {
  actionSlot?: ReactNode
  cardProps?: Omit<
    WdfCardProps,
    'value' | 'defaultValue' | 'onChange' | 'onSave' | 'title' | 'bottomBar' | 'actionSlot' | 'defaultMode' | 'className'
  >
  disabled?: boolean
  displayMenuItems?: ActionMenuItem[]
  imageViewProps?: OcrCardImageViewProps
  initialMode?: 'view' | 'edit'
  isTagClickEnabled?: (tag: string) => boolean
  labels?: OcrCardLabels
  note: OcrCardNote
  onDelete?: () => void
  onDraftChange?: (draft: OcrCardDraft) => void
  onSave?: (draft: OcrCardDraft) => void
  onTagClick?: (tag: string) => void
  tagOptions?: string[]
}

type ResolvedOcrCardLabels = Required<OcrCardLabels>

function resolveOcrCardLabels(labels: OcrCardLabels | undefined): ResolvedOcrCardLabels {
  return {
    imagePlaceholder: 'No image selected',
    openDetail: '校对',
    delete: '删除',
    menu: '更多操作',
    ...labels,
  }
}

/**
 * OcrCard:OCR 结果卡。无识别结果(note.markdown 为空)时是图片展示卡;
 * 有结果时文字编辑交给 WdfCard,markdown 经 weimo-wdf/markdown 桥进出
 * (对外 API 仍是 markdown 字符串,与旧版一致)。校对入口在卡头菜单,
 * 打开 OcrDetail 对照原图修错。
 *
 * 与旧版(weimo-ui monorepo card 包)的差异:卡壳从旧 Card 换成
 * WdfCard(图片态为内置展示卡);标题不再卡内编辑(校对对话框内编辑);
 * 旧 markdown 图片渲染 props(renderImage/resolveImageSrc)随 WdfRender
 * 内容模型移除——WDF v0.1 无图片块,原图始终经 ImageView 呈现。
 */
export function OcrCard({
  actionSlot,
  cardProps = {},
  className,
  disabled,
  displayMenuItems,
  imageViewProps = {},
  initialMode,
  isTagClickEnabled,
  labels: labelsProp,
  note,
  onDelete,
  onDraftChange,
  onSave,
  onTagClick,
  tagOptions,
  ...props
}: OcrCardProps) {
  const labels = resolveOcrCardLabels(labelsProp)
  const hasMarkdownResult = Boolean(note.markdown?.trim())
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailMarkdown, setDetailMarkdown] = useState(() => note.markdown ?? '')
  const [markdownDraft, setMarkdownDraft] = useState(() => note.markdown ?? '')
  const [tags, setTags] = useState(() => note.tags ?? [])
  const {
    className: imageViewClassName,
    ...restImageViewProps
  } = imageViewProps

  const document = useMemo(
    () => markdownToDocument(note.markdown),
    [note.markdown],
  )

  useEffect(() => {
    setMarkdownDraft(note.markdown ?? '')
  }, [note.markdown])

  useEffect(() => {
    setTags(note.tags ?? [])
  }, [note.tags])

  useEffect(() => {
    if (!hasMarkdownResult) {
      setDetailOpen(false)
    }
  }, [hasMarkdownResult])

  function emitDraftChange(nextMarkdown: string, nextTags: string[]) {
    onDraftChange?.({
      title: note.title,
      markdown: nextMarkdown,
      tags: nextTags,
    })
  }

  function handleCardChange(nextDocument: WdfDocument) {
    const nextMarkdown = documentToMarkdown(nextDocument)

    setMarkdownDraft(nextMarkdown)
    emitDraftChange(nextMarkdown, tags)
  }

  function handleCardSave(nextDocument: WdfDocument) {
    const nextMarkdown = documentToMarkdown(nextDocument)

    setMarkdownDraft(nextMarkdown)
    onSave?.({
      title: note.title,
      markdown: nextMarkdown,
      tags,
    })
  }

  function handleTagsChange(nextTags: string[]) {
    setTags(nextTags)
    emitDraftChange(markdownDraft, nextTags)
  }

  function openDetailDialog() {
    setDetailMarkdown(note.markdown ?? '')
    setDetailOpen(true)
  }

  function resolveMenuItems(): ActionMenuItem[] {
    const items: ActionMenuItem[] = []

    if (hasMarkdownResult) {
      items.push({
        key: 'review',
        label: labels.openDetail,
        icon: <BookOpenCheck aria-hidden="true" />,
        disabled,
        onSelect: openDetailDialog,
      })
    }

    if (displayMenuItems?.length) {
      if (items.length > 0) {
        items.push({ key: 'review-separator', type: 'separator' })
      }
      items.push(...displayMenuItems)
    }

    if (onDelete) {
      if (items.length > 0) {
        items.push({ key: 'delete-separator', type: 'separator' })
      }
      items.push({
        key: 'delete',
        label: labels.delete,
        icon: <Trash2 aria-hidden="true" />,
        disabled,
        onSelect: onDelete,
      })
    }

    return items
  }

  const menuItems = resolveMenuItems()
  const headerActions = (
    <div className="weimo-ocr-card__header-actions">
      {actionSlot}
      {menuItems.length > 0 ? (
        <ActionMenu ariaLabel={labels.menu} items={menuItems} />
      ) : null}
    </div>
  )

  function resolveOcrDetailDraft(detailDraft: OcrDetailDraft): OcrCardDraft {
    return {
      title: detailDraft.title,
      markdown: detailDraft.markdown,
      tags: detailDraft.tags,
    }
  }

  function handleDetailMarkdownChange(markdown: string, detailDraft: OcrDetailDraft) {
    setDetailMarkdown(markdown)
    onDraftChange?.(resolveOcrDetailDraft(detailDraft))
  }

  function handleDetailMarkdownSave(markdown: string, detailDraft: OcrDetailDraft) {
    setDetailMarkdown(markdown)
    onSave?.(resolveOcrDetailDraft(detailDraft))
  }

  if (!hasMarkdownResult) {
    return (
      <article
        {...props}
        className={getCardSurfaceClassName('weimo-ocr-card weimo-ocr-card--image', className)}
      >
        <header className="weimo-ocr-card__header">
          <div className="weimo-ocr-card__header-main">
            {note.title ? <span className="weimo-ocr-card__title">{note.title}</span> : null}
            <span className="weimo-ocr-card__time">{note.createdAtText}</span>
          </div>
          {headerActions}
        </header>
        <div className="weimo-ocr-card__body">
          <ImageView
            {...restImageViewProps}
            alt={note.imageAlt}
            className={cn('weimo-ocr-card__image', imageViewClassName)}
            imageHeight={note.imageHeight}
            imageWidth={note.imageWidth}
            placeholder={labels.imagePlaceholder}
            src={note.imageSrc}
          />
        </div>
        <div className="weimo-ocr-card__tags">
          <TagBar
            disabled={disabled}
            isTagClickEnabled={isTagClickEnabled}
            onTagClick={onTagClick}
            onTagsChange={handleTagsChange}
            tagOptions={tagOptions}
            tags={tags}
          />
        </div>
      </article>
    )
  }

  return (
    <>
      <WdfCard
        {...cardProps}
        actionSlot={headerActions}
        bottomBar={
          <TagBar
            disabled={disabled}
            editable
            isTagClickEnabled={isTagClickEnabled}
            onTagClick={onTagClick}
            onTagsChange={handleTagsChange}
            tagOptions={tagOptions}
            tags={tags}
          />
        }
        className={cn('weimo-ocr-card', className)}
        defaultMode={initialMode ?? 'view'}
        onChange={handleCardChange}
        onSave={handleCardSave}
        title={note.title ?? note.createdAtText}
        value={document}
      />
      <OcrDetail
        cardProps={{
          editorProps: cardProps.editorProps,
          renderProps: cardProps.renderProps,
        }}
        disabled={disabled}
        imageAlt={note.imageAlt}
        imageSrc={note.imageSrc}
        onChange={handleDetailMarkdownChange}
        onOpenChange={setDetailOpen}
        onSave={handleDetailMarkdownSave}
        open={detailOpen}
        tagOptions={tagOptions}
        tags={note.tags ?? []}
        title={note.title ?? ''}
        value={detailMarkdown}
      />
    </>
  )
}
