import { describe, expect, it } from 'vitest'

import { componentGroups, componentManifest } from '../src/docs/components-manifest'
import {
  cssDeclaration,
  cssRule,
  cssRuleWithDeclaration,
  exportedNames,
  parseProjectCss,
  projectFileExists,
  readProjectJson,
} from './contract-files'

type PackageJson = {
  exports: Record<string, string>
}

type RegistryFile = {
  path: string
  target: string
  type: string
}

type RegistryItem = {
  name: string
  files: RegistryFile[]
}

type RootRegistry = {
  items: RegistryItem[]
}

const conceptualTokenModules = new Set([
  'bg-blur',
  'bg-color',
  'border-color',
  'border-radius',
  'font-size',
  'pressable',
  'text-color',
])

describe('public component catalog', () => {
  it('keeps component groups ordered and each group alphabetized', () => {
    expect(componentGroups.map((group) => group.id)).toEqual([
      'token-style',
      'surface-material',
      'controls-overlays',
      'layout-bars',
      'tags-navigation',
      'content-markdown',
      'media-ocr',
      'data-visualization',
    ])

    for (const group of componentGroups) {
      const names = componentManifest
        .filter((item) => item.group === group.id)
        .map((item) => item.name)
      expect(names).toEqual([...names].sort((left, right) => left.localeCompare(right, 'en')))
    }
  })

  it('maps every manifest entry to one package export and exported source module', () => {
    const packageJson = readProjectJson<PackageJson>('package.json')
    const ids = new Set<string>()
    const packageExports = new Set<string>()
    const registryNames = new Set<string>()

    for (const item of componentManifest) {
      expect(ids.has(item.id)).toBe(false)
      expect(packageExports.has(item.packageExport)).toBe(false)
      expect(registryNames.has(item.registryName)).toBe(false)
      ids.add(item.id)
      packageExports.add(item.packageExport)
      registryNames.add(item.registryName)

      const sourcePath = packageJson.exports[item.packageExport]
      expect(sourcePath, `${item.id} package export`).toBeTypeOf('string')
      expect(projectFileExists(sourcePath.replace(/^\.\//u, ''))).toBe(true)

      const names = exportedNames(sourcePath.replace(/^\.\//u, ''))
      expect(names.size, `${item.id} source exports`).toBeGreaterThan(0)
      if (!conceptualTokenModules.has(item.id)) {
        expect(names.has(item.name), `${item.id} exports ${item.name}`).toBe(true)
      }
    }
  })

  it('keeps standalone registry items identical to the generated root registry', () => {
    const rootRegistry = readProjectJson<RootRegistry>('registry.json')
    const rootItems = new Map(rootRegistry.items.map((item) => [item.name, item]))

    for (const item of componentManifest) {
      const standalonePath = `registry/${item.registryName}.json`
      expect(projectFileExists(standalonePath)).toBe(true)
      const standalone = readProjectJson<RegistryItem>(standalonePath)

      expect(rootItems.get(item.registryName)).toEqual(standalone)
      expect(standalone.name).toBe(item.registryName)
      expect(standalone.files.length).toBeGreaterThan(0)
      for (const file of standalone.files) {
        expect(projectFileExists(file.path), `${item.registryName}: ${file.path}`).toBe(true)
        expect(file.target.startsWith('@ui/')).toBe(true)
      }
    }
  })
})

describe('shared CSS interfaces', () => {
  it('keeps transparent TopBar shell regions click-through', () => {
    const root = parseProjectCss('src/components/top-bar.css')

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
    const card = parseProjectCss('src/components/card-editable.css')
    const editor = parseProjectCss('src/components/md-editor/md-editor.css')

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
  })

  it('keeps icon-button interactions on variant-owned visual layers', () => {
    const root = parseProjectCss('src/components/icon-button.css')

    expect(
      cssDeclaration(
        cssRuleWithDeclaration(root, '.icon-button--glass::after', 'pointer-events'),
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
