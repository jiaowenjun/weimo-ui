import type { HTMLAttributes, ReactNode } from 'react'

import { useFrostedSurfaceBackgroundToneRef } from './frosted-surface'
import { LiquidGlassSurface } from './liquid-glass'
import { cn } from 'weimo-ui-core/lib/utils'

import './glass-label.css'

export type GlassLabelSize = 'sm' | 'lg'

export type GlassLabelProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  children: ReactNode
  /** 字号档:sm 用于工具栏栏位标题,lg(粗体 600)用于页面标题。 */
  size?: GlassLabelSize
}

// 液态玻璃标题标签:非交互的展示胶囊,玻璃层(LiquidGlassSurface)绝对居中
// 覆盖,隐藏 sizer 复刻文字与内边距撑盒宽(与 CapsuleButton 液态玻璃态同构);
// 文字色随自身 tone 采样自适应,浮动/顶部工具栏用它展示栏位与页面标题。
export function GlassLabel({
  children,
  className,
  size = 'sm',
  style,
  ...props
}: GlassLabelProps) {
  const { backgroundTone, setElementRef } =
    useFrostedSurfaceBackgroundToneRef<HTMLSpanElement>(true)

  return (
    <span
      className={cn('glass-label', `glass-label--${size}`, className)}
      data-background-tone={backgroundTone ?? undefined}
      ref={setElementRef}
      style={style}
      {...props}
    >
      <LiquidGlassSurface
        className="glass-label__liquid-glass-layer"
        cornerRadius={999}
        padding="6px 10px"
      >
        <span className="glass-label__text">{children}</span>
      </LiquidGlassSurface>
      <span aria-hidden="true" className="glass-label__sizer">
        {children}
      </span>
    </span>
  )
}
