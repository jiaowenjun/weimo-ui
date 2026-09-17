import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, KeyboardEvent, MouseEvent } from 'react'
import type { ComponentPropsWithoutRef } from 'react'

import { ImageView } from './image-view'
import { cn } from './lib/utils'

import './image-uploader.css'

type ImageUploaderSelectionSource = 'picker' | 'clipboard' | 'drop'
type ImageUploaderPreview = {
  file: File
  naturalHeight: number
  naturalWidth: number
  src: string
}

export type ImageUploaderActionApi = {
  hasFile: boolean
  canPasteClipboardImage: boolean
  canCheck: boolean
  select: () => void
  paste: () => void
  close: () => void
  check: () => void
}

export type ImageUploaderProps = Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'onChange'> & {
  file?: File | null
  onFileChange: (file: File | null) => void
  onActionsChange?: (actions: ImageUploaderActionApi) => void
  onCheck?: () => void
  title?: string
  description?: string
  clipboardSourceLabel?: string
  inputProps?: Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'onChange'>
}

const CLIPBOARD_FILE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const DEFAULT_IMAGE_UPLOADER_TITLE = '上传图片'
const DEFAULT_IMAGE_UPLOADER_DESCRIPTION = '拖放、选择或粘贴图片'
const DEFAULT_IMAGE_UPLOADER_CLIPBOARD_SOURCE_LABEL = '来自剪贴板'
const IMAGE_PREVIEW_REVOKE_DELAY_MS = 1000

function canPreviewImageFile(file: File) {
  return !file.type || file.type.startsWith('image/')
}

function isEditablePasteTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false

  if (target.isContentEditable) return true

  if (target instanceof HTMLTextAreaElement) return true

  if (target instanceof HTMLInputElement) return target.type !== 'file'

  return target instanceof HTMLSelectElement
}

function createClipboardImageFile(blob: Blob, type = blob.type) {
  const fileType = type || blob.type || 'image/png'
  const extension =
    CLIPBOARD_FILE_EXTENSIONS[fileType] ?? fileType.split('/')[1] ?? 'png'
  const now = Date.now()

  return new File([blob], `pasted-image-${now}.${extension}`, {
    type: fileType,
    lastModified: now,
  })
}

function normalizePastedImageFile(file: File) {
  if (file.name.trim()) return file

  return createClipboardImageFile(file)
}

function hasDraggedFile(dataTransfer: DataTransfer) {
  return Array.from(dataTransfer.items).some((item) => item.kind === 'file') ||
    Array.from(dataTransfer.files).length > 0
}

function hasDraggedImage(dataTransfer: DataTransfer) {
  const items = Array.from(dataTransfer.items)

  if (items.length) {
    return items.some((item) => item.kind === 'file' && (!item.type || item.type.startsWith('image/')))
  }

  return Array.from(dataTransfer.files).some(canPreviewImageFile)
}

function getDraggedImageFile(dataTransfer: DataTransfer) {
  const files = Array.from(dataTransfer.files)
  const file = files.find(canPreviewImageFile) ?? null

  if (file) return file

  for (const item of Array.from(dataTransfer.items)) {
    if (item.kind !== 'file') continue
    if (item.type && !item.type.startsWith('image/')) continue

    const itemFile = item.getAsFile()
    if (itemFile && canPreviewImageFile(itemFile)) return itemFile
  }

  return files.find(canPreviewImageFile) ?? null
}

function canReadClipboardImage() {
  return typeof navigator !== 'undefined' && typeof navigator.clipboard?.read === 'function'
}

async function readClipboardImageFile() {
  if (!canReadClipboardImage()) return null

  const items = await navigator.clipboard.read()

  for (const item of items) {
    const imageType = item.types.find((type) => type.startsWith('image/'))
    if (!imageType) continue

    const blob = await item.getType(imageType)

    return createClipboardImageFile(blob, imageType)
  }

  return null
}

function loadImagePreview(file: File): Promise<ImageUploaderPreview | null> {
  if (!canPreviewImageFile(file)) return Promise.resolve(null)

  const src = URL.createObjectURL(file)
  const image = new Image()

  image.decoding = 'async'
  image.src = src

  return image.decode()
    .then(() => {
      if (!image.naturalWidth || !image.naturalHeight) {
        URL.revokeObjectURL(src)
        return null
      }

      return {
        file,
        naturalHeight: image.naturalHeight,
        naturalWidth: image.naturalWidth,
        src,
      }
    })
    .catch(() => {
      URL.revokeObjectURL(src)
      return null
    })
}

function releaseImagePreview(preview: ImageUploaderPreview | null) {
  if (preview) window.setTimeout(() => URL.revokeObjectURL(preview.src), IMAGE_PREVIEW_REVOKE_DELAY_MS)
}

export function ImageUploader({
  className,
  clipboardSourceLabel = DEFAULT_IMAGE_UPLOADER_CLIPBOARD_SOURCE_LABEL,
  description = DEFAULT_IMAGE_UPLOADER_DESCRIPTION,
  file = null,
  inputProps = {},
  onActionsChange,
  onCheck,
  onFileChange,
  onClick,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onKeyDown,
  role,
  tabIndex,
  title = DEFAULT_IMAGE_UPLOADER_TITLE,
  ...props
}: ImageUploaderProps) {
  const hasFile = Boolean(file)
  const [preview, setPreview] = useState<ImageUploaderPreview | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const canPasteClipboardImage = !hasFile && canReadClipboardImage()
  const [selectedSource, setSelectedSource] = useState<ImageUploaderSelectionSource | null>(null)
  const dragDepthRef = useRef(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const previewRef = useRef<ImageUploaderPreview | null>(null)
  const selectionIdRef = useRef(0)

  const replaceImagePreview = useCallback((nextPreview: ImageUploaderPreview | null) => {
    const currentPreview = previewRef.current
    if (currentPreview === nextPreview) return

    releaseImagePreview(currentPreview)
    previewRef.current = nextPreview
    setPreview(nextPreview)
  }, [])

  const releaseCurrentImagePreview = useCallback(() => {
    releaseImagePreview(previewRef.current)
    previewRef.current = null
  }, [])

  useEffect(() => {
    dragDepthRef.current = 0
    setIsDragActive(false)
    if (!file) setSelectedSource(null)
  }, [file])

  useEffect(() => {
    return () => releaseCurrentImagePreview()
  }, [releaseCurrentImagePreview])

  useLayoutEffect(() => {
    if (!file) {
      replaceImagePreview(null)
      return
    }

    if (previewRef.current?.file === file) return

    let canceled = false

    loadImagePreview(file).then((nextPreview) => {
      if (canceled) {
        releaseImagePreview(nextPreview)
        return
      }

      replaceImagePreview(nextPreview)
    })

    return () => {
      canceled = true
    }
  }, [file, replaceImagePreview])

  const selectImageFile = useCallback(
    async (nextFile: File | null, nextSource: ImageUploaderSelectionSource | null) => {
      if (!nextFile) {
        selectionIdRef.current += 1
        setSelectedSource(null)
        replaceImagePreview(null)
        onFileChange(null)
        return
      }

      const selectionId = selectionIdRef.current + 1
      selectionIdRef.current = selectionId
      const nextPreview = await loadImagePreview(nextFile)

      if (selectionIdRef.current !== selectionId) {
        releaseImagePreview(nextPreview)
        return
      }

      if (!nextPreview) {
        setSelectedSource(null)
        replaceImagePreview(null)
        return
      }

      setSelectedSource(nextSource)
      replaceImagePreview(nextPreview)
      onFileChange(nextFile)
    },
    [onFileChange, replaceImagePreview],
  )

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const nextFile = event.currentTarget.files?.[0] ?? null

    void selectImageFile(nextFile, nextFile ? 'picker' : null).finally(() => {
      input.value = ''
    })
  }

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      if (hasFile) return
      if (isEditablePasteTarget(event.target)) return

      const items = Array.from(event.clipboardData?.items ?? [])
      const fileItem = items.find((item) => item.kind === 'file' && (!item.type || item.type.startsWith('image/')))

      if (!fileItem) return

      const file = fileItem.getAsFile()
      if (!file) return

      event.preventDefault()
      void selectImageFile(normalizePastedImageFile(file), 'clipboard')
    }

    window.addEventListener('paste', handlePaste)

    return () => window.removeEventListener('paste', handlePaste)
  }, [hasFile, selectImageFile])

  const closeImageFile = useCallback(() => {
    void selectImageFile(null, null)
  }, [selectImageFile])

  const openFilePicker = useCallback(() => {
    if (hasFile) return

    inputRef.current?.click()
  }, [hasFile])

  const selectClipboardImageFile = useCallback(async () => {
    if (hasFile) return
    if (!canPasteClipboardImage) return

    const nextFile = await readClipboardImageFile().catch(() => null)
    if (!nextFile) return

    void selectImageFile(nextFile, 'clipboard')
  }, [canPasteClipboardImage, hasFile, selectImageFile])

  const checkImageFile = useCallback(() => {
    if (!hasFile) return

    onCheck?.()
  }, [hasFile, onCheck])

  const actions = useMemo<ImageUploaderActionApi>(() => ({
    hasFile,
    canPasteClipboardImage,
    canCheck: hasFile && Boolean(onCheck),
    select: openFilePicker,
    paste: selectClipboardImageFile,
    close: closeImageFile,
    check: checkImageFile,
  }), [
    canPasteClipboardImage,
    checkImageFile,
    closeImageFile,
    hasFile,
    onCheck,
    openFilePicker,
    selectClipboardImageFile,
  ])

  useEffect(() => {
    onActionsChange?.(actions)
  }, [actions, onActionsChange])

  function handleRootClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === inputRef.current) return

    onClick?.(event)
    if (event.defaultPrevented) return

    openFilePicker()
  }

  function handleRootKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    openFilePicker()
  }

  function resetDragState() {
    dragDepthRef.current = 0
    setIsDragActive(false)
  }

  function handleRootDragEnter(event: DragEvent<HTMLDivElement>) {
    onDragEnter?.(event)
    if (event.defaultPrevented) return
    if (hasFile || !hasDraggedImage(event.dataTransfer)) return

    event.preventDefault()
    dragDepthRef.current += 1
    setIsDragActive(true)
  }

  function handleRootDragOver(event: DragEvent<HTMLDivElement>) {
    onDragOver?.(event)
    if (event.defaultPrevented) return
    if (hasFile || !hasDraggedImage(event.dataTransfer)) return

    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    setIsDragActive(true)
  }

  function handleRootDragLeave(event: DragEvent<HTMLDivElement>) {
    onDragLeave?.(event)
    if (event.defaultPrevented) return

    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
    if (dragDepthRef.current === 0) setIsDragActive(false)
  }

  function handleRootDrop(event: DragEvent<HTMLDivElement>) {
    onDrop?.(event)
    if (event.defaultPrevented) return

    const containsFile = hasDraggedFile(event.dataTransfer)
    const nextFile = getDraggedImageFile(event.dataTransfer)
    if (!containsFile && !nextFile) return

    event.preventDefault()
    resetDragState()

    if (hasFile || !nextFile) return

    void selectImageFile(nextFile, 'drop')
  }

  return (
    <div
      className={cn('image-uploader', className)}
      data-drag-over={isDragActive ? 'true' : undefined}
      data-state={hasFile ? 'ready' : 'initial'}
      onClick={handleRootClick}
      onDragEnter={handleRootDragEnter}
      onDragLeave={handleRootDragLeave}
      onDragOver={handleRootDragOver}
      onDrop={handleRootDrop}
      onKeyDown={handleRootKeyDown}
      role={role}
      tabIndex={tabIndex}
      {...props}
    >
      <div className="image-uploader__panel">
        {!hasFile ? (
          <input
            {...inputProps}
            aria-label={inputProps['aria-label'] ?? title}
            className={cn('image-uploader__input', inputProps.className)}
            onChange={handleInputChange}
            ref={inputRef}
            type="file"
          />
        ) : null}
        {preview ? (
          <span className="image-uploader__preview">
            <ImageView
              alt=""
              className="image-uploader__preview-view"
              imageHeight={preview.naturalHeight}
              imageWidth={preview.naturalWidth}
              src={preview.src}
              objectFit="contain"
            />
          </span>
        ) : null}
        {!hasFile ? <span className="image-uploader__title">{title}</span> : null}
        {!hasFile && selectedSource === 'clipboard' ? (
          <small className="image-uploader__source">{clipboardSourceLabel}</small>
        ) : !hasFile ? (
          <small className="image-uploader__description">{description}</small>
        ) : null}
      </div>
    </div>
  )
}
