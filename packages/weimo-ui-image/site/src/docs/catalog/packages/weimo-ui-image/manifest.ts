import type { PackageCatalog } from '../../types'

export const imageCatalog = {
  id: 'weimo-ui-image',
  title: 'weimo-ui-image',
  pages: [
    {
      id: 'image-view',
      name: '图片视图',
      exportName: 'ImageView',
      registryName: 'image-view',
      packageExport: './components/image-view',
    },
    {
      id: 'image-uploader',
      name: '图片上传',
      exportName: 'ImageUploader',
      registryName: 'image-uploader',
      packageExport: './components/image-uploader',
    },
    {
      id: 'canvas-transparency',
      name: '画布透明化',
      exportName: 'CanvasTransparency',
      registryName: 'canvas-transparency',
      packageExport: './components/canvas-transparency',
      components: [
        {
          id: 'canvas-transparency-cache',
          name: 'CanvasTransparencyCache',
          registryName: 'canvas-transparency-cache',
          packageExport: './components/canvas-transparency-cache',
        },
      ],
    },
  ],
} as const satisfies PackageCatalog
