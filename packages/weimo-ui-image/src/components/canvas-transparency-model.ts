export type CanvasTransparencyRgbColor = readonly [
  red: number,
  green: number,
  blue: number,
]

export type CanvasTransparencyOptions = {
  tolerance: number
  feather: number
}

type BackgroundTransparencyOptions = CanvasTransparencyOptions & {
  background?: CanvasTransparencyRgbColor
  sampleSize?: number
}

type DarkForegroundOptions = {
  background?: CanvasTransparencyRgbColor
  foreground?: CanvasTransparencyRgbColor
  tolerance: number
  sampleSize?: number
}

type ProcessedCanvasBlob = {
  blob: Blob
  height: number
  width: number
}

export type CanvasTransparencyResult = {
  background: CanvasTransparencyRgbColor
  dark: ProcessedCanvasBlob
  light: ProcessedCanvasBlob
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

function resolveInkCoverage(
  red: number,
  green: number,
  blue: number,
  background: CanvasTransparencyRgbColor,
  safeTolerance: number,
  usableDistance: number,
) {
  const distance = Math.hypot(
    red - background[0],
    green - background[1],
    blue - background[2],
  )

  return clamp((distance - safeTolerance) / usableDistance, 0, 1)
}

export function resolveCanvasTransparencyAlpha(
  color: CanvasTransparencyRgbColor,
  background: CanvasTransparencyRgbColor,
  tolerance: number,
  feather: number,
) {
  const distance = Math.hypot(
    color[0] - background[0],
    color[1] - background[1],
    color[2] - background[2],
  )
  const safeTolerance = Math.max(0, tolerance)

  if (distance <= safeTolerance) return 0
  if (feather <= 0) return 255

  return Math.round(clamp((distance - safeTolerance) / feather, 0, 1) * 255)
}

export function estimateCanvasTransparencyBackground(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  sampleSize = 12,
): CanvasTransparencyRgbColor {
  const safeWidth = Math.max(1, Math.floor(width))
  const safeHeight = Math.max(1, Math.floor(height))
  const size = clamp(Math.floor(sampleSize), 1, Math.min(safeWidth, safeHeight))
  const cornerStarts = [
    [0, 0],
    [safeWidth - size, 0],
    [0, safeHeight - size],
    [safeWidth - size, safeHeight - size],
  ] as const
  let red = 0
  let green = 0
  let blue = 0
  let count = 0

  for (const [startX, startY] of cornerStarts) {
    for (let y = startY; y < startY + size; y += 1) {
      for (let x = startX; x < startX + size; x += 1) {
        const offset = (y * safeWidth + x) * 4

        red += pixels[offset]
        green += pixels[offset + 1]
        blue += pixels[offset + 2]
        count += 1
      }
    }
  }

  return [Math.round(red / count), Math.round(green / count), Math.round(blue / count)]
}

export function makeCanvasBackgroundTransparent(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  options: BackgroundTransparencyOptions,
) {
  const output = new Uint8ClampedArray(pixels)
  const background = options.background ??
    estimateCanvasTransparencyBackground(output, width, height, options.sampleSize)

  for (let offset = 0; offset < output.length; offset += 4) {
    const backgroundAlpha = resolveCanvasTransparencyAlpha(
      [output[offset], output[offset + 1], output[offset + 2]],
      background,
      options.tolerance,
      options.feather,
    )

    output[offset + 3] = Math.round((output[offset + 3] * backgroundAlpha) / 255)
  }

  return output
}

export function makeCanvasDarkForeground(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  options: DarkForegroundOptions,
) {
  const output = new Uint8ClampedArray(pixels)
  const background = options.background ??
    estimateCanvasTransparencyBackground(output, width, height, options.sampleSize)
  const foreground = options.foreground ?? [245, 247, 246]
  const safeTolerance = Math.max(0, options.tolerance)
  const maximumDistance = Math.hypot(background[0], background[1], background[2])
  const usableDistance = Math.max(1, maximumDistance - safeTolerance)

  for (let offset = 0; offset < output.length; offset += 4) {
    const coverage = resolveInkCoverage(
      output[offset],
      output[offset + 1],
      output[offset + 2],
      background,
      safeTolerance,
      usableDistance,
    )

    output[offset] = foreground[0]
    output[offset + 1] = foreground[1]
    output[offset + 2] = foreground[2]
    output[offset + 3] = Math.round(output[offset + 3] * coverage)
  }

  return output
}

async function loadImageData(source: string) {
  const image = new Image()

  image.decoding = 'async'
  image.src = source
  await image.decode()

  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const context = canvas.getContext('2d', { willReadFrequently: true })

  if (!context) throw new Error('当前浏览器无法创建 Canvas 2D 上下文。')

  context.drawImage(image, 0, 0)
  return context.getImageData(0, 0, canvas.width, canvas.height)
}

function imageDataToBlob(imageData: ImageData, type: string) {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  const context = canvas.getContext('2d')

  if (!context) throw new Error('当前浏览器无法创建 Canvas 2D 上下文。')

  context.putImageData(imageData, 0, 0)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
        return
      }

      reject(new Error('浏览器未能编码处理后的图像。'))
    }, type)
  })
}

export async function processCanvasTransparency(
  source: string,
  options: CanvasTransparencyOptions,
): Promise<CanvasTransparencyResult> {
  const sourceImageData = await loadImageData(source)
  const background = estimateCanvasTransparencyBackground(
    sourceImageData.data,
    sourceImageData.width,
    sourceImageData.height,
  )
  const lightPixels = makeCanvasBackgroundTransparent(
    sourceImageData.data,
    sourceImageData.width,
    sourceImageData.height,
    { ...options, background },
  )
  const darkPixels = makeCanvasDarkForeground(
    sourceImageData.data,
    sourceImageData.width,
    sourceImageData.height,
    { background, tolerance: options.tolerance },
  )
  const lightImageData = new ImageData(
    lightPixels,
    sourceImageData.width,
    sourceImageData.height,
  )
  const darkImageData = new ImageData(
    darkPixels,
    sourceImageData.width,
    sourceImageData.height,
  )
  const [lightBlob, darkBlob] = await Promise.all([
    imageDataToBlob(lightImageData, 'image/png'),
    imageDataToBlob(darkImageData, 'image/png'),
  ])
  const dimensions = {
    height: sourceImageData.height,
    width: sourceImageData.width,
  }

  return {
    background,
    light: { blob: lightBlob, ...dimensions },
    dark: { blob: darkBlob, ...dimensions },
  }
}
