# Weimo UI

`weimo-ui` 是独立 Git 仓库，也是面向 Weimo 产品的 React 组件库与文档站。

站点参考 `https://coss.com/ui` 搭建，提供精简文档壳、命令式搜索、明暗主题切换、组件预览、安装片段和参数表。初始组件来自 `examples/demo/src/components`。

## 安装与消费

`weimo-ui` 不依赖 Weimo 应用仓库：源码零跨仓库导入，依赖全部来自 npm，并拥有自己的 pnpm workspace 和 lockfile。

```bash
git clone https://github.com/jiaowenjun/weimo-ui.git
cd weimo-ui
pnpm install
```

即可独立安装、测试和构建。Weimo 应用通过锁定的 Git commit 消费本包，避免跟随 `main` 漂移：

```json
{
  "dependencies": {
    "weimo-ui": "github:jiaowenjun/weimo-ui#<full-commit-sha>"
  }
}
```

更新依赖时先在本仓库完成测试并 push commit，再更新 Weimo 的 package manifests 与 lockfile，并验证所有真实消费者。导入符保持为 `weimo-ui/...`。

分发形态为源码导出：`exports` 直接指向 `src` 下的 `.ts/.tsx/.css`，要求消费方使用支持 TypeScript、TSX 和 CSS 的打包器。`react` 与 `react-dom` 声明为 peer dependencies，其余运行时依赖为普通 dependencies。`private: true` 仅禁止误发到 npm，不影响通过 Git commit 安装。

## 职责定位

`weimo-ui` 不是用于复刻 `coss ui`、`shadcn/ui`、`base ui` 等组件库中已经存在的通用组件。

它专门用于沉淀在 `examples/demo` 和 `weimo-biji/frontend/web` 中使用的特殊组件：这些组件应当是在 `coss ui`、`shadcn/ui`、`base ui` 等现有组件库里没有合适替代方案的 Weimo 专属组件。

后续向 `weimo-ui` 添加组件时，应优先确认是否已有合适的通用组件库替代；只有确实没有合适替代、并且该组件服务于 `examples/demo` 或 `weimo-biji/frontend/web` 的特殊场景时，才应纳入本组件库。

`src/lib` 可以承载被多个当前应用消费、且不读取产品 store、query 或业务实体的 headless 交互 hook。此类模块通过 package export 和行为测试发布，不属于视觉组件目录，也不进入详情页、manifest 或 registry。

## Token / 样式 详情页规范

Token / 样式 分组下的组件详情页只用于展示底层 token 值。

真实使用场景可以出现在预览区，包括可交互的真实使用场景，但只能作为 token 值的可视化载体。页面主轴必须是 token 名称、亮/暗值、utility/helper 映射和最小必要说明。

可交互场景必须明确绑定正在展示的 token，并且只展示真实 CSS 中存在的 hover、active、highlighted 等状态。

不要把 Token / 样式 详情页写成组件 API、业务用法或 selector 行为文档。若需要讲解真实组件交互或业务用法，应放到对应组件详情页或其他非 Token / 样式 分组。

## 脚本

`src/docs/components-manifest.ts` 是公共组件目录。新增或调整公共组件时，编辑 manifest、详情页 definition、package export 和对应的独立 `registry/*.json`，然后生成并检查派生产物：

```bash
pnpm catalog:sync
pnpm catalog:check
```

`src/docs/component-definitions/index.ts` 与根 `registry.json` 是生成文件，不直接编辑。

```bash
pnpm dev
pnpm build
pnpm lint
pnpm preview
```

Vite 的 base 路径为 `/weimo-ui/`，本地开发访问 `http://localhost:5176/weimo-ui/`。

## 部署

推送到 `main` 后，GitHub Actions 自动构建并发布到 GitHub Pages：`https://jiaowenjun.github.io/weimo-ui/`（workflow 见 `.github/workflows/deploy-pages.yml`）。

构建产物为纯静态 SPA。GitHub Pages 没有 SPA fallback，workflow 在构建后把 `index.html` 复制为 `404.html`，配合应用内 `path="*"` 兜底路由，使 `/components/:id` 等深链接可直接访问。
