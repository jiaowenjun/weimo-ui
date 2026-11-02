import { useState } from 'react'

import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
import { TextButton } from 'weimo-ui-core/components/text-button'
import { OcrDetail } from 'weimo-ui-ocr/components/ocr-detail'

import type { ComponentDefinition } from '../../component-docs'
import { ocrTagOptions, sampleOcrImage } from './samples'

const sampleMarkdown = [
  '# OCR 校对样例',
  '',
  '这是一段从图片中识别出的 **markdown**。',
  '',
  '- 校对标题层级',
  '- 修正错别字',
  '- 保留列表结构',
].join('\n')

function OcrDetailPreview() {
  const [open, setOpen] = useState(false)
  const [markdown, setMarkdown] = useState(sampleMarkdown)
  const [title, setTitle] = useState('OCR 校对题目')

  return (
    <ComponentPreviewCard label="OCR 校对(左原图右编辑)">
      <div className="ocr-detail-docs-preview">
        <TextButton onClick={() => setOpen(true)} type="button">
          打开 OCR 校对
        </TextButton>
        <OcrDetail
          imageSrc={sampleOcrImage}
          onChange={(nextMarkdown, draft) => {
            setMarkdown(nextMarkdown)
            setTitle(draft.title)
          }}
          onOpenChange={setOpen}
          open={open}
          tagOptions={ocrTagOptions}
          tags={['OCR', '校对']}
          title={title}
          value={markdown}
        />
      </div>
    </ComponentPreviewCard>
  )
}

export const ocrDetailDefinition = {
  id: 'ocr-detail',
  summary: 'OCR 校对对话框:原图显示模式可切,右侧 WdfCard 恒编辑态(行内样式),标题与标签就地修改。',
  status: 'Ready',
  frame: 'plain',
  preview: () => <OcrDetailPreview />,
} satisfies ComponentDefinition
