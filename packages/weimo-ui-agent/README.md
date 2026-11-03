# weimo-ui-agent

Agent 会话场景的 React 组件:输入、发送、停止,以及围绕它们的交互协议。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React 19](https://img.shields.io/badge/React-19-61dafb.svg)
[![在线演示](https://img.shields.io/badge/demo-GitHub_Pages-8957e5.svg)](https://jiaowenjun.github.io/weimo-ui/agent/)

[在线演示](https://jiaowenjun.github.io/weimo-ui/agent/)

## 简介

- **ConversationComposer** — Agent 聊天输入框:Enter 发送 / Shift+Enter 换行 / IME 安全,发送键三态(发送 → Spinner → Stop),提交返回值协议(业务层返回 `false` 草稿保留),`↑`/`↓` 历史翻阅,三个插槽(`topContent` / `leadingActions` / `submitControl`)留给附件、模式切换与模型选择。

交互协议抽象自 ZCode 桌面客户端的 composer 实现,去协议化后成为纯 props 驱动的可复用组件。

## ✨ 特性

- 轻量 `textarea` 编辑器(无富文本依赖),自动增高约 5 行后转滚动
- `status` 单 prop 驱动发送键三态:`idle` / `pending`(Spinner)/ `running`(空草稿时变 Stop,`Esc` 亦可停止)
- 提交返回值协议:`onSubmit` 返回 `false` 拒绝提交,草稿保留不清空
- 受控/非受控统一,DOM props 透传,亮暗主题、`prefers-reduced-motion` 继承家族 token

## 📦 安装

```bash
pnpm add weimo-ui-agent
```

peer 依赖:`react`、`react-dom`、`weimo-ui-core`。

包根不提供 `.` 导出,按组件显式引入:

```tsx
import { ConversationComposer } from 'weimo-ui-agent/components/conversation-composer'
import 'weimo-ui-agent/styles/conversation-composer.css'
```

样式零配置:组件入口自带 token 导入,闭包内样式自洽。

## 🚀 快速上手

```tsx
import { useState } from 'react'
import { ConversationComposer } from 'weimo-ui-agent/components/conversation-composer'
import 'weimo-ui-agent/styles/conversation-composer.css'

function Chat() {
  const [status, setStatus] = useState<'idle' | 'pending' | 'running'>('idle')

  return (
    <ConversationComposer
      onStop={() => stopAgent()}
      onSubmit={(text) => {
        if (!text.trim()) return false // 草稿保留
        sendToAgent(text) // 异步受理
        setStatus('pending')
      }}
      placeholder="给 Agent 发消息…"
      status={status}
    />
  )
}
```

## 📖 组件 API

| 入口 | 说明 |
| --- | --- |
| `weimo-ui-agent/components/conversation-composer` | `ConversationComposer` 及其类型 |
| `weimo-ui-agent/styles/conversation-composer.css` | 组件样式 |

### ConversationComposer

| Prop | 说明 |
| --- | --- |
| `value` / `defaultValue` / `onChange` | 受控优先的文本态 |
| `onSubmit` | `(text) => boolean \| void`;返回 `false` 拒绝提交、草稿保留 |
| `onStop` | `status='running'` 的停止通道(Stop 按钮 / `Esc`) |
| `status` | `'idle' \| 'pending' \| 'running'`,驱动发送键三态 |
| `enterSubmits` / `allowSubmitWhenEmpty` | Enter 语义与空提交门禁 |
| `promptHistory` | 外部历史(旧→新),与本地提交记录合并供 `↑`/`↓` 翻阅 |
| `topContent` / `leadingActions` / `submitControl` | 插槽:输入区上方整行 / 底部左侧工具区 / 提交区整体替换 |
| `disabled` / `disabledReason` / `placeholder` | 常规态控制 |

其余 props 透传到根 `form` 元素。

## 🧩 生态

基础组件与设计 token 来自 [weimo-ui-core](https://github.com/jiaowenjun/weimo-ui);站点壳来自 [weimo-ui-template](https://github.com/jiaowenjun/weimo-ui)。

## 🛠️ 本地开发

<details>
<summary>展开</summary>

```bash
pnpm install
pnpm verify      # typecheck + test + 契约 + check:package + site build
pnpm site:dev    # http://localhost:4184/weimo-ui/agent/
```

</details>

## 许可证

[MIT](./LICENSE)
