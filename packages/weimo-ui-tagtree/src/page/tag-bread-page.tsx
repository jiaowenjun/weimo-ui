import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'

import { TagBread } from '../components/tag-bread/tag-bread'

import './tag-page.css'

function TagBreadDemo() {
  return (
    <ComponentPreviewCard className="tag-page__card" label="标签面包屑">
      <div className="tag-page__canvas">
        <div className="tag-page__bread-preview">
          <TagBread tag="文学/古代/诗词" onSelect={() => {}} />
          <TagBread tag="文学/古代/诗词/唐诗/李白/静夜思" onSelect={() => {}} />
        </div>
      </div>
    </ComponentPreviewCard>
  )
}

export type TagBreadPageProps = {
  embedded?: boolean
}

export function TagBreadPage({ embedded = false }: TagBreadPageProps = {}) {
  // 站点内嵌时不带独立页外壳:卡片作为兄弟节点直接进 app-shell__content
  // 纵列,与其他组件页的单列满宽布局对齐。
  if (embedded) {
    return <TagBreadDemo />
  }

  return (
    <main className="tag-page">
      <header className="tag-page__header">
        <p className="tag-page__eyebrow">Weimo UI / 标签面包屑</p>
        <h1>标签面包屑</h1>
        <p>面包屑导航组件。</p>
      </header>
      <div className="tag-page__grid">
        <TagBreadDemo />
      </div>
    </main>
  )
}
