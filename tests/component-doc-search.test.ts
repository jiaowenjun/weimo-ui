import { describe, expect, it } from 'vitest'

import { componentDocs } from '../src/docs/component-docs'
import { searchComponentDocs } from '../src/docs/search-component-docs'

function resultIds(query: string) {
  return searchComponentDocs(componentDocs, query).map((doc) => doc.id)
}

describe('component docs search', () => {
  it('finds localized token pages by stable English identifiers', () => {
    expect(resultIds('BgColor')).toContain('bg-color')
    expect(resultIds('text-color')).toContain('text-color')
    expect(resultIds('Md')).toContain('md')
    expect(resultIds('Markdown')).toContain('md')
  })

  it('finds token pages by CSS token and usage language', () => {
    expect(resultIds('--color-bg-card')).toContain('bg-color')
    expect(resultIds('TagPicker option')).toContain('pressable')
    expect(resultIds('--glass-surface-dark-border')).toContain('border-color')
  })

  it('keeps localized display-name search working', () => {
    expect(resultIds('背景色')).toContain('bg-color')
    expect(resultIds('边框圆角')).toContain('border-radius')
  })

  it('does not turn separator-only queries into a match-all shortcut', () => {
    expect(resultIds('---')).not.toHaveLength(componentDocs.length)
  })
})
