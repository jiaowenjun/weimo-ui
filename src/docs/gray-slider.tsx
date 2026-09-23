import type { CSSProperties } from 'react'

// 自研滑块：透明原生 range input 作交互层（拖动/点击跳变/键盘步进/ARIA 全由浏览器
// 承担），自绘轨道、指示条与滑块的几何全部由 --fill 一个自定义属性驱动。
// 平滑移动是纯 CSS transition（见 App.css 的 .gray-slider）；按住（:active）期间
// 禁用过渡，保证拖动逐帧跟手，主题重置发生在未按住时才播放动画。
export function GraySlider({
  ariaLabel,
  max,
  min,
  onValueChange,
  value,
}: {
  ariaLabel: string
  max: number
  min: number
  onValueChange: (value: number) => void
  value: number
}) {
  const fill = (value - min) / (max - min)

  return (
    <div className="gray-slider" style={{ '--fill': fill } as CSSProperties}>
      <input
        aria-label={ariaLabel}
        className="gray-slider__input"
        max={max}
        min={min}
        onChange={(event) => onValueChange(Number(event.target.value))}
        step={1}
        type="range"
        value={value}
      />
      <div aria-hidden="true" className="gray-slider__track">
        <div className="gray-slider__indicator" />
      </div>
      <div aria-hidden="true" className="gray-slider__thumb" />
    </div>
  )
}
