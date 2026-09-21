import { Slider as BaseSlider } from '@base-ui/react/slider'
import type {
  SliderControlProps,
  SliderIndicatorProps,
  SliderRootProps,
  SliderThumbProps,
  SliderTrackProps,
} from '@base-ui/react/slider'

import { cn } from '../lib/utils'

import './slider.css'

export function Slider<Value extends number | readonly number[]>({
  className,
  ...props
}: SliderRootProps<Value>) {
  return (
    <BaseSlider.Root
      className={cn('coss-slider', className)}
      data-slot="slider"
      {...props}
    />
  )
}

export function SliderControl({ className, ...props }: SliderControlProps) {
  return (
    <BaseSlider.Control
      className={cn('coss-slider__control', className)}
      data-slot="slider-control"
      {...props}
    />
  )
}

export function SliderTrack({ className, ...props }: SliderTrackProps) {
  return (
    <BaseSlider.Track
      className={cn('coss-slider__track', className)}
      data-slot="slider-track"
      {...props}
    />
  )
}

export function SliderIndicator({ className, ...props }: SliderIndicatorProps) {
  return (
    <BaseSlider.Indicator
      className={cn('coss-slider__indicator', className)}
      data-slot="slider-indicator"
      {...props}
    />
  )
}

export function SliderThumb({ className, ...props }: SliderThumbProps) {
  return (
    <BaseSlider.Thumb
      className={cn('coss-slider__thumb', className)}
      data-slot="slider-thumb"
      {...props}
    />
  )
}
