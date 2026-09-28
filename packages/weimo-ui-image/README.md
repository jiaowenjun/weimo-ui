# weimo-ui-image

`weimo-ui-image` 是 Weimo UI 的图片处理与预览 workspace 子项目，包含 `ImageView`、`ImageUploader` 和 `CanvasTransparency`。它唯一的 workspace 内部依赖是 `weimo-ui-core`。

组件按子路径导入：

```tsx
import { CanvasTransparency } from 'weimo-ui-image/components/canvas-transparency'
import { ImageUploader } from 'weimo-ui-image/components/image-uploader'
import { ImageView } from 'weimo-ui-image/components/image-view'
```

包直接导出 TypeScript、TSX 与 CSS 源码，消费方需要支持这些源码格式，并安装 React peer dependencies。

## 源码结构

```text
src/components/
├── canvas-transparency/  # 透明化组件、缓存与图像处理模型
├── image-uploader/       # 图片选择、预览与上传交互
└── image-view/           # 图片展示、详情查看与展示模式菜单
```

公开子路径直接指向对应组件目录中的实现。实现、样式和内部模型放在同一目录；
组件内部使用相对导入，跨组件通过明确的实现路径依赖。
