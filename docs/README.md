# 维护文档

这里收录面向 `weimo-ui` 维护者的架构约束、技术决策和问题排查记录。组件使用者应先阅读仓库根目录的 [README](../README.md) 和[在线组件文档](https://jiaowenjun.github.io/weimo-ui/)；各 workspace 子项目的职责与入口记录在各自的 README 中。

## 文档导航

### 架构

- [组件架构与设计规范](architecture/component-architecture.md)：包边界、依赖方向、源码组织、材质与 API 设计原则。

### 技术决策

- [shadcn Registry 的定位](decisions/shadcn-registry.md)：为什么保留 Registry 分发能力，以及哪些组件适合进入 Weimo UI。

### 故障排查

- [Card 编辑态过渡](troubleshooting/card-edit-transition.md)：卡片编辑切换中的测量、FLIP 和异步编辑器初始化问题。
- [阴影裁切排查与预览窗放行规范](troubleshooting/shadow-clipping.md)：tone 投影时代的裁切三层模型、`:has` 放行白名单维护规则与裁切诊断方法。

## 子项目文档

| 子项目 | 职责 | 文档 |
| --- | --- | --- |
| `weimo-ui-core` | Token、材质、基础控件、布局和通用行为 | [README](../packages/weimo-ui-core/README.md) |
| `weimo-ui-tagtree` | 标签树、标签面包屑和独立标签页 | [README](../packages/weimo-ui-tagtree/README.md) |
| `weimo-ui-markdown` | Markdown 渲染、编辑和视图切换 | [README](../packages/weimo-ui-markdown/README.md) |
| `weimo-ui-image` | 图片选择、展示和透明化处理 | [README](../packages/weimo-ui-image/README.md) |
| `weimo-ui-stats` | 热力图和统计指标 | [README](../packages/weimo-ui-stats/README.md) |
| `weimo-ui-card` | 内容卡片、标签编辑和 OCR 工作流 | [README](../packages/weimo-ui-card/README.md) |
| `weimo-ui-site` | 组件目录、预览和文档站 | [README](../packages/weimo-ui-site/README.md) |

## 文档边界

- 根 `README.md` 面向组件调用者，优先说明安装、选型、公开行为和可复制示例。
- 子项目 `README.md` 面向 workspace 维护者，记录包职责、公开入口、依赖边界和源码结构。
- `docs/architecture/` 记录当前必须遵守的整体约束。
- `docs/decisions/` 记录仍然生效的技术取舍，不承担组件 API 参考手册的职责。
- `docs/troubleshooting/` 记录可复用的问题模型和排查方法，不复制实现源码。

## 更新约定

公开组件或目录发生变化时，至少同步检查：

1. 根包和所属子包的 `package.json#exports`。
2. 文档站对应包的 `src/docs/catalog/packages/*/manifest.ts`。
3. Registry 源文件与生成的 `registry.json`。
4. 根 README、所属子包 README 和相关维护文档。
5. 契约测试、类型检查与 `pnpm catalog:check`。

`package.json#exports` 是可导入路径的最终事实来源；文档不得依赖未导出的源码路径，也不得为旧文档恢复转发文件或兼容入口。
