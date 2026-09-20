import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { CardSurface } from './card-surface'
import { cn } from './lib/utils'

import './token-group-preview-card.css'

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
                    item.value
                  ) : (
                    <>
                      <span className="token-group-preview-card__value--light">
                        {item.value}
                      </span>
                      <span className="token-group-preview-card__value--dark">
                        {item.darkValue}
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
