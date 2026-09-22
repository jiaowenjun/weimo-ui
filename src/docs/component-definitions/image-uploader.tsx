import { Check, Clipboard, FileImage, X } from 'lucide-react'
import { useState } from 'react'

import { ComponentPreviewCard } from '../../components/component-preview-card'
import { GlassIconButton } from '../../components/glass-icon-button'
import { ImageUploader, type ImageUploaderActionApi } from '../../components/image-uploader'
import type { ComponentDefinition } from '../component-docs'

function ImageUploaderPreview() {
  const [file, setFile] = useState<File | null>(null)
  const [actions, setActions] = useState<ImageUploaderActionApi | null>(null)

  return (
    <ComponentPreviewCard label="图片上传">
      <div className="image-uploader-docs-preview">
        <ImageUploader
          aria-label="图片上传区域预览"
          file={file}
          onActionsChange={setActions}
          onCheck={() => {}}
          onFileChange={setFile}
        />
        <span className="image-uploader-docs-preview__actions">
          {!actions?.hasFile ? (
            <>
              <GlassIconButton
                aria-label="选择文件"
                onClick={() => actions?.select()}
              >
                <FileImage aria-hidden="true" />
              </GlassIconButton>
              <GlassIconButton
                aria-label="粘贴图片"
                disabled={!actions?.canPasteClipboardImage}
                onClick={() => actions?.paste()}
              >
                <Clipboard aria-hidden="true" />
              </GlassIconButton>
            </>
          ) : (
            <>
              <GlassIconButton
                aria-label="清除图片"
                onClick={() => actions?.close()}
              >
                <X aria-hidden="true" />
              </GlassIconButton>
              <GlassIconButton
                aria-label="确认图片"
                disabled={!actions?.canCheck}
                onClick={() => actions?.check()}
              >
                <Check aria-hidden="true" />
              </GlassIconButton>
            </>
          )}
        </span>
      </div>
    </ComponentPreviewCard>
  )
}

export const imageUploaderDefinition = {
  id: 'image-uploader',
  summary: '受控图片上传区域，支持拖放、选择、粘贴和调用者自定义按钮',
  status: 'Ready',
  frame: 'plain',
  preview: () => <ImageUploaderPreview />,
} satisfies ComponentDefinition
