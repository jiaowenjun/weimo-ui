import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from './lib/utils'
import { MdRender } from './md-render'
import { formatShareCardDate } from './share-card-date'

import './share-card.css'

export type ShareCardFont = 'default' | 'print'

export type ShareCardProps = Omit<ComponentPropsWithoutRef<'article'>, 'children'> & {
  content: string
  tags?: string[]
  createdAt?: Date
  useLunarDate?: boolean
  showTags?: boolean
  showNickname?: boolean
  showDate?: boolean
  showBrand?: boolean
  nickname?: string
  brandLabel?: string
  brandIcon?: ReactNode
  font?: ShareCardFont
  largeText?: boolean
}

const SHARE_CARD_DEFAULT_BRAND_LABEL = 'weimo.ink'

function isValidShareCardTime(date: Date | undefined): date is Date {
  return date instanceof Date && Number.isFinite(date.getTime())
}

export function ShareCard({
  brandIcon,
  brandLabel = SHARE_CARD_DEFAULT_BRAND_LABEL,
  className,
  content,
  createdAt,
  font = 'default',
  largeText = false,
  nickname,
  showBrand = true,
  showDate = true,
  showNickname = true,
  showTags = true,
  tags = [],
  useLunarDate = false,
  ...props
}: ShareCardProps) {
  const visibleTags = tags.filter((tag) => tag.trim().length > 0)
  const dateText = showDate ? formatShareCardDate(createdAt, useLunarDate) : ''
  const dateTime = isValidShareCardTime(createdAt) ? createdAt.toISOString() : undefined
  const brandVisible = showBrand && Boolean(brandLabel || brandIcon)
  const nicknameVisible = showNickname && Boolean(nickname)
  const datelineVisible = Boolean(dateText || brandVisible)
  const footerVisible = nicknameVisible || datelineVisible

  return (
    <article
      className={cn(
        'weimo-share-card',
        font === 'print' && 'weimo-share-card--font-print',
        largeText && 'weimo-share-card--large-text',
        className,
      )}
      {...props}
    >
      <div className="weimo-share-card__content">
        <MdRender className="weimo-share-card__rich" content={content} />
      </div>

      {showTags && visibleTags.length > 0 && (
        <div className="weimo-share-card__tags">
          {visibleTags.map((tag, index) => (
            <span className="weimo-share-card__tag" key={`${tag}-${index}`}>
              <span className="weimo-share-card__tag-prefix">#</span>
              <span className="weimo-share-card__tag-text">{tag}</span>
            </span>
          ))}
        </div>
      )}

      {footerVisible && (
        <footer className="weimo-share-card__footer">
          {nicknameVisible && (
            <div className="weimo-share-card__nickname">{nickname}</div>
          )}
          {datelineVisible && (
            <div className="weimo-share-card__footer-dateline">
              <div className="weimo-share-card__footer-dateline-left">
                {dateText && (
                  <time className="weimo-share-card__date" dateTime={dateTime}>
                    {dateText}
                  </time>
                )}
              </div>
              {brandVisible && (
                <div className="weimo-share-card__brand">
                  {brandIcon && (
                    <span className="weimo-share-card__brand-icon" aria-hidden="true">
                      {brandIcon}
                    </span>
                  )}
                  {brandLabel && (
                    <span className="weimo-share-card__brand-label">{brandLabel}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </footer>
      )}
    </article>
  )
}
