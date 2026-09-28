# weimo-ui-site

`weimo-ui-site` 是 Weimo UI 的文档站点 workspace 子项目。它负责站点路由、文档目录、组件预览和站点专用 UI，并通过 workspace 依赖消费组件包：

- `weimo-ui-core`
- `weimo-ui-card`
- `weimo-ui-image`
- `weimo-ui-markdown`
- `weimo-ui-stats`
- `weimo-ui-tagtree`

在仓库根目录运行 `pnpm dev` 或 `pnpm build` 会转发到此站点项目。

## 源码结构

```text
src/
├── app/                    # 路由装配与站点级样式
├── components/primitives/ # 仅供站点使用的基础 UI 适配层
├── docs/
│   ├── catalog/           # 按 workspace 包组织的文档清单与页面定义
│   ├── pages/             # 路由页面
│   ├── previews/          # 多个文档页共享的预览工具
│   └── shell/             # 顶栏、侧栏、搜索与 Outlet context
├── styles/                # 全局基础样式
└── main.tsx               # Vite 入口
```

`docs/catalog/manifest.ts` 从各包目录的 `manifest.ts` 汇总组件目录；
`docs/catalog/definitions.ts` 由 `pnpm catalog:sync` 生成。组件文档实现应修改
`docs/catalog/packages/` 下对应包的清单和页面定义。
