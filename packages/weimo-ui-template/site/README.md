# weimo-ui-template site

`site` 是 `weimo-ui-template` 的自举式文档与布局预览应用。站点外壳通过包的公开入口复用 `SiteTemplate`；模板布局演示使用 `weimo-ui-core` 的标准 `ComponentPreviewCard` 展示，不会嵌套第二个全视口站点壳层。

## 开发

从仓库根目录运行：

```bash
pnpm site:dev
pnpm site:build
pnpm site:preview
```

本地开发地址为 `http://localhost:4179/weimo-ui-template/`。
