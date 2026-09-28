# weimo-ui-stats

`weimo-ui-stats` 是 Weimo UI 的统计与活动可视化 workspace 子项目，包含 `Heatmap` 和 `StatGroup`。它唯一的 workspace 内部依赖是 `weimo-ui-core`。

组件按子路径导入：

```tsx
import { Heatmap } from 'weimo-ui-stats/components/heatmap'
import { StatGroup } from 'weimo-ui-stats/components/stat-group'
```

包直接导出 TypeScript、TSX 与 CSS 源码，消费方需要支持这些源码格式，并安装 React peer dependencies。

## 源码结构

```text
src/components/
├── heatmap/     # 热力图组件、日期模型与 HeatColor 兼容适配
└── stat-group/  # 统计组组件与样式
```

`components/*.tsx` 中的平铺文件仅保留稳定的公开/registry 入口。实现、样式和内部
模型放在对应组件目录；组件内部使用相对导入，跨包依赖通过公开子路径引用。
