import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TokenPreviewCard } from '../src/components/token-preview-card'

describe('TokenPreviewCard', () => {
  it('renders token identity and preview content in one card surface', () => {
    render(
      <TokenPreviewCard
        className="custom-card"
        data-testid="card"
        label="默认圆角"
        token="--radius"
        value="16px"
      >
        <div data-testid="preview" />
      </TokenPreviewCard>,
    )

    const card = screen.getByTestId('card')
    const meta = card.querySelector('.token-preview-card__meta')

    expect(card).toHaveClass('card-surface', 'token-preview-card', 'custom-card')
    expect(within(card).getByText('默认圆角')).toHaveClass('token-preview-card__label')
    expect(within(card).getByText('--radius')).toHaveClass('token-preview-card__token')
    expect(within(card).getByText('16px')).toHaveClass('token-preview-card__value')
    expect(meta?.children).toHaveLength(2)
    const row = card.querySelector('.token-preview-card__row')

    expect(row?.children).toHaveLength(2)
    expect(row?.children[0]).toHaveClass('token-preview-card__token')
    expect(row?.children[1]).toHaveClass('token-preview-card__value')
    expect(screen.getByTestId('preview').parentElement).toBe(card)
  })

  it('renders theme-selectable light and dark values', () => {
    const { container } = render(
      <TokenPreviewCard
        darkValue="hsl(0 0% 20%)"
        label="默认边框"
        token="--color-border"
        value="hsl(0 0% 80%)"
      >
        <div />
      </TokenPreviewCard>,
    )

    expect(container.querySelector('.token-preview-card__value--light')).toHaveTextContent(
      'hsl(0 0% 80%)',
    )
    expect(container.querySelector('.token-preview-card__value--dark')).toHaveTextContent(
      'hsl(0 0% 20%)',
    )
  })
})
