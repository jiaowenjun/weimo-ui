import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Menu,
  Monitor,
  Moon,
  Search,
  Sun,
  X,
} from 'lucide-react'
import {
  Outlet,
  useMatch,
  useNavigate,
} from 'react-router'

import {
  CommandDialog,
  CommandDialogPopup,
  CommandEmpty,
  CommandFooter,
  CommandInput,
  CommandItem,
  CommandList,
} from '../components/coss/command'
import { Chip } from '../components/chip'
import { TopBar } from '../components/top-bar'
import { GlassIconButton } from '../components/glass-icon-button'
import { GhostIconButton } from '../components/ghost-icon-button'
import { SideBar } from '../components/sidebar'
import {
  componentDocGroups,
  componentDocs,
  type ComponentDocGroup,
} from './component-docs'
import { type DocsOutletContext } from './docs-outlet-context'
import { componentHref, componentPath } from './routes'
import { searchComponentDocs } from './search-component-docs'

type Theme = 'light' | 'dark' | 'system'

type DocsSidebarItem = {
  active?: boolean
  href: string
  label: string
  onSelect: () => void
}

type DocsSidebarGroup = {
  items: DocsSidebarItem[]
  title: string
}

function buildSidebarGroups(options: {
  activeComponentId?: string
  docGroups: ComponentDocGroup[]
  onComponentSelect: (id: string) => void
}): DocsSidebarGroup[] {
  return options.docGroups.map((docGroup) => ({
    title: docGroup.title,
    items: docGroup.items.map((doc) => ({
      active: options.activeComponentId === doc.id,
      href: componentHref(doc.id),
      label: doc.name,
      onSelect: () => options.onComponentSelect(doc.id),
    })),
  }))
}

function DocsSidebarContent({ groups }: { groups: DocsSidebarGroup[] }) {
  return (
    <div className="docs-sidebar-nav">
      <div className="docs-sidebar-nav__top">
        <strong>Weimo UI</strong>
      </div>

      {groups.map((group) => (
        <nav className="docs-sidebar-nav__group" key={group.title}>
          <p>{group.title}</p>
          {group.items.map((item) => (
            <a
              className={item.active ? 'active' : undefined}
              href={item.href}
              key={`${group.title}-${item.label}`}
              onClick={(event) => {
                event.preventDefault()
                item.onSelect()
              }}
            >
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      ))}
    </div>
  )
}

function nextTheme(current: Theme): Theme {
  switch (current) {
    case 'light':
      return 'dark'
    case 'dark':
      return 'system'
    case 'system':
      return 'light'
  }
}

export function DocsShell() {
  const [theme, setTheme] = useState<Theme>('system')
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const componentMatch = useMatch('/components/:componentId')
  const activeComponentId = componentMatch?.params.componentId
  const selected = activeComponentId
    ? componentDocs.find((doc) => doc.id === activeComponentId)
    : undefined
  const tokenPreview = selected?.group === 'token-style'

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement

      if (event.key === 'Escape') {
        setSearchOpen(false)
      }

      if (
        !isTyping &&
        (event.key === '/' ||
          (event.key === 'k' && (event.metaKey || event.ctrlKey)))
      ) {
        event.preventDefault()
        setSearchOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    document.title = selected ? `${selected.name} - Weimo UI` : 'Weimo UI'
  }, [selected])

  const filteredDocs = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    if (!normalized) {
      return componentDocs
    }

    return searchComponentDocs(componentDocs, normalized)
  }, [query])

  function navigateTo(path: string) {
    navigate(path)
    setSearchOpen(false)
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openComponent(id: string) {
    navigateTo(componentPath(id))
  }

  const sidebarGroups = buildSidebarGroups({
    activeComponentId,
    docGroups: componentDocGroups,
    onComponentSelect: openComponent,
  })

  const topBarLeftSlot = (
    <>
      <GlassIconButton
        className="docs-top-bar__sidebar-trigger"
        aria-label="打开侧边栏"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu />
      </GlassIconButton>
      {selected ? (
        <Chip
          bordered={false}
          className="docs-top-bar__title"
          content={selected.name}
          textSize="lg"
          variant="glass"
        />
      ) : null}
    </>
  )
  const topBarRightSlot = (
    <>
      <GlassIconButton
        aria-label="搜索"
        onClick={() => setSearchOpen(true)}
        title="按 / 搜索"
      >
        <Search />
      </GlassIconButton>
      <GlassIconButton
        aria-label={
          theme === 'light'
            ? '切换到深色主题'
            : theme === 'dark'
              ? '切换到跟随系统主题'
              : '切换到浅色主题'
        }
        onClick={() => setTheme((current) => nextTheme(current))}
      >
        {theme === 'system' ? <Monitor /> : theme === 'light' ? <Sun /> : <Moon />}
      </GlassIconButton>
    </>
  )
  const closeSidebar = () => setSidebarOpen(false)
  const sidebarDrawerAction = (
    <GlassIconButton aria-label="关闭侧边栏" onClick={closeSidebar}>
      <X />
    </GlassIconButton>
  )

  const outletContext: DocsOutletContext = {
    docs: componentDocs,
    onOpenSidebar: () => setSidebarOpen(true),
    openComponent,
  }

  return (
    <>
      <SideBar
        drawerAction={sidebarDrawerAction}
        open={sidebarOpen}
        onClose={closeSidebar}
      >
        <DocsSidebarContent groups={sidebarGroups} />
      </SideBar>
      <TopBar leftSlot={topBarLeftSlot} rightSlot={topBarRightSlot} />

      <main className="app-shell">
        <div className="app-shell__layout">
          <div aria-hidden="true" className="app-shell__sidebar-space" />

          <div
            className={tokenPreview
              ? 'app-shell__content app-shell__content--token-grid'
              : 'app-shell__content'}
            data-component-id={selected?.id}
          >
            <Outlet context={outletContext} />
          </div>
        </div>
      </main>

      <CommandDialog
        modal
        onOpenChange={(isOpen) => setSearchOpen(isOpen)}
        open={searchOpen}
      >
        <CommandDialogPopup dialogTitle="搜索组件">
          <CommandInput
            autoFocus
            action={
              <GhostIconButton
                aria-label="关闭搜索"
                onClick={() => setSearchOpen(false)}
                size="sm"
              >
                <X />
              </GhostIconButton>
            }
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索组件…"
            value={query}
          />
          <CommandList>
            {filteredDocs.map((doc) => (
              <CommandItem key={doc.id} onClick={() => openComponent(doc.id)}>
                <span>
                  <strong>{doc.name}</strong>
                  {doc.summary ? <small>{doc.summary}</small> : null}
                </span>
                <ArrowRight />
              </CommandItem>
            ))}
            {filteredDocs.length === 0 && (
              <CommandEmpty>未找到组件。</CommandEmpty>
            )}
          </CommandList>
          <CommandFooter>Esc 关闭 · Enter 打开</CommandFooter>
        </CommandDialogPopup>
      </CommandDialog>
    </>
  )
}
