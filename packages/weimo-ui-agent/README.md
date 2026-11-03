# weimo-ui-agent

Agent 会话场景的 React 组件:输入、发送、停止,以及围绕它们的交互协议。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React 19](https://img.shields.io/badge/React-19-61dafb.svg)
[![在线演示](https://img.shields.io/badge/demo-GitHub_Pages-8957e5.svg)](https://jiaowenjun.github.io/weimo-ui/agent/)

[在线演示](https://jiaowenjun.github.io/weimo-ui/agent/)

## 简介

- **ConversationComposerZcode** — Agent 聊天输入框(zcode 血统):Enter 发送 / Shift+Enter 换行 / IME 安全,发送键三态(发送 → Spinner → Stop),提交返回值协议(业务层返回 `false` 草稿保留),`↑`/`↓` 历史翻阅,三个插槽(`topContent` / `leadingActions` / `submitControl`)。
- **ConversationComposerDsh** — Agent 聊天输入框(dsh 血统):事务化提交状态机(SubmitMachine,事件进/效果出)、异步受理结算(Host 接受才清空草稿,拒绝原样回归)、IME 三重守卫(`isComposing` + `keyCode 229` + compositionend 后 10ms 窗口)、queue/steer 双模式(busyEnter 偏好 + Ctrl/Cmd+Enter 加速反转 + 按钮诚实标签)、双击 Esc 停止、`/命令 ` claim 锁定与 QueueDock 排队消息(行内编辑/steer/删除)。

两个组件并列成对:同一输入场景的两种协议取舍——zcode 版是同步返回值协议的轻量实现,dsh 版是异步受理结算的事务化实现,按宿主复杂度选择。

## ✨ 特性

- 轻量 `textarea` 编辑器(无富文本依赖):zcode 版自动增高约 5 行;dsh 版地板 36px、上限 14 行
- zcode 版:`status` 单 prop 驱动发送键三态,`onSubmit` 返回 `false` 拒绝提交草稿保留
- dsh 版:`phase` 五相(plain/adjudicating/claimed/submitting/sending),frozen 事务中编辑器只读、seq 防陈旧回包
- 受控/非受控统一,DOM props 透传,亮暗主题、`prefers-reduced-motion` 继承家族 token

## 📦 安装

```bash
pnpm add weimo-ui-agent
```

peer 依赖:`react`、`react-dom`、`weimo-ui-core`。

包根不提供 `.` 导出,按组件显式引入:

```tsx
import { ConversationComposerZcode } from 'weimo-ui-agent/components/conversation-composer-zcode'
import 'weimo-ui-agent/styles/conversation-composer-zcode.css'
```

样式零配置:组件入口自带 token 导入,闭包内样式自洽。

## 🚀 快速上手

```tsx
import { useState } from 'react'
import { ConversationComposerZcode } from 'weimo-ui-agent/components/conversation-composer-zcode'
import 'weimo-ui-agent/styles/conversation-composer-zcode.css'

function Chat() {
  const [status, setStatus] = useState<'idle' | 'pending' | 'running'>('idle')

  return (
    <ConversationComposerZcode
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
| `weimo-ui-agent/components/conversation-composer` | `ConversationComposerZcode` 及其类型 |
| `weimo-ui-agent/styles/conversation-composer-zcode.css` | 组件样式 |
| `weimo-ui-agent/components/conversation-composer-dsh` | `ConversationComposerDsh`、`QueueDock`、`SubmitMachine` 及其类型 |
| `weimo-ui-agent/styles/conversation-composer-dsh.css` | 组件样式 |

### ConversationComposerZcode

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

### ConversationComposerDsh

| Prop | 说明 |
| --- | --- |
| `onSubmit` | `(draft, mode, attempt) => Promise<SubmitOutcome>`;resolve success 才清空草稿(异步受理结算) |
| `running` / `busyEnter` / `steeringAvailable` | queue/steer 三要素;Ctrl/Cmd+Enter 取偏好反面 |
| `commands` | slash 命令目录;草稿出现完整 token(如 `/model `)即 claim 锁定,Enter 执行 `run(args)` |
| `queue` / `onQueueAction` | QueueDock 排队消息数据与 edit/remove/steer 动作 |
| `onStop` | 双击 Esc(500ms 窗口)或 Stop 按钮的停止通道 |
| `leadingActions` / `trailingActions` | 插槽:工具行 + 按钮两侧 |

提交面类型(`SubmitMachine`/`InputEvent`/`InputEffect`/`SubmitAttempt` 等)均从入口导出,可对状态机直接单测。

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
