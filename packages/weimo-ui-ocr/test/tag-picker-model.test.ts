import { describe, expect, it } from 'vitest'

import {
  filterTagPickerOptions,
  normalizeTagPickerDraft,
  tagMatchesPickerQuery,
} from '../src/components/tags/tag-picker/tag-picker-model'

describe('normalizeTagPickerDraft', () => {
  it('去除首尾空白与前导 #', () => {
    expect(normalizeTagPickerDraft('  # 票据 ')).toBe('票据')
  })
})

describe('tagMatchesPickerQuery', () => {
  it('空查询匹配一切', () => {
    expect(tagMatchesPickerQuery('任意', '')).toBe(true)
  })

  it('按去斜杠后的有序子序列匹配(大小写敏感)', () => {
    expect(tagMatchesPickerQuery('OCR/票据', 'OC')).toBe(true)
    expect(tagMatchesPickerQuery('OCR/票据', 'CR')).toBe(true)
    expect(tagMatchesPickerQuery('OCR/票据', 'oc')).toBe(false)
    expect(tagMatchesPickerQuery('资料', 'OC')).toBe(false)
  })
})

describe('filterTagPickerOptions', () => {
  it('按查询词过滤选项', () => {
    const matched = filterTagPickerOptions(['OCR', 'OCR/票据', '资料'], 'OCR')

    expect(matched).toEqual(['OCR', 'OCR/票据'])
  })
})
