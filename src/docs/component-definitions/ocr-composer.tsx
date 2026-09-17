import { useState } from 'react'

import { OcrComposer } from '../../components/ocr-composer'
import type { OcrComposerDraft } from '../../components/ocr-composer'
import type { ComponentDefinition } from '../component-docs'

const ocrComposerTagOptions = ['OCR', '票据', '资料', '待校对']

function OcrComposerDemo() {
  const [file, setFile] = useState<File | null>(null)
  const [tags, setTags] = useState<string[]>([])

  return (
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
  )
}

export const ocrComposerDefinition = {
  id: 'ocr-composer',
  summary: '复用 CardComposer 外观的 OCR 图片上传草稿壳层，正文区域替换为 ImageUploader',
  status: 'Preview',
  preview: () => <OcrComposerDemo />,
} satisfies ComponentDefinition

void (null as unknown as OcrComposerDraft)
