# weimo-ui-core

`weimo-ui-core` 是 Weimo UI workspace 中的基础 React 源码包，承载通用 Token / 样式、Surface / 材质、控件 / 弹层、布局 / 栏位，以及基础卡片和预览卡片壳层。Markdown 专用 token 与组件位于 `weimo-ui-markdown`。

组件按子路径导入：

```tsx
import { FrostedSurface } from 'weimo-ui-core/components/frosted-surface'
import { TextButton } from 'weimo-ui-core/components/text-button'
import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
```

全局 token 需在应用入口导入一次：

```ts
import 'weimo-ui-core/styles/tokens.css'
```

包直接导出 TypeScript、TSX 与 CSS 源码，消费方需要支持这些源码格式。

## 源码结构

```text
src/
├── behaviors/   # 可跨组件复用的交互与测量行为
├── components/
│   ├── primitives/  # Base UI 等基础适配层；公开路径仍为 components/coss/*
│   ├── surfaces/    # 卡片、弹层、磨砂与液态玻璃材质
│   ├── controls/    # 按钮、胶囊、滑块等输入控件
│   ├── layout/      # 浮动栏、顶部栏与侧边栏
│   └── composites/  # 菜单、对话框、模式按钮与卡片组合
├── lib/         # 无 UI 所有权的公共工具
└── styles/      # 全局 token 与语义样式变体
```

同一组件或组件族的实现、模型与 CSS 放在同一目录。族内使用相对导入；跨组件族通过
`weimo-ui-core/components/*`、`weimo-ui-core/styles/*` 或
`weimo-ui-core/lib/*` 的稳定子路径依赖，源码物理位置不属于公共 API。
