import './bg-blur.css'

export const bgBlurToneMap = {
  glass: {
    label: '磨砂材质',
    backgroundToken: 'none',
    backgroundValue: {
      light: 'none',
      dark: 'none',
    },
    blurToken: '--glass-blur',
    blurValue: '14px',
    filter: 'blur(var(--glass-blur))',
    className: 'bg-blur--glass',
    description: '玻璃 chip 和同类浮动材质使用的半透明背景与柔和背景模糊组合。',
    uiUsage: 'ChipSurface glass',
    bijiUsage: '继承 shared 玻璃 chip/control，暂无本地背景 blur 覆盖',
  },
  backdrop: {
    label: '背景遮罩',
    backgroundToken: '--color-bg-backdrop',
    backgroundValue: {
      light: 'hsl(214.3 33.3% 4.1% / 0.32)',
      dark: 'hsl(214.3 33.3% 4.1% / 0.32)',
    },
    blurToken: '--backdrop-blur',
    blurValue: '4px',
    filter: 'blur(var(--backdrop-blur))',
    className: 'bg-blur--backdrop',
    description: '模态弹层、命令面板和移动端侧边抽屉打开时的背景遮罩与背景模糊组合。',
    uiUsage: 'Coss Dialog backdrop、Command backdrop、SideBar drawer backdrop',
    bijiUsage: '继承 shared Dialog/Command/SideBar drawer，暂无本地背景 blur 覆盖',
  },
} as const

export type BgBlurTone = keyof typeof bgBlurToneMap

export const bgBlurTones = Object.keys(bgBlurToneMap) as BgBlurTone[]

export function getBgBlurClassName(tone: BgBlurTone) {
  return bgBlurToneMap[tone].className
}

export function getBgBlurBackgroundToken(tone: BgBlurTone) {
  return bgBlurToneMap[tone].backgroundToken
}

export function getBgBlurBlurToken(tone: BgBlurTone) {
  return bgBlurToneMap[tone].blurToken
}

export function getBgBlurBlurValue(tone: BgBlurTone) {
  return bgBlurToneMap[tone].blurValue
}

export function getBgBlurFilter(tone: BgBlurTone) {
  return bgBlurToneMap[tone].filter
}
