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

## 源码结构

```text
src/
├── components/
│   ├── markdown/   # 渲染器与编辑器共享的纯 Markdown 语义处理
│   ├── md-render/  # Markdown 渲染实现
│   ├── md-editor/  # Tiptap 编辑器、扩展、工具栏与数学编辑子组件
│   └── md-view/    # 渲染/编辑模式编排与布局保护
└── styles/         # Markdown token 与共享内容样式
```

`components/*.tsx` 中的平铺文件仅保留稳定的公开/registry 入口。实现与私有子模块放在对应组件目录；组件族内部使用相对导入，跨组件族通过 `weimo-ui-markdown/components/*` 的公开子路径依赖。
