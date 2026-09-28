# weimo-ui-tagtree

`weimo-ui-tagtree` 拥有标签树、标签面包屑和独立标签展示页，唯一的 workspace 依赖是 `weimo-ui-core`。

该包标记为 `private`。仓库外调用者应使用根包的 `weimo-ui/components/*` 入口。

## 组件入口

| 入口 | 导出 | 职责 |
| --- | --- | --- |
| `components/tag-tree` | `TagTree` | 树形展开、选中和菜单事件编排 |
| `components/tag-tree-row` | `TagTreeRow` | 单行树节点渲染 |
| `components/tag-tree-model` | 模型 API | 树扁平化、展开状态和节点类型 |
| `components/tag-bread` | `TagBread` | 标签路径面包屑 |
| `page` | `TagTreePage` | 独立标签组件展示页 |

`components/coss/*` 是标签组件使用的基础适配入口，`styles/page.css` 是独立页样式入口。完整清单以本包 `package.json#exports` 为准；包根不提供 `.` 导出。

## Workspace 使用

```tsx
import { TagBread } from 'weimo-ui-tagtree/components/tag-bread'
import { TagTree } from 'weimo-ui-tagtree/components/tag-tree'
import { TagTreePage } from 'weimo-ui-tagtree/page'
```

应用入口需要加载 core token；组件和页面会导入自身结构样式：

```ts
import 'weimo-ui-core/styles/tokens.css'
```

## 依赖边界

- 只依赖 `weimo-ui-core` 的菜单、胶囊、材质和通用工具。
- `TagTree` 管理受控或非受控展开状态，但不负责路由、持久化和服务端数据加载。
- `TagTreeRow` 是 TagTree 组件族的公开子组件；内部 `useTagTree` 留在组件目录，不单独导出。
- 页面只用于展示标签组件，不向其他组件包提供能力。

## 源码结构

```text
src/
├── components/
│   ├── tag-tree/  # 组件、行、模型与状态 hook
│   ├── tag-bread/ # 标签面包屑
│   └── coss/      # 本包所需的基础适配层
└── page/          # 独立展示页与页面样式
```

## 验证

```bash
pnpm --filter weimo-ui-tagtree test:typecheck
pnpm test:contracts
pnpm test:runtime
```

整体边界见[组件架构与设计规范](../../docs/architecture/component-architecture.md)。
