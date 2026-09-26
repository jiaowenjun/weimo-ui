import { useState } from 'react'
import { CalendarDays, Folder, Hash, Plus } from 'lucide-react'

import { ChipButton } from '../../components/chip-button'
import { ComponentPreviewCard } from '../../components/component-preview-card'
import { TagBar } from '../../components/tag-bar'
import { TagBread } from '../../components/tag-bread'
import {
  getCapsuleFrameAttributes,
  getCapsuleFrameClassName,
} from '../../components/capsule-frame'
import { getFrostedSurfaceClassName } from '../../components/frosted-surface-model'
import {
  TagPicker,
  type TagPickerApplyPayload,
  type TagPickerMode,
} from '../../components/tag-picker'
import {
  TagTree,
  type TagTreeNode,
  type TagTreeVariant,
} from '../../components/tag-tree'
import type { AnimatedTagTreeRow } from '../../components/tag-tree/tag-tree-model'
import { TagTreeRow } from '../../components/tag-tree/tag-tree-row'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../components/coss/breadcrumb'
import { GhostIconButton } from '../../components/ghost-icon-button'
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuTrigger,
} from '../../components/menu'
import { TextButton } from '../../components/text-button'
import type { ComponentDefinition } from '../component-docs'

import '../../components/tag-tree/tag-tree.css'

const tagOptions = [
  '工作/项目',
  '写作/日记',
  '研究/论文',
  '生活/灵感',
  '阅读/摘录',
  '学习/笔记',
  '旅行/见闻',
  '健康/运动',
  '美食/烹饪',
  '音乐/收藏',
  '电影/影评',
  '摄影/作品',
  '设计/草图',
  '编程/开发',
  '投资/理财',
  '育儿/家庭',
  '人际/社交',
  '情绪/反思',
  '目标/计划',
  '杂项/待整理',
]

function TagBarDemo() {
  const [editable, setEditable] = useState(false)
  const [tags, setTags] = useState(['写作/日记', '研究/论文'])

  return (
    <ComponentPreviewCard label="标签栏">
      <div className="tag-bar-preview">
        <div className="tag-bar-preview__panel">
          <TagBar
            editable={editable}
            onTagsChange={setTags}
            tagOptions={tagOptions}
            tags={tags}
          />
          <div className="tag-bar-preview__controls">
            <TextButton
              onClick={() => setEditable((currentEditable) => !currentEditable)}
            >
              {editable ? '切换到展示态' : '切换到编辑态'}
            </TextButton>
          </div>
        </div>
      </div>
    </ComponentPreviewCard>
  )
}

function TagBreadDemo() {
  const tagBreadDocsSurfaceAttributes = getCapsuleFrameAttributes({
    material: 'frosted',
    textSize: 'base',
  })

  return (
    <ComponentPreviewCard label="标签面包屑">
      <div className="tag-bread-docs-preview">
        <TagBread tag="文学/古代/诗词" onSelect={() => {}} />
        <Breadcrumb
          aria-label="coss 省略面包屑示例"
          className={getCapsuleFrameClassName(
            getFrostedSurfaceClassName('frosted-surface--bordered'),
            'tag-bread',
            'tag-bread-docs-preview__ellipsis',
          )}
          {...tagBreadDocsSurfaceAttributes}
        >
          <BreadcrumbList>
            <BreadcrumbItem className="tag-bread__item">
              <span className="tag-bread__prefix">
                <Hash aria-hidden="true" />
              </span>
              <BreadcrumbLink className="tag-bread__link" href="/">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="tag-bread__separator">
              /
            </BreadcrumbSeparator>
            <BreadcrumbItem className="tag-bread__item">
              <Menu>
                <MenuTrigger
                  render={
                    <GhostIconButton
                      aria-label="展开省略的面包屑层级"
                      className="tag-bread-docs-preview__ellipsis-trigger"
                      size="sm"
                    />
                  }
                >
                  <BreadcrumbEllipsis />
                </MenuTrigger>
                <MenuPopup align="start">
                  <MenuItem render={<a href="/docs" />}>Docs</MenuItem>
                  <MenuItem render={<a href="/particles" />}>Particles</MenuItem>
                </MenuPopup>
              </Menu>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="tag-bread__separator">
              /
            </BreadcrumbSeparator>
            <BreadcrumbItem className="tag-bread__item">
              <BreadcrumbLink className="tag-bread__link" href="/docs/components">
                Components
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="tag-bread__separator">
              /
            </BreadcrumbSeparator>
            <BreadcrumbItem className="tag-bread__item">
              <BreadcrumbPage className="tag-bread__page">Breadcrumb</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </ComponentPreviewCard>
  )
}

function TagPickerDemo({
  initialDraft = '',
  mode = 'insert',
  targetTag = '',
}: {
  initialDraft?: string
  mode?: TagPickerMode
  targetTag?: string
} = {}) {
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
      if (nextSlots.length === 0 || nextSlots[nextSlots.length - 1]) {
        nextSlots.push('')
      }
      return nextSlots
    })
  }

  return (
    <ComponentPreviewCard label="标签选择器">
      <div className="tag-picker-preview">
        <div className="tag-picker-preview__panel">
          <div className="tag-picker-preview__tags" aria-label="笔记标签">
            {tagSlots.map((tag, index) => (
              tag ? (
                <ChipButton key={`${tag}-${index}`} onClick={() => openTagPicker(index)}>
                  {tag}
                </ChipButton>
              ) : (
                <ChipButton key={`new-${index}`} onClick={() => openTagPicker(index)} prefix={<Plus aria-hidden="true" />}>
                  标签
                </ChipButton>
              )
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
      </div>
    </ComponentPreviewCard>
  )
}

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

function TagTreeDemo({
  defaultExpandedTags = ['writing', 'research'],
  nodes = tagTreeDemoNodes,
  selectedTag: initialSelectedTag = 'writing/daily',
  variant = 'default',
}: {
  defaultExpandedTags?: string[]
  nodes?: TagTreeNode[]
  selectedTag?: string
  variant?: TagTreeVariant
} = {}) {
  const [selectedTag, setSelectedTag] = useState(initialSelectedTag)

  return (
    <ComponentPreviewCard label="标签树">
      <div className="tag-tree-preview">
        <div className="tag-tree-preview__panel">
          <TagTree
            className="tag-tree-preview__tree"
            defaultExpandedTags={defaultExpandedTags}
            defaultIcon={<Hash aria-hidden="true" />}
            nodes={nodes}
            onMenuAction={variant === "default" ? () => {} : undefined}
            onSelect={setSelectedTag}
            selectedTag={selectedTag}
            variant={variant}
          />
        </div>
      </div>
    </ComponentPreviewCard>
  )
}

const rootRow: AnimatedTagTreeRow = {
  node: { tag: 'writing', label: '写作', icon: <Folder aria-hidden="true" /> },
  tag: 'writing',
  label: '写作',
  depth: 0,
  hasChildren: true,
  expanded: true,
  selected: false,
}

const childRow: AnimatedTagTreeRow = {
  node: { tag: 'writing/daily', label: '日记', icon: <CalendarDays aria-hidden="true" /> },
  tag: 'writing/daily',
  label: '日记',
  depth: 1,
  hasChildren: false,
  expanded: false,
  selected: true,
}

function TagTreeRowDemo() {
  return (
    <ComponentPreviewCard align="center" label="标签树行">
      <div className="internal-tag-tree-row-preview tag-tree" role="tree" aria-label="TagTreeRow preview">
        <TagTreeRow
          onMenuAction={() => {}}
          onSelect={() => {}}
          onToggle={() => {}}
          row={rootRow}
          rowMenuEnabled
          variant="default"
        />
        <TagTreeRow
          onMenuAction={() => {}}
          onSelect={() => {}}
          onToggle={() => {}}
          row={childRow}
          rowMenuEnabled
          variant="default"
        />
        <TagTreeRow
          onSelect={() => {}}
          onToggle={() => {}}
          row={{ ...childRow, tag: 'writing/ideas', label: '灵感', selected: false }}
          rowMenuEnabled={false}
          variant="no-action"
        />
      </div>
    </ComponentPreviewCard>
  )
}

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function TagDemo() {
  return (
    <>
      <TagBarDemo />
      <TagBreadDemo />
      <TagPickerDemo />
      <TagTreeDemo />
      <TagTreeRowDemo />
    </>
  )
}

export const tagDefinition = {
  id: 'tag',
  summary: '标签栏、标签面包屑、标签选择器与标签树的标签总览',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'TagBar',
    'TagBread',
    'TagPicker',
    'TagTree',
    'TagTreeRow',
    '标签栏',
    '标签面包屑',
    '标签选择器',
    '标签树',
    '标签树行',
  ],
  preview: () => <TagDemo />,
} satisfies ComponentDefinition
