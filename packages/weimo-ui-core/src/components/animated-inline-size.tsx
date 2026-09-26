import type { ComponentPropsWithoutRef, MutableRefObject, ReactNode } from 'react'

import { cn } from './lib/utils'

import './animated-inline-size.css'

export type AnimatedInlineSizeMeasureProps = Omit<
  ComponentPropsWithoutRef<'span'>,
  'children'
> & {
  measureRef: MutableRefObject<HTMLElement | null>
  children: ReactNode
}

export function AnimatedInlineSizeMeasure({
  children,
  className,
  measureRef,
  ...props
}: AnimatedInlineSizeMeasureProps) {
  return (
    <span
      aria-hidden="true"
      className={cn('animated-inline-size__measure', className)}
      {...props}
    >
      <span
        ref={(node) => {
          measureRef.current = node
        }}
      >
        {children}
      </span>
    </span>
  )
}
