import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { Check } from 'lucide-react'

import { BottomBar } from './bottom-bar'
import { GlassIconButton } from './glass-icon-button'
import { cn } from './lib/utils'

import './card-tool-bar.css'

export type CardToolBarProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  disabled?: boolean
  saveDisabled?: boolean
  saveLabel?: string
  toolbarSlot?: ReactNode
  onSave?: () => void
}

export const CardToolBar = forwardRef<HTMLDivElement, CardToolBarProps>(function CardToolBar(
  {
    className,
    disabled,
    onSave,
    saveDisabled,
    saveLabel = '保存',
    toolbarSlot,
    ...props
  },
  ref,
) {
  return (
    <BottomBar
      {...props}
      ref={ref}
      className={cn('weimo-card-tool-bar', className)}
      leftSlot={toolbarSlot}
      rightSlot={
        <div className="weimo-card-tool-bar__actions">
          <GlassIconButton
            aria-label={saveLabel}
            disabled={disabled || saveDisabled}
            onClick={onSave}
            onMouseDown={(event) => event.preventDefault()}
          >
            <Check />
          </GlassIconButton>
        </div>
      }
    />
  )
})

CardToolBar.displayName = 'CardToolBar'
