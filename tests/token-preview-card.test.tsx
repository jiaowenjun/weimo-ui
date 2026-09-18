import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TokenPreviewCard } from '../src/docs/token-preview-card'

describe('TokenPreviewCard', () => {
  it('renders token identity and preview content in one CardPanel', () => {
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

    expect(card).toHaveClass('coss-card__panel', 'token-preview-card', 'custom-card')
    expect(within(card).getByText('默认圆角')).toHaveClass('token-preview-card__label')
    expect(within(card).getByText(/--radius/)).toHaveTextContent('--radius: 16px')
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
