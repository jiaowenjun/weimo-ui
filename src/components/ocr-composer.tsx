import { Check, Clipboard, FileImage, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { CardTopBar } from './card-top-bar'
import { ComposerShell } from './composer-shell'
import { FrostedIconButton } from './frosted-icon-button'
import { GhostIconButton } from './ghost-icon-button'
import { ImageUploader, type ImageUploaderActionApi, type ImageUploaderProps } from './image-uploader'
import { TagBar } from './tag-bar'
import { getCardSurfaceClassName } from './card-surface'
import { cn } from './lib/utils'

import './card.css'
import './card-editable.css'
import './ocr-composer.css'

export type OcrComposerDraft = {
  file: File
  tags: string[]
}

export type OcrComposerLabels = {
  addTag?: string
  cancel?: string
  clearImage?: string
  editTitle?: ReactNode
  imageDescription?: string
  imageTitle?: string
  imageToolbar?: string
  pasteImage?: string
  save?: string
  selectImage?: string
  toolbar?: string
}

export type OcrComposerImageUploaderProps = Omit<
  ImageUploaderProps,
  'file' | 'onActionsChange' | 'onCheck' | 'onFileChange'
>

export type OcrComposerProps = Omit<
  ComponentPropsWithoutRef<'article'>,
  'children' | 'onChange'
> & {
  clientId: string
  disabled?: boolean
  file?: File | null
  imageUploaderProps?: OcrComposerImageUploaderProps
  isClosing?: boolean
  labels?: OcrComposerLabels
  onCancel?: () => void
  onExitAnimationEnd?: () => void
  onFileChange: (file: File | null) => void
  onSave?: (draft: OcrComposerDraft) => void
  onTagsChange?: (tags: string[]) => void
  onViewTransitionEnd?: () => void
  tagOptions?: string[]
  tags?: string[]
}

type ResolvedOcrComposerLabels = Required<OcrComposerLabels>

function resolveOcrComposerLabels(labels: OcrComposerLabels | undefined): ResolvedOcrComposerLabels {
  return {
    addTag: '标签',
    cancel: '取消',
    clearImage: '清除图片',
    editTitle: '新建OCR任务',
    imageDescription: '拖放、选择或粘贴图片',
    imageTitle: '上传图片',
    imageToolbar: '图片上传工具栏',
    pasteImage: '粘贴图片',
    save: '保存',
    selectImage: '选择图片',
    toolbar: 'OCR 图片编辑器操作栏',
    ...labels,
  }
}

export function OcrComposer({
  className,
  clientId,
  disabled = false,
  file = null,
  imageUploaderProps = {},
  isClosing = false,
  labels,
  onCancel,
  onExitAnimationEnd,
  onFileChange,
  onSave,
  onTagsChange,
  onTransitionEnd,
  onViewTransitionEnd,
  style,
  tagOptions,
  tags = [],
  ...articleProps
}: OcrComposerProps) {
  const [imageActions, setImageActions] = useState<ImageUploaderActionApi | null>(null)
  const resolvedLabels = resolveOcrComposerLabels(labels)
  const canUseActions = !disabled && !isClosing
  const hasFile = Boolean(file)
  const {
    className: imageUploaderClassName,
    description: imageUploaderDescription,
    title: imageUploaderTitle,
    ...restImageUploaderProps
  } = imageUploaderProps

  const handleComposerClose = useCallback(() => {
    if (isClosing || disabled) return

    onCancel?.()
  }, [disabled, isClosing, onCancel])

  function handleSave() {
    if (!file || disabled || isClosing) return

    onSave?.({
      file,
      tags,
    })
  }

  useEffect(() => {
    function handleComposerDocumentKeyDown(event: globalThis.KeyboardEvent) {
      if (event.defaultPrevented || event.key !== 'Escape') return
      if (!canUseActions) return

      event.preventDefault()
      if (hasFile) {
        onFileChange(null)
        return
      }

      handleComposerClose()
    }

    document.addEventListener('keydown', handleComposerDocumentKeyDown)

    return () => document.removeEventListener('keydown', handleComposerDocumentKeyDown)
  }, [canUseActions, handleComposerClose, hasFile, onFileChange])

  const composerEditActionSlot = (
    <GhostIconButton
      aria-label={resolvedLabels.cancel}
      className="weimo-card__header-icon-button"
      disabled={disabled || isClosing}
      onClick={handleComposerClose}
      size="sm"
    >
      <X />
    </GhostIconButton>
  )

  const composerActionSlot = (
    <div
      aria-label={resolvedLabels.imageToolbar}
      className="weimo-ocr-composer__actions"
      role="group"
    >
      {!hasFile ? (
        <>
          <FrostedIconButton
            aria-label={resolvedLabels.selectImage}
            disabled={!canUseActions || !imageActions}
            onClick={() => imageActions?.select()}
            onMouseDown={(event) => event.preventDefault()}
          >
            <FileImage aria-hidden="true" />
          </FrostedIconButton>
          <FrostedIconButton
            aria-label={resolvedLabels.pasteImage}
            disabled={!canUseActions || !imageActions?.canPasteClipboardImage}
            onClick={() => imageActions?.paste()}
            onMouseDown={(event) => event.preventDefault()}
          >
            <Clipboard aria-hidden="true" />
          </FrostedIconButton>
        </>
      ) : (
        <>
          <FrostedIconButton
            aria-label={resolvedLabels.clearImage}
            disabled={!canUseActions || !imageActions}
            onClick={() => imageActions?.close()}
            onMouseDown={(event) => event.preventDefault()}
          >
            <X aria-hidden="true" />
          </FrostedIconButton>
          <FrostedIconButton
            aria-label={resolvedLabels.save}
            disabled={!canUseActions}
            onClick={handleSave}
            onMouseDown={(event) => event.preventDefault()}
          >
            <Check aria-hidden="true" />
          </FrostedIconButton>
        </>
      )}
    </div>
  )

  return (
    <ComposerShell
      className="weimo-ocr-composer"
      data-client-id={clientId}
      isClosing={isClosing}
      onExitAnimationEnd={onExitAnimationEnd}
      onViewTransitionEnd={onViewTransitionEnd}
    >
      <article
        {...articleProps}
        className={getCardSurfaceClassName('weimo-card weimo-card-editable weimo-ocr-composer-card', className)}
        data-edit-layout="false"
        data-editing="true"
        data-height-lock="false"
        data-mode="edit"
        data-view-measure="false"
        onTransitionEnd={onTransitionEnd}
        style={style}
      >
        <CardTopBar
          actionSlot={composerEditActionSlot}
          disabled={disabled || isClosing}
          editTitle={resolvedLabels.editTitle}
          mode="edit"
          onCancel={handleComposerClose}
        />
        <div className="weimo-ocr-composer__content">
          <ImageUploader
            {...restImageUploaderProps}
            className={cn('weimo-ocr-composer__uploader', imageUploaderClassName)}
            description={imageUploaderDescription ?? resolvedLabels.imageDescription}
            file={file}
            onActionsChange={setImageActions}
            onFileChange={onFileChange}
            title={imageUploaderTitle ?? resolvedLabels.imageTitle}
          />
        </div>
        <div className="weimo-card-editable__tags weimo-ocr-composer__tags">
          <div
            aria-label={resolvedLabels.toolbar}
            className="weimo-ocr-composer__tag-row"
            role="group"
          >
            <TagBar
              addLabel={resolvedLabels.addTag}
              className="weimo-ocr-composer__tag-bar"
              disabled={disabled || isClosing}
              editable
              onTagsChange={onTagsChange}
              tagOptions={tagOptions}
              tags={tags}
            />
            {composerActionSlot}
          </div>
        </div>
      </article>
    </ComposerShell>
  )
}
