import type { PackageCatalog } from '../../types'

export const ocrCatalog = {
  id: 'weimo-ui-ocr',
  title: 'weimo-ui-ocr',
  pages: [
    {
      id: 'ocr-card',
      name: 'OCR 卡片',
      exportName: 'OcrCard',
      registryName: 'ocr-card',
      packageExport: './components/ocr-card',
    },
    {
      id: 'ocr-composer',
      name: 'OCR 上传',
      exportName: 'OcrComposer',
      registryName: 'ocr-composer',
      packageExport: './components/ocr-composer',
    },
    {
      id: 'ocr-detail',
      name: 'OCR 校对',
      exportName: 'OcrDetail',
      registryName: 'ocr-detail',
      packageExport: './components/ocr-detail',
    },
    {
      id: 'tag-bar',
      name: '标签栏',
      exportName: 'TagBar',
      registryName: 'tag-bar',
      packageExport: './components/tag-bar',
      components: [
        {
          id: 'tag-picker',
          name: 'TagPicker',
          registryName: 'tag-picker',
          packageExport: './components/tag-picker',
        },
        {
          id: 'editable-capsule',
          name: 'EditableCapsule',
          registryName: 'editable-capsule',
          packageExport: './components/editable-capsule',
        },
      ],
    },
  ],
} as const satisfies PackageCatalog
