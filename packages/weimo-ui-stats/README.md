# weimo-ui-stats

`weimo-ui-stats` 是 Weimo UI 的统计与活动可视化 workspace 子项目，包含 `Heatmap` 和 `StatGroup`。它唯一的 workspace 内部依赖是 `weimo-ui-core`。

组件按子路径导入：

```tsx
import { Heatmap } from 'weimo-ui-stats/components/heatmap'
import { StatGroup } from 'weimo-ui-stats/components/stat-group'
```

包直接导出 TypeScript、TSX 与 CSS 源码，消费方需要支持这些源码格式，并安装 React peer dependencies。
