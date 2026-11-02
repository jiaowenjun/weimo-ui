import { useState } from 'react'

import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
import { OcrCard, type OcrCardDraft } from 'weimo-ui-ocr/components/ocr-card'

import type { ComponentDefinition } from '../../component-docs'
import { ocrTagOptions, sampleOcrImage, sampleOcrMarkdown } from './samples'

function OcrCardResultPreview() {
  const [draft, setDraft] = useState<OcrCardDraft | null>(null)

  return (
    <ComponentPreviewCard label="识别结果卡(可编辑/校对)">
      <div className="ocr-card-docs-preview__stage">
        <OcrCard
          aria-label="OCR card result preview"
          note={{
            createdAtText: draft ? '已保存' : 'OCR 图片',
            imageAlt: 'OCR scanned document preview',
            imageHeight: 480,
            imageSrc: sampleOcrImage,
            imageWidth: 640,
            markdown: draft?.markdown ?? sampleOcrMarkdown,
            tags: draft?.tags ?? ['OCR', '扫描件'],
            title: draft?.title ?? '票据扫描',
          }}
          onDraftChange={setDraft}
          onSave={setDraft}
          tagOptions={ocrTagOptions}
        />
      </div>
    </ComponentPreviewCard>
  )
}

function OcrCardImagePreview() {
  return (
    <ComponentPreviewCard label="图片态卡(无识别结果)">
      <div className="ocr-card-docs-preview__stage">
        <OcrCard
          aria-label="OCR card image preview"
          note={{
            createdAtText: '待识别',
            imageAlt: 'OCR scanned document preview',
            imageHeight: 480,
            imageSrc: sampleOcrImage,
            imageWidth: 640,
            tags: ['待校对'],
          }}
          onTagClick={(tag) => {
            window.alert(`点击标签: ${tag}`)
          }}
          tagOptions={ocrTagOptions}
        />
      </div>
    </ComponentPreviewCard>
  )
}

function OcrCardDemo() {
  return (
    <div className="ocr-card-docs-preview">
      <OcrCardResultPreview />
      <OcrCardImagePreview />
    </div>
  )
}

export const ocrCardDefinition = {
  id: 'ocr-card',
  summary: 'OCR 结果卡:无结果时展示原图,有结果时 WdfCard 编辑 markdown(经 weimo-wdf 桥),卡头菜单进校对。',
  status: 'Ready',
  frame: 'plain',
  preview: () => <OcrCardDemo />,
} satisfies ComponentDefinition
