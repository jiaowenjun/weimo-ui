import type { HTMLAttributes } from 'react'

import { cn } from '../lib/utils'
import type { HeatmapLevel } from './heatmap-model'

import '../heat-color.css'

export type HeatColorLevel = HeatmapLevel

export const heatColorMap = {
  0: {
    label: '0 级',
    token: '--color-heat-0',
    value: {
      light: 'hsl(0 0% 0% / 0.06)',
      dark: 'hsl(0 0% 100% / 0.08)',
    },
    className: 'heat-color--0',
    description: '无记录或最低热力的基础色阶。',
  },
  1: {
    label: '1 级',
    token: '--color-heat-1',
    value: {
      light: 'hsl(18.1 71.9% 46.1% / 0.2)',
      dark: 'hsl(22.6 85% 60.8% / 0.2)',
    },
    className: 'heat-color--1',
    description: '轻量活动或低热力状态。',
  },
  2: {
    label: '2 级',
    token: '--color-heat-2',
    value: {
      light: 'hsl(18.1 71.9% 46.1% / 0.4)',
      dark: 'hsl(22.6 85% 60.8% / 0.4)',
    },
    className: 'heat-color--2',
    description: '中低热力状态。',
  },
  3: {
    label: '3 级',
    token: '--color-heat-3',
    value: {
      light: 'hsl(18.1 71.9% 46.1% / 0.65)',
      dark: 'hsl(22.6 85% 60.8% / 0.65)',
    },
    className: 'heat-color--3',
    description: '中高热力状态。',
  },
  4: {
    label: '4 级',
    token: '--color-heat-4',
    value: {
      light: 'hsl(18.1 71.9% 46.1% / 0.9)',
      dark: 'hsl(22.6 85% 60.8% / 0.9)',
    },
    className: 'heat-color--4',
    description: '最高热力状态。',
  },
} satisfies Record<HeatColorLevel, {
  label: string
  token: string
  value: {
    light: string
    dark: string
  }
  className: string
  description: string
}>

export const heatColorLevels = [0, 1, 2, 3, 4] as HeatColorLevel[]

const defaultLevels: HeatColorLevel[] = [...heatColorLevels]

function formatDefaultLevelLabel(level: HeatColorLevel) {
  if (level === 0) {
    return '0 级，无记录'
  }

  return `${level} 级热力`
}

export type HeatColorProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'aria-label'
> & {
  levels?: HeatColorLevel[]
  ariaLabel?: string
  getLevelLabel?: (level: HeatColorLevel) => string
}

export function getHeatColorClassName(level: HeatColorLevel) {
  return heatColorMap[level].className
}

export function getHeatColorToken(level: HeatColorLevel) {
  return heatColorMap[level].token
}

export function HeatColor({
  ariaLabel = '热力图颜色色阶',
  className,
  getLevelLabel = formatDefaultLevelLabel,
  levels = defaultLevels,
  role,
  ...props
}: HeatColorProps) {
  return (
    <div
      {...props}
      aria-label={ariaLabel}
      className={cn('heat-color', className)}
      role={role ?? 'group'}
    >
      {levels.map((level) => (
        <span
          aria-label={getLevelLabel(level)}
          className={cn('heat-color__swatch', getHeatColorClassName(level))}
          data-level={level}
          key={level}
          role="img"
        />
      ))}
    </div>
  )
}
