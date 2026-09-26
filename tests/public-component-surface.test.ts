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
  'background-tokens',
  'bg-blur',
  'border-radius',
  'border-tokens',
  'heat-color',
  'pressable',
  'surface',
  'text-color',
  'text-tokens',
])

describe('public component catalog', () => {
  it('keeps component groups ordered and each group alphabetized', () => {
    expect(componentGroups.map((group) => group.id)).toEqual([
      'token-style',
      'surface-material',
      'controls-overlays',
      'layout-bars',
      'tags-navigation',
      'card',
      'markdown',
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
        const exportName = ('exportName' in item ? item.exportName : undefined) ?? item.name

        expect(names.has(exportName), `${item.id} exports ${exportName}`).toBe(true)
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

describe('package exports', () => {
  it('keeps every export target installable and exposes the dialog used by Weimo', () => {
    const packageJson = readProjectJson<PackageJson>('package.json')

    for (const [packageExport, sourcePath] of Object.entries(packageJson.exports)) {
      expect(
        projectFileExists(sourcePath.replace(/^\.\//u, '')),
        `${packageExport} target`,
      ).toBe(true)
    }

    const dialogSource = packageJson.exports['./components/coss/dialog']
    expect(dialogSource).toBe('./src/components/coss/dialog.tsx')
    expect(exportedNames(dialogSource.replace(/^\.\//u, '')).has('DialogPanel')).toBe(true)
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

    // container-type:inline-size 会把 .md-editor 的内在宽度归零;没有显式 width 时,
    // MdView 编辑层(display:flex)里 flex-basis:auto 塌缩成 0 宽,正文逐字符竖排撑爆画布。
    const editorRoot = cssRule(editor, '.md-editor')
    expect(cssDeclaration(editorRoot, 'width')).toBe('100%')
    expect(cssDeclaration(editorRoot, 'container-type')).toBe('inline-size')
  })

  it('keeps icon-button interactions on variant-owned visual layers', () => {
    const root = parseProjectCss('src/components/icon-button.css')

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
