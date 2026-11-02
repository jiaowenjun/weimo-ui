# weimo-ui-stats

> 你的坚持,看得见 —— 为笔记与打卡而生。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![在线演示](https://img.shields.io/badge/%E5%9C%A8%E7%BA%BF%E6%BC%94%E7%A4%BA-GitHub%20Pages-2ea44f.svg)](https://jiaowenjun.github.io/weimo-ui/stats/)

**[🚀 打开在线演示,亲手点点看 →](https://jiaowenjun.github.io/weimo-ui/stats/)**

如果你在做笔记应用、写作工具、习惯打卡,需要一块像 GitHub 贡献图那样「一眼看出最近写了多少」的概览区,`weimo-ui-stats` 就是为你准备的:

- **`Heatmap` 日期热力图** —— 把「日期 → 条数」渲染成按周排列的 13 周活动方格,带月份标签、今日环、选中态与悬浮提示;
- **`HeatColor` 热力色阶** —— 热力图的 5 级背景色阶,既是展示用的色卡组件,也是 `--color-heat-0..4` token 的归属地;
- **`StatGroup` 统计组** —— 把「128 篇笔记 / 1.2 万字 / 36 天」这样的指标横排成一组大数字小标签。

组件基于 React 19 构建,视觉语言(主题 token、悬浮提示)来自 [weimo-ui-core](https://github.com/jiaowenjun/weimo-ui-core) 设计系统,深浅色主题自动适配。

## ✨ 特性

- **固定视窗,稳定布局** —— 热力图始终展示截至本周的 13 个 ISO 周(周一起始),不随数据多少抖动
- **自动分级** —— 按条数映射 0–4 级热力:无记录 / 1 条 / 2–3 条 / 4–5 条 / 6 条及以上
- **今日与选中双态** —— 今日单元格带内描边环,`activeDate` 对应的单元格带外描边,两者可叠加
- **悬浮提示 + 键盘可达** —— 每个单元格是原生按钮,附带 `aria-label` 与 Tooltip,聚焦态有清晰 outline
- **headless 模型可单独使用** —— 单元格、列、月份标签的构建函数全部导出,可脱离组件自行渲染
- **按需引入** —— 显式子路径导出、tree-shaking 友好,组件结构样式随导入自动加载,只需在应用入口引入一次主题 token

## 📦 安装

```bash
pnpm add weimo-ui-stats weimo-ui-core @base-ui/react react react-dom
```

- `weimo-ui-stats@0.1.x` 搭配 `weimo-ui-core@0.2.x` 使用;`Heatmap` 的悬浮提示来自 core 的 Tooltip,因此需要 core 的对等依赖 `@base-ui/react`。
- 包根不提供 `.` 导出,所有组件通过显式子路径引入。

样式零配置:引入任意组件子路径,组件 JS 会一并加载自身结构样式、热力色 token 与
`weimo-ui-core/styles/tokens.css` 主题 token(含 `.dark` 暗色覆盖),无需在应用入口
手动引入任何 CSS。显式引入 core tokens.css 仍然无害,定义幂等;定制主题在自有 CSS
中覆盖对应变量即可。

## 🚀 快速上手

### 渲染日期热力图

```tsx
import { useState } from 'react'
import { Heatmap, type HeatmapDailyCount } from 'weimo-ui-stats/components/heatmap'

const dailyCounts: HeatmapDailyCount[] = [
  { date: '2026-10-20', count: 2 },
  { date: '2026-10-22', count: 6 },
  { date: '2026-10-24', count: 1 },
]

export function ActivityOverview() {
  const [activeDate, setActiveDate] = useState('2026-10-22')

  return (
    <Heatmap
      activeDate={activeDate}
      dailyCounts={dailyCounts}
      onDateSelect={(date) => setActiveDate(date)}
    />
  )
}
```

### 渲染统计组

```tsx
import { StatGroup } from 'weimo-ui-stats/components/stat-group'

<StatGroup
  aria-label="笔记统计"
  items={[
    { key: 'notes', value: '128', label: '笔记' },
    { key: 'words', value: '1.2', label: '万字' },
    { key: 'days', value: '36', label: '天' },
  ]}
/>
```

### 展示热力色阶

```tsx
import { HeatColor } from 'weimo-ui-stats/components/heat-color'

// 默认展示 0–4 全部 5 级;也可以只传需要的级别
<HeatColor levels={[1, 2, 3, 4]} />
```

## 📖 组件 API

### `<Heatmap />`

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `dailyCounts` | `HeatmapDailyCount[]` | `[]` | 日期活动数据,`{ date: 'YYYY-MM-DD', count }`;负数按 0 处理 |
| `activeDate` | `string` | `''` | 当前选中的日期键,对应单元格带外描边 |
| `onDateSelect` | `(date: string, cell: HeatmapCell) => void` | — | 点击单元格时回调 |
| `ariaLabel` | `string` | `'日期热力图'` | 容器的无障碍名称(替代原生 `aria-label`) |

其余原生 `div` 属性(`className`、`role` 等)均可透传;`role` 缺省为 `group`。今日日期由组件内部按本地时间计算,不接受外部传入。

`components/heatmap` 入口同时导出 headless 模型:

| 导出 | 说明 |
| --- | --- |
| `formatHeatmapDateKey(date)` | 把 `Date` 格式化为 `YYYY-MM-DD` 本地日期键 |
| `getHeatmapLevel(count)` | 条数 → `0 \| 1 \| 2 \| 3 \| 4` 热力级别 |
| `buildHeatmapCells(dailyCounts, today?, activeDate?)` | 生成 91 个按日排序的 `HeatmapCell` |
| `buildHeatmapColumns(cells)` | 按 7 天一列切分为 13 个 `HeatmapColumn` |
| `buildHeatmapMonthLabels(cells)` | 找出每月 1 日所在列,生成 `HeatmapMonthLabel` |
| `HeatmapCell` / `HeatmapColumn` / `HeatmapDailyCount` / `HeatmapLevel` / `HeatmapMonthLabel` | 对应类型 |

### `<HeatColor />`

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `levels` | `HeatColorLevel[]` | `[0, 1, 2, 3, 4]` | 要展示的色阶级别 |
| `getLevelLabel` | `(level) => string` | 内置中文文案 | 每个色块的无障碍名称 |
| `ariaLabel` | `string` | `'热力图颜色色阶'` | 容器的无障碍名称(替代原生 `aria-label`) |

`components/heat-color` 入口同时导出色阶元数据:

| 导出 | 说明 |
| --- | --- |
| `heatColorMap` | 每级的 `label`、`token`、亮/暗 `value`、`className`、`description` |
| `heatColorLevels` | `[0, 1, 2, 3, 4]` |
| `getHeatColorClassName(level)` | 取对应的 `heat-color--N` 工具类名 |
| `getHeatColorToken(level)` | 取对应的 `--color-heat-N` token 名 |

### `<StatGroup />`

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `StatGroupItem[]` | `[]` | 指标列表,`{ key?, value, label }`,`value` 与 `label` 均可为任意 `ReactNode` |
| `children` | `ReactNode` | — | 追加在指标之后的自定义内容 |

其余原生 `div` 属性均可透传;`role` 缺省为 `group`。

### 样式入口

组件会随导入自动加载各自的样式;若需单独引入(例如在非 React 场景复用 token),可使用:

| 入口 | 内容 |
| --- | --- |
| `styles/heat-color.css` | `--color-heat-0..4` token 与 `.heat-color` 色阶样式 |
| `styles/heatmap.css` | `--color-heatmap-today-ring` token 与 `.heatmap` 网格样式 |
| `styles/stat-group.css` | `.stat-group` 布局样式 |

## 🧩 生态

`weimo-ui-stats` 是 weimo-ui 组件家族的一员,唯一的 UI 依赖是 [weimo-ui-core](https://github.com/jiaowenjun/weimo-ui-core) —— 它提供主题 token、悬浮提示与 `cn` 工具。`Heatmap` 与 `StatGroup` 互不依赖,可单独引入。

## 🛠️ 本地开发

<details>
<summary>展开查看仓库脚本</summary>

```bash
pnpm install
pnpm verify    # 类型检查 + 测试 + 打包校验 + 文档站构建
pnpm site:dev  # 本地启动文档站
```

文档站位于 `site/`,推送 `main` 后由 GitHub Actions 自动构建部署到 GitHub Pages。

</details>

## 许可证

[MIT](./LICENSE)
