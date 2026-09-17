import { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react'
import type { RefObject, TransitionEvent } from 'react'
import type { Editor } from '@tiptap/core'

import {
  reduceCardMode,
  resolveCardModeState,
  resolveInitialCardMode,
  type CardInitialMode,
} from './card-edit-state-machine'
import {
  measureCardLayout,
  measureNaturalCardLayout,
  type CardLayoutMeasurements,
} from './card-layout-measurement'
import type { MdViewHandle } from './md-view'
import { useHeightTransition } from './use-height-transition'

type PendingExitEditLayout = {
  afterTagsViewportTop: number
  currentHeight: string
  tagsViewportTop: number
  toolbarViewportTop: number
}

type PendingExitViewAnimation = {
  firstAfterTagsViewportTop: number
  firstTagsViewportTop: number
  firstToolbarViewportTop: number
  layout: CardLayoutMeasurements
  targetHeight: string
}

export type UseCardEditTransitionOptions = {
  canUseMarkdownEditor: boolean
  editorBottomSafeArea: string
  initialEditAutoFocus: boolean
  initialMode: CardInitialMode
  mdViewRef: RefObject<MdViewHandle | null>
  transitionDurationMs: number
}

function resolveTranslateY(transform: string) {
  if (!transform || transform === 'none') return 0
  if (typeof DOMMatrixReadOnly === 'undefined') return 0

  try {
    return new DOMMatrixReadOnly(transform).m42
  } catch {
    return 0
  }
}

function useFloatingElementTransition({
  dataAttribute,
  durationMs,
  elementRef,
}: {
  dataAttribute: 'exitAnimating'
  durationMs: number
  elementRef: RefObject<HTMLDivElement | null>
}) {
  const animationRef = useRef<Animation | null>(null)

  function clear() {
    animationRef.current?.cancel()
    animationRef.current = null
    delete elementRef.current?.dataset[dataAttribute]
  }

  function animateFromPreviousViewportTop(firstViewportTop: number) {
    clear()

    const element: HTMLDivElement | null = elementRef.current
    if (!element) return

    element.dataset[dataAttribute] = 'true'
    const baseTranslateY = resolveTranslateY(window.getComputedStyle(element).transform)
    const lastViewportTop = element.getBoundingClientRect().top
    const translateY = firstViewportTop - lastViewportTop
    if (Math.abs(translateY) < 0.5) {
      delete element.dataset[dataAttribute]
      return
    }

    animationRef.current = element.animate(
      [
        { transform: `translateY(${baseTranslateY + translateY}px)` },
        { transform: `translateY(${baseTranslateY}px)` },
      ],
      {
        duration: durationMs,
        easing: 'cubic-bezier(0.2, 0, 0, 1)',
        fill: 'none',
      },
    )
    animationRef.current.onfinish = () => {
      delete element.dataset[dataAttribute]
      animationRef.current = null
    }
    animationRef.current.oncancel = () => {
      delete element.dataset[dataAttribute]
      animationRef.current = null
    }
  }

  return { animateFromPreviousViewportTop, clear }
}

export function useCardEditTransition({
  canUseMarkdownEditor,
  editorBottomSafeArea,
  initialEditAutoFocus,
  initialMode,
  mdViewRef,
  transitionDurationMs,
}: UseCardEditTransitionOptions) {
  const [mode, dispatchMode] = useReducer(
    reduceCardMode,
    initialMode,
    resolveInitialCardMode,
  )
  const [activeEditExtraHeight, setActiveEditExtraHeight] = useState<string | null>(null)
  const [editLayout, setEditLayout] = useState<CardLayoutMeasurements | null>(null)
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null)
  const articleRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const afterTagsRef = useRef<HTMLDivElement | null>(null)
  const tagsRef = useRef<HTMLDivElement | null>(null)
  const toolbarRef = useRef<HTMLDivElement | null>(null)
  const initialEditLayoutResolvedRef = useRef(initialMode !== 'edit')
  const initialEditAutoFocusCompletedRef = useRef(initialMode !== 'edit')
  const clearEditLayoutAfterHeightAnimationRef = useRef(false)
  const focusEditorAfterEnterAnimationRef = useRef(false)
  const pendingEnterEditLayoutRef = useRef<CardLayoutMeasurements | null>(null)
  const pendingExitEditLayoutRef = useRef<PendingExitEditLayout | null>(null)
  const pendingExitViewAnimationRef = useRef<PendingExitViewAnimation | null>(null)
  const modeState = resolveCardModeState(mode)
  const isEditing = modeState.isEditing
  const exitAfterTagsTransition = useFloatingElementTransition({
    elementRef: afterTagsRef,
    dataAttribute: 'exitAnimating',
    durationMs: transitionDurationMs,
  })
  const exitTagsTransition = useFloatingElementTransition({
    elementRef: tagsRef,
    dataAttribute: 'exitAnimating',
    durationMs: transitionDurationMs,
  })
  const exitToolbarTransition = useFloatingElementTransition({
    elementRef: toolbarRef,
    dataAttribute: 'exitAnimating',
    durationMs: transitionDurationMs,
  })
  const heightTransition = useHeightTransition(
    transitionDurationMs,
    finishHeightAnimation,
  )
  const animatedHeight = heightTransition.animatedHeight
  const isEnteringEditAnimation = isEditing && animatedHeight !== null

  function clearHeightAnimationSchedule() {
    heightTransition.clear()
  }

  function finishHeightAnimation() {
    clearHeightAnimationSchedule()
    exitAfterTagsTransition.clear()
    exitTagsTransition.clear()
    exitToolbarTransition.clear()
    if (focusEditorAfterEnterAnimationRef.current) {
      focusEditorAfterEnterAnimationRef.current = false
      editorInstance?.commands.focus('end')
    }
    if (clearEditLayoutAfterHeightAnimationRef.current) {
      clearEditLayoutAfterHeightAnimationRef.current = false
      setEditLayout(null)
      setEditorInstance(null)
    }
    heightTransition.unlockHeight()
    setActiveEditExtraHeight(null)
  }

  function resolveEditorContentExtraHeight(
    layout: CardLayoutMeasurements,
    editorContentHeightOverride?: number,
  ) {
    const viewContentHeight = Number.parseFloat(layout.contentHeight) || 0
    const editorContentHeight =
      editorContentHeightOverride ?? mdViewRef.current?.getContentHeight() ?? 0
    const contentExtraHeight = Math.max(0, editorContentHeight - viewContentHeight)

    return `${contentExtraHeight}px`
  }

  function handleEditorContentHeightChange(editorContentHeight: number) {
    if (mode !== 'edit') return
    if (!Number.isFinite(editorContentHeight) || editorContentHeight <= 0) return

    setEditLayout((currentLayout) => {
      if (!currentLayout) return currentLayout

      const nextContentExtraHeight = resolveEditorContentExtraHeight(
        currentLayout,
        editorContentHeight,
      )
      if (nextContentExtraHeight === currentLayout.contentExtraHeight) return currentLayout

      return {
        ...currentLayout,
        contentExtraHeight: nextContentExtraHeight,
      }
    })
  }

  function focusInitialEditEditor() {
    if (!canUseMarkdownEditor) return
    if (!editorInstance) return

    initialEditAutoFocusCompletedRef.current = true
    editorInstance.commands.focus('end')
  }

  function resolveInitialEditLayout() {
    if (initialEditLayoutResolvedRef.current) return
    if (mode !== 'edit') return
    if (canUseMarkdownEditor && !editorInstance) return

    initialEditLayoutResolvedRef.current = true

    const layout = measureNaturalCardLayout(
      articleRef.current,
      contentRef.current,
      tagsRef.current,
      afterTagsRef.current,
    )

    if (!layout) {
      if (initialEditAutoFocus) focusInitialEditEditor()
      return
    }

    const contentExtraHeight = canUseMarkdownEditor
      ? resolveEditorContentExtraHeight(layout)
      : '0px'

    setEditLayout({
      ...layout,
      contentExtraHeight,
    })
    setActiveEditExtraHeight('var(--weimo-card-editable-editor-extra-height)')
    if (initialEditAutoFocus) focusInitialEditEditor()
  }

  function enterEdit() {
    if (mode !== 'view') return

    const layout = measureCardLayout(
      articleRef.current,
      contentRef.current,
      tagsRef.current,
      afterTagsRef.current,
    )
    focusEditorAfterEnterAnimationRef.current = canUseMarkdownEditor
    if (layout) {
      clearHeightAnimationSchedule()
      pendingEnterEditLayoutRef.current = layout
      setActiveEditExtraHeight('0px')
      heightTransition.lockHeight(layout.viewHeight)
      heightTransition.onNextFrame(() => {
        dispatchMode({ type: 'request-edit' })
      })
      return
    }
    dispatchMode({ type: 'request-edit' })
  }

  function exitEdit() {
    focusEditorAfterEnterAnimationRef.current = false
    const currentHeight = articleRef.current?.getBoundingClientRect().height ?? 0
    if (editLayout && currentHeight > 0) {
      pendingExitEditLayoutRef.current = {
        afterTagsViewportTop: afterTagsRef.current?.getBoundingClientRect().top ?? 0,
        currentHeight: `${currentHeight}px`,
        tagsViewportTop: tagsRef.current?.getBoundingClientRect().top ?? 0,
        toolbarViewportTop: toolbarRef.current?.getBoundingClientRect().top ?? 0,
      }
      heightTransition.lockHeight(`${currentHeight}px`)
    }
    clearEditLayoutAfterHeightAnimationRef.current = true
    dispatchMode({ type: 'request-view' })
  }

  function handleEditorChange(nextEditorInstance: Editor | null) {
    if (nextEditorInstance) {
      if (focusEditorAfterEnterAnimationRef.current) {
        nextEditorInstance.commands.setTextSelection(
          nextEditorInstance.state.doc.content.size,
        )
      }
      setEditorInstance(nextEditorInstance)
      return
    }

    if (!clearEditLayoutAfterHeightAnimationRef.current) {
      setEditorInstance(null)
    }
  }

  function completeEnterEdit() {
    const pendingLayout = pendingEnterEditLayoutRef.current
    if (canUseMarkdownEditor && !editorInstance) return
    if (!pendingLayout) {
      if (canUseMarkdownEditor && focusEditorAfterEnterAnimationRef.current) {
        focusEditorAfterEnterAnimationRef.current = false
        editorInstance?.commands.focus('end')
      }
      return
    }

    pendingEnterEditLayoutRef.current = null
    focusEditorAfterEnterAnimationRef.current = canUseMarkdownEditor
    const contentExtraHeight = canUseMarkdownEditor
      ? resolveEditorContentExtraHeight(pendingLayout)
      : '0px'
    const editLayoutWithContentExtra = {
      ...pendingLayout,
      contentExtraHeight,
    }
    setEditLayout(editLayoutWithContentExtra)
    heightTransition.animateTo(
      'var(--weimo-card-editable-edit-target-height)',
      () => setActiveEditExtraHeight('var(--weimo-card-editable-editor-extra-height)'),
    )
  }

  function prepareExitViewAnimation(pendingExitLayout: PendingExitEditLayout) {
    const targetLayout = measureNaturalCardLayout(
      articleRef.current,
      contentRef.current,
      tagsRef.current,
      afterTagsRef.current,
    )

    if (!targetLayout) return null

    const exitLayout = {
      ...targetLayout,
      contentExtraHeight: '0px',
    }

    return {
      firstAfterTagsViewportTop: pendingExitLayout.afterTagsViewportTop,
      firstTagsViewportTop: pendingExitLayout.tagsViewportTop,
      firstToolbarViewportTop: pendingExitLayout.toolbarViewportTop,
      layout: exitLayout,
      targetHeight: targetLayout.viewHeight,
    }
  }

  useLayoutEffect(() => {
    if (mode !== 'preparing-edit') return
    const pendingLayout = pendingEnterEditLayoutRef.current
    if (!canUseMarkdownEditor) {
      if (pendingLayout) setEditLayout(pendingLayout)
      dispatchMode({ type: 'editor-ready' })
      return
    }
    if (!editorInstance) return

    if (pendingLayout) setEditLayout(pendingLayout)
    dispatchMode({ type: 'editor-ready' })
  }, [canUseMarkdownEditor, editorInstance, mode])

  useLayoutEffect(() => {
    if (!isEditing) return

    completeEnterEdit()
  }, [editorBottomSafeArea, editorInstance, isEditing])

  useLayoutEffect(() => {
    resolveInitialEditLayout()
  }, [editorBottomSafeArea, editorInstance, mode])

  useEffect(() => {
    if (!initialEditAutoFocus) return
    if (mode !== 'edit') return
    if (!initialEditLayoutResolvedRef.current) return
    if (initialEditAutoFocusCompletedRef.current) return

    focusInitialEditEditor()
  }, [editorInstance, initialEditAutoFocus, mode])

  useLayoutEffect(() => {
    if (mode !== 'view') return

    const pendingExitLayout = pendingExitEditLayoutRef.current
    if (!pendingExitLayout) return

    pendingExitEditLayoutRef.current = null
    const pendingExitViewAnimation = prepareExitViewAnimation(pendingExitLayout)

    if (!pendingExitViewAnimation) {
      finishHeightAnimation()
      return
    }

    pendingExitViewAnimationRef.current = pendingExitViewAnimation

    heightTransition.lockHeight(pendingExitLayout.currentHeight)
    setActiveEditExtraHeight('0px')
    setEditLayout(pendingExitViewAnimation.layout)
  }, [editLayout, mode])

  useLayoutEffect(() => {
    const pendingExitViewAnimation = pendingExitViewAnimationRef.current
    if (!pendingExitViewAnimation) return
    if (editLayout !== pendingExitViewAnimation.layout) return

    pendingExitViewAnimationRef.current = null
    exitAfterTagsTransition.animateFromPreviousViewportTop(
      pendingExitViewAnimation.firstAfterTagsViewportTop,
    )
    exitTagsTransition.animateFromPreviousViewportTop(
      pendingExitViewAnimation.firstTagsViewportTop,
    )
    exitToolbarTransition.animateFromPreviousViewportTop(
      pendingExitViewAnimation.firstToolbarViewportTop,
    )
    heightTransition.animateTo(pendingExitViewAnimation.targetHeight)
  }, [editLayout])

  useEffect(() => () => {
    clearHeightAnimationSchedule()
    exitAfterTagsTransition.clear()
    exitTagsTransition.clear()
    exitToolbarTransition.clear()
  }, [])

  return {
    activeEditExtraHeight,
    animatedHeight,
    editLayout,
    editorInstance,
    isEnteringEditAnimation,
    mode,
    modeState,
    refs: {
      afterTagsRef,
      articleRef,
      contentRef,
      tagsRef,
      toolbarRef,
    },
    enterEdit,
    exitEdit,
    handleEditorChange,
    handleEditorContentHeightChange,
    handleHeightTransitionEnd: heightTransition.handleTransitionEnd as (
      event: TransitionEvent<HTMLElement>,
    ) => void,
  }
}
