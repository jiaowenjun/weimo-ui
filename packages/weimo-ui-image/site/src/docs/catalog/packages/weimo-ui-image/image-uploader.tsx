import { useState } from 'react'
import { Check, Clipboard, FileImage, X } from 'lucide-react'

import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
import { FrostedIconButton } from 'weimo-ui-core/components/frosted-icon-button'
import {
  ImageUploader,
  type ImageUploaderActionApi,
} from 'weimo-ui-image/components/image-uploader'
import type { ComponentDefinition } from '../../component-docs'
import { ComponentCardTitle } from '../../component-card-title'

function ImageUploaderDemo() {
  const [file, setFile] = useState<File | null>(null)
  const [actions, setActions] = useState<ImageUploaderActionApi | null>(null)

  return (
    <ComponentPreviewCard
      className="image-page__card"
      label={
        <ComponentCardTitle componentName="image-uploader">图片上传</ComponentCardTitle>
      }
    >
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
              <FrostedIconButton
                aria-label="选择文件"
                onClick={() => actions?.select()}
              >
                <FileImage aria-hidden="true" />
              </FrostedIconButton>
              <FrostedIconButton
                aria-label="粘贴图片"
                disabled={!actions?.canPasteClipboardImage}
                onClick={() => actions?.paste()}
              >
                <Clipboard aria-hidden="true" />
              </FrostedIconButton>
            </>
          ) : (
            <>
              <FrostedIconButton
                aria-label="清除图片"
                onClick={() => actions?.close()}
              >
                <X aria-hidden="true" />
              </FrostedIconButton>
              <FrostedIconButton
                aria-label="确认图片"
                disabled={!actions?.canCheck}
                onClick={() => actions?.check()}
              >
                <Check aria-hidden="true" />
              </FrostedIconButton>
            </>
          )}
        </span>
      </div>
    </ComponentPreviewCard>
  )
}

export const imageUploaderDefinition = {
  id: 'image-uploader',
  summary: '文件选择、拖放与剪贴板粘贴三通道合一的图片上传面板',
  status: 'Ready',
  frame: 'plain',
  preview: () => <ImageUploaderDemo />,
} satisfies ComponentDefinition
