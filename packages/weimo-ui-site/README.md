# weimo-ui-site

`weimo-ui-site` 是 Weimo UI 的文档站点 workspace 子项目。它负责站点路由、文档目录、组件预览和站点专用 UI，并通过 workspace 依赖消费组件包：

- `weimo-ui-core`
- `weimo-ui-card`
- `weimo-ui-image`
- `weimo-ui-markdown`
- `weimo-ui-stats`
- `weimo-ui-tagtree`

在仓库根目录运行 `pnpm dev` 或 `pnpm build` 会转发到此站点项目。
