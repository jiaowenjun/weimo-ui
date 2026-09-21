import { useLayoutEffect, useRef } from 'react'
import type { ComponentPropsWithoutRef, ComponentRef, ReactNode, RefObject } from 'react'

import { CardSurface } from './card-surface'
import { cn } from './lib/utils'

import './component-preview-card.css'

const colorValuePattern =
  /^(?:#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|(?:hsl|hsla|rgb|rgba|oklch|oklab|lch|lab|hwb|color)\()/i

function colorValueHasAlpha(value: string) {
  if (value.startsWith('#')) {
    const digits = value.slice(1)
    if (digits.length === 4) {
      return digits[3].toLowerCase() !== 'f'
    }
    if (digits.length === 8) {
      return digits.slice(6).toLowerCase() !== 'ff'
    }
    return false
  }

  const slashAlpha = value.match(/\/\s*([^)]+)/)

  if (slashAlpha) {
    const alpha = slashAlpha[1].trim().endsWith('%')
      ? Number.parseFloat(slashAlpha[1]) / 100
      : Number.parseFloat(slashAlpha[1])
    return Number.isFinite(alpha) && alpha < 1
  }

  const legacyAlpha = value.match(/^(?:rgba|hsla)\([^)]*,\s*([^),\s]+)\s*\)$/i)

  if (legacyAlpha) {
    const alpha = legacyAlpha[1].trim().endsWith('%')
      ? Number.parseFloat(legacyAlpha[1]) / 100
      : Number.parseFloat(legacyAlpha[1])
    return Number.isFinite(alpha) && alpha < 1
  }

  return false
}

function renderTokenValue(value: ReactNode, swatchClassName: string) {
  if (typeof value !== 'string' || !colorValuePattern.test(value.trim())) {
    return value
  }

  // 不透明色只用单层渐变:白色 background-color 层叠多层背景 + border-radius 时,
  // 圆角光栅化会让白底在边缘透出亮环(暗色卡片上明显)。带 alpha 的色值才需要
  // 棋盘格,且白底也写成渐变层,让所有背景层走同一条光栅化路径。
  const background = colorValueHasAlpha(value.trim())
    ? `linear-gradient(${value}), repeating-linear-gradient(45deg, hsl(0 0% 50% / 0.16) 0 4px, transparent 4px 8px), repeating-linear-gradient(-45deg, hsl(0 0% 50% / 0.16) 0 4px, transparent 4px 8px), linear-gradient(#fff, #fff)`
    : `linear-gradient(${value})`

  return (
    <>
      <span className="component-preview-card__value-text">{value}</span>
      <span aria-hidden="true" className={swatchClassName} style={{ background }} />
    </>
  )
}

// 隐藏值文本的判定必须是状态无关的纯函数:若"值文本 + 2em 间隙 + token 单行宽"放不下,
// 就隐藏值文本(只留色块)。不能直接检测 token 当前是否换行——隐藏会反过来扩大 token
// 列宽,可能让 token 恢复单行又触发显示,在临界宽度形成显示/隐藏振荡。
function useCollapseValueTextWhenTokenWraps(rowRef: RefObject<ComponentRef<'div'> | null>) {
  useLayoutEffect(() => {
    const row = rowRef.current

    if (!row || typeof ResizeObserver === 'undefined') {
      return
    }

    const tokenEl = row.querySelector<HTMLElement>('.component-preview-card__token')
    const valueEl = row.querySelector<HTMLElement>('.component-preview-card__value')
    const collapsedClass = 'component-preview-card__row--value-text-collapsed'

    if (!tokenEl || !valueEl || !row.querySelector('.component-preview-card__value-swatch')) {
      return
    }

    const measureNowrapWidth = (el: HTMLElement) => {
      const previous = el.style.whiteSpace
      el.style.whiteSpace = 'nowrap'
      const width = el.scrollWidth
      el.style.whiteSpace = previous
      return width
    }

    const sync = () => {
      const wasCollapsed = row.classList.contains(collapsedClass)

      if (wasCollapsed) {
        row.classList.remove(collapsedClass)
      }

      const gap = Number.parseFloat(getComputedStyle(row).columnGap) || 0
      const needed = measureNowrapWidth(tokenEl) + gap + measureNowrapWidth(valueEl)
      row.classList.toggle(collapsedClass, row.getBoundingClientRect().width + 1 < needed)
    }

    sync()

    const observer = new ResizeObserver(sync)
    observer.observe(row)
    observer.observe(tokenEl)

    return () => observer.disconnect()
  }, [rowRef])
}

function TokenPreviewRow(row: ComponentPreviewCardItem) {
  const rowRef = useRef<ComponentRef<'div'>>(null)
  useCollapseValueTextWhenTokenWraps(rowRef)

  return (
    <div className="component-preview-card__row" ref={rowRef}>
      <code className="component-preview-card__token">{row.token}</code>
      <code className="component-preview-card__value">
        {row.darkValue === undefined ? (
          renderTokenValue(row.value, 'component-preview-card__value-swatch')
        ) : (
          <>
            <span className="component-preview-card__value--light">
              {renderTokenValue(row.value, 'component-preview-card__value-swatch')}
            </span>
            <span className="component-preview-card__value--dark">
              {renderTokenValue(row.darkValue, 'component-preview-card__value-swatch')}
            </span>
          </>
        )}
      </code>
    </div>
  )
}

export type ComponentPreviewCardItem = {
  darkValue?: ReactNode
  token: string
  value: ReactNode
}

export type ComponentPreviewCardProps = Omit<
  ComponentPropsWithoutRef<typeof CardSurface>,
  'children'
> & {
  children: ReactNode
  darkValue?: ReactNode
  items?: readonly ComponentPreviewCardItem[]
  label: ReactNode
  token?: string
  value?: ReactNode
}

export function ComponentPreviewCard({
  children,
  className,
  darkValue,
  items,
  label,
  token,
  value,
  ...props
}: ComponentPreviewCardProps) {
  const rows: readonly ComponentPreviewCardItem[] =
    items ?? (token === undefined || value === undefined ? [] : [{ darkValue, token, value }])

  return (
    <CardSurface className={cn('component-preview-card', className)} {...props}>
      <div className="component-preview-card__meta">
        <span className="component-preview-card__label">{label}</span>
        {rows.map((row) => (
          <TokenPreviewRow darkValue={row.darkValue} key={row.token} token={row.token} value={row.value} />
        ))}
      </div>
      {children}
    </CardSurface>
  )
}
