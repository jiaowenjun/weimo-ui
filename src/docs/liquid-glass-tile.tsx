import type { ReactNode } from 'react'

import { useFrostedSurfaceBackgroundToneRef } from '../components/frosted-surface'

// 液态玻璃示例的内容(文字/图标色)借磨砂材质的 tone 采样自适应明暗(与磨砂
// 材质卡同一机制与翻转阈值):容器持有 data-background-tone,背景转亮时翻深、
// 背景转暗时维持浅色。液态玻璃材质层本身不参与自适应。
export function LiquidGlassTile({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const { backgroundTone, setElementRef } =
    useFrostedSurfaceBackgroundToneRef<HTMLDivElement>(true)

  return (
    <div
      className={className}
      data-background-tone={backgroundTone ?? undefined}
      ref={setElementRef}
    >
      {children}
    </div>
  )
}
