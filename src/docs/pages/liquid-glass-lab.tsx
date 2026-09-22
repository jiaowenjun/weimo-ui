import { useMemo, useState } from 'react'
import { Play, Star } from 'lucide-react'

import { useGlassSurfaceBackgroundToneRef } from '../../components/glass-surface'
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
} from '../../components/coss/slider'

import './liquid-glass-lab.css'

const marqueeTextLarge = '液态玻璃 Liquid Glass · 折射 · 饱和度 · 边缘高光 · '
const marqueeTextSmall = 'regular 用于菜单与工具栏 · clear 用于照片与视频 · 避免玻璃叠玻璃 · 圆角与容器同心 · '

// 富媒体背景用内联 SVG 生成：不依赖网络资源，且 <img> 像素可被背景采样器读取。
function buildMediaSvgUrl(variant: 'dark' | 'light') {
  const shapes =
    variant === 'dark'
      ? '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1d2a52"/><stop offset="1" stop-color="#0b0f1e"/></linearGradient></defs><rect width="640" height="400" fill="url(#bg)"/><circle cx="120" cy="90" r="150" fill="#4f6ef7" opacity="0.55"/><circle cx="520" cy="80" r="110" fill="#8b5cf6" opacity="0.45"/><circle cx="420" cy="330" r="160" fill="#155e9c" opacity="0.5"/><circle cx="240" cy="300" r="60" fill="#22d3ee" opacity="0.5"/><path d="M0 320 Q 160 260 320 320 T 640 320 L 640 400 L 0 400 Z" fill="#0ea5e9" opacity="0.25"/><g stroke="#e2e8f0" stroke-opacity="0.35" stroke-width="2"><line x1="60" y1="40" x2="200" y2="180"/><line x1="480" y1="60" x2="560" y2="200"/></g><g fill="#f8fafc" fill-opacity="0.8"><rect x="70" y="250" width="14" height="14" rx="3"/><rect x="96" y="250" width="14" height="14" rx="3"/><rect x="122" y="250" width="14" height="14" rx="3"/></g>'
      : '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9f0fd"/><stop offset="1" stop-color="#fdf3e3"/></linearGradient></defs><rect width="640" height="400" fill="url(#bg)"/><circle cx="140" cy="100" r="130" fill="#7cb2f8" opacity="0.5"/><circle cx="520" cy="90" r="120" fill="#f9a8d4" opacity="0.45"/><circle cx="430" cy="320" r="150" fill="#fcd34d" opacity="0.4"/><circle cx="230" cy="310" r="55" fill="#6ee7b7" opacity="0.5"/><path d="M0 300 Q 160 240 320 300 T 640 300 L 640 400 L 0 400 Z" fill="#f59e0b" opacity="0.18"/><g stroke="#0f172a" stroke-opacity="0.15" stroke-width="2"><line x1="70" y1="30" x2="220" y2="170"/><line x1="470" y1="50" x2="580" y2="190"/></g><g fill="#0f172a" fill-opacity="0.55"><rect x="80" y="240" width="14" height="14" rx="3"/><rect x="106" y="240" width="14" height="14" rx="3"/><rect x="132" y="240" width="14" height="14" rx="3"/></g>'

  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400">${shapes}</svg>`)}`
}

// tone=auto 演示：复用生产版背景采样 hook（5 点平均、阈值 0.5）。
function AutoToneTile() {
  const { backgroundTone, setElementRef } =
    useGlassSurfaceBackgroundToneRef<HTMLDivElement>(true)

  return (
    <div
      className="lg-glass lg-tile"
      data-elevation="popover"
      data-material="regular"
      data-tone={backgroundTone ?? 'unknown'}
      ref={setElementRef}
    >
      <strong>tone = auto</strong>
      <span>
        当前采样：
        {backgroundTone === 'light'
          ? 'light（亮）'
          : backgroundTone === 'dark'
            ? 'dark（暗）'
            : '未判定'}
      </span>
    </div>
  )
}

export function LiquidGlassLabPage() {
  const [split, setSplit] = useState(50)

  const darkMediaUrl = useMemo(() => buildMediaSvgUrl('dark'), [])
  const lightMediaUrl = useMemo(() => buildMediaSvgUrl('light'), [])

  return (
    <div className="lg-lab">
      <header className="lg-lab__header">
        <h1 className="lg-lab__title">液态玻璃 · 材质实验</h1>
        <p className="lg-lab__intro">
          语义模型 material（regular / clear）× elevation（control / bar /
          popover）× tone（auto / light / dark）的视觉校准场。参数为校准起点而非系统规范值；
          本页样式自包含，未接入 .glass-surface 与现有组件 token。
        </p>
      </header>

      <section className="lg-lab__scene">
        <h2 className="lg-lab__scene-title">regular × 滚动文字（明 / 暗）</h2>
        <p className="lg-lab__note">
          blur(20px) saturate(1.2)：亮背景配浅色 tint 与深色发丝边，暗背景配深色 tint
          与白色发丝边。玻璃需要有可模糊的内容，滚动的文字带提供高频细节。
        </p>
        <div className="lg-lab__grid-2">
          <div className="lg-scene lg-scene--light">
            <div aria-hidden="true" className="lg-marquee">
              <div className="lg-marquee__track lg-marquee__track--large">
                <span>{marqueeTextLarge.repeat(3)}</span>
                <span>{marqueeTextLarge.repeat(3)}</span>
              </div>
              <div className="lg-marquee__track lg-marquee__track--small lg-marquee__track--reverse">
                <span>{marqueeTextSmall.repeat(3)}</span>
                <span>{marqueeTextSmall.repeat(3)}</span>
              </div>
            </div>
            <div
              className="lg-glass lg-toolbar"
              data-elevation="bar"
              data-material="regular"
              data-tone="light"
            >
              <strong className="lg-toolbar__title">工具栏</strong>
              <span className="lg-toolbar__spacer" />
              <span className="lg-toolbar__chip">编辑</span>
              <span className="lg-toolbar__chip">分享</span>
              <span className="lg-toolbar__chip">删除</span>
            </div>
          </div>
          <div className="lg-scene lg-scene--dark">
            <div aria-hidden="true" className="lg-marquee">
              <div className="lg-marquee__track lg-marquee__track--large">
                <span>{marqueeTextLarge.repeat(3)}</span>
                <span>{marqueeTextLarge.repeat(3)}</span>
              </div>
              <div className="lg-marquee__track lg-marquee__track--small lg-marquee__track--reverse">
                <span>{marqueeTextSmall.repeat(3)}</span>
                <span>{marqueeTextSmall.repeat(3)}</span>
              </div>
            </div>
            <div
              className="lg-glass lg-toolbar"
              data-elevation="bar"
              data-material="regular"
              data-tone="dark"
            >
              <strong className="lg-toolbar__title">工具栏</strong>
              <span className="lg-toolbar__spacer" />
              <span className="lg-toolbar__chip">编辑</span>
              <span className="lg-toolbar__chip">分享</span>
              <span className="lg-toolbar__chip">删除</span>
            </div>
          </div>
        </div>
      </section>

      <section className="lg-lab__scene">
        <h2 className="lg-lab__scene-title">clear × 富媒体</h2>
        <p className="lg-lab__note">
          clear 高度通透：blur(12px)、tint 6%。亮色媒体上建议在媒体与玻璃之间叠
          35% 黑色 dim 层（压暗玻璃透出的内容）保障前景可读，暗色媒体上无需 dim。
        </p>
        <div className="lg-lab__grid-2">
          <div className="lg-media">
            <img alt="" aria-hidden="true" draggable={false} src={darkMediaUrl} />
            <span className="lg-glass lg-pill" data-elevation="control" data-material="clear">
              <Play size={14} />
              播放
            </span>
          </div>
          <div className="lg-media">
            <img alt="" aria-hidden="true" draggable={false} src={lightMediaUrl} />
            <span className="lg-glass lg-pill" data-elevation="control" data-material="clear">
              <Star size={14} />
              无 dim
            </span>
            <span className="lg-pill-wrap">
              <span className="lg-glass lg-pill" data-elevation="control" data-material="clear">
                <Star size={14} />
                含 dim
              </span>
            </span>
          </div>
        </div>
      </section>

      <section className="lg-lab__scene">
        <h2 className="lg-lab__scene-title">纯色背景（无细节基线）</h2>
        <p className="lg-lab__note">
          背景没有高频细节时 blur 不可见，可辨识度完全来自 tint、边缘高光与
          elevation 阴影——这是玻璃材质在纯色场景的底线。
        </p>
        <div className="lg-flat">
          <div className="lg-glass lg-tile" data-elevation="popover" data-material="regular" data-tone="light">
            <strong>纯色上的玻璃</strong>
            <span>仅剩 tint · 边缘 · 阴影</span>
          </div>
        </div>
      </section>

      <section className="lg-lab__scene">
        <h2 className="lg-lab__scene-title">tone = auto（真实采样）</h2>
        <p className="lg-lab__note">
          拖动明暗分界：tile 使用生产版 5 点平均采样器判定背景明暗并切换材质挡；
          分界落在采样点之间时的翻转临界，是采样器的真实行为。
        </p>
        <div className="lg-split">
          <div className="lg-split__half lg-split__half--light" style={{ width: `${split}%` }}>
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="lg-split__half lg-split__half--dark" style={{ width: `${100 - split}%` }}>
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="lg-split__tile">
            <AutoToneTile />
          </div>
        </div>
        <div className="lg-lab__slider-row">
          <span>亮侧宽度 {split}%</span>
          <Slider
            className="lg-lab__slider"
            max={100}
            min={0}
            onValueChange={setSplit}
            step={1}
            value={split}
          >
            <SliderControl>
              <SliderTrack>
                <SliderIndicator />
                <SliderThumb aria-label="明暗分界位置" />
              </SliderTrack>
            </SliderControl>
          </Slider>
        </div>
      </section>

      <section className="lg-lab__scene">
        <h2 className="lg-lab__scene-title">elevation 阶梯</h2>
        <p className="lg-lab__note">
          外阴影只由 elevation 提供：control 无阴影、bar 轻浮、popover
          抬升。材质相同，深度感只来自阴影。
        </p>
        <div className="lg-elev-scene">
          <img alt="" aria-hidden="true" draggable={false} src={darkMediaUrl} />
          <div className="lg-elev-row">
            {(['control', 'bar', 'popover'] as const).map((elevation) => (
              <div className="lg-elev-cell" key={elevation}>
                <div
                  className="lg-glass lg-tile"
                  data-elevation={elevation}
                  data-material="regular"
                  data-tone="dark"
                >
                  <strong>{elevation}</strong>
                </div>
                <span className="lg-elev-label">
                  {elevation === 'control' ? '无阴影' : elevation === 'bar' ? '轻浮' : '抬升'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
