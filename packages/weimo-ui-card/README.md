# weimo-ui-card

`weimo-ui-card` 是内容工作流组合包，拥有可编辑内容卡片、卡片创建器、标签编辑和 OCR 卡片。它组合 core、Markdown、图片和标签树能力，但不拥有这些基础能力的实现。

该包标记为 `private`。仓库外调用者应使用根包的 `weimo-ui/components/*` 入口。

## 组件入口

| 入口 | 导出 | 职责 |
| --- | --- | --- |
| `components/card` | `Card` | 内容展示、编辑、标签和保存流程 |
| `components/card-composer` | `CardComposer` | 新建卡片的进入、退出与自动聚焦编排 |
| `components/card-top-bar` | `CardTopBar` | 卡片顶部信息与操作栏 |
| `components/card-tool-bar` | `CardToolBar` | 编辑态保存、取消等动作栏 |
| `components/tag-bar` | `TagBar` | 卡片标签展示与编辑入口 |
| `components/tag-picker` | `TagPicker` | 标签搜索和选择 |
| `components/editable-capsule` | `EditableCapsule` | 可删除的标签胶囊 |
| `components/ocr-card` | `OcrCard` | OCR 结果卡片 |
| `components/ocr-composer` | `OcrComposer` | OCR 创建流程 |
| `components/ocr-detail` | `OcrDetail` | OCR 图片与文本详情 |

`components/tag-picker-model` 提供 TagPicker 的纯模型入口。每个组件的 CSS 也有对应 `styles/*` 子路径，完整清单以本包 `package.json#exports` 为准；包根不提供 `.` 导出。

## Workspace 使用

```tsx
import { Card } from 'weimo-ui-card/components/card'
import { OcrDetail } from 'weimo-ui-card/components/ocr-detail'
```

组件直接导入自身样式，并以 TypeScript、TSX 与 CSS 源码交付。

## 依赖边界

| 依赖 | 使用范围 |
| --- | --- |
| `weimo-ui-core` | Surface、按钮、菜单和通用工具 |
| `weimo-ui-markdown` | 内容渲染、编辑和模式切换 |
| `weimo-ui-image` | 图片上传与查看 |
| `weimo-ui-tagtree` | 标签树数据与标签选择场景 |

- 跨包只能使用依赖包的公开子路径。
- `Card` 不负责网络请求、持久化或业务路由，这些行为由回调和插槽交给调用方。
- 标签、OCR 和卡片组件各自聚合内部模型与样式，不通过扁平转发文件相互暴露。

## 源码结构

```text
src/components/
├── card/       # Card、栏位、编辑状态机、测量与过渡 hooks
├── composer/   # CardComposer 与创建器壳层
├── tags/       # TagBar、EditableCapsule 和 TagPicker 组件族
└── ocr/        # OcrCard、OcrComposer 与 OcrDetail
```

## 验证

```bash
pnpm --filter weimo-ui-card test:typecheck
pnpm test:contracts
pnpm test:runtime
```

编辑态动画的测量和时序模型见 [Card 编辑态过渡排查](../../docs/troubleshooting/card-edit-transition.md)。
