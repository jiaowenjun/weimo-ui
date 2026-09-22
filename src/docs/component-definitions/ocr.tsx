import { useState } from 'react'

import { ComponentPreviewCard } from '../../components/component-preview-card'
import { OcrCard } from '../../components/ocr-card'
import { OcrComposer } from '../../components/ocr-composer'
import type { OcrComposerDraft } from '../../components/ocr-composer'
import { OcrDetail } from '../../components/ocr-detail'
import { TextButton } from '../../components/text-button'
import type { ComponentDefinition } from '../component-docs'

const sampleOcrCardImage = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
  <rect width="640" height="480" fill="#f8fafc"/>
  <rect x="88" y="68" width="464" height="344" rx="18" fill="#fff" stroke="#d4d4d8" stroke-width="2"/>
  <rect x="136" y="124" width="210" height="18" rx="9" fill="#18181b"/>
  <rect x="136" y="178" width="368" height="12" rx="6" fill="#a1a1aa"/>
  <rect x="136" y="212" width="320" height="12" rx="6" fill="#d4d4d8"/>
  <rect x="136" y="246" width="384" height="12" rx="6" fill="#d4d4d8"/>
  <rect x="136" y="306" width="152" height="64" rx="10" fill="#eef2ff"/>
</svg>
`)}`

const sampleOcrMarkdown = [
  '## OCR 识别结果',
  '',
  '| 项目 | 内容 |',
  '| --- | --- |',
  '| 编号 | INV-2026-0708 |',
  '| 金额 | 128.00 |',
  '',
  '- 支持 markdown 渲染',
  '- 可切换查看原始图片',
].join('\n')

const ocrCardTagOptions = ['OCR', '扫描件', '票据', '待校对']

function OcrCardPreview() {
  return (
    <ComponentPreviewCard label="OCR 卡片">
      <div className="ocr-card-docs-preview">
        <OcrCard
          aria-label="OCR card preview"
          note={{
            createdAtText: 'OCR 图片',
            imageAlt: 'OCR scanned document preview',
            imageHeight: 480,
            imageSrc: sampleOcrCardImage,
            imageWidth: 640,
            markdown: sampleOcrMarkdown,
            tags: ['OCR', '扫描件'],
          }}
          onDelete={() => {}}
          onSave={() => {}}
          tagOptions={ocrCardTagOptions}
        />
      </div>
    </ComponentPreviewCard>
  )
}

const ocrComposerTagOptions = ['OCR', '票据', '资料', '待校对']

function OcrComposerDemo() {
  const [file, setFile] = useState<File | null>(null)
  const [tags, setTags] = useState<string[]>([])

  return (
    <ComponentPreviewCard label="OCR 上传">
      <div className="card-composer-docs-preview ocr-composer-docs-preview">
        <OcrComposer
          clientId="docs-ocr-composer"
          file={file}
          onFileChange={setFile}
          onSave={() => {}}
          onTagsChange={setTags}
          tagOptions={ocrComposerTagOptions}
          tags={tags}
        />
      </div>
    </ComponentPreviewCard>
  )
}

void (null as unknown as OcrComposerDraft)

const sampleOcrImage =
  'data:image/png;base64,' +
  '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' +
  'S4VubtZJNwpdD13bSBvpq4HwQuj8fN650NlCw2t10lBosNDFVtpAXwAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQ' +
  'gAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIAAB' +
  'CEAAAhCAAAQgAAEIQAACEIAABCAAAQhAAP4pAI0iGUUyimQUySocAAEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQg' +
  'AAEIQAACEIAABCAAAQhAAAIQgAAEIAABCAAAQhAAAIQgAAEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAAC' +
  'EIAABCAAAQhAAAIQgAAEIAABCEAAAhCARwugUSSjSEaRjCJZhQMgAAEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQg' +
  'AAEIQAACEIAABCAAAQhAAAIQgAAEIAABCAAAQhAAAIQgAAEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAAC' +
  'EIAABCAAAQhAAAIQgAAEIAABCEAAAvBoATSKZBTJKJJRJKtwAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQg' +
  'AAEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAAC' +
  'EIAABCAAAQhAAAIQgAAEIAABCEAAHimA/wJ1WWrqMDcOmAAAAABJRU5ErkJggg=='

const sampleMarkdown = `# OCR Review

这是一段从图片中识别出的 Markdown。

- 校对标题层级
- 修正错别字
- 保留列表结构

> 识别结果可以直接编辑。`

function OcrDetailPreview() {
  const [open, setOpen] = useState(false)
  const [markdown, setMarkdown] = useState(sampleMarkdown)
  const [title, setTitle] = useState('OCR 校对题目')

  return (
    <ComponentPreviewCard label="OCR 校对">
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
          tags={['OCR', '校对']}
          title={title}
          value={markdown}
        />
      </div>
    </ComponentPreviewCard>
  )
}

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function OcrDemo() {
  return (
    <>
      <OcrCardPreview />
      <OcrComposerDemo />
      <OcrDetailPreview />
    </>
  )
}

export const ocrDefinition = {
  id: 'ocr',
  summary: 'OCR 卡片、OCR 上传与 OCR 校对的 OCR 总览',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'OcrCard',
    'OcrComposer',
    'OcrDetail',
    'OCR 卡片',
    'OCR 上传',
    'OCR 校对',
  ],
  preview: () => <OcrDemo />,
} satisfies ComponentDefinition
