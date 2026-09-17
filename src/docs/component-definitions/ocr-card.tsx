import { OcrCard } from '../../components/ocr-card'
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
  )
}

export const ocrCardDefinition = {
  id: 'ocr-card',
  summary: '复用 Card 编辑壳层的 OCR 卡片，有识别结果时通过操作菜单校对 Markdown，否则展示原图',
  status: 'Ready',
  props: [
    { name: 'note', type: 'OcrCardNote', defaultValue: '-' },
    { name: 'imageViewProps', type: 'OcrCardImageViewProps', defaultValue: '-' },
    { name: 'markdownImageRenderer', type: 'MdRenderImageRenderer', defaultValue: '-' },
    { name: 'displayMenuItems', type: 'ActionMenuItem[]', defaultValue: '-' },
    { name: 'onDraftChange', type: '(draft: OcrCardDraft) => void', defaultValue: '-' },
    { name: 'onSave', type: '(draft: OcrCardDraft) => void', defaultValue: '-' },
    { name: 'onDelete', type: '() => void', defaultValue: '-' },
    { name: 'actionSlot', type: 'ReactNode', defaultValue: '-' },
    { name: 'disabled', type: 'boolean', defaultValue: 'false' },
    { name: 'labels', type: 'OcrCardLabels', defaultValue: '-' },
    { name: 'onTagClick', type: '(tag: string) => void', defaultValue: '-' },
    { name: 'isTagClickEnabled', type: '(tag: string) => boolean', defaultValue: '() => true' },
    {
      name: '...articleProps',
      type: 'Omit<ComponentPropsWithoutRef<"article">, "children" | "onChange">',
      defaultValue: '-',
    },
  ],
  preview: () => <OcrCardPreview />,
} satisfies ComponentDefinition
