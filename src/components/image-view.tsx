import { Check, Maximize2, MoveHorizontal, MoveVertical } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type {
  CSSProperties,
  ComponentPropsWithoutRef,
  MouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  Ref,
} from 'react'

import { ActionDialog } from './action-dialog'
import { GlassIconButton } from './glass-icon-button'
import { cn } from './lib/utils'
import { ActionMenu, type ActionMenuItem } from './menu'

import './image-view.css'

export type ImageViewObjectFit = 'contain' | 'cover'
export type ImageViewDisplayMode = 'actual-size' | 'fit-width' | 'fit-height'

export type ImageViewProps = Omit<ComponentPropsWithoutRef<'figure'>, 'children'> & {
  src?: string
  alt?: string
  displayMode?: ImageViewDisplayMode
  imageWidth?: number
  imageHeight?: number
  imageRef?: Ref<HTMLImageElement>
  objectFit?: ImageViewObjectFit
  open?: boolean
  placeholder?: ReactNode
}

export type ImageViewDisplayModeMenuProps = {
  displayMode: ImageViewDisplayMode
  onDisplayModeChange: (displayMode: ImageViewDisplayMode) => void
}

const DEFAULT_IMAGE_VIEW_ALT = ''
const DEFAULT_IMAGE_VIEW_DETAIL_TITLE = '原图预览'
const DEFAULT_IMAGE_VIEW_DISPLAY_MODE: ImageViewDisplayMode = 'fit-width'
const DEFAULT_IMAGE_VIEW_PLACEHOLDER = 'No image selected'
const IMAGE_VIEW_DISPLAY_MODE_INDICATOR = <Check aria-hidden="true" />

const IMAGE_VIEW_DISPLAY_MODE_ITEMS: ActionMenuItem[] = [
  {
    type: 'radio',
    key: 'actual-size',
    value: 'actual-size',
    label: '100%',
    icon: <Maximize2 aria-hidden="true" />,
    indicator: IMAGE_VIEW_DISPLAY_MODE_INDICATOR,
  },
  {
    type: 'radio',
    key: 'fit-width',
    value: 'fit-width',
    label: '适应宽度',
    icon: <MoveHorizontal aria-hidden="true" />,
    indicator: IMAGE_VIEW_DISPLAY_MODE_INDICATOR,
  },
  {
    type: 'radio',
    key: 'fit-height',
    value: 'fit-height',
    label: '适应高度',
    icon: <MoveVertical aria-hidden="true" />,
    indicator: IMAGE_VIEW_DISPLAY_MODE_INDICATOR,
  },
]

function nonImageMessage(src: string) {
  return `非图片： ${src}`
}

type ImageViewStyle = CSSProperties & {
  '--image-view-aspect-ratio'?: string
}

type ImageViewDragState = {
  pointerId: number
  clientX: number
  clientY: number
  scrollLeft: number
  scrollTop: number
}

function canDragImageView(element: HTMLElement) {
  return element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight
}

function isImageViewDisplayMode(value: unknown): value is ImageViewDisplayMode {
  return value === 'actual-size' || value === 'fit-width' || value === 'fit-height'
}

function getImageViewDisplayModeIcon(displayMode: ImageViewDisplayMode) {
  if (displayMode === 'fit-width') return <MoveHorizontal aria-hidden="true" />
  if (displayMode === 'fit-height') return <MoveVertical aria-hidden="true" />

  return <Maximize2 aria-hidden="true" />
}

function setImageViewRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (!ref) return

  if (typeof ref === 'function') {
    ref(node)
    return
  }

  ref.current = node
}

export function ImageViewDisplayModeMenu({
  displayMode = DEFAULT_IMAGE_VIEW_DISPLAY_MODE,
  onDisplayModeChange,
}: ImageViewDisplayModeMenuProps) {
  function handleRadioValueChange(value: unknown) {
    if (!isImageViewDisplayMode(value)) return

    onDisplayModeChange(value)
  }

  return (
    <ActionMenu
      ariaLabel="切换图片展示模式"
      items={IMAGE_VIEW_DISPLAY_MODE_ITEMS}
      radioGroupProps={{
        value: displayMode,
        onValueChange: handleRadioValueChange,
      }}
      triggerProps={{
        render: (
          <GlassIconButton
            aria-label="切换图片展示模式"
            className="image-view__mode-trigger"
            type="button"
          >
            {getImageViewDisplayModeIcon(displayMode)}
          </GlassIconButton>
        ),
      }}
    />
  )
}

export function ImageView({
  alt = DEFAULT_IMAGE_VIEW_ALT,
  className,
  displayMode,
  imageHeight,
  imageRef,
  imageWidth,
  objectFit = 'contain',
  onDoubleClick,
  onLostPointerCapture,
  onPointerCancel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  open,
  placeholder = DEFAULT_IMAGE_VIEW_PLACEHOLDER,
  src,
  style,
  ...props
}: ImageViewProps) {
  const [detailDisplayMode, setDetailDisplayMode] = useState<ImageViewDisplayMode>(DEFAULT_IMAGE_VIEW_DISPLAY_MODE)
  const [detailOpenSrc, setDetailOpenSrc] = useState<string | null>(null)
  const [imageLoadFailedSrc, setImageLoadFailedSrc] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<ImageViewDragState | null>(null)
  const imageLoadFailed = Boolean(src && imageLoadFailedSrc === src)
  const explicitImageAspectRatio = imageWidth && imageHeight ? `${imageWidth} / ${imageHeight}` : undefined
  const canRenderImage = Boolean(src && !imageLoadFailed && (displayMode || explicitImageAspectRatio))
  const imageViewStyle: ImageViewStyle | undefined = explicitImageAspectRatio
    ? { ...style, '--image-view-aspect-ratio': explicitImageAspectRatio }
    : style
  const detailOpen = Boolean(src && detailOpenSrc === src)
  const canOpenDetail = Boolean(canRenderImage && !displayMode && src)

  useEffect(() => {
    dragRef.current = null
    setIsDragging(false)
  }, [src])

  useEffect(() => {
    if (open) return

    dragRef.current = null
    setIsDragging(false)
  }, [open])

  function openImageDetailDialog() {
    if (!canOpenDetail) return

    setDetailOpenSrc(src ?? null)
  }

  function handleImageDetailOpenChange(open: boolean) {
    setDetailOpenSrc(open ? src ?? null : null)
  }

  function handleDoubleClick(event: MouseEvent<HTMLElement>) {
    onDoubleClick?.(event)
    if (event.defaultPrevented) return
    if (!(event.target instanceof HTMLImageElement)) return

    openImageDetailDialog()
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLElement>) {
    onPointerDown?.(event)
    if (event.defaultPrevented) return
    if (!displayMode) return
    if (event.button !== 0) return
    if (!canDragImageView(event.currentTarget)) return

    dragRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      scrollLeft: event.currentTarget.scrollLeft,
      scrollTop: event.currentTarget.scrollTop,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    setIsDragging(true)
    event.preventDefault()
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    onPointerMove?.(event)
    if (event.defaultPrevented) return

    const drag = dragRef.current
    if (!drag || event.pointerId !== drag.pointerId) return

    event.currentTarget.scrollLeft = drag.scrollLeft - (event.clientX - drag.clientX)
    event.currentTarget.scrollTop = drag.scrollTop - (event.clientY - drag.clientY)
    event.preventDefault()
  }

  function stopDrag(event: ReactPointerEvent<HTMLElement>) {
    const drag = dragRef.current
    if (!drag || event.pointerId !== drag.pointerId) return

    if (event.currentTarget.hasPointerCapture(drag.pointerId)) {
      event.currentTarget.releasePointerCapture(drag.pointerId)
    }
    dragRef.current = null
    setIsDragging(false)
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLElement>) {
    onPointerUp?.(event)
    stopDrag(event)
  }

  function handlePointerCancel(event: ReactPointerEvent<HTMLElement>) {
    onPointerCancel?.(event)
    stopDrag(event)
  }

  function handleLostPointerCapture(event: ReactPointerEvent<HTMLElement>) {
    onLostPointerCapture?.(event)
    stopDrag(event)
  }

  return (
    <>
      <figure
        {...props}
        className={cn('image-view', className)}
        data-display-mode={displayMode}
        data-dragging={isDragging ? 'true' : undefined}
        data-object-fit={objectFit}
        onDoubleClick={handleDoubleClick}
        onLostPointerCapture={handleLostPointerCapture}
        onPointerCancel={handlePointerCancel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={imageViewStyle}
      >
        {canRenderImage ? (
          <img
            alt={alt}
            className="image-view__image"
            draggable={displayMode ? false : undefined}
            height={imageHeight}
            onError={() => setImageLoadFailedSrc(src ?? null)}
            ref={(node) => setImageViewRef(imageRef, node)}
            src={src}
            width={imageWidth}
          />
        ) : (
          <div className="image-view__placeholder" role="note">
            {src && imageLoadFailed ? nonImageMessage(src) : placeholder}
          </div>
        )}
      </figure>
      {canOpenDetail ? (
        <ActionDialog
          className="image-view__detail-dialog"
          open={detailOpen}
          onOpenChange={handleImageDetailOpenChange}
          toolbarRightSlot={
            <ImageViewDisplayModeMenu
              displayMode={detailDisplayMode}
              onDisplayModeChange={setDetailDisplayMode}
            />
          }
          title={alt || DEFAULT_IMAGE_VIEW_DETAIL_TITLE}
          titleClassName="image-view__detail-title"
        >
          <ImageView
            alt={alt}
            className="image-view__detail"
            displayMode={detailDisplayMode}
            imageHeight={imageHeight}
            imageWidth={imageWidth}
            open={detailOpen}
            src={src}
          />
        </ActionDialog>
      ) : null}
    </>
  )
}
