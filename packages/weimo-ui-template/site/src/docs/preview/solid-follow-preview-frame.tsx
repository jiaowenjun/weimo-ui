import { useLayoutEffect, useRef, useState } from 'react'

import './solid-follow-preview-frame.css'

type SolidFollowPreviewFrameProps = {
  height?: number
  maxLayoutWidth: number
  onAvailableWidthChange?: (availableWidth: number) => void
  percent: number
  resizing?: boolean
  src: string
  title: string
}

/** 实底跟随预览壳:百分比视觉宽 + 固定倍率派生布局宽;测量外壳透明,
    黑色背景与圆角由宽度受控的 stage 自持,预览区连同底色全程 1:1
    跟随滑块。缩放比例恒为 BASE_WIDTH ÷ maxLayoutWidth,任何卡片宽度
    下不变;卡片装不下基准时右端点对应的布局宽动态收紧(100% 档
    视觉恰好满卡),断点位置随之上移。 */

/* 固定缩放基准:100% 档视觉宽的上限,与演示卡内容最大宽度 token 对应
   (700px − 卡片 padding/边框 ≈ 672);卡片达上限时预览正好满卡 */
const BASE_WIDTH = 672
export function SolidFollowPreviewFrame({
  height = 430,
  maxLayoutWidth,
  onAvailableWidthChange,
  percent,
  resizing = false,
  src,
  title,
}: SolidFollowPreviewFrameProps) {
  const [loaded, setLoaded] = useState(false)
  const [available, setAvailable] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  // 回调经 ref 持有,测量 effect 不因回调引用变化而重挂
  const onAvailableWidthChangeRef = useRef(onAvailableWidthChange)
  onAvailableWidthChangeRef.current = onAvailableWidthChange

  /* 可用宽只随容器与窗口尺寸变化:layout effect 里同步量测并监听 resize
     即可,不走 ResizeObserver——其回调依赖渲染帧,在部分嵌入浏览器环境
     里不会投递。 */
  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return

    const syncAvailable = () => {
      setAvailable(element.clientWidth)
      onAvailableWidthChangeRef.current?.(element.clientWidth)
    }

    syncAvailable()
    window.addEventListener('resize', syncAvailable)
    return () => window.removeEventListener('resize', syncAvailable)
  }, [])

  const ratio = Math.min(percent, 100) / 100
  /* 缩放比例恒定(倍率固定,100% 档满基准卡);卡片装不下基准时动态收紧
     右端点对应的布局宽——100% 档视觉恰好满卡,画面大小不随卡片缩放,
     代价是窄卡下断点位置随之上移、右端点布局宽低于 1100 */
  const zoomFactor = maxLayoutWidth / BASE_WIDTH
  const scale = 1 / zoomFactor
  const effectiveMaxLayoutWidth =
    available > 0
      ? Math.min(maxLayoutWidth, Math.floor(available * zoomFactor))
      : maxLayoutWidth
  const layoutWidth = ratio * effectiveMaxLayoutWidth
  const visualWidth = layoutWidth * scale
  // 视觉高恒为 height,iframe 布局高按同一倍率放大,内部 100svh 随布局高取值
  const layoutHeight = height * zoomFactor

  return (
    <div
      className={
        resizing
          ? 'solid-follow-preview-frame solid-follow-preview-frame--resizing'
          : 'solid-follow-preview-frame'
      }
      ref={containerRef}
      style={{ height }}
    >
      <div
        className="solid-follow-preview-frame__stage"
        style={{ width: visualWidth }}
      >
        <iframe
          className={
            loaded
              ? 'solid-follow-preview-frame__iframe solid-follow-preview-frame__iframe--loaded'
              : 'solid-follow-preview-frame__iframe'
          }
          onLoad={() => setLoaded(true)}
          src={src}
          style={{
            height: layoutHeight,
            transform: `scale(${scale})`,
            width: layoutWidth,
          }}
          title={title}
        />
      </div>
    </div>
  )
}
