import type { PackageCatalog } from '../../types'

export const tagtreeCatalog = {
  id: 'weimo-ui-tagtree',
  title: 'weimo-ui-tagtree',
  pages: [
    {
      id: 'tag-tree',
      name: '标签树',
      exportName: 'TagTree',
      registryName: 'tag-tree',
      packageExport: './components/tag-tree',
      components: [
        {
          id: 'tag-tree-row',
          name: 'TagTreeRow',
          registryName: 'tag-tree-row',
          packageExport: './components/tag-tree-row',
        },
        {
          id: 'tag-tree-model',
          name: 'TagTreeModel',
          registryName: 'tag-tree-model',
          packageExport: './components/tag-tree-model',
        },
      ],
    },
  ],
} as const satisfies PackageCatalog
