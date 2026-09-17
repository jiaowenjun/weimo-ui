import { Check, Clipboard, FileImage, X } from 'lucide-react'
import { useState } from 'react'

import { GlassIconButton } from '../../components/glass-icon-button'
import { ImageUploader, type ImageUploaderActionApi } from '../../components/image-uploader'
import type { ComponentDefinition } from '../component-docs'

function ImageUploaderPreview() {
  const [file, setFile] = useState<File | null>(null)
  const [actions, setActions] = useState<ImageUploaderActionApi | null>(null)

  return (
    <>
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
    </>
  )
}

export const imageUploaderDefinition = {
  id: 'image-uploader',
  summary: '受控图片上传区域，支持拖放、选择、粘贴和调用者自定义按钮',
  status: 'Ready',
  props: [
    { name: 'file', type: 'File | null', defaultValue: 'null' },
    { name: 'onFileChange', type: '(file: File | null) => void', defaultValue: '-' },
    { name: 'onActionsChange', type: '(actions: ImageUploaderActionApi) => void', defaultValue: '-' },
    { name: 'onCheck', type: '() => void', defaultValue: '-' },
    { name: 'title', type: 'string', defaultValue: "'上传图片'" },
    {
      name: 'description',
      type: 'string',
      defaultValue: "'拖放、选择或粘贴图片'",
    },
    { name: 'clipboardSourceLabel', type: 'string', defaultValue: "'来自剪贴板'" },
    {
      name: 'inputProps',
      type: 'Omit<ComponentPropsWithoutRef<"input">, "type" | "onChange">',
      defaultValue: '-',
    },
    {
      name: '...divProps',
      type: 'Omit<ComponentPropsWithoutRef<"div">, "children" | "onChange">',
      defaultValue: '-',
    },
  ],
  preview: () => <ImageUploaderPreview />,
} satisfies ComponentDefinition
