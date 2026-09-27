import { readFileSync } from 'node:fs'
import path from 'node:path'

import postcss, { type Declaration, type Root, type Rule } from 'postcss'
import { describe, expect, it } from 'vitest'

function parseProjectCss(relativePath: string) {
  const filePath = path.join(process.env.WEIMO_UI_PROJECT_ROOT ?? process.cwd(), relativePath)
  return postcss.parse(readFileSync(filePath, 'utf8'), { from: filePath })
}

function matchingRules(root: Root, selector: string) {
  const rules: Rule[] = []
  root.walkRules((rule) => {
    if (rule.selectors.includes(selector)) rules.push(rule)
  })
  return rules
}

function cssRule(root: Root, selector: string) {
  const rules = matchingRules(root, selector)
  if (rules.length !== 1) {
    throw new Error(`Expected one CSS rule for ${selector}, found ${rules.length}.`)
  }
  return rules[0]
}

function cssRuleWithDeclaration(root: Root, selector: string, property: string) {
  const rules = matchingRules(root, selector).filter((rule) =>
    rule.nodes?.some((node) => node.type === 'decl' && node.prop === property),
  )
  if (rules.length !== 1) {
    throw new Error(
      `Expected one CSS rule for ${selector} with ${property}, found ${rules.length}.`,
    )
  }
  return rules[0]
}

function cssDeclaration(rule: Rule, property: string) {
  const declarations: Declaration[] = []
  rule.walkDecls(property, (declaration) => {
    declarations.push(declaration)
  })
  if (declarations.length !== 1) {
    throw new Error(
      `Expected one ${property} declaration in ${rule.selector}, found ${declarations.length}.`,
    )
  }
  return declarations[0].value
}

describe('shared CSS interfaces', () => {
  it('keeps transparent TopBar shell regions click-through', () => {
    const root = parseProjectCss('packages/weimo-ui-core/src/components/top-bar.css')

    expect(
      cssDeclaration(cssRuleWithDeclaration(root, '.top-bar', 'pointer-events'), 'pointer-events'),
    ).toBe('none')
    expect(
      cssDeclaration(
        cssRuleWithDeclaration(root, '.top-bar__frame', 'pointer-events'),
        'pointer-events',
      ),
    ).toBe('none')
    expect(
      cssDeclaration(
        cssRuleWithDeclaration(root, '.top-bar__slot', 'pointer-events'),
        'pointer-events',
      ),
    ).toBe('none')
    expect(
      cssDeclaration(
        cssRuleWithDeclaration(root, '.top-bar__slot > *', 'pointer-events'),
        'pointer-events',
      ),
    ).toBe('auto')
  })

  it('keeps Card edit layout and MdEditor scrolling owned by explicit state selectors', () => {
    const card = parseProjectCss('packages/weimo-ui-card/src/components/card-editable.css')
    const editor = parseProjectCss('packages/weimo-ui-markdown/src/components/md-editor/md-editor.css')

    expect(
      cssDeclaration(
        cssRuleWithDeclaration(card, '.weimo-card-editable', 'position'),
        'position',
      ),
    ).toBe('relative')
    expect(
      cssDeclaration(cssRule(card, '.weimo-card-editable[data-edit-layout="true"]'), 'overflow'),
    ).toBe('hidden')
    const cardViewport = cssRuleWithDeclaration(
      card,
      '.weimo-card-editable[data-edit-layout="true"] .md-editor__viewport',
      'overflow-x',
    )
    expect(cssDeclaration(cardViewport, 'overflow-x')).toBe('clip')
    expect(cssDeclaration(cardViewport, 'overflow-y')).toBe('visible')
    expect(cssDeclaration(cardViewport, 'overscroll-behavior')).toBe('auto')

    const editorViewport = cssRule(editor, '.md-editor__viewport')
    expect(cssDeclaration(editorViewport, 'overflow-y')).toBe('auto')
    expect(cssDeclaration(editorViewport, 'overscroll-behavior')).toBe('contain')
    expect(cssDeclaration(editorViewport, 'padding-block-end')).toBe('14px')

    const editorRoot = cssRule(editor, '.md-editor')
    expect(cssDeclaration(editorRoot, 'width')).toBe('100%')
    expect(cssDeclaration(editorRoot, 'container-type')).toBe('inline-size')
  })

  it('keeps icon-button interactions on variant-owned visual layers', () => {
    const root = parseProjectCss('packages/weimo-ui-core/src/components/icon-button.css')

    expect(
      cssDeclaration(
        cssRuleWithDeclaration(root, '.icon-button--frosted::after', 'pointer-events'),
        'pointer-events',
      ),
    ).toBe('none')
    expect(cssDeclaration(cssRule(root, '.icon-button--ghost'), 'background')).toBe('transparent')
    expect(
      cssDeclaration(
        cssRuleWithDeclaration(root, '.icon-button:disabled', 'transform'),
        'transform',
      ),
    ).toBe('none')
  })
})
