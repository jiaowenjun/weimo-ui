import type { PackageCatalog } from '../../types'

export const cardCatalog = {
  id: 'weimo-ui-card',
  title: 'weimo-ui-card',
  pages: [
    {
      id: 'card-tool-bar',
      name: '卡片栏位',
      exportName: 'CardToolBar',
      registryName: 'card-tool-bar',
      packageExport: './components/card-tool-bar',
      components: [
        { id: 'card-top-bar', name: 'CardTopBar', registryName: 'card-top-bar', packageExport: './components/card-top-bar' },
      ],
    },
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
      id: 'tag-bar',
      name: '标签栏',
      exportName: 'TagBar',
      registryName: 'tag-bar',
      packageExport: './components/tag-bar',
      components: [
        { id: 'tag-picker', name: 'TagPicker', registryName: 'tag-picker', packageExport: './components/tag-picker' },
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
