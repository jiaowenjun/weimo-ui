import { useEffect, useRef, useState } from 'react'
import type { ComponentRef, ReactNode } from 'react'
import { Link } from 'react-router'

import { TokenPreviewCard } from '../components/token-preview-card'
import type { TokenPreviewCardItem } from '../components/token-preview-card'

import './token-preview-card-width-page.css'

// tokens.css 中名字最长的两个颜色类 token(36 / 35 字符);值为 tokens.css 实际定义。
// 两者是主题无关的上下文 token,单值即可,不需要 darkValue 双值。
const longestColorTokenItems: readonly TokenPreviewCardItem[] = [
  { token: '--color-border-divider-menu-on-light', value: 'hsl(0 0% 88%)' },
  { token: '--color-border-divider-menu-on-dark', value: 'hsl(0 0% 28%)' },
]

const sweepWidths = [180, 220, 260, 300, 340, 380, 420, 480, 560, 640]

const previewCard = (
  <TokenPreviewCard items={longestColorTokenItems} label="分隔边框 · menu">
    <div aria-hidden="true" className="width-test__stage" />
  </TokenPreviewCard>
)

function WidthSlot({ children, width }: { children: ReactNode; width: number }) {
  return (
    <div className="width-test__slot">
      <div className="width-test__ruler">{width}px</div>
      <div className="width-test__frame" style={{ width: `${width}px` }}>
        {children}
      </div>
    </div>
  )
}

function ResizableSlot() {
  const frameRef = useRef<ComponentRef<'div'>>(null)
  const [width, setWidth] = useState<number | null>(null)

  useEffect(() => {
    const frame = frameRef.current

    if (!frame) {
      return
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]

      if (entry) {
        setWidth(Math.round(entry.contentRect.width))
      }
    })

    observer.observe(frame)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div className="width-test__slot width-test__slot--fluid">
      <div className="width-test__ruler">
        {width === null ? '拖拽右下角手柄调整宽度' : `当前内容宽度:${width}px(拖拽右下角手柄)`}
      </div>
      <div className="width-test__frame width-test__frame--resizable" ref={frameRef}>
        {previewCard}
      </div>
    </div>
  )
}

function useDarkTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return [dark, setDark] as const
}

export function TokenPreviewCardWidthPage() {
  const [dark, setDark] = useDarkTheme()

  return (
    <main className="width-test">
      <header className="width-test__header">
        <h1>TokenPreviewCard 宽度测试</h1>
        <p>
          示例 tokens:<code>--color-border-divider-menu-on-light</code>(36 字符)与
          <code>--color-border-divider-menu-on-dark</code>(35 字符)—— tokens.css
          中名字最长的两个颜色类 token,多行同卡展示。观察点:各 token/value
          两列在窄容器下的换行位置、行间基线与列对齐、色板(swatch)与右对齐值的表现。
        </p>
        <div className="width-test__toolbar">
          <button onClick={() => setDark(!dark)} type="button">
            {dark ? '切换到亮色主题' : '切换到暗色主题'}
          </button>
          <Link to="/">返回文档首页</Link>
        </div>
      </header>

      <section className="width-test__section">
        <h2>固定宽度扫描</h2>
        <div className="width-test__sweep">
          {sweepWidths.map((width) => (
            <WidthSlot key={width} width={width}>
              {previewCard}
            </WidthSlot>
          ))}
        </div>
      </section>

      <section className="width-test__section">
        <h2>自由拖拽</h2>
        <ResizableSlot />
      </section>
    </main>
  )
}
