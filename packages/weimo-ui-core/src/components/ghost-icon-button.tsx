import { forwardRef, type ComponentPropsWithoutRef } from 'react'

import { getIconButtonClassName, type IconButtonSize } from './icon-button-model'
import { cn } from './lib/utils'

import './icon-button.css'

export type GhostIconButtonProps = ComponentPropsWithoutRef<'button'> & {
  size?: IconButtonSize
}

export const GhostIconButton = forwardRef<HTMLButtonElement, GhostIconButtonProps>(function GhostIconButton(
  {
    className,
    size,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      {...props}
      className={cn(getIconButtonClassName('ghost', size), className)}
      ref={ref}
      type={type}
    />
  )
})

GhostIconButton.displayName = 'GhostIconButton'
