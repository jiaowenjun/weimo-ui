import { useEffect, useState } from 'react'

import { CardSurface } from '../../components/card-surface'
import { GlassSurface } from '../../components/glass-surface'
import { PopupSurface } from '../../components/popup-surface'
import { ComponentPreviewCard } from '../../components/component-preview-card'
import type { ComponentDefinition } from '../component-docs'
import {
  getGlassPreviewBackground,
  glassBackgroundGrayDark,
  glassBackgroundGrayLight,
} from '../glass-preview'
import { GraySlider } from '../gray-slider'

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function SurfaceDemo() {
  // 刷新时的初始灰度跟随页面主题：亮色落在亮卡底端点，暗色落在暗卡底端点。
  // docs-shell 首次挂载前 .dark class 尚未写入（useEffect 时序），直接按 system
  // 偏好预判，与 shell 挂载后的主题一致。
  const [glassBackgroundGray, setGlassBackgroundGray] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
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
    <>
      <ComponentPreviewCard label="卡片材质">
        <div aria-hidden="true" className="card-surface-preview">
          <CardSurface className="card-surface-preview__tile">
            <span className="card-surface-preview__title">Card Surface</span>
            <span className="card-surface-preview__meta">静态实体卡片材质</span>
          </CardSurface>
        </div>
      </ComponentPreviewCard>

      <ComponentPreviewCard
        action={
          <GraySlider
            ariaLabel="背景灰度"
            max={glassBackgroundGrayLight}
            min={glassBackgroundGrayDark}
            onValueChange={setGlassBackgroundGray}
            value={glassBackgroundGray}
          />
        }
        label="玻璃材质"
      >
        <div
          className="glass-surface-preview"
          style={getGlassPreviewBackground(glassBackgroundGray)}
        >
          <div className="glass-surface-preview__fixed">
            <GlassSurface className="glass-surface-preview__tile">
              <span className="glass-surface-preview__title">Glass Surface</span>
              <span className="glass-surface-preview__meta">前景色随背景亮度自适应明暗</span>
            </GlassSurface>
          </div>
        </div>
      </ComponentPreviewCard>

      <ComponentPreviewCard label="浮层材质">
        <div className="popup-surface-preview">
          <PopupSurface className="popup-surface-preview__tile">
            <span className="popup-surface-preview__title">Modal Surface</span>
            <span className="popup-surface-preview__meta">抬升浮层主体材质</span>
          </PopupSurface>
        </div>
      </ComponentPreviewCard>
    </>
  )
}

export const surfaceDefinition = {
  id: 'surface',
  summary: '静态卡片、亮度自适应玻璃层与抬升浮层的材质总览',
  status: 'Preview',
  frame: 'plain',
  searchAliases: [
    'Surface',
    'CardSurface',
    'GlassSurface',
    'PopupSurface',
    '材质',
    '卡片材质',
    '玻璃材质',
    '浮层材质',
    '--color-text-primary',
    '--color-border',
    '--radius',
    '--color-bg-card',
    '--shadow-card',
  ],
  preview: () => <SurfaceDemo />,
} satisfies ComponentDefinition
