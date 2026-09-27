import type { PackageCatalog } from '../../types'

export const markdownCatalog = {
  id: 'weimo-ui-markdown',
  title: 'weimo-ui-markdown',
  pages: [
    {
      id: 'markdown',
      name: 'Markdown 编辑与预览',
      exportName: 'MdEditor',
      registryName: 'md-editor',
      packageExport: './components/md-editor',
      components: [
        { id: 'math-editor', name: 'MathEditor', registryName: 'math-editor', packageExport: './components/math-editor' },
        { id: 'md-render', name: 'MdRender', registryName: 'md-render', packageExport: './components/md-render' },
        { id: 'md-view', name: 'MdView', registryName: 'md-view', packageExport: './components/md-view' },
      ],
    },
    { id: 'md', name: 'Markdown 样式', exportName: 'Md', registryName: 'md', packageExport: './components/md' },
  ],
} as const satisfies PackageCatalog
