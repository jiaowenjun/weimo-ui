import { useEffect, useState } from 'react'

import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
import { GhostIconButton } from 'weimo-ui-core/components/ghost-icon-button'
import { Slider } from 'weimo-ui-core/components/slider'

import { siteTemplatePreviewHref } from '../routes'
import { SolidFollowPreviewFrame } from '../preview/solid-follow-preview-frame'
import './site-template-demo.css'

/* 断点落在滑块约 63.6%(700/1100)处:100% 档的布局宽 = maxLayoutWidth */
const minPercent = 30
const maxPercent = 100
const maxLayoutWidth = 1100
const defaultPercent = 100

function ResetIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M3 3v5h5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

/** SiteTemplate 官方演示:iframe 内直出生产组件,布局宽与视觉宽分离。
    滑块是百分比视觉宽,预览区连同底色全程 1:1 跟随;iframe 布局宽按
    恒定倍率(100% 档 = 1100px)派生,699px 断点按布局宽真实判定。 */
export function SiteTemplateDemo() {
  const [percent, setPercent] = useState(defaultPercent)
  const [resizing, setResizing] = useState(false)
  const previewHref = siteTemplatePreviewHref()

  // 拖动期间禁用预览区过渡保证逐帧跟手,松手恢复(重置归位动画依赖它)
  useEffect(() => {
    if (!resizing) return

    const stopResizing = () => setResizing(false)
    window.addEventListener('pointerup', stopResizing)
    window.addEventListener('pointercancel', stopResizing)
    return () => {
      window.removeEventListener('pointerup', stopResizing)
      window.removeEventListener('pointercancel', stopResizing)
    }
  }, [resizing])

  return (
    <ComponentPreviewCard
      data-component-id="site-template"
      footer={
        <div className="site-template-demo__width-bar">
          <div
            className="site-template-demo__width-slider"
            onPointerDown={() => setResizing(true)}
          >
            <Slider
              ariaLabel="调整预览宽度百分比"
              max={maxPercent}
              min={minPercent}
              onValueChange={setPercent}
              value={percent}
            />
          </div>
          <GhostIconButton
            aria-label="重置预览宽度百分比"
            onClick={() => setPercent(defaultPercent)}
            size="sm"
            type="button"
          >
            <ResetIcon />
          </GhostIconButton>
        </div>
      }
      label="SiteTemplate 布局示例"
    >
      <SolidFollowPreviewFrame
        maxLayoutWidth={maxLayoutWidth}
        percent={percent}
        resizing={resizing}
        src={previewHref}
        title="SiteTemplate 实时预览"
      />
    </ComponentPreviewCard>
  )
}
