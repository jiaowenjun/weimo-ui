import { useEffect, useState } from 'react'

import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
import { GhostIconButton } from 'weimo-ui-core/components/ghost-icon-button'
import { Slider } from 'weimo-ui-core/components/slider'

import { miniSiteTemplatePreviewHref } from '../routes'
import { SolidFollowPreviewFrame } from '../preview/solid-follow-preview-frame'
import './mini-site-template-demo.css'

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

/** MiniSiteTemplate 官方演示:与 SiteTemplate 同款预览方案——
    iframe 内直出生产组件,滑块是百分比视觉宽,预览区连同底色
    全程 1:1 跟随;布局宽按恒定倍率派生,响应式按布局宽真实判定。 */
export function MiniSiteTemplateDemo() {
  const [percent, setPercent] = useState(defaultPercent)
  const [resizing, setResizing] = useState(false)
  const previewHref = miniSiteTemplatePreviewHref()

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
      data-component-id="mini-site-template"
      footer={
        <div className="mini-site-template-demo__width-bar">
          <div
            className="mini-site-template-demo__width-slider"
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
      label="MiniSiteTemplate 布局示例"
    >
      <SolidFollowPreviewFrame
        maxLayoutWidth={maxLayoutWidth}
        percent={percent}
        resizing={resizing}
        src={previewHref}
        title="MiniSiteTemplate 实时预览"
      />
    </ComponentPreviewCard>
  )
}
