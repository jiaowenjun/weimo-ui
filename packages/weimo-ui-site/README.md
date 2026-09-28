# weimo-ui-site

`weimo-ui-site` 是 Weimo UI 的文档与组件预览应用。它负责路由、组件目录、搜索、预览和站点壳层，不拥有对外复用组件，也不提供 package exports。

## 依赖边界

站点作为最上层消费者依赖全部组件包：

- `weimo-ui-core`
- `weimo-ui-card`
- `weimo-ui-image`
- `weimo-ui-markdown`
- `weimo-ui-stats`
- `weimo-ui-tagtree`

可复用组件必须放回所属组件包。只服务站点的页面壳、搜索和预览辅助组件留在本包，不进入根包 exports 或 Registry。

## 组件目录

组件目录按包维护：

```text
src/docs/catalog/
├── packages/
│   ├── weimo-ui-core/
│   ├── weimo-ui-tagtree/
│   ├── weimo-ui-markdown/
│   ├── weimo-ui-image/
│   ├── weimo-ui-stats/
│   └── weimo-ui-card/
├── manifest.ts
├── component-docs.tsx
├── definitions.ts
└── types.ts
```

每个 `packages/<package>/manifest.ts` 声明该包的文档页、公开入口和 Registry 名称；同目录的页面文件拥有预览定义。顶层 `manifest.ts` 汇总各包目录，`definitions.ts` 由 `pnpm catalog:sync` 生成，不应手动编辑。

新增或调整公开组件时，应先修改所属组件包源码和 exports，再同步对应包的 manifest 与预览定义，最后生成并校验组件目录。

## 源码结构

```text
src/
├── app/                    # 路由装配与站点级样式
├── components/primitives/ # 仅供站点使用的基础 UI
├── docs/
│   ├── catalog/           # 按组件包组织的目录与预览定义
│   ├── pages/             # 文档路由页面
│   ├── previews/          # 跨页面复用的预览辅助组件
│   └── shell/             # 顶栏、侧栏、搜索和 Outlet context
├── styles/                # 全局基础样式
└── main.tsx               # Vite 入口
```

## 开发

从仓库根目录运行：

```bash
pnpm dev
pnpm build
```

也可以只调用站点包：

```bash
pnpm --filter weimo-ui-site dev
pnpm --filter weimo-ui-site build
```

本地开发地址为 `http://localhost:5176/weimo-ui/`。

## 验证

```bash
pnpm catalog:sync
pnpm catalog:check
pnpm --filter weimo-ui-site test:typecheck
pnpm test:contracts
pnpm build
```

仓库维护文档见 [docs/README.md](../../docs/README.md)。
