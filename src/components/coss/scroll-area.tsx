import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area'
import type { ReactNode } from 'react'

import { cn } from '../lib/utils'

import './scroll-area.css'

type WithStringClassName<T> = Omit<T, 'className'> & {
  className?: string
}

export type ScrollAreaProps = WithStringClassName<BaseScrollArea.Root.Props> & {
  children?: ReactNode
  clampContentMinWidth?: boolean
  fill?: boolean
  scrollFade?: boolean
  scrollbarGutter?: boolean
  viewportClassName?: string
  contentClassName?: string
}

export function ScrollArea({
  children,
  className,
  clampContentMinWidth = true,
  contentClassName,
  fill = false,
  scrollFade = false,
  scrollbarGutter = false,
  viewportClassName,
  ...props
}: ScrollAreaProps) {
  return (
    <BaseScrollArea.Root
      className={cn('coss-scroll-area', className)}
      data-clamp-min-width={clampContentMinWidth ? '' : undefined}
      data-fill={fill ? '' : undefined}
      data-scroll-fade={scrollFade ? '' : undefined}
      data-scrollbar-gutter={scrollbarGutter ? '' : undefined}
      data-slot="scroll-area"
      {...props}
    >
      <BaseScrollArea.Viewport
        className={cn('coss-scroll-area__viewport', viewportClassName)}
        data-slot="scroll-area-viewport"
      >
        <BaseScrollArea.Content
          className={cn('coss-scroll-area__content', contentClassName)}
          data-slot="scroll-area-content"
        >
          {children}
        </BaseScrollArea.Content>
      </BaseScrollArea.Viewport>
      <BaseScrollArea.Scrollbar
        className="coss-scroll-area__scrollbar"
        data-slot="scroll-area-scrollbar"
        orientation="vertical"
      >
        <BaseScrollArea.Thumb
          className="coss-scroll-area__thumb"
          data-slot="scroll-area-thumb"
        />
      </BaseScrollArea.Scrollbar>
      <BaseScrollArea.Scrollbar
        className="coss-scroll-area__scrollbar"
        data-slot="scroll-area-scrollbar"
        orientation="horizontal"
      >
        <BaseScrollArea.Thumb
          className="coss-scroll-area__thumb"
          data-slot="scroll-area-thumb"
        />
      </BaseScrollArea.Scrollbar>
      <BaseScrollArea.Corner
        className="coss-scroll-area__corner"
        data-slot="scroll-area-corner"
      />
    </BaseScrollArea.Root>
  )
}
