import { useEffect, useId } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import LiquidGlass from 'liquid-glass-react'

import { cn } from './lib/utils'

// LiquidGlass 渲染玻璃层与多层高光/投影覆盖层等一组兄弟节点,自身不占布局;
// 这里统一按库的预期用法以「绝对定位 + 外层容器中点」摆放,调用方只需提供
// 一个 position: relative 的定尺寸容器,各层就会对齐容器中心叠放。
// width: max-content 必须显式给:只设 left 的绝对定位元素 shrink-to-fit 时
// 可用宽度只剩容器宽减 left 偏移,长内容会被压成竖排。
// 效果参数全部透传,未传时沿用库默认(位移 70、磨砂 0.0625、饱和 140、
// 色差 2、弹性 0.15、全胶囊圆角)。
export type LiquidGlassSurfaceProps = {
  children: ReactNode
  /** 位移贴图折射强度(px 尺度) */
  displacementScale?: number
  /** 磨砂强度,叠加在材质基础 backdrop 模糊之上 */
  blurAmount?: number
  /** 折射后背景的饱和度(%) */
  saturation?: number
  /** 边缘色差强度 */
  aberrationIntensity?: number
  /** 指针接近时的液态弹性,0 为刚性 */
  elasticity?: number
  /** 圆角(px),999 为全胶囊 */
  cornerRadius?: number
  /** 亮背景变体:更重的磨砂与投影 */
  overLight?: boolean
  /** 玻璃层内边距,决定玻璃随内容的包裹尺寸 */
  padding?: string
  /** 监听宿主背景变化并强制玻璃重采样,默认开启 */
  observe?: boolean
  /** 点击回调;传入后启用库的悬停辉光与按压缩放反馈 */
  onClick?: () => void
  className?: string
  style?: CSSProperties
}

// Chromium 的 backdrop-filter 采样在「只有背景元素的内联样式变化」时会滞留:
// 滑块改画布灰度时玻璃停留在旧快照,直到玻璃层自身发生一次样式提交才刷新。
// 与 FrostedSurface 的 MutationObserver 同思路——观察宿主样式变化,在玻璃外层
// 写入一次视觉恒等的 translate 抖动强制重采样。
// 只能观察「祖先链」的 class/style 属性,不能 subtree 全观察:抖动写在玻璃
// 自身 subtree(对祖先观察不可见),否则自身/兄弟玻璃实例的写入会互相触发,
// 同步回调下形成微任务乒乓循环把渲染线程卡死。
function useLiquidGlassBackdropResample(instanceClass: string, observe: boolean) {
  useEffect(() => {
    const ownerDocument = document
    const ownerWindow = ownerDocument.defaultView
    const root = ownerDocument.querySelector<HTMLElement>(`.${instanceClass}`)

    if (!observe || !ownerWindow || !root || !('MutationObserver' in ownerWindow)) {
      return undefined
    }

    // 交替写入而不是比对序列化值:浏览器会把 '0 0.001px' 规范化成
    // '0px 0.001px',字符串比较永远不成立,重复写同值不再产生失效。
    // 同步执行(不走 rAF)让抖动与宿主背景变化落进同一帧,后台标签页
    // 的 rAF 节流也不会吞掉重采样。
    const resample = () => {
      const nudged = root.dataset.liquidGlassResample === '1'
      root.dataset.liquidGlassResample = nudged ? '0' : '1'
      root.style.translate = nudged ? '' : '0 0.001px'
    }

    const observer = new ownerWindow.MutationObserver(resample)
    const observerOptions: MutationObserverInit = {
      attributeFilter: ['class', 'style'],
      attributes: true,
    }

    for (
      let ancestor = root.parentElement;
      ancestor;
      ancestor = ancestor.parentElement
    ) {
      observer.observe(ancestor, observerOptions)
    }

    return () => {
      observer.disconnect()
    }
  }, [instanceClass, observe])
}

export function LiquidGlassSurface({
  aberrationIntensity,
  blurAmount,
  children,
  className,
  cornerRadius,
  displacementScale,
  elasticity,
  observe = true,
  onClick,
  overLight,
  padding,
  saturation,
  style,
}: LiquidGlassSurfaceProps) {
  // useId 含 «» 等字符,清洗成纯字母数字才能放进 class 名;实例计数器保证唯一。
  const instanceClass = `liquid-glass-${useId().replace(/[^a-zA-Z0-9]/g, '')}`

  useLiquidGlassBackdropResample(instanceClass, observe)

  return (
    <LiquidGlass
      aberrationIntensity={aberrationIntensity}
      blurAmount={blurAmount}
      className={cn('liquid-glass', instanceClass, className)}
      cornerRadius={cornerRadius}
      displacementScale={displacementScale}
      elasticity={elasticity}
      onClick={onClick}
      overLight={overLight}
      padding={padding}
      saturation={saturation}
      style={{ left: '50%', position: 'absolute', top: '50%', width: 'max-content', ...style }}
    >
      {children}
    </LiquidGlass>
  )
}
