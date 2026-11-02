import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { Menu, Monitor, Moon, Sun, X } from 'lucide-react'

import { FrostedIconButton } from 'weimo-ui-core/components/frosted-icon-button'
import { FrostedLabel } from 'weimo-ui-core/components/frosted-label'
import { SideBar } from 'weimo-ui-core/components/sidebar'
import { TopBar } from 'weimo-ui-core/components/top-bar'
import { cn } from 'weimo-ui-core/lib/utils'

import {
  getNextThemeMode,
  getSiteDocumentTitle,
  getThemeToggleLabel,
  type ThemeMode,
} from './site-template-model'
import 'weimo-ui-core/styles/tokens.css'
import './site-template.css'

export type SiteNavigationItem = {
  href: string
  id: string
  label: string
}

export type SiteNavigationGroup = {
  id?: string
  items: readonly SiteNavigationItem[]
  title: string
}

export type SiteNavigationProps = {
  activeItemId?: string
  groups: readonly SiteNavigationGroup[]
  header?: ReactNode
  onNavigate?: (item: SiteNavigationItem) => void
}

export type SiteTemplateSidebarApi = {
  /** 关闭窄屏抽屉;桌面常驻面板下为空操作语义,调用无副作用。 */
  close: () => void
}

export type SiteTemplateSidebar =
  | ReactNode
  | ((api: SiteTemplateSidebarApi) => ReactNode)

export type SiteTemplateProps = {
  activeItemId?: string
  children?: ReactNode
  contentClassName?: string
  contentProps?: Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className'>
  defaultTheme?: ThemeMode
  mainClassName?: string
  manageDocumentTitle?: boolean
  /** 侧边栏自定义内容;提供后整体取代默认的 SiteNavigation 导航(navigationGroups、sidebarHeader、activeItemId、onNavigate 同时失效)。 传函数时注入 `{ close }`,供富侧边栏在选中后收起窄屏抽屉。 */
  sidebar?: SiteTemplateSidebar
  navigationGroups?: readonly SiteNavigationGroup[]
  onNavigate?: (item: SiteNavigationItem) => void
  onThemeChange?: (theme: ThemeMode) => void
  pageTitle?: string
  scrollOnNavigate?: boolean
  sidebarAriaLabel?: string
  sidebarHeader?: ReactNode
  siteName: string
  theme?: ThemeMode
  topBarActions?: ReactNode
  /** 顶栏居中悬浮插槽（灵动岛式，叠于左右插槽之上）；用于临时通知等短驻内容，配 core 的 TopBarNotice 使用，不传不渲染。 */
  topBarCenter?: ReactNode
  /** 灵动岛让位避让（配 topBarCenter 的 core TopBarNotice）：居中悬浮内容实测压到的左/右槽元素（标题胶囊/前置插槽内容/侧栏触发钮/右侧按钮）渐隐让路，岛收起后延迟回弹——压到才藏，岛主权不动内容绕行。默认关闭。 */
  topBarIslandYield?: boolean
  /** 顶栏左侧前置插槽；提供后取代 pageTitle 标签（pageTitle 仍驱动 document.title），与右侧 topBarActions 对称。 */
  topBarLeading?: ReactNode
  /** 是否渲染右侧主题切换按钮；隐藏后主题仍按 defaultTheme/theme 同步到 html.dark，把该位置让给站点自己的 topBarActions。 */
  showThemeToggle?: boolean
  /** 是否渲染窄屏抽屉右上角关闭按钮，默认开启；隐藏后仍可点击背景或左滑收起抽屉。 */
  showSidebarCloseButton?: boolean
}

const EMPTY_NAVIGATION_GROUPS: readonly SiteNavigationGroup[] = []

function ThemeIcon({ theme }: { theme: ThemeMode }) {
  switch (theme) {
    case 'light':
      return <Sun />
    case 'dark':
      return <Moon />
    case 'system':
      return <Monitor />
  }
}

function useTheme({
  defaultTheme,
  onThemeChange,
  theme: controlledTheme,
}: {
  defaultTheme: ThemeMode
  onThemeChange?: (theme: ThemeMode) => void
  theme?: ThemeMode
}) {
  const [internalTheme, setInternalTheme] = useState(defaultTheme)
  const theme = controlledTheme ?? internalTheme

  useEffect(() => {
    if (theme !== 'system') {
      document.documentElement.classList.toggle('dark', theme === 'dark')
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const syncSystemTheme = () => {
      document.documentElement.classList.toggle('dark', mediaQuery.matches)
    }

    syncSystemTheme()
    mediaQuery.addEventListener('change', syncSystemTheme)

    return () => mediaQuery.removeEventListener('change', syncSystemTheme)
  }, [theme])

  const cycleTheme = useCallback(() => {
    const nextTheme = getNextThemeMode(theme)

    if (controlledTheme === undefined) {
      setInternalTheme(nextTheme)
    }

    onThemeChange?.(nextTheme)
  }, [controlledTheme, onThemeChange, theme])

  return { cycleTheme, theme }
}

/** 灵动岛让位避让（topBarIslandYield，自 weimo-douban 生产实装上收）：
 *  居中悬浮内容与左/右槽元素是否遮叠只能实测——岛宽随内容变、遮叠随
 *  视口与标题长短变，媒体查询与 :has 都近似不了。逐元素比对矩形
 *  （含 8px 余量），被压到的挂让位类渐隐、岛不可见全摘（回弹延迟由
 *  css 基态 transition-delay 承担）。测岛锚 .top-bar__center 直接
 *  子级（对消费方包 wrapper 友好），可见性标记始终在 core TopBarNotice
 *  的 data-visible 上。重测通道四路：data-visible MutationObserver
 *  （岛收起时退场保留令尺寸不变，RO 捕捉不到）、槽位 childList
 *  MutationObserver（换标题胶囊/换钮后重挂 RO）、ResizeObserver
 *  （岛宽/目标宽/frame 宽）、window resize 主通道——RO(documentElement)
 *  在 Chromium 不随视口 resize 触发，不走。挂类走 DOM：目标是本模板
 *  槽位元素，逐元素粒度 */
function useTopBarIslandYield(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const topBar = document.querySelector('.weimo-site-template__top-bar')
    const islandEl = topBar?.querySelector('.top-bar__center > *') ?? null
    const noticeEl = topBar?.querySelector('.top-bar-notice') ?? null
    if (!topBar || !islandEl) return

    const MARGIN = 8
    const YIELD_CLASS = 'weimo-site-template__island-yield'
    const update = () => {
      const visible = noticeEl?.getAttribute('data-visible') === 'true'
      const island = islandEl.getBoundingClientRect()
      topBar
        .querySelectorAll('.weimo-site-template__top-bar-slot > *')
        .forEach((el) => {
          const rect = el.getBoundingClientRect()
          const hit =
            visible &&
            island.width > 0 &&
            rect.width > 0 &&
            rect.left < island.right + MARGIN &&
            rect.right > island.left - MARGIN
          el.classList.toggle(YIELD_CLASS, hit)
        })
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(islandEl)
    const frameEl = topBar.querySelector('.top-bar__frame')
    if (frameEl) observer.observe(frameEl)
    topBar
      .querySelectorAll('.weimo-site-template__top-bar-slot > *')
      .forEach((el) => observer.observe(el))
    const domObserver = new MutationObserver(update)
    if (noticeEl) {
      domObserver.observe(noticeEl, {
        attributes: true,
        attributeFilter: ['data-visible'],
      })
    }
    topBar
      .querySelectorAll('.weimo-site-template__top-bar-slot, .top-bar__center')
      .forEach((el) => domObserver.observe(el, { childList: true }))
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      domObserver.disconnect()
      window.removeEventListener('resize', update)
      topBar
        .querySelectorAll(`.${YIELD_CLASS}`)
        .forEach((el) => el.classList.remove(YIELD_CLASS))
    }
  }, [enabled])
}

export function SiteNavigation({
  activeItemId,
  groups,
  header,
  onNavigate,
}: SiteNavigationProps) {
  function handleClick(
    event: MouseEvent<HTMLAnchorElement>,
    item: SiteNavigationItem,
  ) {
    if (!onNavigate) return

    event.preventDefault()
    onNavigate(item)
  }

  return (
    <div className="weimo-site-template__navigation" data-base-ui-swipe-ignore>
      <div className="weimo-site-template__navigation-header">{header}</div>

      {groups.map((group) => (
        <nav
          aria-label={group.title}
          className="weimo-site-template__navigation-group"
          key={group.id ?? group.title}
        >
          <p>{group.title}</p>
          {group.items.map((item) => {
            const active = item.id === activeItemId

            return (
              <a
                aria-current={active ? 'page' : undefined}
                className={active ? 'active' : undefined}
                href={item.href}
                key={item.id}
                onClick={(event) => handleClick(event, item)}
              >
                <span>{item.label}</span>
              </a>
            )
          })}
        </nav>
      ))}
    </div>
  )
}

export function SiteTemplate({
  activeItemId,
  children,
  contentClassName,
  contentProps,
  defaultTheme = 'system',
  mainClassName,
  manageDocumentTitle = true,
  navigationGroups = EMPTY_NAVIGATION_GROUPS,
  onNavigate,
  onThemeChange,
  pageTitle,
  scrollOnNavigate = true,
  sidebar,
  sidebarAriaLabel = '侧边栏',
  sidebarHeader,
  showSidebarCloseButton = true,
  showThemeToggle = true,
  siteName,
  theme: controlledTheme,
  topBarActions,
  topBarCenter,
  topBarIslandYield = false,
  topBarLeading,
}: SiteTemplateProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { cycleTheme, theme } = useTheme({
    defaultTheme,
    onThemeChange,
    theme: controlledTheme,
  })
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const sidebarApi = useMemo(
    () => ({ close: closeSidebar }),
    [closeSidebar],
  )
  const sidebarContent =
    typeof sidebar === 'function' ? sidebar(sidebarApi) : sidebar

  useTopBarIslandYield(topBarIslandYield)

  useEffect(() => {
    if (manageDocumentTitle) {
      document.title = getSiteDocumentTitle(siteName, pageTitle)
    }
  }, [manageDocumentTitle, pageTitle, siteName])

  const handleNavigate = useCallback(
    (item: SiteNavigationItem) => {
      onNavigate?.(item)
      closeSidebar()

      if (scrollOnNavigate) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    [closeSidebar, onNavigate, scrollOnNavigate],
  )

  const navigationHeader = sidebarHeader ?? <strong>{siteName}</strong>
  const leftSlot = (
    <div className="weimo-site-template__top-bar-slot">
      <FrostedIconButton
        aria-label="打开侧边栏"
        className="weimo-site-template__sidebar-trigger"
        onClick={() => setSidebarOpen(true)}
        tooltip="打开侧边栏"
      >
        <Menu />
      </FrostedIconButton>
      {topBarLeading ? (
        <div className="weimo-site-template__top-bar-leading">
          {topBarLeading}
        </div>
      ) : pageTitle ? (
        <FrostedLabel
          className="weimo-site-template__page-title"
          key={pageTitle}
          size="lg"
        >
          {pageTitle}
        </FrostedLabel>
      ) : null}
    </div>
  )
  const rightSlot = (
    <div className="weimo-site-template__top-bar-slot">
      {topBarActions}
      {showThemeToggle ? (
        <FrostedIconButton
          aria-label={getThemeToggleLabel(theme)}
          onClick={cycleTheme}
          tooltip={getThemeToggleLabel(theme)}
        >
          <ThemeIcon theme={theme} />
        </FrostedIconButton>
      ) : null}
    </div>
  )

  return (
    <>
      <SideBar
        ariaLabel={sidebarAriaLabel}
        className="weimo-site-template__sidebar"
        drawerAction={
          showSidebarCloseButton ? (
            <FrostedIconButton aria-label="关闭侧边栏" onClick={closeSidebar}>
              <X />
            </FrostedIconButton>
          ) : undefined
        }
        open={sidebarOpen}
        onClose={closeSidebar}
      >
        {sidebarContent ?? (
          <SiteNavigation
            activeItemId={activeItemId}
            groups={navigationGroups}
            header={navigationHeader}
            onNavigate={onNavigate ? handleNavigate : undefined}
          />
        )}
      </SideBar>
      <TopBar
        centerSlot={topBarCenter}
        className={cn(
          'weimo-site-template__top-bar',
          topBarIslandYield && 'weimo-site-template__top-bar--island-yield',
        )}
        leftSlot={leftSlot}
        rightSlot={rightSlot}
      />

      <main className={cn('weimo-site-template', mainClassName)}>
        <div className="weimo-site-template__layout">
          <div
            aria-hidden="true"
            className="weimo-site-template__sidebar-space"
          />
          <div
            {...contentProps}
            className={cn(
              'weimo-site-template__content',
              contentClassName,
            )}
          >
            {children}
          </div>
        </div>
      </main>
    </>
  )
}

export type { ThemeMode } from './site-template-model'
