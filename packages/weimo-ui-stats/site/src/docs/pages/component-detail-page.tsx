import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
import { useDocsOutletContext } from '../shell/docs-outlet-context'

/** 单组件站:详情页即站点首页,恒取唯一文档 */
export function ComponentDetailPage() {
  const { docs } = useDocsOutletContext()
  const selected = docs[0]

  // plain 框架的预览自带 ComponentPreviewCard,外层不再包卡片
  if (selected.frame === 'plain') {
    return <>{selected.preview()}</>
  }

  return (
    <ComponentPreviewCard
      data-component-id={selected.id}
      label={selected.name}
    >
      {selected.summary ? (
        <p className="component-detail-page__summary">{selected.summary}</p>
      ) : null}
      {selected.preview()}
    </ComponentPreviewCard>
  )
}
