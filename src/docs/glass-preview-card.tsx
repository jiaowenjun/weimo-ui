import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { ComponentPreviewCard, type ComponentPreviewCardItem } from '../components/component-preview-card'
import { Slider } from '../components/slider'
import {
  getGlassPreviewBackground,
  glassBackgroundGrayDark,
  glassBackgroundGrayLight,
} from './glass-preview'

// Surface 页「磨砂材质」卡、按钮页「磨砂图标按钮」卡与背景页「背景模糊度」卡的公共外壳：
// ComponentPreviewCard + 可滑动竖条纹玻璃背景 + 画布下方居中的灰度滑块。
// action 渲染在标题栏右侧（如按钮页的启用 Switch）；
// token/value/items 透传给 token 行（不传则无行，与 ComponentPreviewCard 语义一致）。
// initialGray 指定刷新与主题切换后的固定起始灰度（如轨道中点）；不传则跟随主题端点。
export function GlassPreviewCard({
  action,
  children,
  className,
  initialGray,
  items,
  label,
  token,
  value,
}: {
  action?: ReactNode
  children: ReactNode
  className?: string
  initialGray?: number
  items?: readonly ComponentPreviewCardItem[]
  label: ReactNode
  token?: string
  value?: ReactNode
}) {
  // 刷新时的初始灰度：默认跟随页面主题（亮色落在亮卡底端点，暗色落在暗卡底端点）。
  // docs-shell 首次挂载前 .dark class 尚未写入（useEffect 时序），直接按 system
  // 偏好预判，与 shell 挂载后的主题一致；调用方传 initialGray 时两主题同一起点。
  const [glassBackgroundGray, setGlassBackgroundGray] = useState(() =>
    initialGray ??
    (typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? glassBackgroundGrayDark
      : glassBackgroundGrayLight),
  )

  // 主题切换后滑块自动归位：默认回到当前主题的卡片底端点，initialGray 则回到该固定
  // 起点。手动切换与跟随系统最终都写 <html> 的 .dark class，观察该 class 变化即可
  // 覆盖两条路径；setState 只在观察者回调里异步执行。
  useEffect(() => {
    const syncThemeEndpoint = () => {
      setGlassBackgroundGray(
        initialGray ??
          (document.documentElement.classList.contains('dark')
            ? glassBackgroundGrayDark
            : glassBackgroundGrayLight),
      )
    }
    const themeObserver = new MutationObserver(syncThemeEndpoint)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => themeObserver.disconnect()
  }, [initialGray])

  return (
    <ComponentPreviewCard
      action={action}
      className={className}
      footer={
        <div className="glass-preview-card__slider-row">
          <Slider
            ariaLabel="背景灰度"
            max={glassBackgroundGrayLight}
            min={glassBackgroundGrayDark}
            onValueChange={setGlassBackgroundGray}
            value={glassBackgroundGray}
          />
        </div>
      }
      items={items}
      label={label}
      token={token}
      value={value}
    >
      <div
        className="glass-preview-card__canvas"
        style={getGlassPreviewBackground(glassBackgroundGray)}
      >
        {children}
      </div>
    </ComponentPreviewCard>
  )
}
