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
        { id: 'heat-color', name: '热力图色', registryName: 'heat-color', packageExport: './components/heat-color' },
        { id: 'heatmap', name: 'Heatmap', registryName: 'heatmap', packageExport: './components/heatmap' },
      ],
    },
  ],
} as const satisfies PackageCatalog
