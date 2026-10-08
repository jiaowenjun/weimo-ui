import { forwardRef, type ComponentPropsWithoutRef } from 'react'

import { cn } from 'weimo-ui-core/lib/utils'

import './text-button.css'

export type TextButtonVariant = 'default' | 'ghost'

export type TextButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: TextButtonVariant
}

export const TextButton = forwardRef<HTMLButtonElement, TextButtonProps>(function TextButton(
  {
    className,
    type = 'button',
    variant = 'default',
    ...props
  },
  ref,
) {
  return (
    <button
      {...props}
      className={cn(
        'text-button',
        variant === 'ghost' && 'text-button--ghost',
        className,
      )}
      ref={ref}
      type={type}
    />
  )
})

TextButton.displayName = 'TextButton'
