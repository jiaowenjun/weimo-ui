import type { PackageCatalog } from '../../types'

export const tagtreeCatalog = {
  id: 'weimo-ui-tagtree',
  title: 'weimo-ui-tagtree',
  pages: [
    {
      id: 'tag',
      name: '标签树',
      exportName: 'TagTree',
      registryName: 'tag-tree',
      packageExport: './components/tag-tree',
      components: [
        { id: 'tag-bread', name: 'TagBread', registryName: 'tag-bread', packageExport: './components/tag-bread' },
        { id: 'tag-tree-row', name: 'TagTreeRow', registryName: 'tag-tree-row', packageExport: './components/tag-tree-row' },
      ],
    },
  ],
} as const satisfies PackageCatalog
