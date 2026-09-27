import { describe, expect, it } from 'vitest'

import { componentDocs } from '../packages/weimo-ui-site/src/docs/catalog/component-docs'
import { searchComponentDocs } from '../packages/weimo-ui-site/src/docs/catalog/search-component-docs'

function resultIds(query: string) {
  return searchComponentDocs(componentDocs, query).map((doc) => doc.id)
}

describe('component docs search', () => {
  it('finds functional pages by workspace package', () => {
    expect(resultIds('weimo-ui-tagtree')).toEqual(['tag', 'chip-button'])
    expect(resultIds('weimo-ui-image')).toEqual(['image'])
    expect(resultIds('weimo-ui-card')).toEqual(['tagged-card', 'ocr'])
  })

  it('finds localized token pages by stable English identifiers', () => {
    expect(resultIds('BgColor')).toContain('background-tokens')
    expect(resultIds('text-color')).toContain('text-tokens')
    expect(resultIds('CardSurface')).toContain('surface')
    expect(resultIds('FrostedSurface')).toContain('surface')
    expect(resultIds('PopupSurface')).toContain('surface')
    expect(resultIds('Md')).toContain('md')
    expect(resultIds('Markdown')).toContain('md')
    expect(resultIds('Markdown渲染')).toContain('md')
    expect(resultIds('Markdown样式')).toContain('md')
  })

  it('finds token pages by CSS token and usage language', () => {
    expect(resultIds('--color-bg-card')).toContain('background-tokens')
    expect(resultIds('--glass-blur')).toContain('background-tokens')
    expect(resultIds('TagPicker option')).toContain('background-tokens')
    expect(resultIds('--color-heat-4')).toContain('background-tokens')
    expect(resultIds('--glass-surface-border-on-dark')).toContain('border-tokens')
  })

  it('keeps localized display-name search working', () => {
    expect(resultIds('背景')).toContain('background-tokens')
    expect(resultIds('背景色')).toContain('background-tokens')
    expect(resultIds('背景模糊度')).toContain('background-tokens')
    expect(resultIds('文字')).toContain('text-tokens')
    expect(resultIds('字体')).toContain('text-tokens')
    expect(resultIds('字号')).toContain('text-tokens')
    expect(resultIds('边框')).toContain('border-tokens')
    expect(resultIds('边框色')).toContain('border-tokens')
    expect(resultIds('边框圆角')).toContain('border-tokens')
  })

  it('does not turn separator-only queries into a match-all shortcut', () => {
    expect(resultIds('---')).not.toHaveLength(componentDocs.length)
  })
})
