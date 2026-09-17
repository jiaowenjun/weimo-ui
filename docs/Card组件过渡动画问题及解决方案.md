# Card 组件过渡动画问题及解决方案

## 背景

`Card` 组件在展示态和编辑态之间切换时，不只是切换内容，还会同步改变卡片高度、正文区域高度、标签栏位置和编辑工具栏可见性。

这类过渡容易出现跳变，因为同一帧内会同时发生：

- React 状态切换导致 DOM 结构或属性变化。
- CSS 变量更新导致布局目标位置变化。
- `MdEditor` 实例和编辑 DOM 异步挂载。
- 标签栏和工具栏从普通流布局切换为绝对定位布局。
- CSS transition 和 WAAPI 动画同时作用于 `transform`。

本次修复的核心经验是：高度和位置必须分阶段测量，动画必须明确区分“布局目标位置”和“视觉过渡位移”。

## 问题一：进入编辑态前目标高度偏小

### 现象

`Card` 从展示态切换到编辑态前，计算目标高度时没有覆盖编辑态下 `MdEditor` 自动在末尾创建的新空白行，导致实际进入编辑态后内容高度变大，标签栏和工具栏位置出现二次调整。

### 根因

展示态的 Markdown 渲染高度不等于编辑态真实内容高度。

编辑态的内容高度需要等 `MdEditor` 实例和编辑 DOM 真正挂载后，读取编辑内容区域的实际高度。过早使用展示态高度或外部选择器估算，会漏掉编辑器自身生成的末尾空白行、编辑器内边距和实际排版差异。

### 解决方案

将高度测量职责收敛到子组件内部：

- `MdView` 暴露内部测量能力。
- 由子组件内部通过稳定 ref 获取内容高度。
- `Card` 只消费抽象后的内容高度，不使用跨组件的外部长选择器。
- 进入编辑态后，在 `MdEditor` 实例和编辑 DOM 挂载完成后再计算编辑态目标高度。

这样比父组件直接读取 `.md-editor__content.scrollHeight` 更可维护。父组件不需要知道编辑器内部 DOM 结构，后续 `MdEditor` 内部重构时，只需要保持子组件暴露的测量语义稳定。

## 问题二：TagBar 从展示态到编辑态跳变

### 现象

进入编辑态时，标签栏会直接跳到目标位置，而不是随卡片高度和内容区域一起滑动。

### 根因

标签栏进入编辑布局后改为绝对定位，`inset-block-start` 使用测量得到的展示态偏移，后续位置移动依赖 CSS 变量 `--weimo-card-editable-content-extra-height`。

如果只更新布局变量而没有对 `transform` 做过渡，浏览器会把标签栏直接绘制到最终位置。

### 解决方案

将标签栏位置变化表达为 `transform: translateY(...)`，并对 `transform` 添加 transition。

原则是：

- `inset-block-start` 表达稳定基准位置。
- `translateY(contentExtraHeight)` 表达随内容增高而下移的视觉偏移。
- 过渡只作用在 `transform` 上，避免重新布局属性参与动画。

这能把位置变化从布局跳变转成合成层位移动画。

## 问题三：退出编辑态时 TagBar 跳变

### 现象

从编辑态切回展示态时，标签栏会立刻跳到展示态目标位置，然后卡片高度才开始收缩。

### 根因

退出编辑态时，卡片内容可能已经被修改，尤其是删除多行笔记后，展示态目标高度会明显小于当前编辑态高度。

如果不先重新测量展示态目标布局，就无法知道标签栏在最终展示态应该回到哪里。直接清空编辑布局或清空内容额外高度，会让标签栏先跳到目标位置，视觉上和高度动画脱节。

### 解决方案

退出编辑态采用 FLIP 思路：

1. First：在编辑态即将退出前，记录标签栏和工具栏当前 viewport top。
2. Last：切到展示态后，重新测量自然展示态布局和目标高度。
3. Invert：计算 `firstViewportTop - lastViewportTop`。
4. Play：用 `transform` 从反向偏移动画到目标位置。

同时保留卡片当前高度作为动画起点，再将高度动画到重新测量得到的展示态目标高度。

关键点是：退出时必须重新测量目标高度，不能复用进入编辑态前的旧布局数据。

## 问题四：退出编辑态时工具栏小幅向上跳闪

### 现象

删除多行内容后点击保存，工具栏会先小幅向上跳到标签栏附近或正文下方，然后再进入消失过渡动画。

修复前跳闪幅度较大；初次 FLIP 修复后幅度变小，但仍然能看到一下向上跳闪。

### 根因

工具栏和标签栏不完全一样。工具栏自身还有显示态和隐藏态的 CSS `transform`：

- 编辑可见时：`translateY(contentExtraHeight)`。
- 退出隐藏时：`translateY(contentExtraHeight + 8px)`。

最初的 FLIP 动画直接使用：

```ts
[
  { transform: `translateY(${delta}px)` },
  { transform: 'translateY(0px)' },
]
```

这会临时覆盖工具栏目标态自身的 CSS transform。也就是说，WAAPI 动画接管 `transform` 后，隐藏态原本需要保留的基础下移量被清掉，于是工具栏会出现一小段不连续位移。

另外，如果在关闭 CSS transform transition 之前读取 `getBoundingClientRect()`，测到的可能是 CSS 过渡中的中间位置，而不是稳定的目标位置。

### 解决方案

退出浮动元素动画需要叠加目标态已有 transform，而不是动画到裸 `translateY(0)`：

```ts
element.dataset.exitAnimating = 'true'
const baseTranslateY = resolveTranslateY(window.getComputedStyle(element).transform)
const lastViewportTop = element.getBoundingClientRect().top
const delta = firstViewportTop - lastViewportTop

element.animate(
  [
    { transform: `translateY(${baseTranslateY + delta}px)` },
    { transform: `translateY(${baseTranslateY}px)` },
  ],
  animationOptions,
)
```

同时应先设置 `data-exit-animating="true"`，让 CSS 进入稳定目标态并关闭 transform transition，再读取 computed transform 和目标位置。

这样 WAAPI 做的是“从旧视觉位置滑到目标视觉位置”，而不是替换掉目标态原有的 CSS 位移。

## 问题五：编辑态新增内容后退出时高度起点偏小

### 现象

编辑态下新增多行内容后点击保存切回展示态，过渡动画还没开始时，卡片高度会先发生跳闪，底部工具栏直接被裁切掉。

这个问题一开始容易被误判为退出编辑态的时序问题，例如认为需要延迟一帧等待展示态 DOM 挂载后再提交退出布局。但实际验证后，这类修复不能消除裁切。

### 根因

真实根因是：进入编辑态后，`Card` 只在 `MdEditor` 首次挂载时计算了一次编辑态内容额外高度；编辑过程中新增内容会让 `.md-editor__content` 继续变高，但 `Card` 内部保存的 `editLayout.contentExtraHeight` 没有同步更新。

因此保存退出时会出现坐标系不一致：

- 编辑器真实内容已经变高。
- 标签栏和工具栏视觉位置跟随真实内容下移。
- `Card` 记录的编辑布局高度仍停留在进入编辑态时的旧高度。
- `exitEditMode()` 锁定当前卡片高度时，拿到的是偏小的外壳高度。
- 随后退出流程切换到展示态目标布局，底部浮动工具栏还没开始消失动画，就先被偏小的 `overflow: hidden` 容器裁切。

这说明退出动画的起点高度也必须可信。只重新测量展示态目标高度不够，如果编辑态期间的当前布局没有同步，动画会从错误的起点开始。

### 解决方案

在编辑态内容变化后，复用 `MdView.getContentHeight()` 重新读取编辑内容高度，并用当前布局的展示态内容高度计算新的 `contentExtraHeight`：

```ts
function syncEditLayoutContentHeight() {
  if (mode !== 'edit') return
  if (!editorInstance) return

  setEditLayout((currentLayout) => {
    if (!currentLayout) return currentLayout

    const nextContentExtraHeight = resolveEditorContentExtraHeight(currentLayout)
    if (nextContentExtraHeight === currentLayout.contentExtraHeight) return currentLayout

    return {
      ...currentLayout,
      contentExtraHeight: nextContentExtraHeight,
    }
  })
}
```

再用 `useLayoutEffect` 监听 `draft.content`、`editorInstance` 和 `mode`，确保 React/Tiptap DOM 更新后、浏览器绘制前完成布局同步。

关键点：

- 不直接从 `Card` 查询编辑器内部长选择器，继续通过 `MdView` 的内部测量 API 获取内容高度。
- 只在 `contentExtraHeight` 变化时更新 `editLayout`，避免无意义重渲染。
- 编辑态增长和缩短都需要同步，因为保存、取消或继续编辑时都依赖当前布局高度。
- 退出动画需要两个正确值：当前编辑态起点高度，以及切回展示态后的目标高度。任意一个过期都会产生跳闪或裁切。

## 问题六：双击正文进入编辑态时偶发闪烁

### 现象

通过“编辑”菜单项进入编辑态时没有看到闪烁，但双击正文区域进入编辑态时，偶尔会出现一帧或数帧闪烁。

最初尝试过给 `Card` 增加稳定宽度约束，例如让卡片在编辑切换期间保持 `width: 100%`。这个方向只能改变闪烁形态：原本像是局部宽度跳变，修改后变成全宽闪一下，但没有消除闪烁。

这说明宽度不是根因。宽度变化只是中间态被暴露后产生的一个可见症状。

### 根因

双击进入编辑态的路径会直接暴露 `MdEditor` 的首个加载帧。

`MdEditor` 内部使用 Tiptap `useEditor({ immediatelyRender: false })`。在编辑器实例创建完成前，`editor` 会短暂为 `null`，此时 `MdEditor` 会渲染 `.md-editor__skeleton`。

旧流程在双击后立即把 `Card` 切到编辑布局，因此同一段过渡里会同时发生：

- `MdRender` 被替换为 `MdEditor`。
- `MdEditor` 先渲染 skeleton，再渲染真实编辑内容。
- 顶部工具栏、标签栏和正文区域进入编辑态布局。
- 卡片高度测量和内容额外高度计算依赖尚未稳定的编辑 DOM。

菜单路径没有明显闪烁，是因为菜单关闭、浮层消失和事件节奏在视觉上缓冲了这个短暂中间帧；并不是菜单路径不存在这个异步加载阶段。

### 解决方案

引入一个不直接暴露给用户的准备态，把“用户可见的编辑态”和“编辑器资源已准备好”拆开：

```ts
export type CardMode = 'view' | 'preparing-edit' | 'edit'
```

进入编辑态时先锁定当前展示态布局，然后进入 `preparing-edit`：

- `Card.handleEnterEdit()` 记录当前视图高度和布局测量结果。
- `MdView` 在 `preparing-edit` 期间继续展示 `MdRender`，保持用户看到的仍是展示态正文。
- 同时通过 `preloadEditor` 隐藏挂载 `MdEditor`，让 Tiptap 在不可见层完成初始化。
- 等 `onEditorChange` 返回真实 editor 实例后，再把 `Card` 从 `preparing-edit` 推进到 `edit`。
- 推进到 `edit` 后再由 `completeEnterEdit()` 测量可见编辑器内容高度，并启动高度过渡。

关键点是：不要在隐藏预加载层上计算最终编辑高度。隐藏层可能因为不可见定位、尺寸约束或布局隔离读到不可信高度。正确做法是先等编辑器实例准备好，再切到真实编辑布局，然后在可见编辑器 DOM 上测量。

### 为什么不删除双击进入编辑态

删除双击功能可以绕过这个入口，但不能解决底层问题。只要未来还有更快的入口、快捷键入口或自动聚焦入口，`MdEditor` 首帧 skeleton 仍可能被暴露。

`preparing-edit` 修复的是通用时序问题：编辑器未准备好时，不让用户看到编辑态布局。这样既保留了双击进入编辑态的交互，也让菜单、双击和后续入口共享同一套稳定流程。

## 推荐实现原则

### 1. 测量职责靠近真实 DOM

高度测量应尽量封装在拥有真实 DOM 的子组件中。例如 `MdView` 或 `MdEditor` 内部知道 `.md-editor__content`、viewport、编辑器空白行等细节，父组件不应依赖这些内部选择器。

父组件更适合保存和组合测量结果，例如卡片高度、标签栏 top、标签栏高度、正文内容高度、工具栏 top。

### 2. 布局状态和动画状态分离

布局状态回答“最终应该在哪里”。

动画状态回答“从哪里过渡到最终位置”。

不要把动画中的临时位移写回布局测量数据，也不要用 CSS 变量同时承担目标布局和反向偏移两种含义。

### 3. 退出动画必须重新测量目标布局

保存或取消时，内容可能已经变化。特别是删除内容时，展示态目标高度和标签栏目标位置都可能改变。

退出流程需要重新测量自然展示态布局，然后再做高度动画和标签栏/工具栏位移动画。

### 3.1 编辑态期间也要同步当前布局

重新测量退出目标只能保证 Last 正确，不能保证 First 正确。

如果用户在编辑态新增或删除内容，`contentExtraHeight` 应随编辑内容高度变化持续同步。否则保存时锁定的当前高度可能是旧布局高度，导致退出动画从错误起点开始。

### 3.2 可见状态和准备状态分离

编辑器、图表、富文本等子组件可能存在异步初始化阶段。父组件不能把“进入编辑态”理解为“立即显示编辑 DOM”。

更稳妥的模型是：

- `view`：展示态。
- `preparing-edit`：用户仍看到展示态，但编辑器在隐藏层预加载。
- `edit`：编辑器已经准备好，展示真实编辑布局。

这样可以避免 skeleton、默认尺寸、未初始化实例和第一次重排直接进入用户视野。

### 4. 使用 transform 动画位置，不动画布局属性

标签栏和工具栏这类浮动元素应优先使用 `transform` 过渡。

`top`、`bottom`、`inset-block-start` 等布局属性适合表达最终布局，不适合承担每帧动画。这样可以减少 layout 抖动，也能避免滚动区域和绝对定位元素互相影响。

### 5. WAAPI 动画要保留 CSS 基础 transform

如果元素自身 CSS 已经有 transform，WAAPI 动画不能简单写 `translateY(delta) -> translateY(0)`。

更稳妥的写法是读取目标态 computed transform，提取基础 translate，再做：

```ts
base + delta -> base
```

这条经验尤其适用于同时有“位置动画”和“显示/隐藏微位移”的浮动工具栏。

### 6. 先稳定目标态，再测 Last

FLIP 的 Last 必须是目标态的稳定位置。

如果某个 CSS class 或 data attribute 用来关闭 transition、切换隐藏态、或者改变目标 transform，应先设置它，再读取 `getBoundingClientRect()` 和 computed style。

### 7. 小位移无动画时要清理临时状态

如果 `Math.abs(delta) < 0.5` 直接跳过动画，需要同步清理临时 `data-*` 标记，避免元素残留在 exit-animating 状态。

## 排查清单

遇到 Card 展示态和编辑态切换闪跳时，优先检查：

- 是否在目标 DOM 挂载完成后再测量。
- 测量的是展示态高度、编辑态高度，还是过渡中的中间高度。
- 标签栏和工具栏是否共用同一套 FLIP 逻辑，但两者 CSS transform 语义不同。
- WAAPI 是否覆盖了 CSS 中已有的 transform。
- `data-exit-animating` 是否在测量 Last 之前设置。
- 退出编辑态是否重新测量了保存后的展示态目标高度。
- 小位移跳过动画时是否清理了临时 dataset。
- CSS transition 和 WAAPI 是否同时作用于同一个 transform。
- 编辑态内容变化后，`editLayout.contentExtraHeight` 是否仍停留在进入编辑态时的旧值。
- 保存退出时锁定的当前高度是否已经覆盖最新编辑内容高度。
- 双击、快捷键等快速入口是否绕过了菜单路径里的视觉缓冲。
- 编辑器实例未准备好时，是否已经把真实编辑布局暴露给用户。
- 预加载编辑器时，是否仍保持 `MdRender` 作为可见内容。
- 最终编辑高度是否是在可见编辑器 DOM 上测量，而不是在隐藏预加载层上测量。

## 后续维护建议

Card 过渡动画后续应尽量用契约测试锁住关键时序：

- 父组件不直接查询编辑器内部长选择器。
- 退出编辑态记录 First viewport top。
- 切回展示态后重新测量目标布局。
- 标签栏和工具栏都使用 FLIP 位移动画。
- 退出动画读取目标态 computed transform。
- WAAPI 关键帧使用 `baseTranslateY + delta -> baseTranslateY`。
- `data-exit-animating` 在测量 Last 前设置。
- 编辑态 `draft.content` 变化后会重新同步 `contentExtraHeight`。
- 双击正文进入编辑态会先进入 `preparing-edit`。
- `MdView preloadEditor` 期间继续可见渲染 `MdRender`，并隐藏预加载 `MdEditor`。
- editor 实例 ready 后才从 `preparing-edit` 推进到 `edit`。

这类动画问题通常不是单一 CSS 属性错误，而是状态切换、DOM 挂载、测量时机和动画叠加共同造成的。以后修复时应先定位“哪一帧读到了错误的位置”，再决定是调整测量、布局状态，还是动画合成方式。
