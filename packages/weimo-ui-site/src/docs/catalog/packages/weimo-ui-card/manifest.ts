import type { PackageCatalog } from '../../types'

export const cardCatalog = {
  id: 'weimo-ui-card',
  title: 'weimo-ui-card',
  pages: [
    {
      id: 'tagged-card',
      name: '带标签卡片',
      exportName: 'Card',
      registryName: 'card',
      packageExport: './components/card',
      components: [
        { id: 'card-composer', name: 'CardComposer', registryName: 'card-composer', packageExport: './components/card-composer' },
      ],
    },
    {
      id: 'ocr',
      name: 'OCR',
      exportName: 'OcrCard',
      registryName: 'ocr-card',
      packageExport: './components/ocr-card',
      components: [
        { id: 'ocr-composer', name: 'OcrComposer', registryName: 'ocr-composer', packageExport: './components/ocr-composer' },
        { id: 'ocr-detail', name: 'OcrDetail', registryName: 'ocr-detail', packageExport: './components/ocr-detail' },
      ],
    },
  ],
} as const satisfies PackageCatalog
