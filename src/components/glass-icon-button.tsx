import { forwardRef, useCallback } from 'react'
import type { ComponentPropsWithoutRef, Ref } from 'react'

import {
  getGlassSurfaceClassName,
  useGlassSurfaceBackgroundToneRef,
} from './glass-surface'
import { getIconButtonClassName, type IconButtonSize } from './icon-button-model'

import './glass-surface.css'
import './icon-button.css'

export type GlassIconButtonProps = ComponentPropsWithoutRef<'button'> & {
  size?: IconButtonSize
}

export const GlassIconButton = forwardRef<HTMLButtonElement, GlassIconButtonProps>(function GlassIconButton(
  {
    className,
    size,
    type = 'button',
    ...props
  },
  ref,
) {
  const {
    backgroundTone,
    setElementRef: setGlassSurfaceElementRef,
  } = useGlassSurfaceBackgroundToneRef<HTMLButtonElement>(true)
  const setElementRef = useCallback((element: HTMLButtonElement | null) => {
    setGlassSurfaceElementRef(element)
    assignButtonRef(ref, element)
  }, [ref, setGlassSurfaceElementRef])

  return (
    <button
      {...props}
      className={getGlassSurfaceClassName(getIconButtonClassName('glass', size), className)}
      data-background-tone={backgroundTone ?? undefined}
      ref={setElementRef}
      type={type}
    />
  )
})

GlassIconButton.displayName = 'GlassIconButton'

function assignButtonRef(
  ref: Ref<HTMLButtonElement> | undefined,
  element: HTMLButtonElement | null,
) {
  if (!ref) return

  if (typeof ref === 'function') {
    ref(element)
    return
  }

  ref.current = element
}
