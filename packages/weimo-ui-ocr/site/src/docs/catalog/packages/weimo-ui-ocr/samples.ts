export const sampleOcrImage = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
  <rect width="640" height="480" fill="#f8fafc"/>
  <rect x="88" y="68" width="464" height="344" rx="18" fill="#fff" stroke="#d4d4d8" stroke-width="2"/>
  <rect x="136" y="124" width="210" height="18" rx="9" fill="#18181b"/>
  <rect x="136" y="178" width="368" height="12" rx="6" fill="#a1a1aa"/>
  <rect x="136" y="212" width="320" height="12" rx="6" fill="#d4d4d8"/>
  <rect x="136" y="246" width="384" height="12" rx="6" fill="#d4d4d8"/>
  <rect x="136" y="306" width="152" height="64" rx="10" fill="#eef2ff"/>
</svg>
`)}`

/** WDF v0.1 可表达的 markdown 子集:标题/段落/列表/加粗(无表格等)。 */
export const sampleOcrMarkdown = [
  '## OCR 识别结果',
  '',
  '**编号** INV-2026-0708',
  '',
  '**金额** 128.00',
  '',
  '- 支持 markdown 渲染',
  '- 可切换查看原始图片',
].join('\n')

export const ocrTagOptions = ['OCR', '扫描件', '票据', '待校对', '资料']
