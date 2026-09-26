import { describe, expect, it } from 'vitest'

import { componentManifest, componentPackages } from '../packages/weimo-ui-site/src/docs/components-manifest'
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
  it('keeps packages and their functional pages in product order', () => {
    expect(componentPackages.map((packageItem) => packageItem.id)).toEqual([
      'weimo-ui-core',
      'weimo-ui-tagtree',
      'weimo-ui-markdown',
      'weimo-ui-image',
      'weimo-ui-stats',
      'weimo-ui-card',
    ])

    expect(componentManifest.filter((item) => item.docs).map((item) => item.id)).toEqual([
      'text-tokens',
      'background-tokens',
      'border-tokens',
      'surface',
      'button',
      'capsule',
      'slider',
      'menu',
      'action-dialog',
      'bar',
      'page-layout',
      'card-tool-bar',
      'base-card',
      'component-preview-card',
      'tag',
      'chip-button',
      'markdown',
      'md',
      'image',
      'stat',
      'tagged-card',
      'ocr',
    ])

    const pages = new Map(
      componentManifest.filter((item) => item.docs).map((item) => [item.id, item]),
    )

    for (const item of componentManifest) {
      const page = pages.get(item.page)

      expect(page, `${item.id} docs page`).toBeDefined()
      expect(page?.packageName).toBe(item.packageName)
    }
  })

  it('maps every manifest entry to one package export and exported source module', () => {
    const packageJson = readProjectJson<PackageJson>('package.json')
    const corePackageJson = readProjectJson<PackageJson>('packages/weimo-ui-core/package.json')
    const cardPackageJson = readProjectJson<PackageJson>('packages/weimo-ui-card/package.json')
    const imagePackageJson = readProjectJson<PackageJson>('packages/weimo-ui-image/package.json')
    const markdownPackageJson = readProjectJson<PackageJson>('packages/weimo-ui-markdown/package.json')
    const statsPackageJson = readProjectJson<PackageJson>('packages/weimo-ui-stats/package.json')
    const tagtreePackageJson = readProjectJson<PackageJson>('packages/weimo-ui-tagtree/package.json')
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

      const packagesByName = {
        'weimo-ui-card': [cardPackageJson, 'packages/weimo-ui-card/'],
        'weimo-ui-core': [corePackageJson, 'packages/weimo-ui-core/'],
        'weimo-ui-image': [imagePackageJson, 'packages/weimo-ui-image/'],
        'weimo-ui-markdown': [markdownPackageJson, 'packages/weimo-ui-markdown/'],
        'weimo-ui-stats': [statsPackageJson, 'packages/weimo-ui-stats/'],
        'weimo-ui-tagtree': [tagtreePackageJson, 'packages/weimo-ui-tagtree/'],
      } as const
      const [ownerPackageJson, packageRoot] = packagesByName[item.packageName]
      const sourcePath = ownerPackageJson.exports[item.packageExport]
      const projectSourcePath = `${packageRoot}${sourcePath.replace(/^\.\//u, '')}`
      expect(sourcePath, `${item.id} package export`).toBeTypeOf('string')
      expect(projectFileExists(projectSourcePath)).toBe(true)
      expect(packageJson.exports[item.packageExport]).toBeTypeOf('string')

      const names = exportedNames(projectSourcePath)
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
    const corePackageJson = readProjectJson<PackageJson>('packages/weimo-ui-core/package.json')

    for (const [packageExport, sourcePath] of Object.entries(packageJson.exports)) {
      expect(
        projectFileExists(sourcePath.replace(/^\.\//u, '')),
        `${packageExport} target`,
      ).toBe(true)
    }

    const dialogSource = packageJson.exports['./components/coss/dialog']
    expect(dialogSource).toBe('./src/components/coss/dialog.tsx')
    const coreDialogSource = corePackageJson.exports['./components/coss/dialog']
    expect(exportedNames(`packages/weimo-ui-core/${coreDialogSource.replace(/^\.\//u, '')}`).has('DialogPanel')).toBe(true)
  })
})

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

    // container-type:inline-size 会把 .md-editor 的内在宽度归零;没有显式 width 时,
    // MdView 编辑层(display:flex)里 flex-basis:auto 塌缩成 0 宽,正文逐字符竖排撑爆画布。
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
