import { useState } from 'react'
import { Check, Clipboard, FileImage, X } from 'lucide-react'

import { CanvasTransparency } from '../../components/canvas-transparency'
import { ComponentPreviewCard } from '../../components/component-preview-card'
import { GlassIconButton } from '../../components/glass-icon-button'
import { ImageUploader, type ImageUploaderActionApi } from '../../components/image-uploader'
import { ImageView, ImageViewDisplayModeMenu, type ImageViewDisplayMode } from '../../components/image-view'
import type { ComponentDefinition } from '../component-docs'

const sampleImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAoAAAAHgCAYAAAA10dzkAAAN5klEQVR42u3dwQlCMRBF0d+FCJZk41ZgAwmDW1cignbgyp84mXPgNpCFPhDG7fF8vSVJklSnzSNIkiQZgJIkSTIAJUmSZABKkiTJAJQkSZIBKEmSJANQkiRJBqAkSZIMQEmSJBmAkiRJMgAlSZJkAEqSJMkAlCRJkgEoSZJkAEqSJMkAlCRJkgEoSZIkA1CSJEkGoCRJkgxASZIkGYCSJEkyACVJkmQASpIkyQCUJEmSAShJkiQDUJIkSQagJEmSDEBJkiQDUJIkSQagJEmSDEBJkiQZgJIkSTIAJUmSZABKkiTJAJQkSZIBKEmSJANQkiRJBqAkSZIMQEmSJBmAkiRJMgAlSZIMQEmSJBmAkiRJMgAlSZJkAEqSJMkAlCRJkgEoSZIkA1CSJEkGoCRJkgxASZIkGYCSJEkyACVJkmQASpIkyQCUJEmSAShJkmQAKm0AMILvXANQhh4AGIYGoIw+AIxB390GoAw/AAxBGYAy/gAwAmUAyvgDwAiUAWj4AYAhKAPQ+AMAI1AGoAEIAAagDEDjDwCMQBmAxh8AGIEyAI0/ADACDUAZgABgABqAMv4AwAg0AGUAAoABaADKAAQAA9AAlPEHAEagASgDEAAMQAPQAAQAbAMD0AAEAANQBqABCAAGoAxAAxAADEAZgMYfABiBMgANQAAwAGUAGoAAYADKADQAAcAANABlAAKAAWgAygAEAAPQAJQBCAAGoAEoAxAADEADUAYgABiABqABCAAYgAagAQgABqAMQAMQAAxAGYAGIAAYgDIADUAAMABlABqAAGAAygA0AAHAAJQBaAACgAFoAMoABAAD0ACUAQgABqABKAMQAAxAA1AGIAAYgAagDEAAMAANQBmAAGAAGoAGIABgABqABiAAGIAyAA1AADAAZQAagCOdjgdptwAMQAPQADT8ZAgCBqAMQAPQ+JMRCBiAMgANQANQBiBgAMoANACNPxmBgAEoA9AANABlAAIGoAxAA9AAlAEIGIAyAA1AA1AGIGAAGoAyAI0QGYCAAWgAygCUDEDAADQAZQBKBiBgABqAMgAlAxAwAA1AOQQtGX+AAWgAygCUDEDAADQADUAjUAKwEQxAA9AQlOEHGIAyAA1AADAAZQAagABgAMoANAABwACUAWgAAoABKAPQAAQAA9AA9BAGIAAYgAagDEAAMAANQBmAAGAAGoByCFoOHwMYgAag/BWcDEEAA9AAVLYBaKAZgQAGoAEoA1AGIIABaABq1QFomBmBAAagASgDUAYggAFoAMpPwDL+AAxAA1AGoAxAAAPQAJQzMDL+AAxAA1AOQRt+ABiABqABCAAYgAagAQgABqAMQAMQAAxAGYAGIAAYgDIADUAAMABlABqAAGAAygA0AAHAADQAPYIBCAAGoAEoAxAADEADUAYgABiABqAMQAAwAA1AGYAAYAAagDIAAcAANAANQADAADQADUAAMABlABqAAGAAygA0AAHAAJQBaAACgAEoA9AABAADUAagAQgABqAMQAMQAAxAA1AGIAAYgAagDEAAMAANQBmAAGAAGoAyAAHAADQAZQACgAFoAMoABAAD0AA0AAEAA9AANAABwACUAWgAAoABKAPQAAQAA1AGoAEIAAagDEADEAAMQBmABiAAGIAyAA1AADAADUAZgABgABqAMgCvcZOkFGEAygA0AI0+ScYgBqAMQAPQ+JNkBGIAGoAewgA0/iQZgRiABqAMQEkyADEADUAZgJJkAGIAGoAyACXJAMQANABlAEqSAYgBaADKAJQkAxAD0AA0AI1ASTL+MAANQAPQCJQk488AlAFoABqDkmT0GYAyAA1AADAAZQAagABgAMoANAABwACUAWgAAoABKAPQAAQAA9AAlAEIAAagASgDEAAMQANQBiAAGIAGoAxAADAADUAZgABgABqAMgABwAA0AA1AAMAANAANQAAwAGUAGoAAYADKADQAAcAAlAFoAAKAASgD0AAEAANQBqABCAAGoAHoEQxAADAADUAZgABgABqAqjwAozdJUqIMQBmABqDRJ0nGoAEoA9AANP4kyQg0AA1AGYAGoCQZgAagASgDUJJkABqABqAMQEmSAWgAGoAyACVJBqABaADKAJQkGYAGoAEoZ2AkScafAWgAGoAOQUuSHII2AA1AAxAAqrIRDEADEAAMQBmABiAAGIAyAA1AADAAZQAagABgAMoANAABwACUAWgAAoABaAB6CAMQAAxAA1AGIAAYgAagDEAAMAANQBmAAGAAGoAyAAHAADQAZQACgAFoABqAAIABaAAagABgAMoANAABwACUAWgAzhC9SZK+hAFoAGqJAegDXZKMQQPQAFShAegDXJKMQAPQAJQBKEkyAA1AA1AGoCTJADQADUAZgJIkA9AANABlAEqSAYgBaAAagAagJBmAGIAGoAFoBEqS8WcA2ggGoAFoDEqS0WcAygA0AAHAAJQBaAACgAEoA9AABAADUAagAQgABqAMQAMQAAxAA1AGIAAYgAagDEAAMAANQBmAAGAAGoAyAAHAADQAZQACgAFoAMoABAAD0AA0AAEAA9AANAABwACUAWgAAoABKAPQAAQAA1AGoAEIAAagDEAD8JeiN0kaEgagDEAD0OiTZAxiAMoANACNP0lGIAagDEAD0ACUZABiAMoANAANQEkGIAagDEAD0ACUZABiAMoANAANQEkGIAagASgD0ACUZABiABqAcgZGkow/DEADUA5BS5LRhwFoAMpfwQGAAWgAygAEAAPQAJQBCAAGoAFoAAIABqABaAACgAEoA9AABAADUAagAQgABqAMQAMQAAxAGYAGIAAYgDIADUAAMAANQI9gAAKAAWgAygAEAAPQAJQBCAAGoAEoAxAADEADUAYgABiABqAMQAAwAA1AAxAAMAANQAMQAAxAGYAGIAAYgDIADUAAMABlABqAAGAAygA0AAHAAJQBaAACgAEoA9AABAAD0ACUAQgABqABKAMQAAxAA1AGIAAYgAagDEAAMAANQBmAAGAAGoAyAAHAADQADUAAwAA0AA1AADAAZQAagABgAMoANAABwACUAWgAAoABKAPQAAQAA1AGoAEIAAagDEADEAAMQANQBiAAGIAGoAxAADAADUAZgABgABqAMgABwAA0AGUAAoABaAAagACAAWgAGoAAYADaCAagAQgABqAMQANwrvvlrIUCMAANQA9hABp9xiCAAWgAqvoANIyMQAAD0ABUoQFoEBmBAAagASgDUAYggAFoAMoAlAEIYAAagDIAZQACGIAGoAxAGYAABqABaAAagDIAAQxAA9AANAJl/AEGoI1gABqARqCMP8AAlAFoABqDMvoAA1AGoAEIAAagDEADEAAMQBmABiAAGIAyAA1AADAADUAZgABgABqAMgABwAA0AGUAAoABaADKAAQAA9AAlAEIAAagASgDEAAMQAPQAAQADEAD0AAEAANQBqABCAAGoAxAAxAADEAZgAYgABiAMgANQAAwAGUAGoAAYADKADQAAcAANABlAAKAAWgAygAEAAPQAJQBCAAGoAEoAxAADEADUMsMwOhNkrRjGIAGoAFo9EmSMWgAygA0AI0/STICDUAZgAagAShJBqABKAPQADQAJckANABlABqABqAkGYAGoAxAA9AAlCQD0AA0AD2CAWgASpIBaAAagHIGxgewJBl/BqABKIegJUlGnwFoAMpfwQGAAWgAygAEAAPQAJQBCAAGoAFoAAIABqABaAACgAEoA9AABAADUAagAQgABqAMQAMQAAxAGYAGIAAYgDIADUAAMABlABqAAGAAGoAyAAHAADQAZQACgAFoAMoABAAD0ACUAQgABqABKAMQAAxAA1B5B2D0JmlyYADKADQAjT7JGAQDUAagAWj8SUYgGIAyAA1AA1AyAMEAlAFoABqAkgEIBqAMQAPQAJQMQDAADUAZgL5cJQMQDEADUAagJAMQDEADUM7ASDL+wAA0AOUQtCSjDwxAA1D+Cg4ADEAD0AAEAAxAA9AABAADUAagAQgABqAMQAMQAAxAGYAGIAAYgDIADUAAMABlABqAAGAAygA0AAHAADQAZQACgAFoAMoABAAD0ACUAQgABqABKAMQAAxAA1AGIAAYgAagDEAAMAANQAMQADAADUADEAAMQBmABiAAGIAyAI1AADD+ZAAagABgAMoANAABwACUAWgAAoABKAPQAAQAA9AAlAEIAAagASgjEACMPwNQBiAAGIAGoAxAADAADUAZgQBg/BmAMgABwAA0AI1AADD+ZAAagQBg/MkANAIBwPiTAWgAAoABKAPQCAQA408GoCEIAIafDEAjEACMPwNQRiAAGH8GoAxBADD8DEAZgwBg9BmAMgwBMPRkAEqSJMkAlCRJkgEoSZIkA1CSJEkGoCRJkgxASZIkGYCSJEkyACVJkmQASpIkyQCUJEkyACVJkmQASpIkyQCUJEmSAShJkiQDUJIkSQagJEmSDEBJkiQZgJIkSTIAJUmSZABKkiTJAJQkSZIBKEmSJANQkiTJAPQIkiRJBqAkSZIMQEmSJBmAkiRJMgAlSZJkAEqSJMkAlCRJkgEoSZIkA1CSJEkGoCRJkgxASZIkGYCSJEkyACVJkmQASpIkGYCSJEkyACVJkmQASpIkyQCUJEmSAShJkiQDUJIkSQagJEmSDEBJkiQZgJIkSTIAJUmSZABKkiTJAJQkSZIBKEmSJANQkiTJAJQkSZIBKEmSJANQkiRJBqAkSZIMQEmSJP1dH6TkZ+wC3yjIAAAAAElFTkSuQmCC'
const nonImageSource =
  'data:text/plain;charset=utf-8,' +
  encodeURIComponent('This document is not an image.')

function ImageViewPreview() {
  const [displayMode, setDisplayMode] = useState<ImageViewDisplayMode>('fit-width')

  return (
    <ComponentPreviewCard label="图片视图">
      <div className="image-view-docs-preview">
        <ImageView
          alt="OCR source document preview"
          imageHeight={480}
          imageWidth={640}
          src={sampleImage}
        />
        <ImageView
          alt="Not an image preview"
          imageHeight={1}
          imageWidth={1}
          src={nonImageSource}
        />
        <ImageView placeholder="等待上传或识别图片" />
        <div className="image-view-docs-preview__detail-shell">
          <div className="image-view-docs-preview__detail-toolbar">
            <ImageViewDisplayModeMenu
              displayMode={displayMode}
              onDisplayModeChange={setDisplayMode}
            />
          </div>
          <ImageView
            alt="OCR source document detail"
            className="image-view-docs-preview__detail"
            displayMode={displayMode}
            open
            src={sampleImage}
          />
        </div>
      </div>
    </ComponentPreviewCard>
  )
}

function ImageUploaderPreview() {
  const [file, setFile] = useState<File | null>(null)
  const [actions, setActions] = useState<ImageUploaderActionApi | null>(null)

  return (
    <ComponentPreviewCard label="图片上传">
      <div className="image-uploader-docs-preview">
        <ImageUploader
          aria-label="图片上传区域预览"
          file={file}
          onActionsChange={setActions}
          onCheck={() => {}}
          onFileChange={setFile}
        />
        <span className="image-uploader-docs-preview__actions">
          {!actions?.hasFile ? (
            <>
              <GlassIconButton
                aria-label="选择文件"
                onClick={() => actions?.select()}
              >
                <FileImage aria-hidden="true" />
              </GlassIconButton>
              <GlassIconButton
                aria-label="粘贴图片"
                disabled={!actions?.canPasteClipboardImage}
                onClick={() => actions?.paste()}
              >
                <Clipboard aria-hidden="true" />
              </GlassIconButton>
            </>
          ) : (
            <>
              <GlassIconButton
                aria-label="清除图片"
                onClick={() => actions?.close()}
              >
                <X aria-hidden="true" />
              </GlassIconButton>
              <GlassIconButton
                aria-label="确认图片"
                disabled={!actions?.canCheck}
                onClick={() => actions?.check()}
              >
                <Check aria-hidden="true" />
              </GlassIconButton>
            </>
          )}
        </span>
      </div>
    </ComponentPreviewCard>
  )
}

const sampleGeometry = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 240">
    <rect width="360" height="240" fill="#fff" />
    <g fill="none" stroke="#111" stroke-width="4">
      <ellipse cx="180" cy="120" rx="130" ry="76" />
      <path d="M50 120h260M180 44v152M92 65l176 110" />
    </g>
    <g fill="#111" font-family="sans-serif" font-size="18">
      <text x="316" y="126">x</text>
      <text x="187" y="39">y</text>
    </g>
  </svg>
`)}`

// eslint-disable-next-line react-refresh/only-export-components
function CanvasTransparencyDemo() {
  return (
    <ComponentPreviewCard label="画布透明化">
      <div className="canvas-transparency-docs-preview">
        <CanvasTransparency
          alt="几何图透明化结果"
          src={sampleGeometry}
        />
      </div>
    </ComponentPreviewCard>
  )
}

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function ImageDemo() {
  return (
    <>
      <ImageViewPreview />
      <ImageUploaderPreview />
      <CanvasTransparencyDemo />
    </>
  )
}

export const imageDefinition = {
  id: 'image',
  summary: '图片视图、图片上传与画布透明化的图片总览',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'ImageView',
    'ImageUploader',
    'CanvasTransparency',
    '图片视图',
    '图片上传',
    '画布透明化',
  ],
  preview: () => <ImageDemo />,
} satisfies ComponentDefinition
