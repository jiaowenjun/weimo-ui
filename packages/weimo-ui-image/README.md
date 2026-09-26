# weimo-ui-image

`weimo-ui-image` 是 Weimo UI 的图片处理与预览 workspace 子项目，包含 `ImageView`、`ImageUploader` 和 `CanvasTransparency`。它唯一的 workspace 内部依赖是 `weimo-ui-core`。

组件按子路径导入：

```tsx
import { CanvasTransparency } from 'weimo-ui-image/components/canvas-transparency'
import { ImageUploader } from 'weimo-ui-image/components/image-uploader'
import { ImageView } from 'weimo-ui-image/components/image-view'
```

包直接导出 TypeScript、TSX 与 CSS 源码，消费方需要支持这些源码格式，并安装 React peer dependencies。
