# weimo-ui-tagtree

> 一棵会动的层级标签树,一条磨砂质感的标签面包屑。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![Base UI](https://img.shields.io/badge/Base%20UI-%5E1.9-6f4bf6.svg)](https://base-ui.com)
[![在线演示](https://img.shields.io/badge/%E5%9C%A8%E7%BA%BF%E6%BC%94%E7%A4%BA-GitHub%20Pages-2ea44f.svg)](https://jiaowenjun.github.io/weimo-ui/tagtree/)

**[🚀 打开在线演示,亲手点点看 →](https://jiaowenjun.github.io/weimo-ui/tagtree/)**

![标签树](https://raw.githubusercontent.com/jiaowenjun/weimo-ui-tagtree/main/docs/images/tag-tree.png)

![标签面包屑](https://raw.githubusercontent.com/jiaowenjun/weimo-ui-tagtree/main/docs/images/tag-bread.png)

如果你在做笔记应用、知识库、素材管理器,需要一个像 Bear、Obsidian 那样以「标签路径」组织内容的导航,`weimo-ui-tagtree` 就是为你准备的:

- **`TagTree` 标签树** —— 把 `写作/日记` 这样的层级标签渲染成一棵可展开、可选中、可操作的树;
- **`TagBread` 标签面包屑** —— 把当前标签变成一条带省略折叠的磨砂胶囊面包屑。

一条字符串就是数据源:路径既描述层级,也充当唯一 ID,树和面包屑共享同一套心智模型。组件基于 React 19 与 [Base UI](https://base-ui.com/) 构建,视觉语言(磨砂材质、胶囊边框、主题 token)来自 [weimo-ui-core](https://github.com/jiaowenjun/weimo-ui-core) 设计系统,深浅色主题自动适配。

## ✨ 特性

- **开箱即用的树导航** —— 展开 / 收起带进出场动画,单选高亮,层级缩进参考线
- **行内操作菜单** —— 内置「重命名 / 删除」,可按节点追加自定义菜单项,也可整体切换为 `no-action` 纯导航模式
- **磨砂玻璃质感** —— 面包屑采用磨砂表面 + 胶囊边框,随背景自动调节色调,内容变化时宽度平滑过渡
- **超长路径不慌** —— 层级数超过 `maxVisible` 时自动折叠中间层级,收进省略号菜单
- **受控 / 非受控任选** —— 选中与展开状态既可以交给组件(`defaultXxx`),也可以自己接管(`xxx` + `onXxxChange`)
- **无障碍友好** —— 完整的 `tree` / `treeitem` ARIA 语义(`aria-expanded`、`aria-selected`、`aria-level`),行选择与展开均为原生按钮
- **按需引入** —— 显式子路径导出、tree-shaking 友好,组件结构样式随导入自动加载,只需在应用入口引入一次主题 token

## 📦 安装

```bash
pnpm add weimo-ui-tagtree weimo-ui-core @base-ui/react react react-dom
```

- `weimo-ui-tagtree@0.1.x` 搭配 `weimo-ui-core@0.1.x` 使用;应用中只保留一份兼容的 core 与 Base UI。
- 包根不提供 `.` 导出,所有组件通过显式子路径引入。

样式零配置:引入任意组件子路径,组件 JS 会一并加载自身结构样式与
`weimo-ui-core/styles/tokens.css` 主题 token(含 `.dark` 暗色覆盖),无需在应用
入口手动引入任何 CSS。显式引入 core tokens.css 仍然无害,定义幂等;定制主题在
自有 CSS 中覆盖对应变量即可。

## 🚀 快速上手

### 渲染一棵标签树

```tsx
import { TagTree, type TagTreeNode } from 'weimo-ui-tagtree/components/tag-tree'

const nodes: TagTreeNode[] = [
  {
    tag: 'writing',
    label: '写作',
    children: [
      { tag: 'writing/daily', label: '日记' },
      { tag: 'writing/ideas', label: '灵感' },
    ],
  },
  { tag: 'archive', label: '归档' },
]

export function TagPanel() {
  return (
    <TagTree
      defaultExpandedTags={['writing']}
      nodes={nodes}
      onMenuAction={(action, tag) => {
        // action: 'rename' | 'delete'
        console.log(action, tag)
      }}
      onSelect={(tag) => console.log('选中', tag)}
    />
  )
}
```

不想要行内菜单?去掉 `onMenuAction` 即可;或显式声明 `variant="no-action"` 进入纯导航模式。

默认开启手风琴模式:展开一个子树时,自动折叠同级兄弟子树,树面板始终保持紧凑。
传 `accordion={false}` 可关闭,恢复各子树独立展开 / 折叠;选中标签的祖先链
始终强制展开,不受手风琴影响。再次点击已选中的节点,会切换它的展开 / 折叠状态
(与箭头按钮语义一致);叶子节点没有展开状态,点击仅触发选中。

### 渲染标签面包屑

```tsx
import { TagBread } from 'weimo-ui-tagtree/components/tag-bread'

// 层级超过 maxVisible(默认 4)时,中间层级自动收进省略号菜单
<TagBread
  tag="文学/古代/诗词/唐诗/李白/静夜思"
  onSelect={(tag) => console.log('跳转到', tag)}
/>
```

## 📖 组件 API

### `<TagTree />`

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `nodes` | `TagTreeNode[]` | 必填 | 树数据 |
| `variant` | `'default' \| 'no-action'` | `'default'` | `no-action` 为纯导航模式,不渲染操作菜单与占位 |
| `defaultExpandedTags` | `string[]` | `[]` | 初始展开的标签路径 |
| `expandedTags` | `string[]` | — | 受控展开状态 |
| `onExpandedTagsChange` | `(tags: string[]) => void` | — | 展开 / 收起时回调 |
| `selectedTag` | `string` | — | 受控选中标签 |
| `accordion` | `boolean` | `true` | 手风琴模式:展开一个子树时自动折叠同级兄弟子树 |
| `onSelect` | `(tag, node) => void` | — | 点击行时回调 |
| `onMenuAction` | `(action, tag, node) => void` | — | 菜单动作回调;传入后才会显示行菜单 |
| `additionalMenuItems` | `(tag, node) => ActionMenuItem[]` | — | 在内置项之前追加自定义菜单项 |
| `defaultIcon` | `ReactNode` | `#` 图标 | 未设置 `icon` 节点的兜底图标 |
| `emptyLabel` | `ReactNode` | `暂无标签` | 空状态文案 |

其余原生 `div` 属性(`className`、`aria-label` 等)均可透传。

`TagTreeNode` 类型:

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `tag` | `string` | 标签路径,同时充当唯一 ID,如 `writing/daily` |
| `label` | `string` | 显示名,缺省取路径最后一段 |
| `icon` | `ReactNode` | 节点图标 |
| `children` | `TagTreeNode[]` | 子节点 |
| `itemCount` | `number` | 条目计数,渲染在行尾折叠开关左侧,与开关同占位色;同树各行右对齐 |
| `menuEnabled` | `boolean` | 设为 `false` 单独关闭该行的操作菜单 |

### `<TagBread />`

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `tag` | `string` | 必填 | 标签路径,如 `文学/古代/诗词` |
| `onSelect` | `(tag: string) => void` | — | 点击中间层级或省略菜单时回调,参数为该层级的完整路径 |
| `prefix` | `ReactNode` | `#` 图标 | 首位图标 |
| `separator` | `ReactNode` | `/` | 层级分隔符 |
| `maxVisible` | `number` | `4` | 最多可见层级数,超出部分折叠进省略号菜单 |

### 其他入口

| 入口 | 导出 | 用途 |
| --- | --- | --- |
| `components/tag-tree-row` | `TagTreeRow` | 单行树节点,需要完全自管状态时使用 |
| `components/tag-tree-model` | `buildVisibleRows`、`toggleExpandedTag` 及类型 | headless 模型工具:树扁平化与展开状态运算 |
| `components/coss/*` | 面包屑 / 输入组 / 滚动区适配 | 标签组件依赖的基础适配层,一般无需直接使用 |

## 🧩 生态

`weimo-ui-tagtree` 是 weimo-ui 组件家族的一员,唯一的 UI 依赖是 [weimo-ui-core](https://github.com/jiaowenjun/weimo-ui-core) —— 它提供主题 token、菜单、胶囊框架与磨砂材质等基础设施。

## 🛠️ 本地开发

<details>
<summary>展开查看仓库脚本</summary>

```bash
pnpm install
pnpm verify    # 类型检查 + 测试 + 打包校验 + 文档站构建
pnpm site:dev  # 本地启动文档站
```

文档站位于 `site/`,推送 `main` 后由 GitHub Actions 自动构建部署到 GitHub Pages。

</details>

## 许可证

[MIT](./LICENSE)
