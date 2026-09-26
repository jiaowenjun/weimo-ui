# weimo-ui-tagtree

`weimo-ui-tagtree` 是独立的标签树页面与标签导航组件包，唯一的 workspace 内部依赖是 `weimo-ui-core`。

页面和组件按子路径导入：

```tsx
import { TagTreePage } from 'weimo-ui-tagtree/page'
import { TagTree } from 'weimo-ui-tagtree/components/tag-tree'
```

使用页面或组件前，在应用入口导入 core token：

```ts
import 'weimo-ui-core/styles/tokens.css'
import 'weimo-ui-tagtree/styles/page.css'
```

包直接导出 TypeScript、TSX 与 CSS 源码，消费方需要支持这些源码格式。
