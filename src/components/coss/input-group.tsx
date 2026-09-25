import type { ComponentPropsWithoutRef, MouseEvent } from 'react'

import { getFrostedSurfaceClassName } from '../frosted-surface-model'
import { cn } from '../lib/utils'

import '../frosted-surface.css'
import './input-group.css'

export type InputGroupAddonAlign =
  | 'block-end'
  | 'block-start'
  | 'inline-end'
  | 'inline-start'

export type InputGroupProps = ComponentPropsWithoutRef<'div'>

export function InputGroup({ className, ...props }: InputGroupProps) {
  return (
    <div
      className={getFrostedSurfaceClassName('coss-input-group', className)}
      data-slot="input-group"
      role="group"
      {...props}
    />
  )
}

export type InputGroupAddonProps = ComponentPropsWithoutRef<'div'> & {
  align?: InputGroupAddonAlign
}

export function InputGroupAddon({
  align = 'inline-start',
  className,
  onMouseDown,
  ...props
}: InputGroupAddonProps) {
  function handleMouseDown(event: MouseEvent<HTMLDivElement>) {
    onMouseDown?.(event)
    if (event.defaultPrevented) return

    const target = event.target as HTMLElement
    const isInteractive = target.closest(
      "button, a, input, select, textarea, [role='button'], [role='combobox'], [role='listbox']",
    )
    if (isInteractive) return

    event.preventDefault()
    const input = event.currentTarget.parentElement?.querySelector<
      HTMLInputElement | HTMLTextAreaElement
    >('input, textarea')

    if (input && document.activeElement !== input) {
      input.focus()
    }
  }

  return (
    <div
      className={cn('coss-input-group__addon', className)}
      data-align={align}
      data-slot="input-group-addon"
      onMouseDown={handleMouseDown}
      {...props}
    />
  )
}

export type InputGroupInputProps = ComponentPropsWithoutRef<'input'>

export function InputGroupInput({
  className,
  ...props
}: InputGroupInputProps) {
  return (
    <input
      className={cn('coss-input-group__input', className)}
      data-slot="input"
      {...props}
    />
  )
}

export type InputGroupTextProps = ComponentPropsWithoutRef<'span'>

export function InputGroupText({ className, ...props }: InputGroupTextProps) {
  return (
    <span
      className={cn('coss-input-group__text', className)}
      data-slot="input-group-text"
      {...props}
    />
  )
}
