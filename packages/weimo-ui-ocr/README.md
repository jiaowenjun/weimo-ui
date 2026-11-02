# weimo-ui-ocr

OCR 场景的 React 卡片组件:上传待识别图片、展示识别结果、对照原图校对。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React 19](https://img.shields.io/badge/React-19-61dafb.svg)
[![在线演示](https://img.shields.io/badge/demo-GitHub_Pages-8957e5.svg)](https://jiaowenjun.github.io/weimo-ui/ocr/)

[在线演示](https://jiaowenjun.github.io/weimo-ui/ocr/)

## 简介

- **OcrCard** — OCR 结果卡:无识别结果时展示原图;有结果时文字编辑交给 [WdfCard](https://github.com/jiaowenjun/weimo-ui-editor),卡头菜单进入校对。
- **OcrComposer** — 「新建 OCR 任务」占位卡:选图 + 打标签,保存上抛 draft 交宿主执行识别。组件本身不做 OCR。
- **OcrDetail** — 校对对话框:左原图右文字,显示模式可切,标题与标签就地修改。
- **TagBar / TagPicker / EditableCapsule** — 标签栏套件,随本包自 weimo-ui monorepo card 包迁入。

markdown 是组件对外的内容接口;内部经 [weimo-wdf](https://www.npmjs.com/package/weimo-wdf) 的 `fromMarkdown`/`toMarkdown` 适配器与 WdfCard 的 WdfDocument 互转。超出 WDF v0.1 子集的 markdown(表格、链接、行内代码等)会降级为纯文本段落,内容不丢。

## ✨ 特性

- 文字编辑/渲染全由 WdfCard 承担(窄屏对话框、宽屏行内、动画转场)
- 对外 API 保持 markdown 字符串,与旧版(weimo-ui monorepo card 包)语义一致
- 亮暗主题、移动端适配、`prefers-reduced-motion` 全部继承家族组件

## 📦 安装

```bash
pnpm add weimo-ui-ocr
```

peer 依赖:`react`、`react-dom`、`weimo-ui-core`、`weimo-ui-editor`、`weimo-ui-image`、`weimo-ui-tagtree`、`weimo-wdf`。

包根不提供 `.` 导出,按组件显式引入:

```tsx
import { OcrCard } from 'weimo-ui-ocr/components/ocr-card'
import 'weimo-ui-ocr/styles/ocr-card.css'
```

样式零配置:每个组件入口自带 token 导入,闭包内样式自洽。

## 🚀 快速上手

### OcrCard

```tsx
import { OcrCard } from 'weimo-ui-ocr/components/ocr-card'
import 'weimo-ui-ocr/styles/ocr-card.css'

<OcrCard
  note={{
    createdAtText: '刚刚',
    imageSrc: '/scan.png',
    imageWidth: 640,
    imageHeight: 480,
    markdown: '## 识别结果\n\n- 第一行',
    tags: ['票据'],
  }}
  onSave={(draft) => console.log(draft.markdown, draft.tags)}
  tagOptions={['票据', '资料']}
/>
```

### OcrComposer

```tsx
import { OcrComposer } from 'weimo-ui-ocr/components/ocr-composer'
import 'weimo-ui-ocr/styles/ocr-composer.css'

<OcrComposer
  clientId="new-ocr"
  onFileChange={setFile}
  onSave={(draft) => runOcr(draft.file, draft.tags)}
  onTagsChange={setTags}
  tagOptions={['票据', '资料']}
  tags={tags}
/>
```

### OcrDetail

```tsx
import { OcrDetail } from 'weimo-ui-ocr/components/ocr-detail'
import 'weimo-ui-ocr/styles/ocr-detail.css'

<OcrDetail
  imageSrc="/scan.png"
  onChange={(markdown, draft) => { setMarkdown(markdown); setTitle(draft.title) }}
  onOpenChange={setOpen}
  open={open}
  tags={tags}
  title={title}
  value={markdown}
/>
```

## 📖 组件 API

| 入口 | 说明 |
| --- | --- |
| `weimo-ui-ocr/components/ocr-card` | `OcrCard`、`OcrCardNote`、`OcrCardDraft` 等 |
| `weimo-ui-ocr/components/ocr-composer` | `OcrComposer`、`OcrComposerDraft` 等 |
| `weimo-ui-ocr/components/ocr-detail` | `OcrDetail`、`OcrDetailDraft` 等 |
| `weimo-ui-ocr/components/tag-bar` | `TagBar` |
| `weimo-ui-ocr/components/tag-picker` | `TagPicker` |
| `weimo-ui-ocr/components/editable-capsule` | `EditableCapsule` |
| `weimo-ui-ocr/lib/markdown-bridge` | `markdownToDocument`、`documentToMarkdown` |

与旧版(weimo-ui monorepo card 包)的差异:

- 卡壳从旧 Card 换成 WdfCard,旧 markdown 图片渲染 props(`renderImage`/`resolveImageSrc`)移除——WDF v0.1 无图片块,原图始终经 ImageView 呈现
- 标题不再卡内编辑,移至校对对话框
- `OcrComposer` 的 `onViewTransitionEnd` 随新壳层移除

## 🧩 生态

基础组件(按钮、菜单、对话框、卡片表面、token)来自 [weimo-ui-core](https://github.com/jiaowenjun/weimo-ui-core);站点壳来自 [weimo-ui-template](https://github.com/jiaowenjun/weimo-ui-template)。

## 🛠️ 本地开发

<details>
<summary>展开</summary>

```bash
pnpm install
pnpm verify      # typecheck + test + 契约 + check:package + site build
pnpm site:dev    # http://localhost:4183/weimo-ui-ocr/
```

</details>

## 许可证

[MIT](./LICENSE)
