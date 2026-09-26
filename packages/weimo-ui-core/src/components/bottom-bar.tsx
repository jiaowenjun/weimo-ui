import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'

import { FloatBar } from './float-bar'
import { cn } from './lib/utils'

import './bottom-bar.css'

export type BottomBarProps = ComponentPropsWithoutRef<'div'> & {
  leftSlot?: ReactNode
  rightSlot?: ReactNode
}

export const BottomBar = forwardRef<HTMLDivElement, BottomBarProps>(function BottomBar(
  {
    className,
    leftSlot,
    rightSlot,
    ...props
  },
  ref,
) {
  return (
    <FloatBar
      {...props}
      ref={ref}
      className={cn('bottom-bar', className)}
      leftSlot={leftSlot}
      rightSlot={rightSlot}
    />
  )
})

BottomBar.displayName = 'BottomBar'
