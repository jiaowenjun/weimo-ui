import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'

import { cn } from './lib/utils'

import './float-bar.css'

export type FloatBarProps = ComponentPropsWithoutRef<'div'> & {
  leftSlot?: ReactNode
  centerSlot?: ReactNode
  rightSlot?: ReactNode
}

export const FloatBar = forwardRef<HTMLDivElement, FloatBarProps>(function FloatBar(
  {
    className,
    centerSlot,
    leftSlot,
    role,
    rightSlot,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      role={role ?? 'toolbar'}
      {...props}
      className={cn('float-bar', className)}
    >
      <div className="float-bar__frame">
        <div className="float-bar__slot float-bar__slot--left">
          {leftSlot}
        </div>
        <div className="float-bar__slot float-bar__slot--center">
          {centerSlot}
        </div>
        <div className="float-bar__slot float-bar__slot--right">
          {rightSlot}
        </div>
      </div>
    </div>
  )
})

FloatBar.displayName = 'FloatBar'
