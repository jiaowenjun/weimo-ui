import { describe, expect, it } from 'vitest'

import {
  getNextThemeMode,
  getSiteDocumentTitle,
  getThemeToggleLabel,
} from '../src/components/site-template/site-template-model'

describe('site template model', () => {
  it('cycles through light, dark, and system themes', () => {
    expect(getNextThemeMode('system')).toBe('light')
    expect(getNextThemeMode('light')).toBe('dark')
    expect(getNextThemeMode('dark')).toBe('system')
  })

  it('describes the next theme action', () => {
    expect(getThemeToggleLabel('system')).toBe('切换到浅色主题')
    expect(getThemeToggleLabel('light')).toBe('切换到深色主题')
    expect(getThemeToggleLabel('dark')).toBe('切换到跟随系统主题')
  })

  it('builds the document title from the active page', () => {
    expect(getSiteDocumentTitle('weimo-ui')).toBe('weimo-ui')
    expect(getSiteDocumentTitle('weimo-ui', 'TagTree')).toBe(
      'TagTree - weimo-ui',
    )
  })
})
