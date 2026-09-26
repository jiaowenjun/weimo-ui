# UI 组件设计规范

本文记录 `weimo-ui` 的当前组件设计原则，优先约束材质、层级和 API 边界。

## 1. 组件职责

- 组件先承担单一职责，再通过组合扩展。
- 内容、导航、动作尽量由调用方传入，不在组件内部做多余的内容拼装。
- 公共 API 保持窄口，避免把页面语义写死进基础组件。

## 2. 材质规则

- 材质绘制由 Surface 层统一实现；宿主组件保留自身几何、布局与交互反馈，不在组件 CSS 里重复定义 blur、材质边框或材质前景色。
- 磨砂材质用于贴附在页面内容上的轻浮元素，透出底下的内容；由 `FrostedSurface` 提供运行时背景亮度自适应。
- 抬升浮层（对话框、命令面板、Tooltip）使用不透明材质，靠阴影表达层级，不依赖底下的内容。
- 常驻、嵌入式、占位式组件一律使用不透明背景，不使用 `backdrop-filter`。
- 面板材质与 backdrop 模糊是两件事：抽屉面板本体是不透明材质，模糊只发生在 backdrop 上。

### Material taxonomy

| 材质 | 实现 | 当前宿主 |
|---|---|---|
| `opaque.card` | `CardSurface` | `Card`、coss `Card` / `CardFrame`、`SideBarShell` 常驻态 |
| `opaque.popup` | `PopupSurface`（`level: modal \| tooltip` 细分圆角与阴影） | Dialog、Command、Tooltip 弹层 |
| `solid.chip` | `CapsuleFrame` 使用 `--color-bg-chip` 绘制普通胶囊底色 | `Chip`、`ChipButton` 默认态 |
| `frosted.adaptive` | `FrostedSurface`（运行时背景亮度采样切换前景/边框 token） | `Menu` 弹层、磨砂图标按钮、`MdEditorToolbar`、coss `InputGroup`、胶囊磨砂态、`TagBread` |
| `liquid.glass` | `LiquidGlassSurface` | 明确选择液态折射效果的浮动控件 |

- `CapsuleFrame` 只拥有胶囊几何、内容插槽、宽度/按压动画和普通态填充；磨砂态组合 `FrostedSurface`，由后者拥有前景色、描边和 backdrop blur。
- 依赖方向锁定为：组件 → Surface → token，由 `surface-material-contract` 契约测试强制。

### 当前对应关系

- `Menu` 弹层、磨砂图标按钮、`MdEditorToolbar`、coss `InputGroup`：浮动元素，使用磨砂材质。
- Dialog、Command、Tooltip 弹层：抬升浮层，使用不透明材质（`PopupSurface`）。
- `Card`：非浮动组件，使用纯色卡片背景。
- `SideBarShell` 常驻态：非浮动组件，组合 `CardSurface`。
- `SideBarShell` 抽屉态：面板为不透明 `--color-bg-card`，backdrop 使用 `--backdrop-blur` 模糊。
- `FloatBar`：纯布局壳，自身不持有材质，材质由槽内组件自带。

## 3. 视觉层级

- 静态内容面板使用 `--color-bg-card` 与 `--shadow-card`（`CardSurface`）。
- 抬升浮层使用 `--color-bg-card` 与 `--shadow-overlay` / `--shadow-tooltip`（`PopupSurface`）。
- 磨砂材质使用 `--glass-blur` 与 `--glass-surface-*` token（`FrostedSurface`）。
- 抽屉 backdrop 模糊使用 `--backdrop-blur`。
- 视觉效果服务于层级，不服务于装饰。

## 4. 组件边界

- `Card` 负责内容承载，不接管业务拼装。
- `Chip` 负责标签式小动作或标记。
- `IconButton` 负责图标按钮；`FrostedIconButton` 负责磨砂底图标按钮。
- `SideBarShell` 负责桌面常驻面板和移动端抽屉壳层，但不负责导航内容本身。
- `FloatBar` 负责浮动条布局壳，不负责材质，也不负责具体业务按钮语义。

## 5. 约束

- 只有真正浮动的组件才可以使用玻璃材质。
- 常驻、嵌入式、占位式组件一律使用纯色背景。
- 如果新组件不明确属于浮动层，默认按纯色背景处理。
- 新增组件不得自带材质 CSS，必须组合对应 Surface。
