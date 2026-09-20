import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { CardSurface } from './card-surface'
import { cn } from './lib/utils'

import './token-preview-card.css'

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

export type TokenPreviewCardProps = Omit<
  ComponentPropsWithoutRef<typeof CardSurface>,
  'children'
> & {
  children: ReactNode
  darkValue?: ReactNode
  label: ReactNode
  token: ReactNode
  value: ReactNode
}

export function TokenPreviewCard({
  children,
  className,
  darkValue,
  label,
  token,
  value,
  ...props
}: TokenPreviewCardProps) {
  return (
    <CardSurface className={cn('token-preview-card', className)} {...props}>
      <div className="token-preview-card__meta">
        <span className="token-preview-card__label">{label}</span>
        <div className="token-preview-card__row">
          <code className="token-preview-card__token">{token}</code>
          <code className="token-preview-card__value">
            {darkValue === undefined ? (
              renderTokenValue(value, 'token-preview-card__value-swatch')
            ) : (
              <>
                <span className="token-preview-card__value--light">
                  {renderTokenValue(value, 'token-preview-card__value-swatch')}
                </span>
                <span className="token-preview-card__value--dark">
                  {renderTokenValue(darkValue, 'token-preview-card__value-swatch')}
                </span>
              </>
            )}
          </code>
        </div>
      </div>
      {children}
    </CardSurface>
  )
}
