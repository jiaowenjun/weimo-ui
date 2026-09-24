import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { ComponentPreviewCard } from '../components/component-preview-card'
import { cn } from '../components/lib/utils'
import { Slider } from '../components/slider'
import {
  getGlassPreviewBackground,
  glassBackgroundGrayDark,
  glassBackgroundGrayLight,
} from './glass-preview'

// Surface 页「玻璃材质」卡与按钮页「玻璃图标按钮」卡的公共外壳：
// ComponentPreviewCard + 标题栏灰度滑块 + 可滑动竖条纹玻璃背景。
// action 放在滑块右侧（如按钮页的启用 Switch）；canvasClassName 附加到条纹
// 画布上（Surface 页用它定高 180px）。
export function GlassPreviewCard({
  action,
  canvasClassName,
  children,
  label,
}: {
  action?: ReactNode
  canvasClassName?: string
  children: ReactNode
  label: ReactNode
}) {
  // 刷新时的初始灰度跟随页面主题：亮色落在亮卡底端点，暗色落在暗卡底端点。
  // docs-shell 首次挂载前 .dark class 尚未写入（useEffect 时序），直接按 system
  // 偏好预判，与 shell 挂载后的主题一致。
  const [glassBackgroundGray, setGlassBackgroundGray] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? glassBackgroundGrayDark
      : glassBackgroundGrayLight,
  )

  // 主题切换后滑块自动归位：亮色主题回到亮卡底端点（滑块右端），暗色主题回到暗
  // 卡底端点（左端）。手动切换与跟随系统最终都写 <html> 的 .dark class，观察该
  // class 变化即可覆盖两条路径；setState 只在观察者回调里异步执行。
  useEffect(() => {
    const syncThemeEndpoint = () => {
      setGlassBackgroundGray(
        document.documentElement.classList.contains('dark')
          ? glassBackgroundGrayDark
          : glassBackgroundGrayLight,
      )
    }
    const themeObserver = new MutationObserver(syncThemeEndpoint)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => themeObserver.disconnect()
  }, [])

  return (
    <ComponentPreviewCard
      action={
        <>
          <Slider
            ariaLabel="背景灰度"
            max={glassBackgroundGrayLight}
            min={glassBackgroundGrayDark}
            onValueChange={setGlassBackgroundGray}
            value={glassBackgroundGray}
          />
          {action}
        </>
      }
      label={label}
    >
      <div
        className={cn('glass-preview-card__canvas', canvasClassName)}
        style={getGlassPreviewBackground(glassBackgroundGray)}
      >
        {children}
      </div>
    </ComponentPreviewCard>
  )
}
