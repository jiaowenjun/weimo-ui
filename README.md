# Weimo UI

面向 Weimo 风格产品的 React UI 组件库。它提供可以直接组合到应用中的材质、Markdown、卡片、标签、图片和数据可视化组件，帮助你更快搭建一致、可交互的界面。

- [在线文档与组件预览](https://jiaowenjun.github.io/weimo-ui/)
- [GitHub 仓库](https://github.com/jiaowenjun/weimo-ui)

## 适合什么场景

Weimo UI 适合需要以下界面的 React 应用：

- 笔记、知识库和内容管理：Markdown 展示、编辑和阅读/编辑切换
- 标签导航：可展开、可选中、支持操作菜单的标签树
- 图片工作流：图片上传、拖放、粘贴、预览和原图查看
- 内容卡片：带标题、正文、标签和编辑流程的卡片，以及 OCR 卡片
- 活动与统计：日期热力图和统计指标组
- 轻量的页面壳层：磨砂材质、卡片材质、弹层、按钮和布局栏位

它更适合产品型界面和 Weimo 风格的专用交互，而不是用来替代已经成熟的通用组件库。

## 安装

当前通过 Git commit 安装，建议锁定具体 commit，避免依赖随分支变化：

下面示例中的 `COMMIT_SHA` 替换为你要使用的完整 commit SHA。

```bash
pnpm add github:jiaowenjun/weimo-ui#COMMIT_SHA
```

也可以写入 `package.json`：

```json
{
  "dependencies": {
    "weimo-ui": "github:jiaowenjun/weimo-ui#COMMIT_SHA"
  }
}
```

组件以 TypeScript/TSX/CSS 源码提供。你的构建工具需要能够处理这些格式；应用需要使用 React 19，并安装 `react` 与 `react-dom`。

## 第一个组件

在应用入口加载一次全局 token，然后从 `weimo-ui/...` 导入需要的组件：

```tsx
// main.tsx
import 'weimo-ui/styles/tokens.css'
```

```tsx
import { useState } from 'react'
import { FrostedSurface } from 'weimo-ui/components/frosted-surface'
import { TextButton } from 'weimo-ui/components/text-button'

export function WelcomePanel() {
  const [message, setMessage] = useState('准备开始')

  return (
    <FrostedSurface className="welcome-panel">
      <p>{message}</p>
      <TextButton onClick={() => setMessage('已完成')}>确认</TextButton>
    </FrostedSurface>
  )
}
```

支持原生属性透传的组件可以直接接收 `className`、`style`、ARIA 属性和事件处理器；每个组件的完整参数与交互预览见[在线文档](https://jiaowenjun.github.io/weimo-ui/)。

## 常用调用示例

### Markdown 展示与编辑

`MdRender` 适合只读内容；需要在同一位置切换查看和编辑时使用 `MdView`。

```tsx
import { useState } from 'react'
import { MdView, type MdViewMode } from 'weimo-ui/components/md-view'

export function MarkdownExample() {
  const [mode, setMode] = useState<MdViewMode>('view')
  const [content, setContent] = useState('## 今日\n\n- 完成首页')

  return (
    <>
      <button type="button" onClick={() => setMode(mode === 'view' ? 'edit' : 'view')}>
        {mode === 'view' ? '编辑' : '完成'}
      </button>
      <MdView mode={mode} value={content} onChange={setContent} />
    </>
  )
}
```

### 图片上传与预览

`ImageUploader` 负责选择、拖放和粘贴图片；上传到服务端后，可以把返回的 URL 交给 `ImageView` 展示。

```tsx
import { useEffect, useState } from 'react'
import { ImageUploader } from 'weimo-ui/components/image-uploader'
import { ImageView } from 'weimo-ui/components/image-view'

export function ImageExample() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>()

  useEffect(() => {
    if (!file) {
      setPreviewUrl(undefined)
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    return () => URL.revokeObjectURL(url)
  }, [file])

  return (
    <>
      <ImageUploader file={file} onFileChange={setFile} />
      <ImageView
        alt="图片预览"
        displayMode="fit-width"
        src={previewUrl}
        style={{ maxWidth: 480 }}
      />
    </>
  )
}
```

在实际应用中，建议在文件变化时上传并回收预览 URL；如果只需要展示已有地址，可以直接使用 `ImageView`。

### 标签树

标签节点使用递归数据结构；通过 `selectedTag` 和回调接入应用自己的路由或筛选状态。

```tsx
import { useState } from 'react'
import { TagTree, type TagTreeNode } from 'weimo-ui/components/tag-tree'

const nodes: TagTreeNode[] = [
  {
    tag: 'project',
    label: '项目',
    children: [
      { tag: 'project/design', label: '设计', itemCount: 12 },
      { tag: 'project/research', label: '调研', itemCount: 4 },
    ],
  },
]

export function TagTreeExample() {
  const [selectedTag, setSelectedTag] = useState('project/design')

  return (
    <TagTree
      nodes={nodes}
      selectedTag={selectedTag}
      onSelect={(tag) => setSelectedTag(tag)}
    />
  )
}
```

### 热力图与统计指标

```tsx
import { Heatmap } from 'weimo-ui/components/heatmap'
import { StatGroup } from 'weimo-ui/components/stat-group'

export function ActivityExample() {
  return (
    <>
      <StatGroup
        items={[
          { label: '连续记录', value: '12 天' },
          { label: '本月记录', value: 38 },
        ]}
      />
      <Heatmap
        dailyCounts={[
          { date: '2026-09-25', count: 3 },
          { date: '2026-09-26', count: 7 },
        ]}
        onDateSelect={(date) => console.log('选择日期', date)}
      />
    </>
  )
}
```

## 组件怎么选

| 需求 | 组件 |
| --- | --- |
| 只读 Markdown | `MdRender` 或 `Md` |
| Markdown 查看/编辑切换 | `MdView` |
| 独立 Markdown 编辑器 | `MdEditor` |
| 磨砂背景容器 | `FrostedSurface` |
| 卡片背景容器 | `CardSurface` |
| 带编辑流程的内容卡片 | `Card` |
| 上传、拖放或粘贴图片 | `ImageUploader` |
| 图片展示和原图预览 | `ImageView` |
| 可展开标签导航 | `TagTree` |
| 日期活动可视化 | `Heatmap` |
| 一组关键指标 | `StatGroup` |

更多按钮、弹层、菜单、布局栏位和 token 组件，可以在[组件目录](https://jiaowenjun.github.io/weimo-ui/)中按场景查看预览与参数。

## 导入规则

优先使用根包的公开子路径：

```tsx
import { Card } from 'weimo-ui/components/card'
import { Heatmap } from 'weimo-ui/components/heatmap'
import { TagTree } from 'weimo-ui/components/tag-tree'
```

不需要复制组件源码，也不需要依赖仓库内部的目录结构。组件的样式会随组件加载；全局 token 只需在应用入口导入一次。

## 本地开发

如果需要查看组件目录或参与贡献：

```bash
git clone https://github.com/jiaowenjun/weimo-ui.git
cd weimo-ui
pnpm install
pnpm dev
```

然后打开 `http://localhost:5176/weimo-ui/`。组件目录会展示每个组件的预览、参数和可复制的导入方式。

## 许可

[MIT](LICENSE)
