import assert from 'node:assert/strict'
import { execFileSync, spawn } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import http from 'node:http'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

const nodeBinDir = dirname(process.execPath)
const packageManagerCli = process.env.npm_execpath
const packageManagerName = process.env.npm_config_user_agent?.split('/')[0]
const packageRunnerCommand = packageManagerCli ? process.execPath : 'pnpm'
const packageRunnerArgsPrefix = packageManagerCli ? [packageManagerCli] : []
const root = new URL('..', import.meta.url)
const workspacePackageJson = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'))
const env = {
  ...process.env,
  PATH: `${nodeBinDir}:${process.env.PATH}`,
}

assert.ok(packageManagerCli || packageRunnerCommand === 'pnpm', 'registry smoke test must be run through a package manager.')

function packageRunnerArgs(command, args) {
  if (command === 'dlx' && packageManagerName === 'npm') {
    const npmPackageArgs = args[0].startsWith('shadcn@')
      ? ['--package', args[0], '--package', 'ajv-formats']
      : ['--package', args[0]]

    return [...packageRunnerArgsPrefix, 'exec', '--yes', ...npmPackageArgs, '--', args[0].split('@')[0], ...args.slice(1)]
  }

  if (command === 'exec') {
    return [...packageRunnerArgsPrefix, 'exec', '--', ...args]
  }

  return [...packageRunnerArgsPrefix, command, ...args]
}

function buildRegistry(outputDir) {
  execFileSync(
    packageRunnerCommand,
    packageRunnerArgs('dlx', [
      'shadcn@latest',
      'build',
      'registry.json',
      '--output',
      outputDir,
    ]),
    {
      cwd: root,
      env,
      stdio: 'pipe',
    },
  )
}

function writeConsumerProject(consumerDir, registryUrl) {
  mkdirSync(join(consumerDir, 'src'), { recursive: true })
  writeFileSync(
    join(consumerDir, 'package.json'),
    JSON.stringify(
      {
        name: 'weimo-registry-smoke-consumer',
        type: 'module',
        packageManager: workspacePackageJson.packageManager,
        dependencies: {
          '@base-ui/react': '^1.5.0',
          '@tiptap/core': '^3.20.5',
          '@tiptap/pm': '^3.20.5',
          '@tiptap/extension-mathematics': '^3.20.5',
          '@tiptap/extension-placeholder': '^3.20.5',
          '@tiptap/extension-table': '^3.20.5',
          '@tiptap/extension-table-cell': '^3.20.5',
          '@tiptap/extension-table-header': '^3.20.5',
          '@tiptap/extension-table-row': '^3.20.5',
          '@tiptap/extension-task-item': '^3.20.5',
          '@tiptap/extension-task-list': '^3.20.5',
          '@tiptap/markdown': '^3.20.5',
          '@tiptap/react': '^3.20.5',
          '@tiptap/starter-kit': '^3.20.5',
          'class-variance-authority': '^0.7.1',
          katex: '^0.16.43',
          'lucide-react': '^0.555.0',
          'remark-parse': '^11.0.0',
          'remark-stringify': '^11.0.0',
          unified: '^11.0.0',
          react: '^19.0.0',
          'react-dom': '^19.0.0',
        },
        devDependencies: {
          '@types/react': '^19.0.0',
          '@types/react-dom': '^19.0.0',
          tailwindcss: '^4.0.0',
          typescript: '^6.0.0',
          vite: '^8.0.0',
        },
      },
      null,
      2,
    ),
  )
  writeFileSync(
    join(consumerDir, 'components.json'),
    JSON.stringify(
      {
        $schema: 'https://ui.shadcn.com/schema.json',
        style: 'default',
        tailwind: {
          config: '',
          css: 'src/index.css',
          baseColor: 'neutral',
          cssVariables: true,
        },
        rsc: false,
        tsx: true,
        aliases: {
          components: '@/components',
          utils: '@/lib/utils',
          ui: '@/components/ui',
          lib: '@/lib',
          hooks: '@/hooks',
        },
        registries: {
          '@weimo': registryUrl,
        },
      },
      null,
      2,
    ),
  )
  writeFileSync(
    join(consumerDir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'Bundler',
          jsx: 'react-jsx',
          strict: true,
          types: ['vite/client'],
          skipLibCheck: true,
          ignoreDeprecations: '6.0',
          baseUrl: '.',
          paths: {
            '@/*': ['./src/*'],
          },
        },
        include: ['src'],
      },
      null,
      2,
    ),
  )
  writeFileSync(
    join(consumerDir, 'vite.config.ts'),
    'import { defineConfig } from "vite"\nexport default defineConfig({})\n',
  )
  writeFileSync(
    join(consumerDir, 'src/index.css'),
    '@import "tailwindcss";\n\n:root {}\n\n.dark {}\n\n@theme inline {}\n',
  )
  writeFileSync(
    join(consumerDir, 'src/contract.tsx'),
    `import { useState } from "react"
import { PanelLeft } from "lucide-react"
import { Card } from "@/components/ui/card"
import { CanvasTransparency } from "@/components/ui/canvas-transparency"
import { ImageUploader } from "@/components/ui/image-uploader"
import { OcrComposer } from "@/components/ui/ocr-composer"
import { OcrCard } from "@/components/ui/ocr-card"
import { TopBar } from "@/components/ui/top-bar"
import { GlassIconButton } from "@/components/ui/glass-icon-button"
import { GhostIconButton } from "@/components/ui/ghost-icon-button"
import { TextButton } from "@/components/ui/text-button"
	import {
	  ActionMenu,
	  Menu,
	  MenuItem,
	  MenuPopup,
  MenuShortcut,
  MenuTrigger,
} from "@/components/ui/menu"
import { SideBar, SideBarShell } from "@/components/ui/sidebar"
import { Heatmap } from "@/components/ui/heatmap"
import { HeatColor } from "@/components/ui/heat-color"
import { bgBlurTones, getBgBlurClassName } from "@/components/ui/bg-blur"
import { bgColorTones, getBgColorClassName } from "@/components/ui/bg-color"
import { pressableTones, getPressableClassName } from "@/components/ui/pressable"
import { textColorTones, getTextColorClassName } from "@/components/ui/text-color"
import { borderColorTones, getBorderColorClassName } from "@/components/ui/border-color"
import { borderRadiusScales, getBorderRadiusToken } from "@/components/ui/border-radius"
import { fontSizeScales, getFontSizeClassName } from "@/components/ui/font-size"
import { TokenPreviewCard } from "@/components/ui/token-preview-card"
import { TagTree } from "@/components/ui/tag-tree"
import { StatGroup } from "@/components/ui/stat-group"
import { TagPicker, type TagPickerApplyPayload } from "@/components/ui/tag-picker"
import { TagBread } from "@/components/ui/tag-bread"
import { ImageView, ImageViewDisplayModeMenu, type ImageViewDisplayMode } from "@/components/ui/image-view"
import { GlassSurface } from "@/components/ui/glass-surface"
import { FloatBar } from "@/components/ui/float-bar"
import { BottomBar } from "@/components/ui/bottom-bar"
import { CardTopBar } from "@/components/ui/card-top-bar"
import { ModeButton, type ModeButtonMode } from "@/components/ui/mode-button"
import { CardToolBar } from "@/components/ui/card-tool-bar"
import { ActionDialog } from "@/components/ui/action-dialog"
import { TagTreeRow, type TagTreeRowProps } from "@/components/ui/tag-tree-row"
import { Chip } from "@/components/ui/chip"
import { ChipButton, type ChipButtonState } from "@/components/ui/chip-button"
import { TagBar } from "@/components/ui/tag-bar"
import { MdEditor } from "@/components/ui/md-editor"
import { MdRender } from "@/components/ui/md-render"
import { MdView } from "@/components/ui/md-view"
import { MathEditor, type MathEditorValue } from "@/components/ui/math-editor"

function formatWordCountMetric(wordCount: number) {
  if (wordCount < 1000) return { value: String(wordCount), label: "字" }
  if (wordCount < 10000) return { value: (wordCount / 1000).toFixed(1), label: "千字" }
  return { value: (wordCount / 10000).toFixed(1), label: "万字" }
}

function handleTagPickerApply(payload: TagPickerApplyPayload) {
  return payload.selectedTags
}

const invoicePreviewFile = new File(
  [
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 240'><rect width='320' height='240' fill='#f8fafc'/><text x='32' y='96' font-size='28'>Invoice</text></svg>",
  ],
  "invoice-scan.svg",
  { type: "image/svg+xml" },
)

export function RegistryConsumerContract() {
  const [editableNote, setEditableNote] = useState({
    content: "## Editable\\n\\n正文 **粗体**",
    createdAtText: "今天 14:06",
    tags: ["Tag", "Editable"],
  })
  const wordMetric = formatWordCountMetric(12345)
  const mode: ModeButtonMode = "display"
  const chipState: ChipButtonState = "glass"
  const bgBlurClassName = getBgBlurClassName(bgBlurTones[0])
  const bgColorClassName = getBgColorClassName(bgColorTones[0])
  const pressableClassName = getPressableClassName(pressableTones[0])
  const textColorClassName = getTextColorClassName(textColorTones[0])
  const borderColorClassName = getBorderColorClassName(borderColorTones[0])
  const borderRadiusToken = getBorderRadiusToken(borderRadiusScales[0])
  const fontSizeClassName = getFontSizeClassName(fontSizeScales[0])
  const [imageDisplayMode, setImageDisplayMode] = useState<ImageViewDisplayMode>("fit-width")
  const mathDialog: MathEditorValue | null = null
  const sampleRow: TagTreeRowProps["row"] = {
    node: { tag: "writing/poetry" },
    tag: "writing/poetry",
    label: "poetry",
    depth: 1,
    hasChildren: false,
    expanded: false,
    selected: false,
  }

  return (
    <>
      <Card
        note={editableNote}
        onSave={(draft) => {
          setEditableNote((current) => ({
            ...current,
            content: draft.content,
            tags: draft.tags,
          }))
        }}
        tagOptions={["Tag", "Editable", "Work"]}
      />
      <CanvasTransparency
        alt="Transparent geometry"
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 240'%3E%3Crect width='320' height='240' fill='white'/%3E%3Ccircle cx='160' cy='120' r='80' fill='none' stroke='black'/%3E%3C/svg%3E"
      />
      <ImageUploader
        file={invoicePreviewFile}
        onFileChange={() => {}}
      />
      <OcrComposer
        clientId="registry-ocr-composer"
        file={invoicePreviewFile}
        onFileChange={() => {}}
        onSave={() => {}}
      />
      <OcrCard
        note={{
          createdAtText: "OCR 图片",
          imageHeight: 240,
          imageSrc: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 240'%3E%3Crect width='320' height='240' fill='%23f8fafc'/%3E%3Ctext x='32' y='96' font-size='28'%3EOCR Card%3C/text%3E%3C/svg%3E",
          imageWidth: 320,
          markdown: "## OCR Card\\n\\n识别出的 **markdown** 内容",
          tags: ["OCR", "扫描件"],
        }}
        onSave={() => {}}
        tagOptions={["OCR", "扫描件", "票据"]}
      />
      <ImageView
        imageHeight={240}
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 240'%3E%3Crect width='320' height='240' fill='%23f8fafc'/%3E%3Ctext x='32' y='96' font-size='28'%3EImage%3C/text%3E%3C/svg%3E"
        imageWidth={320}
      />
      <ImageViewDisplayModeMenu
        displayMode={imageDisplayMode}
        onDisplayModeChange={setImageDisplayMode}
      />
      <ImageView
        displayMode={imageDisplayMode}
        open
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 240'%3E%3Crect width='320' height='240' fill='%23f8fafc'/%3E%3Ctext x='32' y='96' font-size='28'%3EDetail View%3C/text%3E%3C/svg%3E"
      />
      <GlassSurface>Glass surface</GlassSurface>
      <FloatBar leftSlot={<span>Left</span>} centerSlot={<span>Center</span>} rightSlot={<span>Right</span>} />
      <BottomBar leftSlot={<span>Draft</span>} rightSlot={<button type="button">Save</button>} />
      <CardTopBar mode="display" createdAtText="今天 14:06" onAction={() => {}} />
      <ModeButton mode={mode} onModeChange={() => {}} />
      <TextButton disabled={false}>Text button</TextButton>
      <CardToolBar onSave={() => {}} toolbarSlot={<span>Toolbar</span>} />
      <ActionDialog open={false} onOpenChange={() => {}} title="Dialog">Body</ActionDialog>
      <TagTreeRow
        row={sampleRow}
        rowMenuEnabled={false}
        variant="no-action"
        onSelect={() => {}}
        onToggle={() => {}}
      />
      <Chip content="Chip" prefix="#" />
      <ChipButton state={chipState}>Chip button</ChipButton>
      <TagBar tags={["Tag"]} />
      <MdRender content={"## Render\\n\\ncontent"} />
      <MdEditor value={"## Editor"} onChange={() => {}} />
      <MdView mode="view" value={"## View"} />
      <MathEditor dialog={mathDialog} onOpenChange={() => {}} onSave={() => {}} />
      <GlassIconButton aria-label="Open">
        <PanelLeft />
      </GlassIconButton>
      <StatGroup
        items={[
          { key: "notes", value: "128", label: "笔记" },
          { key: "words", value: wordMetric.value, label: wordMetric.label },
          { key: "days", value: "36", label: "天" },
        ]}
      />
      <Heatmap
        activeDate="2026-06-16"
        dailyCounts={[
          { date: "2026-06-15", count: 1 },
          { date: "2026-06-16", count: 3 },
        ]}
        onDateSelect={() => {}}
      />
      <HeatColor ariaLabel="Contract heat colors" />
      <span className={bgBlurClassName}>BgBlur utility</span>
      <span className={bgColorClassName}>Bg color utility</span>
      <span className={pressableClassName}>Pressable utility</span>
      <span className={textColorClassName}>Text color utility</span>
      <span className={borderColorClassName}>Border color utility</span>
      <span data-contract="border-radius">{borderRadiusToken}</span>
      <span className={fontSizeClassName}>Font size utility</span>
      <TokenPreviewCard label="Radius" token="--radius" value="16px">
        <span>Token preview</span>
      </TokenPreviewCard>
      <TagPicker
        mode="insert"
        onApply={handleTagPickerApply}
        onOpenChange={() => {}}
        open={false}
        selectedTags={["写作/日记"]}
        tagOptions={["工作/项目", "写作/日记", "研究/论文"]}
      />
      <TagBread
        tag="文学/古代/诗词"
        onSelect={() => {}}
      />
      <Menu>
        <MenuTrigger render={<GhostIconButton aria-label="More actions" />}>
          <PanelLeft />
        </MenuTrigger>
        <MenuPopup align="end" sideOffset={6}>
          <MenuItem>
            Open
            <MenuShortcut>⌘O</MenuShortcut>
          </MenuItem>
        </MenuPopup>
	      </Menu>
	      <ActionMenu
	        ariaLabel="More actions"
	        items={[
	          {
	            key: "open",
	            label: "Open",
	            shortcut: "⌘O",
	          },
	        ]}
	        triggerProps={{
	          render: <GhostIconButton aria-label="More actions" />,
	        }}
	      />
	      <TagTree
        defaultExpandedTags={["design"]}
        nodes={[
          {
            tag: "design",
            label: "设计",
            children: [{ tag: "design/ui", label: "UI" }],
          },
        ]}
        onMenuAction={() => {}}
        onSelect={() => {}}
        selectedTag="design/ui"
      />
      <TopBar
        className="topbar-extra"
        leftSlot={
          <GlassIconButton aria-label="Open navigation">
            <PanelLeft />
          </GlassIconButton>
        }
        rightSlot={
          <GlassIconButton aria-label="Search">
            <PanelLeft />
          </GlassIconButton>
        }
      />
      <SideBar open={false} onClose={() => {}} className="sidebar-extra">
        <nav aria-label="Sidebar">
          <a href="#card">Card</a>
        </nav>
      </SideBar>
      <SideBarShell open={false} onClose={() => {}} showCloseButton>
        <div>Custom sidebar content</div>
      </SideBarShell>
    </>
  )
}
`,
  )
}

function startRegistryServer(registryDir, hits) {
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url ?? '/', 'http://127.0.0.1').pathname
    const filename = decodeURIComponent(pathname).replace(/^\/+/, '') || 'registry.json'

    hits.push(filename)

    try {
      const body = readFileSync(join(registryDir, filename))

      res.writeHead(200, {
        'content-type': 'application/json',
        connection: 'close',
      })
      res.end(body)
    } catch {
      res.writeHead(404, { connection: 'close' })
      res.end('not found')
    }
  })

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server))
  })
}

function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error)
      else resolve()
    })
  })
}

function runShadcnAdd(consumerDir, itemAddress) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      packageRunnerCommand,
      packageRunnerArgs('dlx', ['shadcn@latest', 'add', itemAddress, '-y', '--silent']),
      {
        cwd: consumerDir,
        env,
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    )
    let stdout = ''
    let stderr = ''
    let didTimeout = false

    child.stdout.on('data', (chunk) => {
      stdout += chunk
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })

    const timeout = setTimeout(() => {
      didTimeout = true
      child.kill('SIGTERM')
    }, 45_000)

    child.on('error', (error) => {
      clearTimeout(timeout)
      reject(error)
    })
    child.on('close', (code) => {
      clearTimeout(timeout)

      if (didTimeout) {
        reject(new Error(`shadcn add timed out.\nstdout:\n${stdout}\nstderr:\n${stderr}`))
        return
      }

      if (code !== 0) {
        reject(new Error(`shadcn add failed with ${code}.\nstdout:\n${stdout}\nstderr:\n${stderr}`))
        return
      }

      resolve({ stdout, stderr })
    })
  })
}

function runConsumerTypecheck(consumerDir) {
  execFileSync(packageRunnerCommand, packageRunnerArgs('exec', ['tsc', '--noEmit']), {
    cwd: consumerDir,
    env,
    stdio: 'pipe',
  })
}

const tempDir = mkdtempSync(join(tmpdir(), 'weimo-registry-smoke-'))
const registryDir = join(tempDir, 'registry')
const consumerDir = join(tempDir, 'consumer')
const hits = []
let server

try {
  buildRegistry(registryDir)
  server = await startRegistryServer(registryDir, hits)
  const { port } = server.address()
  writeConsumerProject(consumerDir, `http://127.0.0.1:${port}/{name}.json`)

  await runShadcnAdd(consumerDir, '@weimo/card')
  await runShadcnAdd(consumerDir, '@weimo/canvas-transparency')
  await runShadcnAdd(consumerDir, '@weimo/image-uploader')
  await runShadcnAdd(consumerDir, '@weimo/ocr-composer')
  await runShadcnAdd(consumerDir, '@weimo/ocr-card')
  await runShadcnAdd(consumerDir, '@weimo/glass-icon-button')
  await runShadcnAdd(consumerDir, '@weimo/ghost-icon-button')
  await runShadcnAdd(consumerDir, '@weimo/text-button')
  await runShadcnAdd(consumerDir, '@weimo/tag-picker')
  await runShadcnAdd(consumerDir, '@weimo/tag-bread')
  await runShadcnAdd(consumerDir, '@weimo/stat-group')
  await runShadcnAdd(consumerDir, '@weimo/heatmap')
  await runShadcnAdd(consumerDir, '@weimo/heat-color')
  await runShadcnAdd(consumerDir, '@weimo/bg-blur')
  await runShadcnAdd(consumerDir, '@weimo/bg-color')
  await runShadcnAdd(consumerDir, '@weimo/pressable')
  await runShadcnAdd(consumerDir, '@weimo/text-color')
  await runShadcnAdd(consumerDir, '@weimo/border-color')
  await runShadcnAdd(consumerDir, '@weimo/border-radius')
  await runShadcnAdd(consumerDir, '@weimo/font-size')
  await runShadcnAdd(consumerDir, '@weimo/token-preview-card')
  await runShadcnAdd(consumerDir, '@weimo/top-bar')
  await runShadcnAdd(consumerDir, '@weimo/sidebar')
  await runShadcnAdd(consumerDir, '@weimo/menu')
  await runShadcnAdd(consumerDir, '@weimo/tag-tree')
  for (const item of [
    '@weimo/image-view',
    '@weimo/glass-surface',
    '@weimo/float-bar',
    '@weimo/bottom-bar',
    '@weimo/card-top-bar',
    '@weimo/mode-button',
    '@weimo/card-tool-bar',
    '@weimo/action-dialog',
    '@weimo/tag-tree-row',
    '@weimo/chip',
    '@weimo/chip-button',
    '@weimo/tag-bar',
    '@weimo/md-editor',
    '@weimo/md-render',
    '@weimo/md-view',
    '@weimo/math-editor',
  ]) {
    await runShadcnAdd(consumerDir, item)
  }

  assert.ok(
    !hits.includes('editable-card.json'),
    'Smoke test must not install the removed EditableCard item through the local @weimo registry.',
  )
  assert.ok(
    hits.includes('card.json'),
    'Smoke test must install the requested Card item through the local @weimo registry.',
  )
  assert.ok(
    hits.includes('canvas-transparency.json'),
    'Smoke test must install the requested CanvasTransparency item through the local @weimo registry.',
  )
  assert.ok(
    hits.includes('image-uploader.json'),
    'Smoke test must install the requested ImageUploader item through the local @weimo registry.',
  )
  assert.ok(
    hits.includes('ocr-composer.json'),
    'Smoke test must install the requested OcrComposer item through the local @weimo registry.',
  )
  assert.ok(
    hits.includes('ocr-card.json'),
    'Smoke test must install the requested OcrCard item through the local @weimo registry.',
  )
  for (const file of [
    'image-view.json',
    'md-render.json',
    'chip-button.json',
    'md-editor.json',
    'glass-surface.json',
    'float-bar.json',
    'bottom-bar.json',
    'card-top-bar.json',
    'mode-button.json',
    'card-tool-bar.json',
    'action-dialog.json',
    'tag-tree-row.json',
    'chip.json',
    'tag-bar.json',
    'ocr-detail.json',
    'md-view.json',
    'math-editor.json',
  ]) {
    assert.ok(hits.includes(file), `Smoke test must install ${file} through the local @weimo registry.`)
  }
  assert.ok(
    hits.includes('tag-picker.json'),
    'Smoke test must install the explicitly requested TagPicker item through the local @weimo registry.',
  )
  assert.ok(
    hits.includes('tag-bread.json'),
    'Smoke test must install the explicitly requested TagBread item through the local @weimo registry.',
  )
  assert.ok(
    !hits.includes('tag-edit-bar.json'),
    'Smoke test must not install the removed TagEditBar item through the local @weimo registry.',
  )
  assert.ok(
    hits.includes('stat-group.json'),
    'Smoke test must install the explicitly requested StatGroup item through the local @weimo registry.',
  )
  assert.ok(
    hits.includes('heatmap.json'),
    'Smoke test must install the explicitly requested Heatmap item through the local @weimo registry.',
  )
  assert.ok(
    hits.includes('heat-color.json'),
    'Smoke test must install the explicitly requested HeatColor item through the local @weimo registry.',
  )
  assert.ok(
    hits.includes('bg-blur.json'),
    'Smoke test must install the explicitly requested BgBlur item through the local @weimo registry.',
  )
  assert.ok(
    hits.includes('bg-color.json'),
    'Smoke test must install the explicitly requested BgColor item through the local @weimo registry.',
  )
  assert.ok(
    hits.includes('pressable.json'),
    'Smoke test must install the explicitly requested Pressable item through the local @weimo registry.',
  )
  assert.ok(
    hits.includes('text-color.json'),
    'Smoke test must install the explicitly requested TextColor item through the local @weimo registry.',
  )
  assert.ok(
    hits.includes('text-button.json'),
    'Smoke test must install the explicitly requested TextButton item through the local @weimo registry.',
  )
  assert.ok(
    hits.includes('border-color.json'),
    'Smoke test must install the explicitly requested BorderColor item through the local @weimo registry.',
  )
  assert.ok(
    hits.includes('border-radius.json'),
    'Smoke test must install the explicitly requested BorderRadius item through the local @weimo registry.',
  )
  assert.ok(
    hits.includes('font-size.json'),
    'Smoke test must install the explicitly requested FontSize item through the local @weimo registry.',
  )
  assert.ok(
    hits.includes('token-preview-card.json'),
    'Smoke test must install the explicitly requested TokenPreviewCard item through the local @weimo registry.',
  )
  assert.ok(
    hits.includes('glass-icon-button.json') && hits.includes('ghost-icon-button.json'),
    'Smoke test must install the explicitly requested GlassIconButton and GhostIconButton items through the local @weimo registry.',
  )
  assert.ok(
    hits.includes('menu.json'),
    'Smoke test must install the explicitly requested Menu item through the local @weimo registry.',
  )
  assert.ok(
    hits.includes('tag-tree.json'),
    'Smoke test must install the explicitly requested TagTree item through the local @weimo registry.',
  )
  assert.ok(
    hits.includes('style.json'),
    'Smoke test must install the shared @weimo/style dependency with component CSS.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/card.css')),
    'shadcn add must still write shared card shell CSS through Card.',
  )
  assert.ok(
    !existsSync(join(consumerDir, 'src/components/ui/editable-card.tsx')),
    'shadcn add must not write removed EditableCard component file.',
  )
  assert.ok(
    !existsSync(join(consumerDir, 'src/components/ui/editable-card.css')),
    'shadcn add must not write removed EditableCard CSS file.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/card.tsx')),
    'shadcn add must write Card component file.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/card-resolvers.tsx')),
    'shadcn add must write Card private resolver helpers.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/card.css')),
    'shadcn add must write Card CSS file.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/card-editable.css')),
    'shadcn add must write Card editable CSS file.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/chip-button.tsx')),
    'shadcn add must write internal ChipButton source used by Card TagBar.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/chip-button.css')),
    'shadcn add must write internal ChipButton CSS used by Card TagBar.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/chip-surface.tsx')) &&
      existsSync(join(consumerDir, 'src/components/ui/chip-surface-model.ts')) &&
      existsSync(join(consumerDir, 'src/components/ui/chip-surface.css')),
    'shadcn add must write internal ChipSurface files used by Card TagBar and TagBread.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/glass-surface.tsx')) &&
      existsSync(join(consumerDir, 'src/components/ui/glass-surface-model.ts')) &&
      existsSync(join(consumerDir, 'src/components/ui/glass-surface.css')),
    'shadcn add must write GlassSurface files from the configured custom registry.',
  )
  assert.ok(
    !existsSync(join(consumerDir, 'src/components/ui/smart-glass-surface.tsx')) &&
      !existsSync(join(consumerDir, 'src/components/ui/smart-glass-surface-model.ts')) &&
      !existsSync(join(consumerDir, 'src/components/ui/smart-glass-surface.css')),
    'shadcn add must not write removed SmartGlassSurface files.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/animated-inline-size.tsx')) &&
      existsSync(join(consumerDir, 'src/components/ui/animated-inline-size-model.ts')) &&
      existsSync(join(consumerDir, 'src/components/ui/animated-inline-size.css')),
    'shadcn add must write internal AnimatedInlineSize files used by chip surfaces.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/canvas-transparency.tsx')) &&
      existsSync(join(consumerDir, 'src/components/ui/canvas-transparency-model.ts')),
    'shadcn add must write the CanvasTransparency component and processing model files.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/image-uploader.tsx')),
    'shadcn add must write the explicitly requested ImageUploader component file.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/image-uploader.css')),
    'shadcn add must write the explicitly requested ImageUploader CSS file.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/ocr-composer.tsx')),
    'shadcn add must write the explicitly requested OcrComposer component file.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/composer-shell.tsx')),
    'shadcn add must write internal ComposerShell source used by CardComposer and OcrComposer.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/ocr-composer.css')),
    'shadcn add must write the explicitly requested OcrComposer CSS file.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/ocr-card.tsx')),
    'shadcn add must write the explicitly requested OcrCard component file.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/ocr-card.css')),
    'shadcn add must write the explicitly requested OcrCard CSS file.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/ocr-detail.tsx')),
    'shadcn add must write OcrDetail source used by OcrCard review action.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/ocr-detail.css')),
    'shadcn add must write OcrDetail CSS used by OcrCard review action.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/md-render.tsx')),
    'shadcn add must write the shared MdRender component file.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/tag-picker.tsx')),
    'shadcn add must write explicitly requested TagPicker entry from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/tag-picker/tag-picker.tsx')),
    'shadcn add must write TagPicker implementation files from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/tag-bread.tsx')),
    'shadcn add must write explicitly requested TagBread files from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/tag-bread.css')),
    'shadcn add must write TagBread glass CSS from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/coss/breadcrumb.tsx')),
    'shadcn add must write local coss Breadcrumb for TagBread.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/coss/breadcrumb.css')),
    'shadcn add must write local coss Breadcrumb CSS for TagBread.',
  )
  assert.ok(
    !existsSync(join(consumerDir, 'src/components/ui/tag-edit-bar.tsx')),
    'shadcn add must not write removed TagEditBar file.',
  )
  assert.ok(
    !existsSync(join(consumerDir, 'src/components/ui/tag-edit-bar.css')),
    'shadcn add must not write removed TagEditBar CSS.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/action-dialog.tsx')),
    'shadcn add must write internal ActionDialog for TagPicker.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/action-dialog.css')),
    'shadcn add must write internal ActionDialog CSS for TagPicker.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/float-bar.tsx')),
    'shadcn add must write internal FloatBar for TagPicker.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/bottom-bar.tsx')),
    'shadcn add must write internal BottomBar for TagPicker, Card controls, and MdEditor math dialog.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/bottom-bar.css')),
    'shadcn add must write internal BottomBar CSS for TagPicker, Card controls, and MdEditor math dialog.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/coss/dialog.tsx')),
    'shadcn add must write internal coss Dialog for TagPicker.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/coss/input-group.tsx')),
    'shadcn add must write internal coss InputGroup for TagPicker.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/coss/scroll-area.tsx')),
    'shadcn add must write internal coss ScrollArea for TagPicker.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/stat-group.tsx')),
    'shadcn add must write explicitly requested StatGroup files from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/stat-group.css')),
    'shadcn add must write explicitly requested StatGroup CSS from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/heatmap.tsx')),
    'shadcn add must write explicitly requested Heatmap entry from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/heat-color.tsx')),
    'shadcn add must write the public HeatColor entry from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/heat-color.css')),
    'shadcn add must write the HeatColor utility stylesheet from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/bg-blur.ts')),
    'shadcn add must write the public BgBlur tone map from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/bg-blur.css')),
    'shadcn add must write the BgBlur utility stylesheet from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/bg-color.ts')),
    'shadcn add must write the public BgColor tone map from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/bg-color.css')),
    'shadcn add must write the BgColor utility stylesheet from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/pressable.ts')),
    'shadcn add must write the public Pressable tone map from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/text-color.ts')),
    'shadcn add must write the public TextColor tone map from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/text-color.css')),
    'shadcn add must write the TextColor utility stylesheet from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/border-color.ts')),
    'shadcn add must write the public BorderColor tone map from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/border-color.css')),
    'shadcn add must write the BorderColor utility stylesheet from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/border-radius.ts')),
    'shadcn add must write the public BorderRadius scale map from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/font-size.ts')) &&
      existsSync(join(consumerDir, 'src/components/ui/font-size.css')),
    'shadcn add must write the public FontSize scale map and utility stylesheet from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/token-preview-card.tsx')) &&
      existsSync(join(consumerDir, 'src/components/ui/token-preview-card.css')),
    'shadcn add must write the public TokenPreviewCard component and stylesheet from the configured custom registry.',
  )
  assert.ok(
    existsSync(
      join(consumerDir, 'src/components/ui/heatmap/heatmap.tsx'),
    ),
    'shadcn add must write Heatmap implementation files from the configured custom registry.',
  )
  assert.ok(
    existsSync(
      join(consumerDir, 'src/components/ui/heatmap/heat-color.tsx'),
    ),
    'shadcn add must write public HeatColor implementation files with Heatmap.',
  )
  assert.ok(
    existsSync(
      join(consumerDir, 'src/components/ui/heatmap/heatmap.css'),
    ),
    'shadcn add must write Heatmap sidecar CSS from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/glass-icon-button.tsx')) &&
      existsSync(join(consumerDir, 'src/components/ui/ghost-icon-button.tsx')) &&
      existsSync(join(consumerDir, 'src/components/ui/icon-button-model.ts')),
    'shadcn add must write explicitly requested GlassIconButton and GhostIconButton files from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/icon-button.css')),
    'shadcn add must write shared icon button CSS because installed components use GlassIconButton and GhostIconButton.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/text-button.tsx')) &&
      existsSync(join(consumerDir, 'src/components/ui/text-button.css')),
    'shadcn add must write explicitly requested TextButton files from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/menu.tsx')),
    'shadcn add must write explicitly requested Menu files from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/md-editor.tsx')),
    'shadcn add must write internal MdEditor entry through Card.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/md-editor/md-editor.tsx')),
    'shadcn add must write internal MdEditor implementation files through Card.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/md-editor/md-editor.css')),
    'shadcn add must write internal MdEditor sidecar CSS through Card.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/markdown-content.css')),
    'shadcn add must write shared Markdown content CSS for Card and MdEditor.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/md-editor/md-editor-centered-quote.ts')),
    'shadcn add must write MdEditor centered quote extension from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/md-editor/md-editor-image.ts')),
    'shadcn add must write MdEditor image placeholder extension from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/md-editor/md-editor-markdown.ts')),
    'shadcn add must write MdEditor markdown normalization helper from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/tag-tree.tsx')),
    'shadcn add must write explicitly requested TagTree files from the configured custom registry.',
  )
  assert.ok(
    existsSync(
      join(consumerDir, 'src/components/ui/tag-tree/tag-tree.tsx'),
    ),
    'shadcn add must write TagTree implementation files from the configured custom registry.',
  )
  assert.ok(
    existsSync(
      join(consumerDir, 'src/components/ui/tag-tree/tag-tree.css'),
    ),
    'shadcn add must write TagTree sidecar CSS from the configured custom registry.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/lib/utils.ts')),
    'shadcn add must write the cn() utility next to installed UI source.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/top-bar.tsx')),
    'shadcn add must write additional component files from the local @weimo registry.',
  )
  const topBarRegistryPayload = JSON.parse(
    readFileSync(join(registryDir, 'top-bar.json'), 'utf8'),
  )
  const topBarRegistryFiles = topBarRegistryPayload.files ?? []
  assert.ok(
    !topBarRegistryFiles.some(
      (file) =>
        file.path === 'src/components/float-bar.css' ||
        file.target === '@ui/float-bar.css',
    ),
    'The TopBar registry payload must not ship unused internal FloatBar CSS.',
  )
  assert.ok(
    existsSync(join(consumerDir, 'src/components/ui/sidebar/sidebar-shell.tsx')),
    'shadcn add must write nested sidebar component files from the local @weimo registry.',
  )

  runConsumerTypecheck(consumerDir)

  const cardCssSource = readFileSync(join(consumerDir, 'src/components/ui/card.css'), 'utf8')
  const CardSource = readFileSync(
    join(consumerDir, 'src/components/ui/card.tsx'),
    'utf8',
  )
  const cardEditStateMachineSource = readFileSync(
    join(consumerDir, 'src/components/ui/card-edit-state-machine.ts'),
    'utf8',
  )
  const cardEditTransitionSource = readFileSync(
    join(consumerDir, 'src/components/ui/use-card-edit-transition.ts'),
    'utf8',
  )
  const cardRuntimeSource = [
    CardSource,
    cardEditStateMachineSource,
    cardEditTransitionSource,
  ].join('\n')
  const cardResolversSource = readFileSync(
    join(consumerDir, 'src/components/ui/card-resolvers.tsx'),
    'utf8',
  )
  const cardDraftSource = readFileSync(
    join(consumerDir, 'src/components/ui/use-card-draft.ts'),
    'utf8',
  )
  const layoutMeasurementSource = readFileSync(
    join(consumerDir, 'src/components/ui/card-layout-measurement.ts'),
    'utf8',
  )
  const heightTransitionSource = readFileSync(
    join(consumerDir, 'src/components/ui/use-height-transition.ts'),
    'utf8',
  )
  const cardEditableCssSource = readFileSync(
    join(consumerDir, 'src/components/ui/card-editable.css'),
    'utf8',
  )
  const tagBarSource = readFileSync(
    join(consumerDir, 'src/components/ui/tag-bar.tsx'),
    'utf8',
  )
  const tagBarCssSource = readFileSync(
    join(consumerDir, 'src/components/ui/tag-bar.css'),
    'utf8',
  )
  const chipButtonSource = readFileSync(
    join(consumerDir, 'src/components/ui/chip-button.tsx'),
    'utf8',
  )
  const chipButtonCssSource = readFileSync(
    join(consumerDir, 'src/components/ui/chip-button.css'),
    'utf8',
  )
  const chipSurfaceSource = readFileSync(
    join(consumerDir, 'src/components/ui/chip-surface.tsx'),
    'utf8',
  )
  const chipSurfaceModelSource = readFileSync(
    join(consumerDir, 'src/components/ui/chip-surface-model.ts'),
    'utf8',
  )
  const chipSurfaceCssSource = readFileSync(
    join(consumerDir, 'src/components/ui/chip-surface.css'),
    'utf8',
  )
  const animatedInlineSizeSource = readFileSync(
    join(consumerDir, 'src/components/ui/animated-inline-size.tsx'),
    'utf8',
  )
  const animatedInlineSizeModelSource = readFileSync(
    join(consumerDir, 'src/components/ui/animated-inline-size-model.ts'),
    'utf8',
  )
  const mdRenderSource = readFileSync(
    join(consumerDir, 'src/components/ui/md-render.tsx'),
    'utf8',
  )
  const tagPickerSource = readFileSync(
    join(consumerDir, 'src/components/ui/tag-picker/tag-picker.tsx'),
    'utf8',
  )
  const floatBarSource = readFileSync(
    join(consumerDir, 'src/components/ui/float-bar.tsx'),
    'utf8',
  )
  const actionDialogSource = readFileSync(
    join(consumerDir, 'src/components/ui/action-dialog.tsx'),
    'utf8',
  )
  const bottomBarSource = readFileSync(
    join(consumerDir, 'src/components/ui/bottom-bar.tsx'),
    'utf8',
  )
  const cardTopBarSource = readFileSync(
    join(consumerDir, 'src/components/ui/card-top-bar.tsx'),
    'utf8',
  )
  const modeButtonSource = readFileSync(
    join(consumerDir, 'src/components/ui/mode-button.tsx'),
    'utf8',
  )
  const cardToolBarSource = readFileSync(
    join(consumerDir, 'src/components/ui/card-tool-bar.tsx'),
    'utf8',
  )
  const cardToolBarCssSource = readFileSync(
    join(consumerDir, 'src/components/ui/card-tool-bar.css'),
    'utf8',
  )
  const inputGroupSource = readFileSync(
    join(consumerDir, 'src/components/ui/coss/input-group.tsx'),
    'utf8',
  )
  const statGroupSource = readFileSync(
    join(consumerDir, 'src/components/ui/stat-group.tsx'),
    'utf8',
  )
  const heatmapSource = readFileSync(
    join(consumerDir, 'src/components/ui/heatmap/heatmap.tsx'),
    'utf8',
  )
  const topBarSource = readFileSync(
    join(consumerDir, 'src/components/ui/top-bar.tsx'),
    'utf8',
  )
  const menuSource = readFileSync(
    join(consumerDir, 'src/components/ui/menu.tsx'),
    'utf8',
  )
  const mdEditorSource = readFileSync(
    join(consumerDir, 'src/components/ui/md-editor/md-editor.tsx'),
    'utf8',
  )
  const mathEditorSource = readFileSync(
    join(consumerDir, 'src/components/ui/md-editor/math-editor.tsx'),
    'utf8',
  )
  const mdEditorCssSource = readFileSync(
    join(consumerDir, 'src/components/ui/md-editor/md-editor.css'),
    'utf8',
  )
  const markdownContentCssSource = readFileSync(
    join(consumerDir, 'src/components/ui/markdown-content.css'),
    'utf8',
  )
  const tagTreeSource = readFileSync(
    join(consumerDir, 'src/components/ui/tag-tree/tag-tree.tsx'),
    'utf8',
  )
  const tagTreeModelSource = readFileSync(
    join(consumerDir, 'src/components/ui/tag-tree/tag-tree-model.ts'),
    'utf8',
  )
  const sidebarShellSource = readFileSync(
    join(consumerDir, 'src/components/ui/sidebar/sidebar-shell.tsx'),
    'utf8',
  )
  const consumerCss = readFileSync(join(consumerDir, 'src/index.css'), 'utf8')

  assert.ok(
    cardTopBarSource.includes('export function CardTopBar') &&
      cardTopBarSource.includes("from './mode-button'") &&
      cardTopBarSource.includes('<ModeButton') &&
      cardTopBarSource.includes('displayLabel={actionLabel}') &&
      cardTopBarSource.includes('editLabel={cancelLabel}') &&
      cardTopBarSource.includes('onModeChange={handleActionModeChange}') &&
      !cardTopBarSource.includes("import { Ellipsis, X } from 'lucide-react'") &&
      !cardTopBarSource.includes('function CardTopBarActionButton'),
    'Installed CardTopBar source must delegate display/edit top bar icon behavior to ModeButton.',
  )
  assert.ok(
    modeButtonSource.includes('export function ModeButton') &&
      modeButtonSource.includes("from './ghost-icon-button'") &&
      modeButtonSource.includes("from './menu'") &&
      modeButtonSource.includes('<GhostIconButton') &&
      modeButtonSource.includes('<Ellipsis />') &&
      modeButtonSource.includes('<X />'),
    'Installed Card must include ModeButton and its GhostIconButton/Menu dependencies.',
  )
  assert.ok(
    cardToolBarSource.includes('export const CardToolBar = forwardRef<HTMLDivElement, CardToolBarProps>(function CardToolBar') &&
      cardToolBarSource.includes("from './bottom-bar'") &&
      cardToolBarSource.includes("from './glass-icon-button'") &&
      cardToolBarSource.includes("import { Check } from 'lucide-react'") &&
      cardToolBarSource.includes('toolbarSlot?: ReactNode') &&
      cardToolBarSource.includes('saveDisabled?: boolean') &&
      cardToolBarSource.includes("saveLabel = '保存'") &&
      cardToolBarSource.includes('<BottomBar') &&
      cardToolBarSource.includes('ref={ref}') &&
      cardToolBarSource.includes('leftSlot={toolbarSlot}') &&
      cardToolBarSource.includes("CardToolBar.displayName = 'CardToolBar'") &&
      cardToolBarSource.includes('onMouseDown={(event) => event.preventDefault()}') &&
      cardToolBarSource.includes('<Check />') &&
      cardToolBarCssSource.includes('.weimo-card-tool-bar .float-bar__slot--left') &&
      cardToolBarCssSource.includes('overflow: visible;'),
    'Installed CardToolBar must compose BottomBar and own the save IconButton.',
  )
  assert.ok(
    cardRuntimeSource.includes('export function Card') &&
      cardRuntimeSource.includes("from './card-top-bar'") &&
      cardRuntimeSource.includes("from './card-tool-bar'") &&
      cardRuntimeSource.includes("from './md-view'") &&
      cardRuntimeSource.includes("from './tag-bar'") &&
      cardRuntimeSource.includes("from './card-layout-measurement'") &&
      cardRuntimeSource.includes("from './card-resolvers'") &&
      cardRuntimeSource.includes("from './use-card-draft'") &&
      cardRuntimeSource.includes("from './use-height-transition'") &&
      cardRuntimeSource.includes("from './use-card-edit-transition'") &&
      cardRuntimeSource.includes('const CARD_TRANSITION_MS = 181') &&
      cardRuntimeSource.includes('transitionDurationMs?: number') &&
      cardRuntimeSource.includes('transitionDurationMs = CARD_TRANSITION_MS') &&
      cardRuntimeSource.includes('const cardTransitionMs = transitionDurationMs') &&
      cardRuntimeSource.includes('const heightTransition = useHeightTransition(') &&
      cardRuntimeSource.includes('cardTransitionMs') &&
      cardRuntimeSource.includes("export type CardMode = 'view' | 'preparing-edit' | 'edit'") &&
      cardRuntimeSource.includes("export type CardInitialMode = 'view' | 'edit'") &&
      cardRuntimeSource.includes('initialMode?: CardInitialMode') &&
      cardRuntimeSource.includes('initialEditAutoFocus?: boolean') &&
      cardRuntimeSource.includes("initialMode = 'view'") &&
      cardRuntimeSource.includes('initialEditAutoFocus = true') &&
      cardRuntimeSource.includes('function focusInitialEditEditor()') &&
      cardRuntimeSource.includes("const initialEditLayoutResolvedRef = useRef(initialMode !== 'edit')") &&
      cardRuntimeSource.includes('const [mode, dispatchMode] = useReducer(') &&
      cardRuntimeSource.includes('reduceCardMode,') &&
      cardRuntimeSource.includes('resolveInitialCardMode,') &&
      cardRuntimeSource.includes('function resolveInitialEditLayout()') &&
      cardRuntimeSource.includes('if (initialEditLayoutResolvedRef.current) return') &&
      cardRuntimeSource.includes("if (mode !== 'edit') return") &&
      cardRuntimeSource.includes('const layout = measureNaturalCardLayout(') &&
      cardRuntimeSource.includes("setActiveEditExtraHeight('var(--weimo-card-editable-editor-extra-height)')") &&
      cardRuntimeSource.includes('const modeState = resolveCardModeState(mode)') &&
      cardRuntimeSource.includes('const isEditing = modeState.isEditing') &&
      cardRuntimeSource.includes("dispatchMode({ type: 'request-edit' })") &&
      !cardRuntimeSource.includes("setMode(canUseMarkdownEditor ? 'preparing-edit' : 'edit')") &&
      CardSource.includes('const topBarProps = resolveCardTopBarProps(') &&
      CardSource.includes('<CardTopBar') &&
      CardSource.includes('<CardTopBar {...topBarProps} />') &&
      CardSource.includes('<CardToolBar') &&
      CardSource.includes('const toolBarState = resolveCardToolBarState(') &&
      CardSource.includes('const toolBarProps = resolveCardToolBarProps(') &&
      CardSource.includes('{...toolBarProps}') &&
      CardSource.includes('<MdView') &&
      cardResolversSource.includes('preloadEditor: modeState.preloadEditor') &&
      cardRuntimeSource.includes('const visibleEditorInstance = editorInstance') &&
      cardRuntimeSource.includes('function handleEditorChange(nextEditorInstance: Editor | null)') &&
      cardRuntimeSource.includes('function completeEnterEdit()') &&
      cardRuntimeSource.includes('const isEnteringEditAnimation =') &&
      CardSource.includes('<TagBar') &&
      CardSource.includes('onSave?: (draft: CardDraft) => void') &&
      CardSource.includes('const cardDraft = useCardDraft(note, onDraftChange)') &&
      CardSource.includes('onSave?.(nextDraft)') &&
      !CardSource.includes("from './bottom-bar'") &&
      !CardSource.includes('import { Check'),
    'Installed Card runtime must include the state model/transition hook and compose Card controls.',
  )
  assert.ok(
      cardResolversSource.includes('export function resolveCardStyle(') &&
      cardResolversSource.includes("'--weimo-card-transition-duration': `${cardTransitionMs}ms`") &&
      cardResolversSource.includes('export function resolveCardTopBarProps(') &&
      cardResolversSource.includes('displayActionPrefixSlot: ReactNode | undefined') &&
      cardResolversSource.includes('actionPrefixSlot: displayActionPrefixSlot') &&
      cardResolversSource.includes("mode: 'display'") &&
      cardResolversSource.includes("mode: 'edit'") &&
      cardResolversSource.includes('export function resolveCardEditorToolbarSlot(') &&
      cardResolversSource.includes('canUseMarkdownEditor: boolean') &&
      cardResolversSource.includes('if (!canUseMarkdownEditor || !usesEditLayout || !visibleEditorInstance) return null') &&
      cardResolversSource.includes('suppressActiveBackground={isEnteringEditAnimation}') &&
      cardResolversSource.includes('disabled={disabled || mode !== \'edit\'}') &&
      cardResolversSource.includes('editor={visibleEditorInstance}') &&
      cardResolversSource.includes('saveDisabledOverride: CardProps[\'saveDisabled\']') &&
      cardResolversSource.includes('export function resolveCardToolBarProps(') &&
      cardResolversSource.includes('saveDisabled: saveDisabledOverride ?? (!isEditing || draftContent.trim().length === 0)'),
    'Installed Card resolver source must ship private prop/style resolver helpers.',
  )
  assert.ok(
    cardDraftSource.includes('export function useCardDraft') &&
      cardDraftSource.includes('function createDraftFromNote(note: CardNote): CardDraft') &&
      cardDraftSource.includes('function commitDraft(nextDraft: CardDraft, notify = true)') &&
      cardDraftSource.includes('function resetFromNote(nextNote: CardNote, notify = false)') &&
      cardDraftSource.includes('function updateContent(content: string)') &&
      cardDraftSource.includes('function updateTags(tags: string[])'),
    'Installed Card must include its internal draft state hook.',
  )
  assert.ok(
    layoutMeasurementSource.includes('export type CardLayoutMeasurements') &&
      layoutMeasurementSource.includes('export function measureCardLayout') &&
      layoutMeasurementSource.includes('export function measureNaturalCardLayout') &&
      layoutMeasurementSource.includes("article.setAttribute('data-view-measure', 'true')") &&
      layoutMeasurementSource.includes("article.removeAttribute('data-view-measure')"),
    'Installed Card must include its internal layout measurement helpers.',
  )
  assert.ok(
    heightTransitionSource.includes('export function useHeightTransition') &&
      heightTransitionSource.includes('function animateTo(targetHeight: string, onTargetFrame?: () => void)') &&
      heightTransitionSource.includes('durationMs + 80') &&
      heightTransitionSource.includes("event.propertyName !== 'height'"),
    'Installed Card must include its internal height transition hook.',
  )
  assert.ok(
	      tagBarSource.includes("from './chip-button'") &&
	      tagBarSource.includes('<ChipButton') &&
	      tagBarSource.includes("state={editable ? 'glass' : 'default'}") &&
	      tagBarSource.includes('state="glass"') &&
	      tagBarSource.includes('const rootPositionLayoutSignature = [') &&
	      tagBarSource.includes('function resolveRootPositionAnimationStartOffset(') &&
	      tagBarSource.includes('const previousOffset = resolveRootPositionAnimationStartOffset(root, parent)') &&
	      tagBarSource.includes('cancelRootPositionAnimation()') &&
	      tagBarSource.includes('const nextOffset = readRootParentOffset(root, parent)') &&
	      tagBarSource.includes('}, [rootPositionLayoutSignature])') &&
	      chipButtonSource.includes('export function ChipButton') &&
      chipButtonSource.includes("from './chip-surface-model'") &&
      chipButtonSource.includes("from './animated-inline-size'") &&
      chipButtonSource.includes("from './animated-inline-size-model'") &&
      chipButtonSource.includes('getChipSurfaceAttributes({ variant: state, interactive: true })') &&
      chipSurfaceSource.includes('export function ChipSurface') &&
      chipSurfaceModelSource.includes('export function getChipSurfaceClassName') &&
      animatedInlineSizeSource.includes('export function AnimatedInlineSizeMeasure') &&
      animatedInlineSizeModelSource.includes('export function useAnimatedInlineSize') &&
      chipSurfaceCssSource.includes('.chip-surface[data-variant="glass"]') &&
      !chipSurfaceCssSource.includes('background: var(--glass-gradient);') &&
      !chipSurfaceCssSource.includes('--glass-gradient') &&
      chipSurfaceCssSource.includes('--animated-inline-size-transition-duration: 180ms;') &&
      chipSurfaceCssSource.includes('inline-size var(--animated-inline-size-transition-duration)') &&
      chipSurfaceCssSource.includes('justify-content: flex-start;') &&
      chipSurfaceCssSource.includes('--chip-surface-state-transition-duration: 180ms;') &&
      chipSurfaceCssSource.includes('opacity var(--chip-surface-state-transition-duration)') &&
	      !chipButtonCssSource.includes(':hover::before') &&
	      tagBarCssSource.includes('.tag-bar[data-position-animating="true"]') &&
	      tagBarCssSource.includes('tag-bar-add-chip-in var(--weimo-card-transition-duration, 180ms)') &&
      tagBarCssSource.includes('tag-bar-add-chip-out var(--weimo-card-transition-duration, 160ms)'),
    'Installed TagBar must consume the internal ChipButton files shipped with Card.',
  )
  assert.ok(
    cardEditableCssSource.includes('.weimo-card-editable') &&
      cardEditableCssSource.includes('--weimo-card-transition-duration: 181ms;') &&
      cardEditableCssSource.includes('height var(--weimo-card-transition-duration)') &&
      cardEditableCssSource.includes('.weimo-card-editable__content') &&
      cardEditableCssSource.includes('--weimo-card-editable-bottom-bar-gap: 1em;') &&
      cardEditableCssSource.includes('.weimo-card-editable__bottom-bar') &&
      cardEditableCssSource.includes('.weimo-card-editable__bottom-bar[data-visible="true"]') &&
      cardEditableCssSource.includes('opacity var(--weimo-card-transition-duration)') &&
      cardEditableCssSource.includes('var(--weimo-card-editable-tags-top-offset)') &&
      cardEditableCssSource.includes('var(--weimo-card-editable-tags-height)') &&
      cardEditableCssSource.includes('var(--weimo-card-editable-bottom-bar-gap)') &&
      cardEditableCssSource.includes('var(--md-view-editor-bottom-safe-area, var(--weimo-card-editable-editor-extra-height))') &&
      cardEditableCssSource.includes('.weimo-card-editable[data-custom-content="true"][data-mode="edit"][data-edit-layout="true"] .weimo-card-editable__tags') &&
      !cardEditableCssSource.includes('.weimo-editable-card {'),
    'Installed Card editable CSS must use Card selectors and reserve editor bottom safe area without styling old EditableCard.',
  )
  assert.match(mdRenderSource, /react-markdown/)
  assert.match(mdRenderSource, /remark-gfm/)
  assert.match(mdRenderSource, /remark-breaks/)
  assert.match(mdRenderSource, /rehype-katex/)
  for (const source of [
    tagPickerSource,
    floatBarSource,
    actionDialogSource,
    bottomBarSource,
    inputGroupSource,
    statGroupSource,
    heatmapSource,
    topBarSource,
    menuSource,
    mdEditorSource,
    tagTreeSource,
    sidebarShellSource,
  ]) {
    assert.match(source, /from ['"](?:\.\/|\.\.\/)lib\/utils['"]/)
    assert.doesNotMatch(source, /from ['"]@\/lib\/utils['"]/)
  }
  assert.doesNotMatch(consumerCss, /--radius-card:/)
  assert.match(consumerCss, /--radius:\s*16px;/)
  assert.match(consumerCss, /--color-background:\s*hsl\(var\(--background\)\);/)
  assert.match(consumerCss, /--color-bg-card:/)
  assert.match(consumerCss, /--color-heat-0:\s*rgba\(0,\s*0,\s*0,\s*0\.06\);/)
  assert.match(consumerCss, /--color-heat-1:\s*rgba\(202,\s*84,\s*33,\s*0\.2\);/)
  assert.match(consumerCss, /--color-heatmap-today-ring:\s*rgba\(202,\s*84,\s*33,\s*0\.55\);/)
  assert.ok(
    tagPickerSource.includes("from '../coss/input-group'") &&
    !tagPickerSource.includes("from '../bottom-bar'") &&
    tagPickerSource.includes("from '../action-dialog'") &&
    tagPickerSource.includes("from '../glass-icon-button'") &&
    tagPickerSource.includes('<ActionDialog') &&
    tagPickerSource.includes('bottomBarLabel="标签选择器输入栏"') &&
    tagPickerSource.includes('bottomBarClassName="tag-picker__bottom-float-bar"') &&
    tagPickerSource.includes('bottomBarLeftSlot={') &&
    inputGroupSource.includes("data-slot=\"input-group\""),
    'Installed TagPicker must use ActionDialog bottomBarLeftSlot with shipped InputGroup and GlassIconButton dependencies.',
  )
  assert.ok(
    actionDialogSource.includes("import { BottomBar } from './bottom-bar'") &&
    actionDialogSource.includes("import { FloatBar } from './float-bar'") &&
    actionDialogSource.includes("from './coss/dialog'") &&
    actionDialogSource.includes("from './glass-icon-button'") &&
    actionDialogSource.includes('bottomBarLeftSlot?: ReactNode') &&
    actionDialogSource.includes('bottomBarRightSlot?: ReactNode') &&
    actionDialogSource.includes('showCloseButton?: boolean') &&
    actionDialogSource.includes('toolbarRightSlot?: ReactNode') &&
    actionDialogSource.includes('className="action-dialog__actions"') &&
    actionDialogSource.includes('{toolbarRightSlot}') &&
    actionDialogSource.includes('showCloseButton = true') &&
    actionDialogSource.includes('showCloseButton ?') &&
    actionDialogSource.includes('<BottomBar') &&
    actionDialogSource.includes('leftSlot={bottomBarLeftSlot}') &&
    actionDialogSource.includes('rightSlot={bottomBarRightSlot}'),
    'Installed ActionDialog must compose installed internal BottomBar, FloatBar, coss Dialog, GlassIconButton, and right toolbar slot files.',
  )
  assert.ok(
    bottomBarSource.includes("import { FloatBar } from './float-bar'") &&
    bottomBarSource.includes('export const BottomBar = forwardRef<HTMLDivElement, BottomBarProps>(function BottomBar') &&
    bottomBarSource.includes('ref={ref}') &&
    bottomBarSource.includes("BottomBar.displayName = 'BottomBar'") &&
    bottomBarSource.includes("className={cn('bottom-bar', className)}"),
    'Installed BottomBar must compose installed internal FloatBar and keep its internal class.',
  )
  assert.ok(
    mdEditorSource.includes("from '@tiptap/react'") &&
      !mdEditorSource.includes("from 'lucide-react'") &&
      !mdEditorSource.includes("from '../bottom-bar'") &&
      !mdEditorSource.includes('<BottomBar') &&
      !mdEditorSource.includes('<MdEditorToolbar') &&
      mdEditorSource.includes('onEditorChange') &&
      mdEditorSource.includes('forwardRef<MdEditorHandle, MdEditorProps>'),
    'Installed MdEditor must use Tiptap React and the public forwarded ref API without main-surface BottomBar controls.',
  )
  assert.ok(
    mathEditorSource.includes("from '../action-dialog'") &&
      !mathEditorSource.includes("from '../bottom-bar'") &&
      mathEditorSource.includes('bottomBarLabel="公式编辑操作栏"') &&
      mathEditorSource.includes('bottomBarClassName="md-editor__math-dialog-float-bar"') &&
      mathEditorSource.includes('bottomBarRightSlot={') &&
      mathEditorSource.includes('form={formId}') &&
      mathEditorSource.includes('id={formId}') &&
      mathEditorSource.includes('type="submit"'),
    'Installed MdEditor math dialog must use ActionDialog bottomBarRightSlot while preserving submit behavior.',
  )
  assert.ok(
    cardCssSource.includes('@import "./markdown-content.css";'),
    'Installed Card CSS must import shared Markdown content CSS.',
  )
  assert.ok(
    !cardCssSource.includes('.weimo-share-card'),
    'Installed Card CSS must not include removed ShareCard styles.',
  )
  assert.ok(
    mdEditorCssSource.includes('@import "../markdown-content.css";'),
    'Installed MdEditor CSS must import shared Markdown content CSS.',
  )
  assert.ok(
    markdownContentCssSource.includes('.weimo-markdown-content') &&
      markdownContentCssSource.includes('[data-weimo-centered="true"]') &&
      markdownContentCssSource.includes('margin-top: 1em;'),
    'Installed shared Markdown CSS must include root, centered quote, and block rhythm styles.',
  )
  assert.ok(
    tagTreeSource.includes("export type TagTreeVariant = 'default' | 'no-action'") &&
    tagTreeSource.includes('variant?: TagTreeVariant') &&
    tagTreeSource.includes('defaultIcon?: ReactNode') &&
    tagTreeSource.includes("variant === 'default' && typeof onMenuAction === 'function'"),
    'Installed TagTree must include no-action variant and defaultIcon API.',
  )
  assert.ok(
    tagTreeModelSource.includes("import type { ReactNode } from 'react'") &&
    tagTreeModelSource.includes('icon?: ReactNode'),
    'Installed TagTree model must include node-level icon API.',
  )
  assert.ok(
    topBarSource.includes('top-bar__frame') &&
      topBarSource.includes('top-bar__slot top-bar__slot--left') &&
      topBarSource.includes('top-bar__slot top-bar__slot--right') &&
      !topBarSource.includes('FloatBar') &&
      !topBarSource.includes('centerSlot'),
    'Installed TopBar must render its own two-slot toolbar without the internal FloatBar center slot.',
  )
  assert.match(
    readFileSync(join(consumerDir, 'src/components/ui/top-bar.css'), 'utf8'),
    /@media\s*\(min-width:\s*700px\)\s*{[\s\S]*\.top-bar\s*{[\s\S]*padding-inline:\s*var\(--space-gutter\);/,
    'Installed TopBar CSS must preserve desktop fixed top-bar padding specificity.',
  )
} finally {
  if (server) {
    await closeServer(server)
  }
  rmSync(tempDir, { recursive: true, force: true })
}
