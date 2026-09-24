import { forwardRef, useCallback } from 'react'
import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react'

import {
  getGlassSurfaceClassName,
  useGlassSurfaceBackgroundToneRef,
} from './glass-surface'
import { getIconButtonClassName, type IconButtonSize } from './icon-button-model'
import { cn } from './lib/utils'

import './glass-icon-button-group.css'

export type GlassIconButtonGroupProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  children: ReactNode
}

export const GlassIconButtonGroup = forwardRef<HTMLDivElement, GlassIconButtonGroupProps>(function GlassIconButtonGroup(
  {
    children,
    className,
    role,
    ...props
  },
  ref,
) {
  const {
    backgroundTone,
    setElementRef: setGlassSurfaceElementRef,
  } = useGlassSurfaceBackgroundToneRef<HTMLDivElement>(true)
  const setElementRef = useCallback((element: HTMLDivElement | null) => {
    setGlassSurfaceElementRef(element)
    assignGroupRef(ref, element)
  }, [ref, setGlassSurfaceElementRef])

  return (
    <div
      {...props}
      role={role ?? 'group'}
      className={getGlassSurfaceClassName('glass-icon-button-group', className)}
      data-background-tone={backgroundTone ?? undefined}
      ref={setElementRef}
    >
      {children}
    </div>
  )
})

GlassIconButtonGroup.displayName = 'GlassIconButtonGroup'

export type GlassIconGroupButtonProps = ComponentPropsWithoutRef<'button'> & {
  size?: IconButtonSize
}

export const GlassIconGroupButton = forwardRef<HTMLButtonElement, GlassIconGroupButtonProps>(function GlassIconGroupButton(
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
      className={cn(getIconButtonClassName('glass', size), className)}
      ref={ref}
      type={type}
    />
  )
})

GlassIconGroupButton.displayName = 'GlassIconGroupButton'

function assignGroupRef(
  ref: Ref<HTMLDivElement> | undefined,
  element: HTMLDivElement | null,
) {
  if (!ref) return

  if (typeof ref === 'function') {
    ref(element)
    return
  }

  ref.current = element
}
