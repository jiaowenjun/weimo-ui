# weimo-ui-markdown

`weimo-ui-markdown` 是 Weimo UI 的 Markdown 渲染、编辑、数学公式和视图切换子项目，唯一的 workspace 内部依赖是 `weimo-ui-core`。

组件按子路径导入：

```tsx
import { MdRender } from 'weimo-ui-markdown/components/md-render'
import { MdEditor } from 'weimo-ui-markdown/components/md-editor'
import { MdView } from 'weimo-ui-markdown/components/md-view'
```

应用入口导入 token：

```ts
import 'weimo-ui-markdown/styles/tokens.css'
```

包直接导出 TypeScript、TSX 与 CSS 源码，消费方需要支持这些源码格式，并安装组件声明的 Markdown/Tiptap 运行时依赖。
