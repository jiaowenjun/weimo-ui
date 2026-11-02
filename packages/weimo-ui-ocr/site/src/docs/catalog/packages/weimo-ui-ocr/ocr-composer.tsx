import { useState } from 'react'

import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
import {
  OcrComposer,
  type OcrComposerDraft,
} from 'weimo-ui-ocr/components/ocr-composer'

import type { ComponentDefinition } from '../../component-docs'
import { ocrTagOptions } from './samples'

function OcrComposerDemo() {
  const [file, setFile] = useState<File | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [saved, setSaved] = useState<OcrComposerDraft | null>(null)

  return (
    <ComponentPreviewCard label="OCR 上传(选图 + 打标签,保存交宿主识别)">
      <div className="ocr-composer-docs-preview">
        <OcrComposer
          clientId="docs-ocr-composer"
          file={file}
          onFileChange={setFile}
          onSave={setSaved}
          onTagsChange={setTags}
          tagOptions={ocrTagOptions}
          tags={tags}
        />
        {saved ? (
          <p className="component-detail-page__summary">
            已上抛草稿: {saved.file.name} / {saved.tags.join('、') || '无标签'}
          </p>
        ) : null}
      </div>
    </ComponentPreviewCard>
  )
}

export const ocrComposerDefinition = {
  id: 'ocr-composer',
  summary: '「新建 OCR 任务」占位卡:0fr 折叠进场、退场协议收起,选图打标签后上抛 draft 交宿主执行识别。',
  status: 'Ready',
  frame: 'plain',
  preview: () => <OcrComposerDemo />,
} satisfies ComponentDefinition
