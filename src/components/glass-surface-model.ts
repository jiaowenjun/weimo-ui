import type { ClassValue } from 'clsx'

import { cn } from './lib/utils'

export type GlassSurfaceBackgroundTone = 'light' | 'dark'

export type GlassSurfaceColor = {
  red: number
  green: number
  blue: number
  alpha: number
}

type GlassSurfacePoint = {
  x: number
  y: number
}

type GlassSurfaceRenderedRect = Pick<
  DOMRect,
  'bottom' | 'height' | 'left' | 'right' | 'top' | 'width'
>

const BACKGROUND_LIGHTNESS_THRESHOLD = 0.5
const MIN_VISIBLE_ALPHA = 0.05
const MIN_VIDEO_READY_STATE = 2

export function getGlassSurfaceClassName(...className: ClassValue[]) {
  return cn('glass-surface', className)
}

export function resolveElementBackgroundTone(
  element: HTMLElement,
): GlassSurfaceBackgroundTone | null {
  const ownerDocument = element.ownerDocument
  const ownerWindow = ownerDocument.defaultView

  if (!ownerWindow || typeof ownerDocument.elementsFromPoint !== 'function') {
    return null
  }

  const rect = element.getBoundingClientRect()

  if (rect.width <= 0 || rect.height <= 0) {
    return null
  }

  const samplePoints = getElementSamplePoints(rect)
  const sampleColors: GlassSurfaceColor[] = []

  for (const point of samplePoints) {
    const backgroundColor = findBackgroundColorBehindElement(element, point.x, point.y)

    if (backgroundColor) {
      sampleColors.push(backgroundColor)
    }
  }

  if (sampleColors.length === 0) {
    return null
  }

  const averageLuminance =
    sampleColors.reduce((sum, color) => sum + relativeLuminanceForRgb(color), 0) /
    sampleColors.length

  return averageLuminance >= BACKGROUND_LIGHTNESS_THRESHOLD ? 'light' : 'dark'
}

export function getReadableToneForColor(
  color: GlassSurfaceColor,
): GlassSurfaceBackgroundTone {
  return relativeLuminanceForRgb(color) >= BACKGROUND_LIGHTNESS_THRESHOLD ? 'light' : 'dark'
}

export function relativeLuminanceForRgb({
  red,
  green,
  blue,
}: Pick<GlassSurfaceColor, 'red' | 'green' | 'blue'>) {
  const [linearRed, linearGreen, linearBlue] = [red, green, blue].map((channel) => {
    const normalized = clamp(channel, 0, 255) / 255

    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4
  })

  return 0.2126 * linearRed + 0.7152 * linearGreen + 0.0722 * linearBlue
}

export function parseCssColor(color: string): GlassSurfaceColor | null {
  const normalizedColor = color.trim().toLowerCase()

  if (!normalizedColor || normalizedColor === 'transparent') {
    return { red: 0, green: 0, blue: 0, alpha: 0 }
  }

  const hexColor = parseHexColor(normalizedColor)

  if (hexColor) {
    return hexColor
  }

  const rgbMatch = normalizedColor.match(/^rgba?\((.*)\)$/)

  if (!rgbMatch) {
    return null
  }

  const [channelSource, alphaSource] = rgbMatch[1].split('/').map((part) => part.trim())
  const channels = channelSource
    .split(/[\s,]+/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (channels.length < 3) {
    return null
  }

  const alphaChannel = alphaSource ?? channels[3] ?? '1'
  const red = parseRgbChannel(channels[0])
  const green = parseRgbChannel(channels[1])
  const blue = parseRgbChannel(channels[2])
  const alpha = parseAlphaChannel(alphaChannel)

  if ([red, green, blue, alpha].some((channel) => Number.isNaN(channel))) {
    return null
  }

  return {
    red,
    green,
    blue,
    alpha,
  }
}

function findBackgroundColorBehindElement(
  element: HTMLElement,
  x: number,
  y: number,
): GlassSurfaceColor | null {
  const ownerWindow = element.ownerDocument.defaultView

  if (!ownerWindow) {
    return null
  }

  const stack = element.ownerDocument.elementsFromPoint(x, y)
  const backgroundCandidates = stack.filter((candidate): candidate is Element => {
    return (
      candidate instanceof ownerWindow.Element &&
      candidate !== element &&
      !element.contains(candidate)
    )
  })

  for (const candidate of backgroundCandidates) {
    const sampledPixelColor = sampleActualPixelColor(candidate, x, y)

    if (sampledPixelColor && sampledPixelColor.alpha > MIN_VISIBLE_ALPHA) {
      return sampledPixelColor
    }

    const backgroundColor = findPaintedElementBackground(candidate)

    if (backgroundColor) {
      return backgroundColor
    }
  }

  for (const candidate of backgroundCandidates) {
    const backgroundColor = findNearestPaintedBackground(candidate)

    if (backgroundColor) {
      return backgroundColor
    }
  }

  return null
}

function findNearestPaintedBackground(element: Element): GlassSurfaceColor | null {
  const ownerWindow = element.ownerDocument.defaultView
  let current: Element | null = element

  while (current && ownerWindow) {
    const backgroundColor = findPaintedElementBackground(current)

    if (backgroundColor) return backgroundColor

    current = current.parentElement
  }

  return null
}

function findPaintedElementBackground(element: Element): GlassSurfaceColor | null {
  const ownerWindow = element.ownerDocument.defaultView

  if (!ownerWindow) {
    return null
  }

  const computedStyle = ownerWindow.getComputedStyle(element)
  const colors = [
    ...extractCssColors(computedStyle.backgroundImage),
    parseCssColor(computedStyle.backgroundColor),
  ].filter((color): color is GlassSurfaceColor => Boolean(color))
  const visibleColors = colors.filter((color) => color.alpha > MIN_VISIBLE_ALPHA)

  if (visibleColors.length === 0) {
    return null
  }

  return averageColors(visibleColors)
}

function sampleActualPixelColor(
  element: Element,
  x: number,
  y: number,
): GlassSurfaceColor | null {
  const ownerWindow = element.ownerDocument.defaultView

  if (!ownerWindow) {
    return null
  }

  if (
    'HTMLImageElement' in ownerWindow &&
    element instanceof ownerWindow.HTMLImageElement
  ) {
    return sampleImageElementPixel(element, x, y)
  }

  if (
    'HTMLCanvasElement' in ownerWindow &&
    element instanceof ownerWindow.HTMLCanvasElement
  ) {
    return sampleCanvasElementPixel(element, x, y)
  }

  if (
    'HTMLVideoElement' in ownerWindow &&
    element instanceof ownerWindow.HTMLVideoElement
  ) {
    return sampleVideoElementPixel(element, x, y)
  }

  return null
}

function sampleImageElementPixel(
  image: HTMLImageElement,
  x: number,
  y: number,
): GlassSurfaceColor | null {
  if (!image.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0) {
    return null
  }

  const sourcePoint = mapClientPointToObjectPixel(
    image,
    x,
    y,
    image.naturalWidth,
    image.naturalHeight,
  )

  if (!sourcePoint) {
    return null
  }

  return drawImageSourcePixel(image, sourcePoint, image.ownerDocument)
}

function sampleCanvasElementPixel(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
): GlassSurfaceColor | null {
  if (canvas.width <= 0 || canvas.height <= 0) {
    return null
  }

  const sourcePoint = mapClientPointToElementPixel(canvas, x, y, canvas.width, canvas.height)

  if (!sourcePoint) {
    return null
  }

  const context = canvas.getContext('2d', { willReadFrequently: true })

  if (!context) {
    return null
  }

  return readCanvasPixel(context, sourcePoint)
}

function sampleVideoElementPixel(
  video: HTMLVideoElement,
  x: number,
  y: number,
): GlassSurfaceColor | null {
  if (
    video.readyState < MIN_VIDEO_READY_STATE ||
    video.videoWidth <= 0 ||
    video.videoHeight <= 0
  ) {
    return null
  }

  const sourcePoint = mapClientPointToObjectPixel(
    video,
    x,
    y,
    video.videoWidth,
    video.videoHeight,
  )

  if (!sourcePoint) {
    return null
  }

  return drawImageSourcePixel(video, sourcePoint, video.ownerDocument)
}

function getElementSamplePoints(rect: DOMRect) {
  const insetX = Math.max(1, rect.width * 0.18)
  const insetY = Math.max(1, rect.height * 0.18)

  return [
    { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
    { x: rect.left + insetX, y: rect.top + insetY },
    { x: rect.right - insetX, y: rect.top + insetY },
    { x: rect.left + insetX, y: rect.bottom - insetY },
    { x: rect.right - insetX, y: rect.bottom - insetY },
  ]
}

function mapClientPointToObjectPixel(
  element: HTMLElement,
  clientX: number,
  clientY: number,
  intrinsicWidth: number,
  intrinsicHeight: number,
): GlassSurfacePoint | null {
  const renderedRect = getRenderedObjectRect(element, intrinsicWidth, intrinsicHeight)

  if (!renderedRect) {
    return null
  }

  return mapClientPointToRenderedPixel(
    renderedRect,
    clientX,
    clientY,
    intrinsicWidth,
    intrinsicHeight,
  )
}

function mapClientPointToElementPixel(
  element: HTMLElement,
  clientX: number,
  clientY: number,
  sourceWidth: number,
  sourceHeight: number,
): GlassSurfacePoint | null {
  return mapClientPointToRenderedPixel(
    element.getBoundingClientRect(),
    clientX,
    clientY,
    sourceWidth,
    sourceHeight,
  )
}

function mapClientPointToRenderedPixel(
  renderedRect: GlassSurfaceRenderedRect,
  clientX: number,
  clientY: number,
  sourceWidth: number,
  sourceHeight: number,
): GlassSurfacePoint | null {
  if (
    renderedRect.width <= 0 ||
    renderedRect.height <= 0 ||
    sourceWidth <= 0 ||
    sourceHeight <= 0 ||
    clientX < renderedRect.left ||
    clientX > renderedRect.right ||
    clientY < renderedRect.top ||
    clientY > renderedRect.bottom
  ) {
    return null
  }

  return {
    x: clamp(
      ((clientX - renderedRect.left) / renderedRect.width) * sourceWidth,
      0,
      sourceWidth - 1,
    ),
    y: clamp(
      ((clientY - renderedRect.top) / renderedRect.height) * sourceHeight,
      0,
      sourceHeight - 1,
    ),
  }
}

function getRenderedObjectRect(
  element: HTMLElement,
  intrinsicWidth: number,
  intrinsicHeight: number,
): GlassSurfaceRenderedRect | null {
  const rect = element.getBoundingClientRect()

  if (
    rect.width <= 0 ||
    rect.height <= 0 ||
    intrinsicWidth <= 0 ||
    intrinsicHeight <= 0
  ) {
    return null
  }

  const computedStyle = element.ownerDocument.defaultView?.getComputedStyle(element)
  const objectFit = computedStyle?.objectFit || 'fill'
  const containedScale = Math.min(rect.width / intrinsicWidth, rect.height / intrinsicHeight)
  const coveredScale = Math.max(rect.width / intrinsicWidth, rect.height / intrinsicHeight)
  let renderedWidth = rect.width
  let renderedHeight = rect.height

  if (objectFit === 'contain') {
    renderedWidth = intrinsicWidth * containedScale
    renderedHeight = intrinsicHeight * containedScale
  } else if (objectFit === 'cover') {
    renderedWidth = intrinsicWidth * coveredScale
    renderedHeight = intrinsicHeight * coveredScale
  } else if (objectFit === 'none') {
    renderedWidth = intrinsicWidth
    renderedHeight = intrinsicHeight
  } else if (objectFit === 'scale-down') {
    const containedWidth = intrinsicWidth * containedScale
    const containedHeight = intrinsicHeight * containedScale

    if (containedWidth * containedHeight < intrinsicWidth * intrinsicHeight) {
      renderedWidth = containedWidth
      renderedHeight = containedHeight
    } else {
      renderedWidth = intrinsicWidth
      renderedHeight = intrinsicHeight
    }
  }

  const objectPosition = parseObjectPosition(computedStyle?.objectPosition ?? '50% 50%')
  const left = rect.left + (rect.width - renderedWidth) * objectPosition.x
  const top = rect.top + (rect.height - renderedHeight) * objectPosition.y

  return {
    bottom: top + renderedHeight,
    height: renderedHeight,
    left,
    right: left + renderedWidth,
    top,
    width: renderedWidth,
  }
}

function parseObjectPosition(position: string) {
  const tokens = position.trim().toLowerCase().split(/\s+/).filter(Boolean)
  let x = 0.5
  let y = 0.5

  if (tokens.includes('left')) x = 0
  if (tokens.includes('right')) x = 1
  if (tokens.includes('top')) y = 0
  if (tokens.includes('bottom')) y = 1

  const percentages = tokens
    .filter((token) => token.endsWith('%'))
    .map((token) => clamp(Number.parseFloat(token) / 100, 0, 1))

  if (percentages[0] !== undefined) {
    x = percentages[0]
  }

  if (percentages[1] !== undefined) {
    y = percentages[1]
  }

  return { x, y }
}

function drawImageSourcePixel(
  source: CanvasImageSource,
  sourcePoint: GlassSurfacePoint,
  ownerDocument: Document,
): GlassSurfaceColor | null {
  const canvas = ownerDocument.createElement('canvas')

  canvas.width = 1
  canvas.height = 1

  const context = canvas.getContext('2d', { willReadFrequently: true })

  if (!context) {
    return null
  }

  try {
    context.clearRect(0, 0, 1, 1)
    context.drawImage(
      source,
      Math.floor(sourcePoint.x),
      Math.floor(sourcePoint.y),
      1,
      1,
      0,
      0,
      1,
      1,
    )

    return imageDataToColor(context.getImageData(0, 0, 1, 1).data)
  } catch {
    return null
  }
}

function readCanvasPixel(
  context: CanvasRenderingContext2D,
  sourcePoint: GlassSurfacePoint,
): GlassSurfaceColor | null {
  try {
    return imageDataToColor(
      context.getImageData(Math.floor(sourcePoint.x), Math.floor(sourcePoint.y), 1, 1).data,
    )
  } catch {
    return null
  }
}

function imageDataToColor(data: Uint8ClampedArray): GlassSurfaceColor {
  return {
    red: data[0],
    green: data[1],
    blue: data[2],
    alpha: data[3] / 255,
  }
}

function extractCssColors(source: string) {
  const colors: GlassSurfaceColor[] = []
  const colorMatches = source.match(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)/gi) ?? []

  for (const colorMatch of colorMatches) {
    const color = parseCssColor(colorMatch)

    if (color) {
      colors.push(color)
    }
  }

  return colors
}

function averageColors(colors: GlassSurfaceColor[]) {
  const totalAlpha = colors.reduce((sum, color) => sum + color.alpha, 0)

  if (totalAlpha <= 0) {
    return null
  }

  return colors.reduce(
    (average, color) => {
      const weight = color.alpha / totalAlpha

      return {
        red: average.red + color.red * weight,
        green: average.green + color.green * weight,
        blue: average.blue + color.blue * weight,
        alpha: average.alpha + color.alpha * weight,
      }
    },
    { red: 0, green: 0, blue: 0, alpha: 0 },
  )
}

function parseHexColor(color: string): GlassSurfaceColor | null {
  const match = color.match(/^#([0-9a-f]{3,8})$/i)

  if (!match) {
    return null
  }

  const hex = match[1]
  const channels =
    hex.length === 3 || hex.length === 4
      ? hex.split('').map((digit) => `${digit}${digit}`)
      : hex.match(/.{2}/g)

  if (!channels || channels.length < 3) {
    return null
  }

  return {
    red: Number.parseInt(channels[0], 16),
    green: Number.parseInt(channels[1], 16),
    blue: Number.parseInt(channels[2], 16),
    alpha: channels[3] ? Number.parseInt(channels[3], 16) / 255 : 1,
  }
}

function parseRgbChannel(channel: string) {
  if (channel.endsWith('%')) {
    return clamp((Number.parseFloat(channel) / 100) * 255, 0, 255)
  }

  return clamp(Number.parseFloat(channel), 0, 255)
}

function parseAlphaChannel(channel: string) {
  if (channel.endsWith('%')) {
    return clamp(Number.parseFloat(channel) / 100, 0, 1)
  }

  return clamp(Number.parseFloat(channel), 0, 1)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
