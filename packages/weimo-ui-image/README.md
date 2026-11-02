# weimo-ui-image

> 一块可拖拽查看的图片视图,一条粘贴即传的上传通道,一键把白底图变透明。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![在线演示](https://img.shields.io/badge/%E5%9C%A8%E7%BA%BF%E6%BC%94%E7%A4%BA-GitHub%20Pages-2ea44f.svg)](https://jiaowenjun.github.io/weimo-ui/image/)

**[🚀 打开在线演示,亲手点点看 →](https://jiaowenjun.github.io/weimo-ui/image/)**

如果你在做 OCR 应用、素材管理器、笔记附件,需要「上传 → 预览 → 细看」的图片链路,`weimo-ui-image` 就是为你准备的:

- **`ImageView` 图片视图** —— 三种展示模式(适应宽度 / 适应高度 / 100%),支持拖拽平移、非图片占位与原图详情弹层;
- **`ImageUploader` 图片上传** —— 文件选择、拖放、剪贴板粘贴三通道合一,自带本地预览与受控操作 API;
- **`CanvasTransparency` 画布透明化** —— 按背景色采样把白底示意图转成透明 PNG,暗色主题下自动切换深色前景版本,结果带 LRU 缓存。

组件基于 React 19 构建,弹层、菜单与按钮等基础件来自 [weimo-ui-core](https://github.com/jiaowenjun/weimo-ui-core) 设计系统,深浅色主题自动适配。

## ✨ 特性

- **展示模式可切换** —— `fit-width` / `fit-height` / `actual-size` 三模式,配套 `ImageViewDisplayModeMenu` 单选菜单直接可用
- **细节不放过** —— 拖拽平移查看大图,「查看原图」弹出 ActionDialog 详情层
- **上传协议归调用方** —— 组件只管本地文件对象与预览,上传、远端存储与 URL 持久化由你决定
- **粘贴即上传** —— 监听剪贴板图片并生成 `File`,来源标记为「来自剪贴板」
- **透明化开箱即用** —— 采样背景色 + 容差 + 羽化,亮暗双份产物按主题切换,32 条 LRU 缓存
- **按需引入** —— 显式子路径导出、tree-shaking 友好,组件结构样式随导入自动加载,只需在应用入口引入一次主题 token

## 📦 安装

```bash
pnpm add weimo-ui-image weimo-ui-core @base-ui/react react react-dom
```

- `weimo-ui-image@0.1.x` 搭配 `weimo-ui-core@0.1.x` 使用;弹层与菜单依赖 core 的对等依赖 `@base-ui/react`。
- 包根不提供 `.` 导出,所有组件通过显式子路径引入。

样式零配置:引入任意组件子路径,组件 JS 会一并加载自身结构样式与
`weimo-ui-core/styles/tokens.css` 主题 token(含 `.dark` 暗色覆盖),无需在应用
入口手动引入任何 CSS。显式引入 core tokens.css 仍然无害,定义幂等;定制主题在
自有 CSS 中覆盖对应变量即可。

## 🚀 快速上手

### 渲染图片视图

```tsx
import { ImageView } from 'weimo-ui-image/components/image-view'

<ImageView
  alt="OCR 源文档"
  src={imageUrl}
  imageWidth={640}
  imageHeight={480}
/>
```

留空 `src` 显示占位;传入非图片地址显示「非图片」占位。需要模式切换时搭配:

```tsx
import {
  ImageViewDisplayModeMenu,
  type ImageViewDisplayMode,
} from 'weimo-ui-image/components/image-view'
```

### 接管上传

```tsx
import { useState } from 'react'
import { ImageUploader, type ImageUploaderActionApi } from 'weimo-ui-image/components/image-uploader'

export function UploadPanel() {
  const [file, setFile] = useState<File | null>(null)
  const [actions, setActions] = useState<ImageUploaderActionApi | null>(null)

  return (
    <ImageUploader
      file={file}
      onActionsChange={setActions}
      onCheck={() => upload(file)}
      onFileChange={setFile}
    />
  )
}
```

`actions` 暴露 `select()` / `paste()` / `close()` / `check()` 与 `hasFile` / `canCheck` / `canPasteClipboardImage`,适合把操作按钮放到组件外部。

### 白底图透明化

```tsx
import { CanvasTransparency } from 'weimo-ui-image/components/canvas-transparency'

<CanvasTransparency alt="几何示意图" src={diagramUrl} tolerance={18} feather={42} />
```

处理中的加载/就绪/错误状态通过 `onStateChange` 回调暴露;缓存 API 见 `components/canvas-transparency-cache`。

## 📖 组件 API

### `<ImageView />`

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | — | 图片地址;缺省显示 `placeholder` |
| `alt` | `string` | `''` | 图片描述 |
| `displayMode` | `'fit-width' \| 'fit-height' \| 'actual-size'` | `'fit-width'` | 展示模式 |
| `imageWidth` / `imageHeight` | `number` | — | 原始尺寸,用于占位与比例 |
| `objectFit` | `'contain' \| 'cover'` | — | 图片填充方式 |
| `open` | `boolean` | — | 受控打开原图详情弹层 |
| `placeholder` | `ReactNode` | `'No image selected'` | 无图占位内容 |

其余原生 `figure` 属性(`className`、`aria-label` 等)均可透传。

### `<ImageUploader />`

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `file` | `File \| null` | — | 受控文件对象 |
| `onFileChange` | `(file: File \| null) => void` | 必填 | 文件变化回调 |
| `onActionsChange` | `(actions: ImageUploaderActionApi) => void` | — | 操作 API 变化回调 |
| `onCheck` | `() => void` | — | 「确认」回调,传入后显示确认按钮 |
| `title` / `description` | `ReactNode` | `上传图片` / `拖放、选择或粘贴图片` | 面板文案 |
| `clipboardSourceLabel` | `string` | `来自剪贴板` | 粘贴文件的来源标记 |
| `inputProps` | 原生 `input` 属性 | — | 透传给隐藏的文件输入(`type`、`onChange` 除外) |
| `panelClassName` | `string` | — | 面板定制类名,消费方样式落在此自有类名上 |

### `<CanvasTransparency />`

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | 必填 | 源图片地址 |
| `alt` | `string` | 必填 | 图片描述 |
| `tolerance` | `number` | `18` | 背景色容差 |
| `feather` | `number` | `42` | 边缘羽化半径 |
| `onStateChange` | `(state: CanvasTransparencyState) => void` | — | `loading` / `ready` / `error` 状态回调 |

### 其他入口

| 入口 | 导出 | 用途 |
| --- | --- | --- |
| `components/canvas-transparency-cache` | 缓存获取 / 复用 / 释放 API | 直接消费或预热透明化结果 |
| `styles/image-view.css` / `styles/image-uploader.css` | 组件样式 | 非组件场景单独引入样式 |

## 🧩 生态

`weimo-ui-image` 是 weimo-ui 组件家族的一员,唯一的 UI 依赖是 [weimo-ui-core](https://github.com/jiaowenjun/weimo-ui-core) —— 它提供主题 token、对话框、菜单与按钮。上传协议、远端存储与 URL 持久化属于调用方职责。

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
