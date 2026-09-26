# weimo-ui-core

`weimo-ui-core` 是 Weimo UI workspace 中的基础 React 源码包，承载 Token / 样式、Surface / 材质、控件 / 弹层和布局 / 栏位四组组件。

组件按子路径导入：

```tsx
import { FrostedSurface } from 'weimo-ui-core/components/frosted-surface'
import { TextButton } from 'weimo-ui-core/components/text-button'
```

全局 token 需在应用入口导入一次：

```ts
import 'weimo-ui-core/styles/tokens.css'
```

包直接导出 TypeScript、TSX 与 CSS 源码，消费方需要支持这些源码格式。
