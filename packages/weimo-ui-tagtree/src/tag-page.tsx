import { useState } from 'react'
import type { ReactNode } from 'react'
import { CalendarDays, Folder, Hash, Plus } from 'lucide-react'

import {
  getCapsuleFrameAttributes,
  getCapsuleFrameClassName,
} from 'weimo-ui-core/components/capsule-frame'
import { getFrostedSurfaceClassName } from 'weimo-ui-core/components/frosted-surface-model'
import { GhostIconButton } from 'weimo-ui-core/components/ghost-icon-button'
import { Menu, MenuItem, MenuPopup, MenuTrigger } from 'weimo-ui-core/components/menu'
import { TextButton } from 'weimo-ui-core/components/text-button'
import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'

import { ChipButton } from './components/chip-button'
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './components/coss/breadcrumb'
import { TagBar } from './components/tag-bar'
import { TagBread } from './components/tag-bread'
import { TagPicker, type TagPickerApplyPayload, type TagPickerMode } from './components/tag-picker'
import { TagTree, type TagTreeNode, type TagTreeVariant } from './components/tag-tree'
import type { AnimatedTagTreeRow } from './components/tag-tree/tag-tree-model'
import { TagTreeRow } from './components/tag-tree/tag-tree-row'

import './tag-page.css'

const tagOptions = [
  '工作/项目', '写作/日记', '研究/论文', '生活/灵感', '阅读/摘录',
  '学习/笔记', '旅行/见闻', '健康/运动', '美食/烹饪', '音乐/收藏',
  '电影/影评', '摄影/作品', '设计/草图', '编程/开发', '投资/理财',
  '育儿/家庭', '人际/社交', '情绪/反思', '目标/计划', '杂项/待整理',
]

const tagTreeDemoNodes: TagTreeNode[] = [
  {
    tag: 'writing',
    label: '写作',
    icon: <Folder aria-hidden="true" />,
    children: [
      { tag: 'writing/daily', label: '日记', icon: <CalendarDays aria-hidden="true" /> },
      { tag: 'writing/ideas', label: '灵感' },
    ],
  },
  {
    tag: 'research',
    label: '研究',
    children: [
      { tag: 'research/papers', label: '论文' },
      { tag: 'research/quotes', label: '摘录' },
    ],
  },
  { tag: 'archive', label: '归档' },
]

function PreviewCard({ children, label }: { children: ReactNode; label: string }) {
  return (
    <ComponentPreviewCard className="tag-page__card" label={label}>
      <div className="tag-page__canvas">{children}</div>
    </ComponentPreviewCard>
  )
}

function TagBarDemo() {
  const [editable, setEditable] = useState(false)
  const [tags, setTags] = useState(['写作/日记', '研究/论文'])

  return (
    <PreviewCard label="标签栏">
      <div className="tag-page__panel">
        <TagBar editable={editable} onTagsChange={setTags} tagOptions={tagOptions} tags={tags} />
        <TextButton onClick={() => setEditable((current) => !current)}>
          {editable ? '切换到展示态' : '切换到编辑态'}
        </TextButton>
      </div>
    </PreviewCard>
  )
}

function TagBreadDemo() {
  const surfaceAttributes = getCapsuleFrameAttributes({ material: 'frosted', textSize: 'base' })

  return (
    <PreviewCard label="标签面包屑">
      <div className="tag-page__bread-preview">
        <TagBread tag="文学/古代/诗词" onSelect={() => {}} />
        <Breadcrumb
          aria-label="省略面包屑示例"
          className={getCapsuleFrameClassName(
            getFrostedSurfaceClassName('frosted-surface--bordered'),
            'tag-bread',
          )}
          {...surfaceAttributes}
        >
          <BreadcrumbList>
            <BreadcrumbItem className="tag-bread__item">
              <span className="tag-bread__prefix"><Hash aria-hidden="true" /></span>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem className="tag-bread__item">
              <Menu>
                <MenuTrigger render={<GhostIconButton aria-label="展开省略的面包屑层级" size="sm" />}>
                  <BreadcrumbEllipsis />
                </MenuTrigger>
                <MenuPopup align="start">
                  <MenuItem render={<a href="/docs" />}>Docs</MenuItem>
                  <MenuItem render={<a href="/particles" />}>Particles</MenuItem>
                </MenuPopup>
              </Menu>
            </BreadcrumbItem>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem className="tag-bread__item"><BreadcrumbLink href="/docs/components">Components</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem className="tag-bread__item"><BreadcrumbPage>Breadcrumb</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </PreviewCard>
  )
}

function TagPickerDemo({ mode = 'insert', initialDraft = '', targetTag = '' }: { mode?: TagPickerMode; initialDraft?: string; targetTag?: string }) {
  const [open, setOpen] = useState(false)
  const [tagSlots, setTagSlots] = useState(['写作/日记', ''])
  const [activeSlotIndex, setActiveSlotIndex] = useState(0)
  const [pickerMode, setPickerMode] = useState<TagPickerMode>(mode)
  const selectedTags = tagSlots.filter(Boolean)
  const activeTag = tagSlots[activeSlotIndex] ?? ''

  function openTagPicker(index: number) {
    const tag = tagSlots[index] ?? ''
    setActiveSlotIndex(index)
    setPickerMode(mode === 'pick' ? 'pick' : tag ? 'update' : 'insert')
    setOpen(true)
  }

  function handleApply(payload: TagPickerApplyPayload) {
    setTagSlots((slots) => {
      const nextSlots = [...slots]
      if (payload.mode === 'insert') {
        nextSlots[activeSlotIndex] = payload.draft
        nextSlots.push('')
        return nextSlots
      }
      const nextTag = payload.selectedTags[activeSlotIndex] ?? ''
      if (nextTag) nextSlots[activeSlotIndex] = nextTag
      else nextSlots.splice(activeSlotIndex, 1)
      if (nextSlots.length === 0 || nextSlots[nextSlots.length - 1]) nextSlots.push('')
      return nextSlots
    })
  }

  return (
    <PreviewCard label="标签选择器">
      <div className="tag-page__panel">
        <div className="tag-page__tags" aria-label="笔记标签">
          {tagSlots.map((tag, index) => tag ? (
            <ChipButton key={`${tag}-${index}`} onClick={() => openTagPicker(index)}>{tag}</ChipButton>
          ) : (
            <ChipButton key={`new-${index}`} onClick={() => openTagPicker(index)} prefix={<Plus aria-hidden="true" />}>标签</ChipButton>
          ))}
        </div>
      </div>
      <TagPicker
        initialDraft={activeTag || initialDraft}
        mode={pickerMode}
        onApply={handleApply}
        onOpenChange={setOpen}
        open={open}
        selectedTags={selectedTags}
        tagOptions={tagOptions}
        targetTag={activeTag || targetTag}
      />
    </PreviewCard>
  )
}

function TagTreeDemo({ variant = 'default' }: { variant?: TagTreeVariant }) {
  const [selectedTag, setSelectedTag] = useState('writing/daily')
  return (
    <PreviewCard label={variant === 'default' ? '标签树' : '无操作标签树'}>
      <div className="tag-page__tree-panel">
        <TagTree
          defaultExpandedTags={['writing', 'research']}
          defaultIcon={<Hash aria-hidden="true" />}
          nodes={tagTreeDemoNodes}
          onMenuAction={variant === 'default' ? () => {} : undefined}
          onSelect={setSelectedTag}
          selectedTag={selectedTag}
          variant={variant}
        />
      </div>
    </PreviewCard>
  )
}

const rootRow: AnimatedTagTreeRow = {
  node: { tag: 'writing', label: '写作', icon: <Folder aria-hidden="true" /> },
  tag: 'writing', label: '写作', depth: 0, hasChildren: true, expanded: true, selected: false,
}
const childRow: AnimatedTagTreeRow = {
  node: { tag: 'writing/daily', label: '日记', icon: <CalendarDays aria-hidden="true" /> },
  tag: 'writing/daily', label: '日记', depth: 1, hasChildren: false, expanded: false, selected: true,
}

function TagTreeRowDemo() {
  return (
    <PreviewCard label="标签树行">
      <div className="tag-page__tree-panel" role="tree" aria-label="TagTreeRow preview">
        <TagTreeRow onMenuAction={() => {}} onSelect={() => {}} onToggle={() => {}} row={rootRow} rowMenuEnabled variant="default" />
        <TagTreeRow onMenuAction={() => {}} onSelect={() => {}} onToggle={() => {}} row={childRow} rowMenuEnabled variant="default" />
        <TagTreeRow onSelect={() => {}} onToggle={() => {}} row={{ ...childRow, tag: 'writing/ideas', label: '灵感', selected: false }} rowMenuEnabled={false} variant="no-action" />
      </div>
    </PreviewCard>
  )
}

export type TagTreePageProps = {
  embedded?: boolean
}

export function TagTreePage({ embedded = false }: TagTreePageProps = {}) {
  return (
    <main className="tag-page">
      {!embedded ? (
        <header className="tag-page__header">
          <p className="tag-page__eyebrow">Weimo UI / 标签树</p>
          <h1>标签树</h1>
          <p>标签栏、面包屑、选择器与树形导航组件。</p>
        </header>
      ) : null}
      <div className="tag-page__grid">
        <TagBarDemo />
        <TagBreadDemo />
        <TagPickerDemo />
        <TagTreeDemo />
        <TagTreeDemo variant="no-action" />
        <TagTreeRowDemo />
      </div>
    </main>
  )
}
