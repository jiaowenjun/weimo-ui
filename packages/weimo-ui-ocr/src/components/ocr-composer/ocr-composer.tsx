import { Check, Clipboard, FileImage, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { FrostedIconButton } from 'weimo-ui-core/components/frosted-icon-button'
import { GhostIconButton } from 'weimo-ui-core/components/ghost-icon-button'
import { getCardSurfaceClassName } from 'weimo-ui-core/components/card-surface'
import { cn } from 'weimo-ui-core/lib/utils'
import {
  ImageUploader,
  type ImageUploaderActionApi,
  type ImageUploaderProps,
} from 'weimo-ui-image/components/image-uploader'

import { TagBar } from '../tags/tag-bar'
import { ComposerShell } from './composer-shell'

import 'weimo-ui-core/styles/tokens.css'
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

/**
 * OcrComposer:「新建 OCR 任务」占位卡。选图 + 打标签,保存上抛
 * OcrComposerDraft{file, tags} 交宿主执行识别——组件本身不做 OCR,
 * 与旧版(weimo-ui monorepo card 包)职责一致。
 *
 * 与旧版的差异:壳层退场协议移植自 weimo-ui-editor 的 ComposerShell
 * (onViewTransitionEnd 随之移除);顶栏由旧 CardTopBar 换为内置精简
 * 头行(标题 + 收起钮),卡片表面经 core card-surface 公开类钩子挂载。
 */
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
    >
      <article
        {...articleProps}
        className={getCardSurfaceClassName('weimo-ocr-composer-card', className)}
        onTransitionEnd={onTransitionEnd}
        style={style}
      >
        <header className="weimo-ocr-composer__header">
          <span className="weimo-ocr-composer__header-title">{resolvedLabels.editTitle}</span>
          <GhostIconButton
            aria-label={resolvedLabels.cancel}
            disabled={disabled || isClosing}
            onClick={handleComposerClose}
            size="sm"
          >
            <X />
          </GhostIconButton>
        </header>
        <div className="weimo-ocr-composer__content">
          <ImageUploader
            {...restImageUploaderProps}
            className={cn('weimo-ocr-composer__uploader', imageUploaderClassName)}
            description={imageUploaderDescription ?? resolvedLabels.imageDescription}
            file={file}
            onActionsChange={setImageActions}
            onFileChange={onFileChange}
            panelClassName="weimo-ocr-composer__uploader-panel"
            title={imageUploaderTitle ?? resolvedLabels.imageTitle}
          />
        </div>
        <div className="weimo-ocr-composer__tags">
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
