import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { CardPanel } from '../components/coss/card'
import { cn } from '../components/lib/utils'

import './token-preview-card.css'

export type TokenPreviewCardProps = Omit<
  ComponentPropsWithoutRef<typeof CardPanel>,
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
    <CardPanel className={cn('token-preview-card', className)} {...props}>
      <div className="token-preview-card__meta">
        <span className="token-preview-card__label">{label}</span>
        <code className="token-preview-card__token">
          {token}: {' '}
          {darkValue === undefined ? (
            value
          ) : (
            <>
              <span className="token-preview-card__value--light">{value}</span>
              <span className="token-preview-card__value--dark">{darkValue}</span>
            </>
          )}
        </code>
      </div>
      {children}
    </CardPanel>
  )
}
