# 阴影裁切排查与预览窗放行规范

## 背景

2026-09-28 引入「磨砂材质亮背景 tone 投影」并对齐浮层投影（`0 12px 40px`、黑 25%）后，文档站各预览卡集中暴露阴影被平齐切断的问题。这不是单一 bug，而是**材质规则升级后，历史遗留的裁切层与新视觉语义的系统性冲突**：过去没有投影可裁，裁切层存在与否无人感知；投影落地后，每一层多余的 `overflow: hidden` 都变成一条可见的切断线。

> 2026-09-30 更新：磨砂材质亮背景投影已改为卡片材质同款双层配方 `0 1px 2px hsl(0 0% 0% / 0.04), 0 2px 8px hsl(0 0% 0% / 0.06)`（数值对齐 `--shadow-card`；旧浮层大半径投影的上晕会越过布局视口顶，触发 iOS Safari 安全区回退——状态栏条带变不透明根背景遮盖滚动内容，与浮层投影有意分道）；本文的裁切机制与放行规范对新配方同样适用。

本文记录十一轮修复的过程、裁切机制的分层模型、修复手段的决策分级、后续开发的维护规范，以及裁切类问题的诊断方法。涉及的核心文件：

- 放行列表：`packages/weimo-ui-site/src/app/app.css` 的 `.component-preview-card:has(...) .base-card__content` 规则。
- 契约镜像：`scripts/surface-material-contract.test.mjs` 对上述锁串的精确断言。
- 材质规则：`packages/weimo-ui-core/src/components/surfaces/frosted-surface/frosted-surface.css`（tone 投影与描边隐藏）。

## 裁切机制：三层模型

阴影被切断时，裁切源必在以下三层之一。排查按从外到内的顺序逐层排除。

### 第一层：预览窗（最常见）

`component-preview-card.css` 给 `.base-card__content` 设了 `overflow: hidden + border-radius`（为彩色衬底演示提供圆角预览窗）。真实材质组件的投影超出画布即被切断。

**修法：画布放行**。app.css 维护一条 `:has` 白名单，命中即把内容窗改为 `overflow: visible`，让投影画进外层卡片的 16px padding。这是绝大多数案例的答案。

`:has` 条目的两种粒度，按需选择：

- **画布类名**（如 `.card-surface-preview`、`.frosted-border-preview__tile`）：适合一次性、页面专属的画布。加条目前确认共享该类名的其他卡不受影响（无投影的卡放开无视觉差，一般安全）。
- **组件级类名**（`.capsule-button`、`.icon-button--frosted`）：同一组件家族的卡被逐张报告第二次时，升级为组件级匹配，一次覆盖全部宿主并免去逐卡补类名。前提是验证「无该材质态的卡放开后零视觉差」，以及不会误伤不相关卡（例如 Md 编辑器工具栏实为 coss/toolbar，不受 `.icon-button--frosted` 牵连）。

### 第二层：内嵌演示面板

演示卡自己在 docs CSS 里写的 `overflow: hidden`。又分两种：

- **无功能遗留**：历史上照抄的防御性声明，几何上根本不需要（悬浮栏四周内缩不碰圆角、正文不会溢出）。典型：底部操作栏卡与卡片工具栏卡的 `__surface`。**修法：直接删除并留注释**。
- **契约锁定的历史决策**：卡片工具栏卡的 hidden 曾被契约显式锁定（"must clip the internal absolute bottom bar"），锁于 tone 投影时代之前。**修法：删除的同时反转契约断言**（从「必须含 overflow: hidden」改为「不得含 overflow」），让契约锁定现行材质规则而非过时防御。

### 第三层：组件内部（最难）

共享组件自身的裁切，通常有真实功能：

- **动画遮罩**：CardComposer 的 0fr 网格折叠进出场动画依赖 `overflow: hidden` 做遮罩；editable 卡的高度锁（`data-height-lock`）同理。**修法：稳态放开**——用 `:not([data-state='closing'])` / `:not([data-height-lock='true'])` 把退出动画与高度锁的遮罩保留，仅放开稳态；代价是 180ms 进场折叠期间遮罩弱化（动画自带透明度渐入，基本被柔化）。演示级放法写在 docs CSS 作用域内（`.card-composer-docs-preview` 前缀），不碰组件。
- **结构性防溢出**：抽屉面板 `.weimo-sidebar--drawer` 的 `overflow-x: hidden` 防横向滚动，裁掉面板内 X 磨砂钮的投影。**无法安全放开，需要结构调整**（把按钮挪出裁切层），动共享组件前应单独过方案。此类是「已知未修」的唯一存量。

## 维护规范

后续开发请遵循以下规则，避免重新制造裁切或破坏已有放行。

### 1. 新增演示卡检查清单

新卡若渲染**真实材质组件**——CardSurface / PopupSurface / FrostedSurface / 胶囊（任意 frosted 态）/ 磨砂图标钮——逐项检查：

- 画布内会出投影的元素，其所在卡是否命中 `:has` 白名单？没有则按上文粒度规则加条目。
- 卡内有**内嵌演示面板**时，不写 `overflow: hidden`，除非有明确功能；写了必须留注释说明用途（见规则 3）。
- 卡内嵌**共享组件**（composer / editable card / drawer 等）时，意识到它们的内部遮罩会裁投影，参考第三层修法处理。

### 2. `:has` 白名单是双镜像

app.css 的选择器串被 `surface-material-contract.test.mjs` 逐字符锁定（含换行与缩进）。**改列表必须同步契约锁串与断言消息**，漏同步即测试红。同样，改磨砂 tone 投影字面量须四处手动同步（tokens.css + 两份 registry + 磨砂 CSS 字面量），对齐关系由契约锁定、定义互不引用。

### 3. 新增 `overflow: hidden` 的注释义务

任何新增的裁切声明必须就地注释**功能用途**（动画遮罩 / 防横向滚动 / 圆角裁切贴边子元素……）。本批修复中多处分不清「遗留」还是「功能」，全靠 git log -S 追溯，成本高。有注释的裁切层（如 composer 的 0fr 遮罩）在修复时被正确保留，无注释的（bottom-bar surface）被正确删除。

### 4. 动契约前先查锁、再溯源

改任何组件 CSS / docs CSS 前 `rg scripts/` 查契约锁点；遇到反向断言（「不得含 X」）与本轮需求冲突时，`git log -S` 追溯断言的原始意图与年代，确认是「过时防御」才可反转，并在新断言消息里记录现行语义。

### 5. 并行开发下的提交纪律

用户会在会话中并行改文件、提交。**提交必须逐文件点名 `git add <path>...`，禁用 `git add -A`**——本批曾发生一次 `-A` 卷入并行 WIP 六文件，靠 soft reset 拆分挽回。提交前重新核对 `git status` 与 `git diff`，只描述当前差量。

## 诊断方法

裁切类问题的排查手段，按成本从低到高。

### 1. 祖先链 computed 遍历（首选）

从投影元素向上逐层读 `getComputedStyle`。除 `overflow` 外还要查 `contain`、`filter`、`clip-path`、`content-visibility`——它们都能裁掉 box-shadow。注意 computed `visible` 不代表渲染无恙时，怀疑**层叠/绘制问题**而非裁切。

### 2. CSS 探针法（IAB 环境最可靠）

在真实页面临时追加规则给目标元素硬上投影（`box-shadow: ... !important`），借 dev server 热更新触发重绘，reload 后截图观察切断线位置。用完即删。这绕开了 IAB 的三重限制：

- JS 注入的 `data-background-tone` 属性会被 React 重渲染剥除；
- 后台标签渲染冻结，截图拿到旧帧或空帧；
- rAF 饿死令 tone 采样恒为 null（材质影根本不上屏）。

### 3. /tmp 复现页

把怀疑的 CSS 结构（材质 + 祖先链）抽成静态 HTML 独立验证。用于区分「CSS 机制本身有恙」与「页面特定层裁切」——例如验证 backdrop-filter 元素的 box-shadow 在 visible 链上可自由溢出，从而排除机制嫌疑。

### 4. 截图判读纪律

视觉模型首读易误判（曾把「未点开的触发钮投影」读成「抽屉面板投影」，把面板细微阴影归给胶囊）。**关键结论必须二次精读**，问题要问到具体：哪个元素、切断线在哪层边、距边几像素、留白区是否干净。

### 5. 先实测再动手

报告中的截图可能是**提前批量截取**的旧帧（本批两例：标签选择器卡、OCR 上传卡，报告时其实已被此前的组件级修复覆盖）。收到裁切报告先用探针法在当前代码上实测，确认仍存在再改，避免对已修卡做无谓改动。

## 案例索引

| 轮次 | 卡片 | 裁切层 | 手段 | 提交 |
| --- | --- | --- | --- | --- |
| 1 | 磨砂图标按钮 / 按钮组卡 | 预览窗 | 画布类名 `.icon-preview__row` | `065c67e` |
| 2 | 边框页磨砂方瓦片 | 预览窗 | 画布类名 `.frosted-border-preview__tile` | `089e66f` |
| 3 | 胶囊材质切换 / 可编辑胶囊等 | 预览窗 | 组件级 `.capsule-button` | `01bc3e1` |
| 4 | 底部操作栏卡 | 内嵌面板 | 删除无功能遗留 hidden | `bd7cbb0` |
| 5 | 抽屉侧边栏卡（触发钮） | 预览窗 | 画布类名 `.sidebar-preview` | `be1cc70` |
| 6 | 标签面包屑卡 | 预览窗 | 画布类名 `.tag-page__bread-preview` | `8876d0e` |
| 7 | 图片上传卡及磨砂图标钮家族 | 预览窗 | 组件级 `.icon-button--frosted` | `4d7e2fe` |
| 8 | 卡片工具栏卡 | 内嵌面板 | 删除 + 契约反转 | `d6a36c1` / `a33c6fa` |
| 9 | 新建草稿壳层卡（含同页笔记卡片） | 组件内部三层 | 稳态放开（`:not` 排除动画态）+ `.card-docs-preview` 入列 | `954535f` |
| 10 | 标签选择器卡 | — | 已修误报（探针实测无裁切） | 零差量 |
| 11 | OCR 上传卡 | — | 已修误报（同上，复用第 9 轮覆盖） | 零差量 |

另有带标签卡片页「笔记卡片」卡随第 9 轮顺带放行（`.card-docs-preview`）。

## 已知未修与待决策

- **抽屉面板内 X 磨砂钮投影**：被 `.weimo-sidebar--drawer` 的 `overflow-x: hidden`（防横向滚动）裁。需结构调整（按钮挪出裁切层），动共享组件，未见报告，等单独决策。
- **CardComposer 组件级 settled 态方案**：当前是演示级稳态放开。组件级正解为「动画期裁切 / 稳态放开」——ComposerShell 在进出场动画结束后标记 settled 态，CSS 据此切换 overflow。影响全部可编辑卡片，需与高度锁、测量竞态一起评估后再做。
