# shadcn Registry 的定位

- 状态：已采纳
- 最后更新：2026-09-28

## 决策

`weimo-ui` 保留 shadcn Registry 作为源码分发和安装工具，但不以复刻 shadcn/ui、coss ui 或 Base UI 的通用组件为目标。

项目优先沉淀 Weimo 产品中具有明确内容结构、视觉语言或交互规则的 React 组件。Button、Input、Dialog、Select、Table 等通用能力应优先直接使用成熟原语或组件库；只有 Weimo 语义无法通过组合、token 或局部封装表达时，才新增公开组件。

## 背景

shadcn/ui 的核心价值是让调用方获得并拥有组件源码，而不是某一种固定视觉风格。它提供了几项适合本项目的工程能力：

- 按组件安装源码和依赖。
- 用 Registry 描述组件文件、npm 依赖和组件间依赖。
- 以 CSS variables 和语义 token 共享视觉规则。
- 在文档中同时展示预览、导入路径和安装信息。

这些能力适合作为 Weimo 组件的分发底座，但不构成扩大通用组件覆盖面的理由。

## 当前分发模型

项目同时维护两种消费方式：

1. 根包 `weimo-ui` 通过显式 `exports` 子路径提供 Git 依赖消费方式。
2. `registry/*.json` 和生成的 `registry.json` 提供 shadcn CLI 源码安装方式。

两种方式必须指向同一套真实组件源码。Registry 可以包含安装所需的依赖文件，但仓库中不再为包导入保留扁平转发文件或包根 barrel。

组件目录与公开 API 的事实来源分别是：

- 所属子包的 `package.json#exports`：子包可导入入口。
- 根 `package.json#exports`：`weimo-ui/*` 对外入口。
- `packages/weimo-ui-site/src/docs/catalog/packages/*/manifest.ts`：文档目录与 Registry 元数据。
- `registry/*.json`：单组件安装载荷。
- `registry.json`：由目录同步脚本生成的聚合载荷。

## 组件准入规则

新增公开组件前依次确认：

1. Base UI、shadcn/ui、coss ui 或其他成熟方案是否已经提供合适的原语或组合方式。
2. 组件是否承载 Weimo 特有的信息结构、视觉规则、交互节奏或产品语义。
3. 是否存在真实调用场景，而不是只为了扩充组件数量。
4. 能否稳定归属到一个子项目，且不会引入叶子包之间的循环依赖。
5. 是否能够同步提供明确导出、组件文档、Registry item 和契约测试。

仅服务文档站的页面壳、搜索或预览辅助组件应留在 `weimo-ui-site`，不进入根包导出和 Registry。

## 依赖和目录约束

- Registry item 的组件文件保持与源码中的组件目录一致。
- 同一组件族的实现、模型、hook 和 CSS 一起分发。
- 跨包依赖使用拥有者的公开子路径，不能引用其他包的 `src`。
- 根包只映射真实实现，不维护第二套包装 API。
- 移除公开入口时同步迁移所有调用方，不新增永久兼容层。

## 新增或修改公开组件

变更至少需要同步以下位置：

1. 组件源码与所属子包 `package.json#exports`。
2. 根 `package.json#exports`。
3. 对应包的文档目录 manifest 和预览定义。
4. 单组件 Registry 文件以及生成的 `registry.json`。
5. 公开 API、依赖方向和安装 smoke test 等契约。
6. 根 README 或所属子包 README 中受影响的说明。

推荐验证顺序：

```bash
pnpm catalog:sync
pnpm catalog:check
pnpm test:contracts
pnpm test:typecheck
pnpm test:registry
git diff --check
```

涉及交互或站点装配时，再运行 `pnpm test:runtime` 和 `pnpm build`。

## 结果

这项决策带来三个边界：

- Registry 是分发机制，不是组件职责的来源。
- 通用原语可以作为内部依赖或明确公开的适配层存在，但不以数量作为项目成熟度指标。
- Weimo UI 的健康度由真实复用、清晰所有权、稳定公开路径和可验证安装决定。

## 参考

- [shadcn/ui 文档](https://ui.shadcn.com/docs)
- [Registry 介绍](https://ui.shadcn.com/docs/registry)
- [components.json](https://ui.shadcn.com/docs/components-json)
- [Base UI](https://base-ui.com)
- [coss ui](https://coss.com/ui)
