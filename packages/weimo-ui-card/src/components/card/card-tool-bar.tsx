import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { Check } from 'lucide-react'

import { BottomBar } from 'weimo-ui-core/components/bottom-bar'
import { FrostedIconButton } from 'weimo-ui-core/components/frosted-icon-button'
import { cn } from 'weimo-ui-core/lib/utils'

import './card-tool-bar.css'

export type CardToolBarProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  disabled?: boolean
  /* 透传给内部 BottomBar/FloatBar 的公开 frame 定制钩子。 */
  frameClassName?: string
  saveDisabled?: boolean
  saveLabel?: string
  toolbarSlot?: ReactNode
  onSave?: () => void
}

export const CardToolBar = forwardRef<HTMLDivElement, CardToolBarProps>(function CardToolBar(
  {
    className,
    disabled,
    frameClassName,
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
      frameClassName={frameClassName}
      leftSlot={toolbarSlot}
      rightSlot={
        <div className="weimo-card-tool-bar__actions">
          <FrostedIconButton
            aria-label={saveLabel}
            disabled={disabled || saveDisabled}
            onClick={onSave}
            onMouseDown={(event) => event.preventDefault()}
          >
            <Check />
          </FrostedIconButton>
        </div>
      }
    />
  )
})

CardToolBar.displayName = 'CardToolBar'
