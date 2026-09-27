import type { PackageCatalog } from '../../types'

export const statsCatalog = {
  id: 'weimo-ui-stats',
  title: 'weimo-ui-stats',
  pages: [
    {
      id: 'stat',
      name: '统计',
      exportName: 'StatGroup',
      registryName: 'stat-group',
      packageExport: './components/stat-group',
      components: [
        { id: 'heatmap', name: 'Heatmap', registryName: 'heatmap', packageExport: './components/heatmap' },
      ],
    },
  ],
} as const satisfies PackageCatalog
