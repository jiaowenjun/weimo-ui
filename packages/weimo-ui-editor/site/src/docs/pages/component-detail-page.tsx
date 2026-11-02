import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
import { useDocsOutletContext } from '../shell/docs-outlet-context'

/** 单组件站:详情页即站点首页,恒取唯一文档 */
export function ComponentDetailPage() {
  const { docs } = useDocsOutletContext()
  const selected = docs[0]

  if (selected.frame === 'plain') {
    return <div className="component-detail-page">{selected.preview()}</div>
  }

  return (
    <div className="component-detail-page">
      <ComponentPreviewCard
        data-component-id={selected.id}
        label={
          <>
            {selected.name}{' '}
            <code className="docs-component-class">{selected.id}</code>
          </>
        }
      >
        {selected.summary ? (
          <p>{selected.summary}</p>
        ) : null}
        {selected.preview()}
      </ComponentPreviewCard>
    </div>
  )
}
