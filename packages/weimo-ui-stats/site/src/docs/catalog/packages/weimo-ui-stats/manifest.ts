import type { PackageCatalog } from '../../types'

export const statsCatalog = {
  id: 'weimo-ui-stats',
  title: 'weimo-ui-stats',
  pages: [
    {
      id: 'heatmap',
      name: '热力图',
      exportName: 'Heatmap',
      registryName: 'heatmap',
      packageExport: './components/heatmap',
      components: [
        {
          id: 'heat-color',
          name: 'HeatColor',
          registryName: 'heat-color',
          packageExport: './components/heat-color',
        },
        {
          id: 'stat-group',
          name: 'StatGroup',
          registryName: 'stat-group',
          packageExport: './components/stat-group',
        },
      ],
    },
  ],
} as const satisfies PackageCatalog
