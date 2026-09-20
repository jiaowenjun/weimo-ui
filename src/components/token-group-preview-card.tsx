import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { CardSurface } from './card-surface'
import { cn } from './lib/utils'

import './token-group-preview-card.css'

const colorValuePattern =
  /^(?:#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|(?:hsl|hsla|rgb|rgba|oklch|oklab|lch|lab|hwb|color)\()/i

function renderTokenValue(value: ReactNode, swatchClassName: string) {
  if (typeof value !== 'string' || !colorValuePattern.test(value.trim())) {
    return value
  }

  return (
    <>
      {value}
      <span
        aria-hidden="true"
        className={swatchClassName}
        style={{
          background: `linear-gradient(${value}), repeating-linear-gradient(45deg, hsl(0 0% 50% / 0.16) 0 4px, transparent 4px 8px), repeating-linear-gradient(-45deg, hsl(0 0% 50% / 0.16) 0 4px, transparent 4px 8px), #fff`,
        }}
      />
    </>
  )
}

export type TokenGroupPreviewCardItem = {
  darkValue?: ReactNode
  token: string
  value: ReactNode
}

export type TokenGroupPreviewCardProps = Omit<
  ComponentPropsWithoutRef<typeof CardSurface>,
  'children'
> & {
  children: ReactNode
  items: readonly TokenGroupPreviewCardItem[]
  label: ReactNode
}

export function TokenGroupPreviewCard({
  children,
  className,
  items,
  label,
  ...props
}: TokenGroupPreviewCardProps) {
  return (
    <CardSurface className={cn('token-group-preview-card', className)} {...props}>
      <div className="token-group-preview-card__meta">
        <span className="token-group-preview-card__label">{label}</span>
        <dl className="token-group-preview-card__items">
          {items.map((item) => (
            <div className="token-group-preview-card__row" key={item.token}>
              <dt className="token-group-preview-card__token">
                <code>{item.token}</code>
              </dt>
              <dd className="token-group-preview-card__value">
                <code>
                  {item.darkValue === undefined ? (
                    renderTokenValue(item.value, 'token-group-preview-card__value-swatch')
                  ) : (
                    <>
                      <span className="token-group-preview-card__value--light">
                        {renderTokenValue(item.value, 'token-group-preview-card__value-swatch')}
                      </span>
                      <span className="token-group-preview-card__value--dark">
                        {renderTokenValue(item.darkValue, 'token-group-preview-card__value-swatch')}
                      </span>
                    </>
                  )}
                </code>
              </dd>
            </div>
          ))}
        </dl>
      </div>
      {children}
    </CardSurface>
  )
}
