import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from './lib/utils'

import './stat-group.css'

export type StatGroupItem = {
  key?: string
  value: ReactNode
  label: ReactNode
}

export type StatGroupProps = ComponentPropsWithoutRef<'div'> & {
  items?: StatGroupItem[]
}

export function StatGroup({
  children,
  className,
  items = [],
  role,
  ...props
}: StatGroupProps) {
  return (
    <div className={cn('stat-group', className)} role={role ?? 'group'} {...props}>
      {items.map((item, index) => (
        <div className="stat-group__item" key={item.key ?? index}>
          <span className="stat-group__value">{item.value}</span>
          <span className="stat-group__label">{item.label}</span>
        </div>
      ))}
      {children}
    </div>
  )
}
