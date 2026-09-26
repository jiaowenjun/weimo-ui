import { forwardRef, type ComponentPropsWithoutRef } from 'react'

import { cn } from './lib/utils'

import './text-button.css'

export type TextButtonProps = ComponentPropsWithoutRef<'button'>

export const TextButton = forwardRef<HTMLButtonElement, TextButtonProps>(function TextButton(
  {
    className,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      {...props}
      className={cn('text-button', className)}
      ref={ref}
      type={type}
    />
  )
})

TextButton.displayName = 'TextButton'
