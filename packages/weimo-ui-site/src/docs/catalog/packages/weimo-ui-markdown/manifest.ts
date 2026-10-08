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
        { id: 'md-view', name: 'MdView', registryName: 'md-view', packageExport: './components/md-view' },
      ],
    },
    {
      id: 'markdown-render',
      name: 'Markdown渲染',
      exportName: 'MdRender',
      registryName: 'md-render',
      packageExport: './components/md-render',
    },
  ],
} as const satisfies PackageCatalog
