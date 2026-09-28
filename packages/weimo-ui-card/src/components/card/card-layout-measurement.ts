export type CardLayoutMeasurements = {
  afterTagsHeight: string
  afterTagsReserve: string
  afterTagsViewportTop: number
  contentExtraHeight: string
  contentHeight: string
  tagsViewportTop: number
  tagsBottomOffset: string
  tagsHeight: string
  tagsTopOffset: string
  viewHeight: string
}

export function measureCardLayout(
  article: HTMLElement | null,
  content: HTMLDivElement | null,
  tags: HTMLDivElement | null,
  afterTags: HTMLDivElement | null,
): CardLayoutMeasurements | null {
  if (!article || !content || !tags) return null

  const articleRect = article.getBoundingClientRect()
  const contentRect = content.getBoundingClientRect()
  const tagsRect = tags.getBoundingClientRect()
  const afterTagsRect = afterTags?.getBoundingClientRect() ?? null
  if (articleRect.height <= 0 || tagsRect.height <= 0) return null

  const articleStyles = window.getComputedStyle(article)
  const articleBorderTop = Number.parseFloat(articleStyles.borderTopWidth) || 0
  const articleBorderBottom = Number.parseFloat(articleStyles.borderBottomWidth) || 0
  const afterTagsHeight = afterTagsRect?.height ?? 0
  const afterTagsReserve =
    afterTagsHeight > 0
      ? `calc(${afterTagsHeight}px + var(--weimo-card-editable-after-tags-gap))`
      : '0px'

  return {
    afterTagsHeight: `${afterTagsHeight}px`,
    afterTagsReserve,
    afterTagsViewportTop: afterTagsRect?.top ?? tagsRect.bottom,
    contentExtraHeight: '0px',
    contentHeight: `${contentRect.height}px`,
    tagsBottomOffset: `${articleRect.bottom - articleBorderBottom - tagsRect.bottom}px`,
    tagsHeight: `${tagsRect.height}px`,
    tagsTopOffset: `${tagsRect.top - articleRect.top - articleBorderTop}px`,
    tagsViewportTop: tagsRect.top,
    viewHeight: `${articleRect.height}px`,
  }
}

export function measureNaturalCardLayout(
  article: HTMLElement | null,
  content: HTMLDivElement | null,
  tags: HTMLDivElement | null,
  afterTags: HTMLDivElement | null,
) {
  if (!article) return null

  const previousViewMeasure = article.getAttribute('data-view-measure')
  article.setAttribute('data-view-measure', 'true')

  try {
    return measureCardLayout(article, content, tags, afterTags)
  } finally {
    if (previousViewMeasure === null) {
      article.removeAttribute('data-view-measure')
    } else {
      article.setAttribute('data-view-measure', previousViewMeasure)
    }
  }
}
