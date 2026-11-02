import {
  useCallback,
  useEffect,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'

import { FrostedIconButton } from 'weimo-ui-core/components/frosted-icon-button'
import { TopBar } from 'weimo-ui-core/components/top-bar'
import { cn } from 'weimo-ui-core/lib/utils'

import {
  getNextThemeMode,
  getSiteDocumentTitle,
  getThemeToggleLabel,
  type ThemeMode,
} from '../site-template/site-template-model'
import 'weimo-ui-core/styles/tokens.css'
import './mini-site-template.css'

export type MiniSiteTemplateProps = {
  children?: ReactNode
  contentClassName?: string
  contentProps?: Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className'>
  defaultTheme?: ThemeMode
  headline?: ReactNode
  mainClassName?: string
  manageDocumentTitle?: boolean
  onThemeChange?: (theme: ThemeMode) => void
  pageTitle?: string
  showThemeToggle?: boolean
  siteName: string
  subheadline?: ReactNode
  theme?: ThemeMode
  topBarActions?: ReactNode
  /** 顶栏居中悬浮插槽（灵动岛式，叠于左右插槽之上）；用于临时通知等短驻内容，配 core 的 TopBarNotice 使用，不传不渲染。 */
  topBarCenter?: ReactNode
  topBarLeading?: ReactNode
}

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

/**
 * MiniSiteTemplate:无侧边栏的单页站壳(顶栏 + 全宽内容)。
 * 与 SiteTemplate 同源的主题与文档标题约定;pageTitle/siteName 仅驱动
 * document.title,顶栏左侧只渲染 `topBarLeading` 前置插槽(与右侧
 * `topBarActions` 对称,模板不赋予其导航语义)。
 * `showThemeToggle={false}` 隐藏右侧主题切换按钮,但主题状态仍按
 * defaultTheme/theme 同步到 html.dark(默认跟随系统),站点可把该位置
 * 让给自己的 topBarActions。
 * headline/subheadline 提供时,标题区与内容一起包进 hero wrapper,
 * 标题区渲染居中主标题与副标题。
 */
export function MiniSiteTemplate({
  children,
  contentClassName,
  contentProps,
  defaultTheme = 'system',
  headline,
  mainClassName,
  manageDocumentTitle = true,
  onThemeChange,
  pageTitle,
  showThemeToggle = true,
  siteName,
  subheadline,
  theme: controlledTheme,
  topBarActions,
  topBarCenter,
  topBarLeading,
}: MiniSiteTemplateProps) {
  const { cycleTheme, theme } = useTheme({
    defaultTheme,
    onThemeChange,
    theme: controlledTheme,
  })

  useEffect(() => {
    if (manageDocumentTitle) {
      document.title = getSiteDocumentTitle(siteName, pageTitle)
    }
  }, [manageDocumentTitle, pageTitle, siteName])

  const leftSlot = (
    <div className="weimo-mini-site-template__top-bar-slot">
      {topBarLeading}
    </div>
  )
  const rightSlot = (
    <div className="weimo-mini-site-template__top-bar-slot">
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
      <TopBar
        centerSlot={topBarCenter}
        leftSlot={leftSlot}
        rightSlot={rightSlot}
        variant="full-width"
      />

      <main className={cn('weimo-mini-site-template', mainClassName)}>
        <div
          {...contentProps}
          className={cn('weimo-mini-site-template__content', contentClassName)}
        >
          {headline || subheadline ? (
            <div className="weimo-mini-site-template__hero">
              <header className="weimo-mini-site-template__hero-head">
                {headline ? (
                  <h1 className="weimo-mini-site-template__headline">
                    {headline}
                  </h1>
                ) : null}
                {subheadline ? (
                  <p className="weimo-mini-site-template__subheadline">
                    {subheadline}
                  </p>
                ) : null}
              </header>
              {children}
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </>
  )
}

export type { ThemeMode } from '../site-template/site-template-model'
