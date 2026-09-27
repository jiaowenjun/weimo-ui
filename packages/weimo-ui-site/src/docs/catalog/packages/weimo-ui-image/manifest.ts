import type { PackageCatalog } from '../../types'

export const imageCatalog = {
  id: 'weimo-ui-image',
  title: 'weimo-ui-image',
  pages: [
    {
      id: 'image',
      name: '图片',
      exportName: 'ImageView',
      registryName: 'image-view',
      packageExport: './components/image-view',
      components: [
        { id: 'image-uploader', name: 'ImageUploader', registryName: 'image-uploader', packageExport: './components/image-uploader' },
        { id: 'canvas-transparency', name: 'CanvasTransparency', registryName: 'canvas-transparency', packageExport: './components/canvas-transparency' },
      ],
    },
  ],
} as const satisfies PackageCatalog
