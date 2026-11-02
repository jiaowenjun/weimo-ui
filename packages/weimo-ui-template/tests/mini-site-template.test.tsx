import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MiniSiteTemplate } from '../src/components/mini-site-template/mini-site-template'

vi.mock('weimo-ui-core/components/frosted-icon-button', () => ({
  FrostedIconButton: ({ children, ...props }: React.ComponentProps<'button'>) => (
    <button type="button" {...props}>{children}</button>
  ),
}))

vi.mock('weimo-ui-core/components/frosted-label', () => ({
  FrostedLabel: ({ children, size: _size, ...props }: React.ComponentProps<'span'> & { size?: string }) => (
    <span {...props}>{children}</span>
  ),
}))

vi.mock('weimo-ui-core/components/top-bar', () => ({
  TopBar: ({
    leftSlot,
    rightSlot,
    variant,
  }: {
    leftSlot?: React.ReactNode
    rightSlot?: React.ReactNode
    variant?: string
  }) => (
    <header data-variant={variant}>
      {leftSlot}
      {rightSlot}
    </header>
  ),
}))

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockReturnValue({
      addEventListener: vi.fn(),
      matches: false,
      removeEventListener: vi.fn(),
    }),
  })
  window.scrollTo = vi.fn()
})

describe('MiniSiteTemplate', () => {
  it('renders the top bar in the full-width variant', () => {
    render(<MiniSiteTemplate siteName="weimo-ui-editor" />)

    expect(document.querySelector('header')).toHaveAttribute(
      'data-variant',
      'full-width',
    )
  })

  it('renders content without a top-bar title label', () => {
    render(
      <MiniSiteTemplate pageTitle="WDF读写卡片" siteName="weimo-ui-editor">
        <p>Content</p>
      </MiniSiteTemplate>,
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.queryByText('WDF读写卡片')).not.toBeInTheDocument()
    expect(screen.queryByText('weimo-ui-editor')).not.toBeInTheDocument()
  })

  it('renders the optional headline and subheadline above the content', () => {
    render(
      <MiniSiteTemplate
        headline="点开即写,收起即读"
        siteName="weimo-ui-editor"
        subheadline="同一份 WDF 数据驱动阅读与编辑。"
      >
        <p>Content</p>
      </MiniSiteTemplate>,
    )

    expect(
      screen.getByRole('heading', { name: '点开即写,收起即读' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('同一份 WDF 数据驱动阅读与编辑。'),
    ).toBeInTheDocument()
  })

  it('manages the document title and theme cycle', async () => {
    render(
      <MiniSiteTemplate pageTitle="WDF读写视图" siteName="weimo-ui-editor" />,
    )

    await waitFor(() => {
      expect(document.title).toBe('WDF读写视图 - weimo-ui-editor')
    })

    const themeButton = screen.getByRole('button', { name: '切换到浅色主题' })
    fireEvent.click(themeButton)
    fireEvent.click(screen.getByRole('button', { name: '切换到深色主题' }))

    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark')
    })
  })

  it('hides the theme toggle while keeping the system theme in sync', async () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({
        addEventListener: vi.fn(),
        matches: true,
        removeEventListener: vi.fn(),
      }),
    })

    render(
      <MiniSiteTemplate
        showThemeToggle={false}
        siteName="weimo-ui-editor"
        topBarActions={<button type="button">GitHub</button>}
      />,
    )

    expect(screen.getByRole('button', { name: 'GitHub' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /主题/ }),
    ).not.toBeInTheDocument()

    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark')
    })
  })
})
