# weimo-ui

weimo-ui 组件家族 monorepo:八个独立 npm 包,共享一个文档站。

| 包 | 说明 | 文档 |
| --- | --- | --- |
| [weimo-ui-core](./packages/weimo-ui-core) | 基础组件与设计 token | [/weimo-ui/core](https://jiaowenjun.github.io/weimo-ui/core/) |
| [weimo-ui-template](./packages/weimo-ui-template) | 站点模板 SiteTemplate / MiniSiteTemplate | [/weimo-ui/template](https://jiaowenjun.github.io/weimo-ui/template/) |
| [weimo-ui-editor](./packages/weimo-ui-editor) | WdfCard 富文本卡片与编辑器 | [/weimo-ui/editor](https://jiaowenjun.github.io/weimo-ui/editor/) |
| [weimo-ui-stats](./packages/weimo-ui-stats) | 热力图与统计大数字 | [/weimo-ui/stats](https://jiaowenjun.github.io/weimo-ui/stats/) |
| [weimo-ui-tagtree](./packages/weimo-ui-tagtree) | 标签树与面包屑 | [/weimo-ui/tagtree](https://jiaowenjun.github.io/weimo-ui/tagtree/) |
| [weimo-ui-image](./packages/weimo-ui-image) | 图片视图与上传 | [/weimo-ui/image](https://jiaowenjun.github.io/weimo-ui/image/) |
| [weimo-ui-ocr](./packages/weimo-ui-ocr) | OCR 卡片/上传/校对 | [/weimo-ui/ocr](https://jiaowenjun.github.io/weimo-ui/ocr/) |
| [weimo-ui-agent](./packages/weimo-ui-agent) | Agent 会话输入框 | [/weimo-ui/agent](https://jiaowenjun.github.io/weimo-ui/agent/) |

## 结构

- `packages/<name>/` — 各包源码(独立构建、独立 tsconfig、各自 verify 链与契约测试)
- `packages/<name>/site/` — 各包文档站(workspace 包,`workspace:*` 链接本地源码)
- 包间依赖 = peerDependencies(语义带,面向 npm 消费方) + devDependencies(`workspace:*`,本地联测)
- 单 GitHub Pages:八站经 vite `base: /weimo-ui/<短名>/` 按路径收纳,根目录落地页导航

## 本地开发

```bash
pnpm install
pnpm build              # 全部包 + 站点(拓扑序)
pnpm verify             # build 后逐包跑完整 verify 链
pnpm site:build         # build + 聚合 pages-dist/(含落地页,本地预览产物)
pnpm dev:ocr            # 任选一包起站点(4176-4184 固定端口)
```

## 发布

各包独立版本独立发布(版本号见各包 package.json):

```bash
pnpm --filter weimo-ui-<name> build
pnpm --dir packages/weimo-ui-<name> publish   # pnpm 自动把 workspace:* 替换为实际版本
```

历史:2026-10 由旧 monorepo 拆为七仓独立演进,2026-11 合并回 monorepo(peer 带已全量对齐 core ~0.4.0)。原七仓作为独立仓库保留。

## 许可证

[MIT](./LICENSE)
