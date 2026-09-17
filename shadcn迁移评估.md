# shadcn/ui 风格分析与 weimo/ui 迁移评估

更新时间：2026-06-16

## 一、shadcn/ui 的核心风格

shadcn/ui 的关键不在于某一种视觉风格，而在于它是一套 **源码分发与设计系统构建方法**。它强调组件以源码进入使用方项目，由使用方拥有、组合、修改和维护。

它和 Ant Design、MUI、Element Plus 这类传统组件库的差异如下：

| 维度 | 传统组件库 | shadcn/ui 风格 |
|------|------------|----------------|
| 安装方式 | `npm install` 一个黑盒包 | CLI 将组件源码复制到项目 |
| 代码归属 | 组件实现留在 `node_modules` | 组件源码进入业务仓库，由使用方拥有 |
| 定制方式 | props、theme、样式覆盖 | 直接编辑本地源码、tokens、variants |
| 升级方式 | 跟随 npm 包版本升级 | 按需手动 merge，使用方决定升级时机 |
| 样式模型 | 库内主题系统为主 | Tailwind CSS + CSS variables + 语义 token |
| 组件模型 | 大组件、强封装 | 原语组合、源码可读、按需复制 |

shadcn/ui 风格组件库通常具备这些特征：

1. **Open Code**：组件以源码形式分发，安装后不依赖远端包的内部实现。
2. **Composition**：用 `DialogTrigger`、`DialogContent`、`CardHeader`、`CardContent` 这类子组件组合能力，而不是只提供大而全的组件。
3. **Headless Primitives**：交互组件优先基于 Radix UI、Base UI、Ark UI 等无头原语，获得键盘导航、焦点管理、ARIA 等基础能力。
4. **Tailwind + CSS Variables**：使用 `--background`、`--foreground`、`--primary`、`--muted` 等语义 token；Tailwind v4 项目通过 `@theme inline` 暴露 token。
5. **CVA Variants**：用 `class-variance-authority` 声明 `variant`、`size`、`state` 等变体，而不是把变体散落在调用处。
6. **`cn()` 工具**：标准模式是 `clsx` + `tailwind-merge`，用于条件类名与冲突类名合并。
7. **Registry 分发**：通过 `components.json`、`registry.json`、`registry-item.json` 和 shadcn CLI 分发组件、hooks、themes、blocks、pages 等代码资产。
8. **文档即使用入口**：每个公开组件应有安装命令、导入方式、示例、API/props 表和可交互预览。

## 二、coss ui 对 `weimo-ui` 的参考价值

[coss ui](https://coss.com/ui) 是一个典型的 shadcn/ui 风格案例。它没有简单复制 shadcn 官方实现，而是保留 shadcn 的源码分发模型，并把底层原语换成 Base UI。

它对 `weimo-ui` 的参考价值主要是 **分发方式和文档方式**：

- 基于 Base UI 这类无头原语，而不是自己手写复杂交互行为。
- 使用 Tailwind CSS v4 和 CSS variables。
- 组件通过 shadcn CLI 安装，例如 `npx shadcn@latest add @coss/button`。
- 文档同时提供 CLI 安装和手动复制源码两种路径。
- 组件安装后由项目方拥有源码，符合 copy/paste/own 模型。
- 文档覆盖组件预览、代码示例、API Reference、Props 表等使用信息。

但 coss ui 不应成为 `weimo-ui` 的组件覆盖目标。coss 提供 Button、Dialog、Select、Form、Table、Sidebar 等通用组件，这些正是 `weimo-ui` 后续应优先避免重复建设的部分。

## 三、`weimo-ui` 的最新职责定位

最新代码和 `README.md` 已经把 `weimo-ui` 的职责收窄为：

```text
weimo-ui 不是用于复刻 coss ui、shadcn/ui、base ui 等组件库中已经存在的通用组件。

它专门用于沉淀在 examples/demo 和 weimo-biji/frontend/web 中使用的特殊组件：
这些组件应当是在 coss ui、shadcn/ui、base ui 等现有组件库里没有合适替代方案的 Weimo 专属组件。

后续向 weimo-ui 添加组件时，应优先确认是否已有合适的通用组件库替代；
只有确实没有合适替代、并且该组件服务于 examples/demo 或 weimo-biji/frontend/web 的特殊场景时，才应纳入本组件库。
```

因此，`weimo-ui` 现在更准确的定位是：

```text
Weimo 专属 React 组件沉淀库
+ shadcn registry 分发能力
+ Weimo token/style item
+ demo/biji 特殊场景组件
+ 文档站与 smoke test
- 不追求复刻通用 primitives
- 不追求覆盖完整通用组件库版图
```

这个定位会改变迁移评估的核心判断：shadcn registry 能力已经是工具链，不再是“继续补齐 Button/Input/Dialog/Select/Form/Table 等基础组件”的理由。

## 四、当前公开资产盘点

### 对外 package exports

`weimo-ui/package.json` 目前只导出下面这些 Weimo 组件和样式入口：

| Export | 对应源码 | 定位 |
|--------|----------|------|
| `ui/components/card` | `src/components/card.tsx` | Weimo 笔记内容卡片 |
| `ui/components/floating-top-bar` | `src/components/floating-top-bar.tsx` | Weimo 顶部悬浮工具栏 |
| `ui/components/icon-button` | `src/components/icon-button.tsx` | Weimo 玻璃态圆形图标按钮 |
| `ui/components/sidebar` | `src/components/sidebar/index.tsx` | Weimo 响应式侧栏壳 |
| `ui/components/tag-chip` | `src/components/tag-chip.tsx` | Weimo 标签 chip |
| `ui/styles/tokens.css` | `src/styles/tokens.css` | Weimo token 兼容样式 |

这个公开面和新职责基本一致：没有导出 Button、Input、Dialog、Select、Table、Tabs 这类通用 primitives。

### Registry items

`weimo-ui/registry.json` 和 `weimo-ui/registry/*.json` 当前包含：

| Registry item | 类型 | 定位 |
|---------------|------|------|
| `@weimo/utils` | `registry:lib` | `cn()` 工具，支撑 Weimo registry 组件 |
| `@weimo/style` | `registry:style` | Weimo token、字体、半径、玻璃态变量 |
| `@weimo/tag-chip` | `registry:ui` | Weimo 标签展示 |
| `@weimo/icon-button` | `registry:ui` | Weimo 玻璃态图标动作 |
| `@weimo/card` | `registry:ui` | Weimo 笔记内容卡片 |
| `@weimo/floating-top-bar` | `registry:ui` | Weimo 顶部工具栏 |
| `@weimo/sidebar` | `registry:ui` | Weimo 侧栏壳 |

这些 item 仍然沿用 shadcn registry 方式分发，但 registry 的作用是 **让 Weimo 专属组件可被复制消费**，不是扩展成通用组件市场。

### 文档站内部 coss primitives

`src/components/coss/` 下有 `button`、`card`、`command`、`table`、`tabs` 等 coss-compatible docs primitives。它们目前用于文档站自举，例如页面框架、props 表、搜索命令和 tabs。

这些文件不在 `package.json` exports 中，也不在 `registry.json` 中注册为 `@weimo/*` 组件，因此应视为 **文档站内部实现细节**，不是 `weimo-ui` 公共组件库的一部分。后续如果项目能直接消费 coss/shadcn/base 的通用组件，应优先替换或继续保持 docs-local，而不是把这些 primitives 包装成 `@weimo/button`、`@weimo/table` 等公开组件。

## 五、现有组件是否符合新职责

| 组件 | 当前代码特征 | 新职责判断 |
|------|--------------|------------|
| `Card` | 面向笔记内容，支持 `createdAtText`、双换行段落拆分、tags、`CardHeader/CardContent/CardFooter` 组合 | 符合。它不是通用 Card，而是 Weimo 记忆/笔记卡片 |
| `TagChip` | 小型 `#` 标签展示，服务 Card 和 Weimo 内容语境 | 基本符合。应继续保持语义窄口，避免扩展成通用 Badge |
| `IconButton` | 玻璃态圆形图标按钮，被 Card header action 和 FloatingTopBar 复用 | 有条件符合。通用 IconButton 可由 shadcn/coss Button 组合替代；当前保留理由应是 Weimo 特定玻璃态与尺寸节奏 |
| `FloatingTopBar` | 固定顶部工具栏，包含侧栏 spacer、菜单动作、搜索默认 action、预览态 | 符合。它是 Weimo demo/docs 壳层专属结构 |
| `SideBar` / `SideBarShell` | 桌面固定面板 + 移动端 Base UI Drawer；当前是空白玻璃面板，内容由调用方传入 | 符合。它不是通用导航组件，而是 Weimo 布局壳 |

需要特别注意：`IconButton` 和 `TagChip` 最容易滑向通用组件。后续只能在它们确实承载 Weimo 视觉语言或 Weimo 内容语义时继续扩展；如果只是普通按钮或普通 badge，应直接使用 coss/shadcn/base 的通用组件。

## 六、对 `examples/demo` 和 `weimo-biji/frontend/web` 消费关系的评估

### `examples/demo`

最新代码中，`examples/demo` 通过本地 facade 消费 `ui/components/*`：

- `examples/demo/src/components/card.tsx` 重新导出 `ui/components/card`
- `examples/demo/src/components/floating-top-bar.tsx` 重新导出 `ui/components/floating-top-bar`
- `examples/demo/src/components/icon-button.tsx` 重新导出 `ui/components/icon-button`
- `examples/demo/src/components/tag-chip.tsx` 重新导出 `ui/components/tag-chip`
- `examples/demo/src/components/sidebar.tsx` 使用 `ui/components/sidebar` 并补充 demo 自己的关闭动作

这种调用方式符合当前职责：demo 作为 Weimo 场景消费者，复用 `weimo-ui` 的专属组件，同时仍把页面内容、导航内容和业务适配留在 demo 自己的代码里。

尤其是最新 `SideBar` 的方向是健康的：`weimo-ui` 提供响应式玻璃侧栏壳和 Drawer 行为，不再内置导航分组；调用方可以传入自己的 children 或只使用空白面板。

### `weimo-biji/frontend/web`

按当前检索结果，`weimo-biji/frontend/web` 中没有直接从 `ui/components/*` 或 `@weimo/*` 引入组件。它仍可作为 `weimo-ui` 的目标服务场景，但只有当某个 React/Web 组件确实服务于 `weimo-biji/frontend/web`，并且没有合适通用库替代时，才应进入 `weimo-ui`。

`weimo-biji/frontend/skyline` 是微信小程序原生技术栈，不要为了“统一组件库”把小程序专用视图强行抽象进 `weimo-ui`。`weimo-ui` 当前是 React + shadcn registry 语境，应只收纳能在该语境下真实消费的专属组件。

## 七、shadcn 迁移状态评估

### 已经完成且仍有价值的部分

| 维度 | 当前状态 | 新职责下的意义 |
|------|----------|----------------|
| `components.json` | aliases 指向 `src/components`、`src/lib` 等目录 | 支撑 registry 构建和本地 shadcn tooling |
| `registry.json` | root payload 包含完整 item，组件依赖 `@weimo/style` / `@weimo/utils` | 让专属组件可按 shadcn 方式复制消费 |
| `@weimo/style` | 集中承载 Weimo token、字体、半径、玻璃态变量 | 避免每个专属组件重复声明主题变量 |
| `cn()` | `clsx` + `tailwind-merge` | 保持源码分发后的 class 合并能力 |
| CVA | Card、TagChip、IconButton、FloatingTopBar 使用 variants | 让 Weimo 专属视觉差异收口到组件 API |
| Base UI | SideBar 移动端抽屉基于 `@base-ui/react/drawer` | 复杂交互仍复用无头原语 |
| smoke test | registry 安装 Card、FloatingTopBar、Sidebar 并验证依赖 | 确认 Weimo 专属组件可被 shadcn CLI 消费 |
| 文档站 | 有 registry-first 安装片段、workspace 安装片段、props 表和预览 | 让公开组件的消费路径可执行 |

### 需要修正的旧判断

旧文档中“P2 增加基础 primitives：Button、Badge、Input、Field、Dialog、Select、Tabs、Alert、Skeleton、Separator”的建议已经不符合最新职责。

这些组件属于 coss ui、shadcn/ui、base ui 已经覆盖的通用组件面。后续不应默认进入 `weimo-ui`。只有在出现非常明确的 Weimo 专属形态时，才考虑以更窄的名字和语义进入，例如“MemoReferencePanel”这类业务/产品语义，而不是“Dialog”这类通用语义。

## 八、后续准入规则

新增任何 `weimo-ui` 公共组件前，应先完成下面判断：

1. **通用库替代检查**
   - coss ui、shadcn/ui、base ui、Radix UI、Ark UI 是否已有合适组件或组合方式？
   - 如果已有，应优先在业务侧直接使用或组合，不进入 `weimo-ui`。

2. **Weimo 专属性检查**
   - 组件是否承载 Weimo 特有的信息结构、视觉语言、交互节奏或产品语义？
   - 如果只是样式略有不同，应优先通过 token、className、variant 或业务局部封装解决。

3. **真实消费检查**
   - 是否已经服务于 `examples/demo` 或 `weimo-biji/frontend/web` 的真实场景？
   - 如果只是文档站内部需要，应留在 `src/components/coss/` 或 docs-local 目录，不进入 package exports / registry。

4. **复用边界检查**
   - 是否会被至少一个目标应用稳定复用，或即将在 demo/biji 两侧复用？
   - 如果只是单页面一次性结构，应先保留在应用内部。

5. **分发契约检查**
   - 公开组件必须有 package export、registry item、文档示例、props 说明和契约测试。
   - 组件依赖共享 token 时应通过 `@weimo/style`，工具函数通过 `@weimo/utils`。

## 九、建议的下一阶段优先级

| 优先级 | 事项 | 状态 | 说明 |
|--------|------|------|------|
| P0 | 保持 registry/schema/smoke test | 已完成，持续维护 | 这是专属组件可复制消费的底座 |
| P0 | 明确公共组件边界 | 已完成，需在文档中持续贯彻 | `README.md` 已写明不复刻通用组件库 |
| P1 | 给公开组件补充“为什么不是通用库替代”说明 | 建议进行 | 每个组件文档应解释其 Weimo 专属性 |
| P1 | 保持 docs-only coss primitives 私有 | 建议进行 | 不加入 exports，不加入 `@weimo/*` registry |
| P1 | 盘点 `examples/demo` / `weimo-biji/frontend/web` 的真实候选组件 | 建议进行 | 只从真实产品场景里沉淀组件 |
| P2 | 建立 Weimo 场景 examples | 可选 | 示例应围绕 memo、侧栏、顶部工具栏等真实场景，而不是通用 particles 市场 |
| 不建议 | 增加通用 primitives | 不执行 | Button、Input、Dialog、Select、Table、Tabs 等优先使用 coss/shadcn/base |

## 十、更新后的总体结论

`weimo-ui` 已经具备较完整的 shadcn-style 分发底座：Tailwind v4 token、`cn()`、CVA、Base UI Drawer、`@weimo/style`、registry item、文档站和 registry smoke test 都已经到位。

但它的目标不再是成长为一个覆盖 Button、Input、Dialog、Select、Form、Table 等完整 primitives 的通用组件库。更合适的方向是：

```text
用 shadcn registry 的分发模型
沉淀 Weimo demo/biji 中无法由通用库替代的专属 React 组件
并把通用组件继续交给 coss ui、shadcn/ui、base ui 等成熟库
```

因此，后续评估 `weimo-ui` 是否健康，重点不应看“组件数量是否足够多”，而应看：

- 公共组件是否确实来自 demo/biji 的特殊场景。
- 是否避免复刻已有通用组件。
- 每个 registry item 是否有明确 Weimo 专属性。
- 文档和测试是否能证明组件可被真实消费。

## 参考文档与链接

### shadcn/ui 官方

- [shadcn/ui Docs](https://ui.shadcn.com/docs) — 核心理念、组件列表、CLI、theming、registry
- [components.json](https://ui.shadcn.com/docs/components-json) — 项目配置文件说明
- [Registry Introduction](https://ui.shadcn.com/docs/registry) — 自定义 registry 的设计与使用方式
- [registry.json schema](https://ui.shadcn.com/schema/registry.json) — registry 根文件 schema
- [registry-item.json schema](https://ui.shadcn.com/schema/registry-item.json) — registry item schema

### 参考案例：coss ui

- [coss ui](https://coss.com/ui) — 基于 Base UI + Tailwind CSS 的 shadcn-style 组件库
- [coss llms.txt](https://coss.com/ui/llms.txt) — 组件目录与代理友好文档入口
- [coss Get Started](https://coss.com/ui/docs/get-started.md) — CLI、preset、手动复制路径
- [coss Button](https://coss.com/ui/docs/components/button.md) — CLI 安装、手动安装、API 示例
- [coss Dialog](https://coss.com/ui/docs/components/dialog.md) — Base UI 组合式 Dialog 示例
- [coss Particles](https://coss.com/ui/particles) — 可复制组合片段参考

### 相关技术

- [Radix UI](https://www.radix-ui.com) — shadcn/ui 常用无头原语基础
- [Base UI](https://base-ui.com) — coss ui 使用的无头原语基础
- [class-variance-authority](https://cva.style/docs) — 组件变体管理
- [tailwind-merge](https://github.com/dcastil/tailwind-merge) — Tailwind class 冲突合并
- [Tailwind CSS](https://tailwindcss.com) — utility-first CSS 与 v4 token 系统
