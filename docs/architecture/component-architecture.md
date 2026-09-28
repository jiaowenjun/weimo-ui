# 组件架构与设计规范

本文记录 `weimo-ui` 当前必须遵守的包边界、源码组织、材质和公共 API 设计原则。

## Workspace 分层

| 子项目 | 可以依赖的 workspace 包 |
| --- | --- |
| `weimo-ui-core` | 无 |
| `weimo-ui-tagtree` | `weimo-ui-core` |
| `weimo-ui-markdown` | `weimo-ui-core` |
| `weimo-ui-image` | `weimo-ui-core` |
| `weimo-ui-stats` | `weimo-ui-core` |
| `weimo-ui-card` | `weimo-ui-core`、`weimo-ui-tagtree`、`weimo-ui-markdown`、`weimo-ui-image` |
| `weimo-ui-site` | 全部组件包 |

- `weimo-ui-core` 是基础层，不依赖其他 workspace 包。
- `weimo-ui-tagtree`、`weimo-ui-markdown`、`weimo-ui-image` 和 `weimo-ui-stats` 只依赖 `weimo-ui-core`，彼此不直接耦合。
- `weimo-ui-card` 是业务组合层，可以复用 core、Markdown、图片和标签树能力。
- `weimo-ui-site` 是文档与预览应用，只消费组件包，不承载可复用组件实现。
- 根包 `weimo-ui` 只提供统一的公开子路径，不增加转发源码或第二套实现。

跨包依赖必须从所属包的显式子路径导入。禁止依赖包根 barrel、其他包的 `src` 路径或历史转发文件。

## 源码组织

- 一个组件族的组件、模型、hook、状态机和 CSS 放在同一目录或同一父目录中。
- 父子组件可以同目录维护；只有形成独立职责的组件族才新增目录层级。
- 组件族内部使用相对导入，跨组件族和跨包使用所属包的公开子路径。
- 公开导出直接指向真实实现；不为缩短路径增加只有一行 `export *` 的文件。
- 每个组件只能由一个子项目拥有。组合包引用所有者提供的入口，不复制实现。
- 根包与各子包均不提供 `.` 根导出。调用方必须选择明确的 `components/*`、`styles/*` 或 `lib/*` 入口。

## 组件职责

- 组件先承担单一职责，再通过组合扩展。
- 内容、导航和动作尽量由调用方传入，不在基础组件内部拼装业务数据。
- 公共 API 保持窄口，不把页面语义写入通用基础组件。
- 内部模型只在确有跨组件复用需求时公开；实现细节默认留在组件目录内。
- 可复用行为应靠近拥有真实 DOM 和状态的组件，避免父组件通过长选择器读取子组件内部结构。

## 材质与视觉层级

材质绘制由 Surface 层统一实现。宿主组件保留几何、布局和交互反馈，不重复定义 blur、材质边框或材质前景色。

| 材质 | 实现 | 适用场景 |
| --- | --- | --- |
| `opaque.card` | `CardSurface` | `Card`、预览卡片、桌面 `SideBar` |
| `opaque.popup` | `PopupSurface` | Dialog、Command、Tooltip 等抬升浮层 |
| `solid.chip` | `CapsuleFrame` | 普通胶囊控件 |
| `frosted.adaptive` | `FrostedSurface` | 菜单、磨砂按钮、编辑器工具栏、`TagBread` |

- 只有真正浮动且需要透出背景的元素使用磨砂材质。
- 常驻、嵌入式和占位式组件使用不透明背景。
- 抽屉面板本体使用不透明材质；模糊只发生在 backdrop。
- `CapsuleFrame` 只负责胶囊几何、内容插槽和普通态填充。磨砂态组合 `FrostedSurface`。
- `FloatBar` 只负责布局，材质由槽内组件自行提供。
- 依赖方向固定为“宿主组件 -> Surface -> token”。

## 关键组件边界

- `Card` 负责内容展示、编辑编排和过渡，不负责业务请求与持久化。
- `SideBar` 负责桌面常驻面板和移动端抽屉，不负责导航内容。
- `TagTree` 负责树的展开、选中和菜单事件，不负责业务路由与数据存储。
- `MdRender` 负责只读渲染，`MdEditor` 负责编辑，`MdView` 负责两种模式的编排。
- `ImageUploader` 负责文件选择、拖放、粘贴与本地预览，不负责上传协议。
- `Heatmap` 负责日期活动可视化；色阶能力由 core 的 `HeatColor` 独立提供。

## 公共 API

- 面向根包调用者的新入口必须落在所属子包的 `exports` 中，并由根包映射到同一个真实实现。
- 文档、Registry 和契约测试必须与公开入口同步。
- 删除或重命名入口时直接更新调用方；项目不以转发文件长期保留历史 API。
- `className`、`style`、ARIA 属性和原生事件应在语义允许时继续透传。
- 新增通用组件前先检查 Base UI、shadcn/ui 和 coss ui 是否已有合适能力；Weimo UI 优先承载具有明确产品语义或视觉规则的组件。

## 验证

目录或公共入口调整后，至少运行：

```bash
pnpm catalog:check
pnpm test:contracts
pnpm test:typecheck
pnpm lint
git diff --check
```

涉及运行时行为时补充 `pnpm test:runtime`；涉及文档站装配时补充 `pnpm build`。
