import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/* jsdom 测试环境下 import.meta.url 非 file 协议,源码路径走 cwd 相对
   (vitest 以包根为 cwd 运行) */
const templateTsx = readFileSync(
  join(
    process.cwd(),
    'src/components/site-template/site-template.tsx',
  ),
  'utf-8',
)
const templateCss = readFileSync(
  join(
    process.cwd(),
    'src/components/site-template/site-template.css',
  ),
  'utf-8',
)

/* 「灵动岛让位避让」契约(topBarIslandYield):CI 无浏览器,锁定源码必须
   自带的协议——实测遮叠判定(非 :has/媒体查询)、四路重测通道、host
   类挂锁的过渡与 320ms 延迟回弹、触发钮零收缩。改动行为须同步本契约。
   时序常量与 core TopBarNotice 收拢退场(transform 260ms)联动。 */

describe('SiteTemplate 灵动岛让位避让', () => {
  it('prop 默认关闭,开启后挂 host 类锁(关闭时 css 零影响)', () => {
    expect(templateTsx).toMatch(/topBarIslandYield = false/)
    expect(templateTsx).toMatch(
      /topBarIslandYield && 'weimo-site-template__top-bar--island-yield'/,
    )
  })

  it('实测遮叠判定:岛锚 center 直接子级(对 wrapper 友好),可见性读 TopBarNotice 的 data-visible,逐元素挂类', () => {
    expect(templateTsx).toMatch(/\.top-bar__center > \*/)
    expect(templateTsx).toMatch(
      /noticeEl\?\.getAttribute\('data-visible'\) === 'true'/,
    )
    expect(templateTsx).toMatch(
      /querySelectorAll\('\.weimo-site-template__top-bar-slot > \*'\)/,
    )
    expect(templateTsx).toMatch(/rect\.left < island\.right \+ MARGIN/)
  })

  it('四路重测通道:data-visible 与槽位 childList 的 MutationObserver、ResizeObserver、window resize(RO(documentElement) 不随视口触发不走)', () => {
    expect(templateTsx).toMatch(/attributeFilter: \['data-visible'\]/)
    expect(templateTsx).toMatch(/domObserver\.observe\(el, \{ childList: true \}\)/)
    expect(templateTsx).toMatch(/new ResizeObserver\(update\)/)
    expect(templateTsx).toMatch(/window\.addEventListener\('resize', update\)/)
    expect(templateTsx).not.toMatch(/observe\(document\.documentElement\)/)
  })

  it('过渡:即时让位(delay 归零)、岛收起后 320ms 延迟回弹,且尊重 prefers-reduced-motion(duration 与 delay 双清零)', () => {
    expect(templateCss).toMatch(
      /\.weimo-site-template__top-bar--island-yield \.weimo-site-template__top-bar-slot > \* \{[^}]*transition: opacity 240ms ease 320ms/s,
    )
    expect(templateCss).toMatch(
      /\.weimo-site-template__island-yield \{[^}]*transition-delay: 0ms/s,
    )
    expect(templateCss).toMatch(
      /prefers-reduced-motion: reduce[^@]*island-yield[^}]*transition-duration: 1ms/s,
    )
  })

  it('侧栏触发钮零收缩(flex-shrink 分摊会把它压成竖椭圆)', () => {
    expect(templateCss).toMatch(
      /\.weimo-site-template__sidebar-trigger \{[^}]*flex: none/s,
    )
  })
})
