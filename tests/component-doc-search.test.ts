import { describe, expect, it } from 'vitest'

import { componentDocs } from '../src/docs/component-docs'
import { searchComponentDocs } from '../src/docs/search-component-docs'

function resultIds(query: string) {
  return searchComponentDocs(componentDocs, query).map((doc) => doc.id)
}

describe('component docs search', () => {
  it('finds localized token pages by stable English identifiers', () => {
    expect(resultIds('BgColor')).toContain('bg-color')
    expect(resultIds('text-color')).toContain('font-size')
    expect(resultIds('Md')).toContain('md')
    expect(resultIds('Markdown')).toContain('md')
  })

  it('finds token pages by CSS token and usage language', () => {
    expect(resultIds('--color-bg-card')).toContain('bg-color')
    expect(resultIds('--glass-blur')).toContain('bg-color')
    expect(resultIds('TagPicker option')).toContain('bg-color')
    expect(resultIds('--color-heat-4')).toContain('bg-color')
    expect(resultIds('--glass-surface-dark-border')).toContain('border-color')
  })

  it('keeps localized display-name search working', () => {
    expect(resultIds('背景')).toContain('bg-color')
    expect(resultIds('背景色')).toContain('bg-color')
    expect(resultIds('背景模糊度')).toContain('bg-color')
    expect(resultIds('文字')).toContain('font-size')
    expect(resultIds('字体')).toContain('font-size')
    expect(resultIds('字号')).toContain('font-size')
    expect(resultIds('边框')).toContain('border-color')
    expect(resultIds('边框色')).toContain('border-color')
    expect(resultIds('边框圆角')).toContain('border-color')
  })

  it('does not turn separator-only queries into a match-all shortcut', () => {
    expect(resultIds('---')).not.toHaveLength(componentDocs.length)
  })
})
