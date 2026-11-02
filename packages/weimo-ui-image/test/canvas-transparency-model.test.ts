import { describe, expect, it } from 'vitest'

import {
  estimateCanvasTransparencyBackground,
  makeCanvasBackgroundTransparent,
  resolveCanvasTransparencyAlpha,
} from '../src/components/canvas-transparency/canvas-transparency-model'

const white: [number, number, number] = [255, 255, 255]

describe('canvas transparency model', () => {
  it('resolves alpha from color distance with tolerance and feather', () => {
    // 与背景同色:完全透明
    expect(resolveCanvasTransparencyAlpha(white, white, 18, 42)).toBe(0)

    // 容差内的近背景色:完全透明
    expect(resolveCanvasTransparencyAlpha([250, 250, 250], white, 18, 42)).toBe(0)

    // 容差外、羽化中:按距离比例插值(单通道距离 42 → (42-18)/42 * 255 ≈ 146)
    expect(resolveCanvasTransparencyAlpha([213, 255, 255], white, 18, 42)).toBe(146)

    // 距离超过容差 + 羽化:完全不透明
    expect(resolveCanvasTransparencyAlpha([0, 0, 0], white, 18, 42)).toBe(255)

    // 负容差按 0 处理,零羽化时容差外一律不透明
    expect(resolveCanvasTransparencyAlpha([254, 254, 254], white, -5, 0)).toBe(255)
  })

  it('estimates the background color from four corners', () => {
    const width = 4
    const height = 4
    // 左上 2x2 红、右上 2x2 绿、左下 2x2 蓝、右下 2x2 白(默认 sampleSize 不超过边长)
    const pixels = new Uint8ClampedArray(width * height * 4)

    const fill = (x: number, y: number, rgb: readonly number[]) => {
      const offset = (y * width + x) * 4

      pixels[offset] = rgb[0]
      pixels[offset + 1] = rgb[1]
      pixels[offset + 2] = rgb[2]
      pixels[offset + 3] = 255
    }

    for (let y = 0; y < 2; y += 1) {
      for (let x = 0; x < 2; x += 1) {
        fill(x, y, [255, 0, 0])
        fill(x + 2, y, [0, 255, 0])
        fill(x, y + 2, [0, 0, 255])
        fill(x + 2, y + 2, white)
      }
    }

    // 四角均值的每个通道恰好只有一角全亮 → (255+0+0+255)/4 = 128
    expect(estimateCanvasTransparencyBackground(pixels, width, height, 2)).toEqual([
      128, 128, 128,
    ])
  })

  it('keeps foreground pixels and clears background pixels', () => {
    const width = 3
    const height = 1
    // [白, 灰(容差内), 黑(前景)]
    const pixels = new Uint8ClampedArray([
      255, 255, 255, 255,
      250, 250, 250, 255,
      0, 0, 0, 255,
    ])

    const output = makeCanvasBackgroundTransparent(pixels, width, height, {
      background: white,
      tolerance: 18,
      feather: 0,
    })

    expect([...output.slice(0, 4)]).toEqual([255, 255, 255, 0])
    expect([...output.slice(4, 8)]).toEqual([250, 250, 250, 0])
    expect([...output.slice(8, 12)]).toEqual([0, 0, 0, 255])

    // 输入数组不被修改
    expect(pixels[3]).toBe(255)
  })
})
