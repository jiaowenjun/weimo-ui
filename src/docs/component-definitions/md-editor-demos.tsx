import { useState } from 'react'

import {
  MdEditor,
} from '../../components/md-editor'
import { mdRenderSample } from './markdown-sample'

export function ControlledMdEditorDemo({
  initialMarkdown = mdRenderSample,
}: {
  initialMarkdown?: string
} = {}) {
  const [markdown, setMarkdown] = useState(initialMarkdown)

  return (
    <div className="md-editor-docs-preview">
      <MdEditor
        onChange={setMarkdown}
        placeholder="写点什么..."
        value={markdown}
      />
    </div>
  )
}
