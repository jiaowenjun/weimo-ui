import {
  forwardRef,
  lazy,
  Suspense,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import type { CSSProperties } from 'react'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { unified } from 'unified'

import type { MdEditorHandle, MdEditorProps } from './md-editor'
import { MdRender, type MdRenderProps } from './md-render'
import { normalizeCenteredQuoteSyntax, restoreCenteredQuoteSyntax } from './markdown-centered-quote'
import { cn } from './lib/utils'

import './md-view.css'

const MdEditor = lazy(() =>
  import('./md-editor').then((module) => ({ default: module.MdEditor })),
)

export type MdViewMode = 'view' | 'edit'
type MdViewStyle = CSSProperties & Record<'--md-view-editor-bottom-safe-area', string>

const mdViewMarkdownFormatter = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkStringify, {
    bullet: '-',
    fences: true,
  })

function formatMdViewMarkdown(markdown: string) {
  const normalizedMarkdown = normalizeCenteredQuoteSyntax(markdown)
  const formattedMarkdown = String(
    mdViewMarkdownFormatter.processSync(normalizedMarkdown),
  )

  return restoreCenteredQuoteSyntax(formattedMarkdown).replace(/\n$/, '')
}

export type MdViewHandle = {
  convertSelectionToInlineMath: MdEditorHandle['convertSelectionToInlineMath']
  formatContent: MdEditorHandle['formatContent']
  getContentHeight: () => number
}

export type MdViewProps = {
  mode: MdViewMode
  value: string
  onChange?: (markdown: string) => void
  className?: string
  editorBottomSafeArea?: number | string
  preloadEditor?: boolean
  renderProps?: Omit<MdRenderProps, 'content' | 'className'>
  editorProps?: Omit<MdEditorProps, 'value' | 'onChange' | 'className'>
}

export const MdView = forwardRef<MdViewHandle, MdViewProps>(function MdView(
  {
    className,
    editorBottomSafeArea = 100,
    editorProps,
    mode,
    onChange,
    preloadEditor = false,
    renderProps,
    value,
  },
  ref,
) {
  const editorRef = useRef<MdEditorHandle | null>(null)
  const renderRef = useRef<HTMLDivElement | null>(null)
  const previousModeRef = useRef<MdViewMode>(mode)
  const showEditor = mode === 'edit'
  const shouldMountEditor = showEditor || preloadEditor
  const editorAutoFocus = editorProps?.autoFocus ?? showEditor
  const editorAutoFocusPosition = editorProps?.autoFocusPosition ?? 'end'
  const editorImageRenderer = editorProps?.renderImage ?? renderProps?.renderImage
  const editorImageSrcResolver = editorProps?.resolveImageSrc ?? renderProps?.resolveImageSrc

  useEffect(() => {
    const previousMode = previousModeRef.current
    previousModeRef.current = mode

    if (previousMode !== 'edit' || mode !== 'view' || !onChange) return

    const formattedMarkdown = formatMdViewMarkdown(value)

    if (formattedMarkdown !== value) {
      onChange(formattedMarkdown)
    }
  }, [mode, onChange, value])

  function measureRenderContentHeight() {
    const render = renderRef.current

    if (!render) return 0

    return Math.max(
      render.scrollHeight,
      render.getBoundingClientRect().height,
    )
  }

  useImperativeHandle(
    ref,
    () => ({
      convertSelectionToInlineMath: () =>
        editorRef.current?.convertSelectionToInlineMath() ?? false,
      formatContent: (options) =>
        editorRef.current?.formatContent(options) ?? value,
      getContentHeight: () =>
        showEditor
          ? editorRef.current?.getContentHeight() ?? 0
          : measureRenderContentHeight(),
    }),
    [showEditor, value],
  )

  const resolvedEditorBottomSafeArea =
    typeof editorBottomSafeArea === 'number'
      ? `${editorBottomSafeArea}px`
      : editorBottomSafeArea
  const editorStyle: MdViewStyle | undefined =
    showEditor
      ? ({
          '--md-view-editor-bottom-safe-area': resolvedEditorBottomSafeArea,
        } satisfies MdViewStyle)
      : undefined

  return (
    <div
      className={cn('md-view', className)}
      data-mode={mode}
      data-preloading-editor={preloadEditor && !showEditor ? 'true' : undefined}
      style={editorStyle}
    >
      {shouldMountEditor ? (
        <div
          aria-hidden={!showEditor}
          className="md-view__editor-layer"
          hidden={!showEditor}
        >
          <Suspense fallback={null}>
            <MdEditor
              ref={editorRef}
              value={value}
              onChange={onChange}
              {...editorProps}
              autoFocus={editorAutoFocus}
              autoFocusPosition={editorAutoFocusPosition}
              renderImage={editorImageRenderer}
              resolveImageSrc={editorImageSrcResolver}
            />
          </Suspense>
        </div>
      ) : null}
      {showEditor ? null : (
        <MdRender ref={renderRef} content={value} {...renderProps} />
      )}
    </div>
  )
})

MdView.displayName = 'MdView'
