import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { ComponentPreviewCard, type ComponentPreviewCardItem } from '../components/component-preview-card'
import { Slider } from '../components/slider'
import {
  getGlassPreviewBackground,
  glassBackgroundGrayDark,
  glassBackgroundGrayLight,
  glassBackgroundGrayMidpoint,
} from './glass-preview'

// Surface 页「磨砂材质」卡、按钮页「磨砂图标按钮」卡与背景页「背景模糊度」卡的公共外壳：
// ComponentPreviewCard + 可滑动竖条纹玻璃背景 + 画布下方居中的灰度滑块。
// action 渲染在标题栏右侧（如按钮页的启用 Switch）；
// token/value/items 透传给 token 行（不传则无行，与 ComponentPreviewCard 语义一致）。
export function GlassPreviewCard({
  action,
  children,
  className,
  items,
  label,
  token,
  value,
}: {
  action?: ReactNode
  children: ReactNode
  className?: string
  items?: readonly ComponentPreviewCardItem[]
  label: ReactNode
  token?: string
  value?: ReactNode
}) {
  // 刷新与主题切换后的起始灰度统一为轨道中点:亮暗主题从同一点出发。
  const [glassBackgroundGray, setGlassBackgroundGray] = useState(glassBackgroundGrayMidpoint)

  // 主题切换后滑块归位到轨道中点。手动切换与跟随系统最终都写 <html> 的 .dark
  // class,观察该 class 变化即可覆盖两条路径;setState 只在观察者回调里异步执行。
  useEffect(() => {
    const syncThemeMidpoint = () => {
      setGlassBackgroundGray(glassBackgroundGrayMidpoint)
    }
    const themeObserver = new MutationObserver(syncThemeMidpoint)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => themeObserver.disconnect()
  }, [])

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
