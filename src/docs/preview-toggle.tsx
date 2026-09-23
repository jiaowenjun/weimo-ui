import type { ReactNode } from 'react'

import { Switch } from '../components/coss/switch'

// 标题栏开关：可见状态标签 + Switch，按钮页启用/模式开关与材质页边框开关共用，
// 外观由 App.css 的 .preview-toggle 提供。
export function PreviewToggle({
  ariaLabel,
  checked,
  label,
  onCheckedChange,
}: {
  ariaLabel: string
  checked: boolean
  label: ReactNode
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <span className="preview-toggle">
      <span className="preview-toggle__label">{label}</span>
      <Switch
        aria-label={ariaLabel}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </span>
  )
}

// 材质页三张卡的边框开关：统一「有边框 / 无边框」文案与无障碍名。
export function SurfaceBorderToggle({
  bordered,
  onBorderedChange,
}: {
  bordered: boolean
  onBorderedChange: (bordered: boolean) => void
}) {
  return (
    <PreviewToggle
      ariaLabel="显示边框"
      checked={bordered}
      label={bordered ? '有边框' : '无边框'}
      onCheckedChange={onBorderedChange}
    />
  )
}
