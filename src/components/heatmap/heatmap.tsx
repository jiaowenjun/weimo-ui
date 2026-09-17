import type { HTMLAttributes } from 'react'

import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from '../coss/tooltip'
import { cn } from '../lib/utils'
import { getHeatColorClassName } from './heat-color'
import {
  buildHeatmapCells,
  buildHeatmapColumns,
  buildHeatmapMonthLabels,
  formatHeatmapDateKey,
  type HeatmapCell,
  type HeatmapDailyCount,
} from './heatmap-model'

import './heatmap.css'

export type { HeatmapCell, HeatmapDailyCount } from './heatmap-model'

export type HeatmapProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'onSelect' | 'aria-label'
> & {
  dailyCounts?: HeatmapDailyCount[]
  activeDate?: string
  ariaLabel?: string
  onDateSelect?: (date: string, cell: HeatmapCell) => void
}

function formatCellAriaLabel(cell: HeatmapCell) {
  const countLabel = `${cell.count} 条记录`

  return `${cell.date}，${countLabel}`
}

export function formatHeatmapTooltip(
  cell: Pick<HeatmapCell, 'count' | 'date'>,
) {
  if (cell.count <= 0) {
    return cell.date
  }

  return `${cell.date}，${cell.count} 条记录`
}

export function Heatmap({
  activeDate = '',
  ariaLabel = '日期热力图',
  className,
  dailyCounts = [],
  onDateSelect,
  role,
  ...props
}: HeatmapProps) {
  const today = formatHeatmapDateKey(new Date())
  const cells = buildHeatmapCells(dailyCounts, today, activeDate)
  const columns = buildHeatmapColumns(cells)
  const monthLabels = new Map(
    buildHeatmapMonthLabels(cells).map((label) => [
      label.columnIndex,
      label.name,
    ]),
  )

  return (
    <div
      {...props}
      aria-label={ariaLabel}
      className={cn('heatmap', className)}
      role={role ?? 'group'}
    >
      <div className="heatmap__grid">
        <TooltipProvider delay={180}>
          {columns.map((column) => {
            const monthLabel = monthLabels.get(column.index)

            return (
              <div className="heatmap__column" key={column.index}>
                {column.cells.map((cell) => (
                  <Tooltip key={cell.date}>
                    <TooltipTrigger
                      render={
                        <button
                          aria-label={formatCellAriaLabel(cell)}
                          className={cn(
                            'heatmap__cell',
                            getHeatColorClassName(cell.level),
                            cell.isActive && 'heatmap__cell--active',
                            cell.isToday && 'heatmap__cell--today',
                          )}
                          data-count={cell.count}
                          data-date={cell.date}
                          data-level={cell.level}
                          onClick={() => onDateSelect?.(cell.date, cell)}
                          type="button"
                        />
                      }
                    />
                    <TooltipPopup>{formatHeatmapTooltip(cell)}</TooltipPopup>
                  </Tooltip>
                ))}
                {monthLabel ? (
                  <span className="heatmap__month">{monthLabel}</span>
                ) : (
                  <span
                    aria-hidden="true"
                    className="heatmap__month-spacer"
                  />
                )}
              </div>
            )
          })}
        </TooltipProvider>
      </div>
    </div>
  )
}
