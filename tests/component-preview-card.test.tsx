import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ComponentPreviewCard } from '../src/components/component-preview-card'

describe('ComponentPreviewCard', () => {
  it('renders token identity and preview content on the BaseCard shell', () => {
    render(
      <ComponentPreviewCard
        className="custom-card"
        data-testid="card"
        label="默认圆角"
        token="--radius"
        value="16px"
      >
        <div data-testid="preview" />
      </ComponentPreviewCard>,
    )

    const card = screen.getByTestId('card')
    const meta = card.querySelector('.base-card__meta')
    const content = card.querySelector('.base-card__content')

    expect(card).toHaveClass('card-surface', 'base-card', 'component-preview-card', 'custom-card')
    expect(within(card).getByText('默认圆角')).toHaveClass('base-card__title')
    expect(within(card).getByText('--radius')).toHaveClass('component-preview-card__token')
    expect(within(card).getByText('16px')).toHaveClass('component-preview-card__value')
    expect(meta?.children).toHaveLength(1)
    const row = card.querySelector('.component-preview-card__row')

    expect(row?.children).toHaveLength(2)
    expect(row?.children[0]).toHaveClass('component-preview-card__token')
    expect(row?.children[1]).toHaveClass('component-preview-card__value')
    expect(screen.getByTestId('preview').parentElement).toBe(content)
    expect(content?.parentElement).toBe(card)
  })

  it('renders theme-selectable light and dark values', () => {
    const { container } = render(
      <ComponentPreviewCard
        darkValue="hsl(0 0% 20%)"
        label="默认边框"
        token="--color-border"
        value="hsl(0 0% 80%)"
      >
        <div />
      </ComponentPreviewCard>,
    )

    expect(container.querySelector('.component-preview-card__value--light')).toHaveTextContent(
      'hsl(0 0% 80%)',
    )
    expect(container.querySelector('.component-preview-card__value--dark')).toHaveTextContent(
      'hsl(0 0% 20%)',
    )
  })

  it('renders multiple token rows through items', () => {
    const { container } = render(
      <ComponentPreviewCard
        items={[
          { token: '--color-heat-0', value: 'hsl(0 0% 94%)' },
          { darkValue: 'hsl(22 42% 32%)', token: '--color-heat-2', value: 'hsl(18 62% 78%)' },
        ]}
        label="热力图"
      >
        <div data-testid="group-preview" />
      </ComponentPreviewCard>,
    )

    const rows = container.querySelectorAll('.component-preview-card__row')

    expect(rows).toHaveLength(2)
    expect(rows[0]).toHaveTextContent('--color-heat-0')
    expect(rows[0]).toHaveTextContent('hsl(0 0% 94%)')
    expect(rows[1].querySelector('.component-preview-card__value--light')).toHaveTextContent(
      'hsl(18 62% 78%)',
    )
    expect(rows[1].querySelector('.component-preview-card__value--dark')).toHaveTextContent(
      'hsl(22 42% 32%)',
    )
    expect(screen.getByTestId('group-preview').parentElement).toBe(
      container.querySelector('.component-preview-card .base-card__content'),
    )
  })

  it('keeps the label title bar when no token rows are provided', () => {
    const { container } = render(
      <ComponentPreviewCard label="卡片材质">
        <div data-testid="bare-preview" />
      </ComponentPreviewCard>,
    )

    const card = container.querySelector('.component-preview-card')

    expect(card?.querySelector('.base-card__title')).toHaveTextContent('卡片材质')
    expect(card?.querySelectorAll('.component-preview-card__row')).toHaveLength(0)
    expect(card?.querySelector('.base-card__meta')).toBeNull()
    expect(screen.getByTestId('bare-preview').parentElement).toBe(
      card?.querySelector('.base-card__content'),
    )
  })

  it('renders an optional action control on the right of the label title bar', () => {
    const { container } = render(
      <ComponentPreviewCard action={<button type="button">调节</button>} label="玻璃材质">
        <div />
      </ComponentPreviewCard>,
    )

    const header = container.querySelector('.base-card__header')
    const action = container.querySelector('.base-card__header-action')

    expect(header?.querySelector('.base-card__title')).toHaveTextContent('玻璃材质')
    expect(action?.contains(screen.getByRole('button', { name: '调节' }))).toBe(true)
  })
})
