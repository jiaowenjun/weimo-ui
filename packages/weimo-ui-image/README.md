# weimo-ui-image

`weimo-ui-image` 拥有图片选择、展示和画布透明化能力，唯一的 workspace 依赖是 `weimo-ui-core`。

该包标记为 `private`。仓库外调用者应使用根包的 `weimo-ui/components/*` 入口。

## 组件入口

| 入口 | 导出 | 职责 |
| --- | --- | --- |
| `components/image-uploader` | `ImageUploader` | 文件选择、拖放、剪贴板粘贴与本地预览 |
| `components/image-view` | `ImageView` | 图片展示、尺寸模式、拖拽查看与原图弹层 |
| `components/canvas-transparency` | `CanvasTransparency` | 按背景色生成透明化图片并适配明暗主题 |
| `components/canvas-transparency-cache` | 缓存 API | 透明化结果的获取、复用与释放 |

`ImageUploader` 和 `ImageView` 的 CSS 另有 `styles/*` 入口。完整清单以本包 `package.json#exports` 为准；包根不提供 `.` 导出。

## Workspace 使用

```tsx
import { CanvasTransparency } from 'weimo-ui-image/components/canvas-transparency'
import { ImageUploader } from 'weimo-ui-image/components/image-uploader'
import { ImageView } from 'weimo-ui-image/components/image-view'
```

组件直接导入自身样式，并以 TypeScript、TSX 与 CSS 源码交付。

## 依赖边界

- 只依赖 `weimo-ui-core` 的对话框、菜单、按钮和工具函数。
- 上传协议、远端存储与 URL 持久化属于调用方职责。
- Canvas 处理模型和缓存由 `canvas-transparency/` 组件族拥有，其他包不能引用其内部文件。
- 组件之间使用明确实现路径，不维护扁平转发入口。

## 源码结构

```text
src/components/
├── canvas-transparency/  # 组件、图像处理模型与缓存
├── image-uploader/       # 文件输入、拖放、粘贴和预览
└── image-view/           # 展示模式、详情弹层和交互
```

## 验证

```bash
pnpm --filter weimo-ui-image test:typecheck
pnpm test:contracts
pnpm test:runtime
```

整体边界见[组件架构与设计规范](../../docs/architecture/component-architecture.md)。
