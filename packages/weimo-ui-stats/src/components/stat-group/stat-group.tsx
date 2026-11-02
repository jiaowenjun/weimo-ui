import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { MagicNumber, type MagicNumberFormat } from 'weimo-ui-core/components/magic-number'
import { cn } from 'weimo-ui-core/lib/utils'

import 'weimo-ui-core/styles/tokens.css'
import './stat-group.css'

export type StatGroupItem = {
  key?: string
  value: ReactNode
  label: ReactNode
  /** value 为数字时的展示格式化(透传 MagicNumber,默认四舍五入取整)。 */
  format?: MagicNumberFormat
}

export type StatGroupProps = ComponentPropsWithoutRef<'div'> & {
  items?: StatGroupItem[]
}

// 统计组:value/label 成对的横排大数字。value 传数字时经 MagicNumber 渲染,
// 数值变动即滚动到新值(千分位/单位换算经 format 定制);其余 ReactNode 原样透出。
export function StatGroup({
  children,
  className,
  items = [],
  role,
  ...props
}: StatGroupProps) {
  return (
    <div className={cn('stat-group', className)} role={role ?? 'group'} {...props}>
      {items.map((item, index) => (
        <div className="stat-group__item" key={item.key ?? index}>
          <span className="stat-group__value">
            {typeof item.value === 'number' ? (
              <MagicNumber format={item.format} value={item.value} />
            ) : (
              item.value
            )}
          </span>
          <span className="stat-group__label">{item.label}</span>
        </div>
      ))}
      {children}
    </div>
  )
}
