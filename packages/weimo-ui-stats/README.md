# weimo-ui-stats

`weimo-ui-stats` 拥有日期活动热力图和统计指标组，唯一的 workspace 依赖是 `weimo-ui-core`。

该包标记为 `private`。仓库外调用者应使用根包的 `weimo-ui/components/*` 入口。

## 组件入口

| 入口 | 导出 | 职责 |
| --- | --- | --- |
| `components/heatmap` | `Heatmap` 与日期模型 API | 构建、展示和选择日期活动单元格 |
| `components/heat-color` | `HeatColor` 与色阶 API | 热力图背景色色阶（token 定义在 `heat-color.css`） |
| `components/stat-group` | `StatGroup` | 展示一组标签和值 |

组件 CSS 另有 `styles/heatmap.css`、`styles/heat-color.css` 和 `styles/stat-group.css` 入口。完整清单以本包 `package.json#exports` 为准；包根不提供 `.` 导出。

## Workspace 使用

```tsx
import { Heatmap } from 'weimo-ui-stats/components/heatmap'
import { StatGroup } from 'weimo-ui-stats/components/stat-group'
```

组件直接导入自身样式，并以 TypeScript、TSX 与 CSS 源码交付。

## 依赖边界

- 只依赖 `weimo-ui-core`。
- `Heatmap` 拥有日期、列和月份标签模型；色阶展示由本包的 `HeatColor` 拥有，热力图背景色 token（`--color-heat-0..4`）随 `heat-color.css` 交付。
- `weimo-ui-stats/components/heatmap` 不再转发 `HeatColor`。需要色阶组件时直接使用 `weimo-ui-stats/components/heat-color`，根包调用者使用 `weimo-ui/components/heat-color`。
- Heatmap 和 StatGroup 互不依赖。

## 源码结构

```text
src/components/
├── heatmap/     # 热力图、日期模型、热力图色阶与组件聚合入口
└── stat-group/  # 统计指标组与样式
```

## 验证

```bash
pnpm --filter weimo-ui-stats test:typecheck
pnpm test:contracts
pnpm test:runtime
```

整体边界见[组件架构与设计规范](../../docs/architecture/component-architecture.md)。
