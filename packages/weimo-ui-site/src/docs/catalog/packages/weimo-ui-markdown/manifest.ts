import type { PackageCatalog } from '../../types'

export const markdownCatalog = {
  id: 'weimo-ui-markdown',
  title: 'weimo-ui-markdown',
  pages: [
    {
      id: 'markdown',
      name: 'Markdown编辑',
      exportName: 'MdEditor',
      registryName: 'md-editor',
      packageExport: './components/md-editor',
      components: [
        { id: 'math-editor', name: 'MathEditor', registryName: 'math-editor', packageExport: './components/math-editor' },
      ],
    },
    {
      id: 'markdown-render',
      name: 'Markdown渲染',
      exportName: 'MdRender',
      registryName: 'md-render',
      packageExport: './components/md-render',
    },
    {
      id: 'markdown-view',
      name: 'Markdown视图',
      exportName: 'MdView',
      registryName: 'md-view',
      packageExport: './components/md-view',
    },
  ],
} as const satisfies PackageCatalog
