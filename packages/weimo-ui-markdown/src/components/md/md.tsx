import { forwardRef } from 'react'

import { cn } from 'weimo-ui-core/lib/utils'
import { MdRender, type MdRenderProps } from 'weimo-ui-markdown/components/md-render'
import 'weimo-ui-markdown/styles/md.css'

export type MdProps = MdRenderProps

export const Md = forwardRef<HTMLDivElement, MdProps>(function Md(
  {
    className,
    content,
    ...props
  },
  ref,
) {
  return (
    <MdRender
      ref={ref}
      className={cn('md', className)}
      content={content}
      {...props}
    />
  )
})

Md.displayName = 'Md'
