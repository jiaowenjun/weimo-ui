import { useState } from 'react'

import {
  getPressableBgColorTone,
  getPressableClassName,
  getPressableToken,
  pressableToneMap,
} from '../../components/pressable'

type PressablePreviewState = 'idle' | 'hover' | 'active' | 'highlighted' | 'open'

const pressablePreviewStateLabels = {
  idle: 'idle',
  hover: 'hover',
  active: 'active',
  highlighted: 'highlighted',
  open: 'open',
} satisfies Record<PressablePreviewState, string>

const pressableHoverStates = ['idle', 'hover'] as const satisfies readonly PressablePreviewState[]
const pressableHoverActiveStates = ['idle', 'hover', 'active'] as const satisfies readonly PressablePreviewState[]
const pressableHighlightedStates = ['idle', 'highlighted'] as const satisfies readonly PressablePreviewState[]
const pressableHoverOpenStates = ['idle', 'hover', 'open'] as const satisfies readonly PressablePreviewState[]

type PressableScenario = {
  label: string
  source: string
  token: string
  className: string
  note: string
  states?: readonly PressablePreviewState[]
  cellClassName?: string
  stageClassName?: string
  backgroundTone?: 'light' | 'dark'
}

type PressableTokenGroup = {
  key: string
  label: string
  tone: string
  token: string
  valueRows: readonly { label: string; value: string }[]
  description: string
  scenarioRows: readonly PressableScenario[]
}

const feedbackItem = pressableToneMap.feedback
const feedbackClassName = getPressableClassName('feedback')

const pressableTokenGroups: readonly PressableTokenGroup[] = [
  {
    key: 'color-bg-hover-feedback',
    label: '反馈背景',
    tone: 'Pressable feedback',
    token: getPressableToken('feedback'),
    valueRows: [
      { label: 'token', value: '--color-bg-hover' },
      { label: '亮', value: feedbackItem.value.light },
      { label: '暗', value: feedbackItem.value.dark },
      { label: 'BgColor', value: getPressableBgColorTone('feedback') },
      { label: 'utility', value: feedbackClassName },
    ],
    description: feedbackItem.description,
    scenarioRows: [
      {
        label: 'GhostIconButton',
        source: 'weimo-ui icon-button--ghost',
        token: getPressableToken('feedback'),
        className: 'pressable-preview__scenario--icon-ghost',
        states: pressableHoverActiveStates,
        note: 'ghost 图标按钮 hover 背景直接消费 feedback token。',
      },
      {
        label: 'TagPicker option',
        source: 'weimo-ui tag-picker__option:hover',
        token: getPressableToken('feedback'),
        className: 'pressable-preview__scenario--tag-picker',
        states: pressableHoverActiveStates,
        note: '标签选择列表的 hover、focus 和 active 行复用同一 token。',
      },
      {
        label: 'TagTree row',
        source: 'weimo-ui tag-tree__row:hover',
        token: getPressableToken('feedback'),
        className: 'pressable-preview__scenario--tag-tree',
        states: pressableHoverStates,
        note: '侧栏标签树行 hover 通过共享反馈 token 呈现。',
      },
      {
        label: 'coss Button ghost',
        source: 'weimo-ui coss-button--ghost',
        token: getPressableToken('feedback'),
        className: 'pressable-preview__scenario--coss-button',
        states: pressableHoverOpenStates,
        note: 'ghost button 场景展示相同 hover 背景值。',
      },
      {
        label: 'biji-react close button',
        source: 'weimo-biji/frontend/web workspace-filter-bar__close:hover',
        token: getPressableToken('feedback'),
        className: 'pressable-preview__scenario--biji-close',
        states: pressableHoverStates,
        note: 'app-local close button 复用 --color-bg-hover 语义，具体值由 biji-react token 覆盖。',
      },
    ],
  },
  {
    key: 'smart-glass-hover',
    label: '玻璃动态反馈',
    tone: 'GlassSurface hover',
    token: '--glass-surface-hover-bg',
    valueRows: [
      { label: '亮色背景 fg', value: '--glass-surface-light-fg' },
      { label: '亮色背景 muted', value: '--glass-surface-light-muted-fg' },
      { label: '暗色背景 fg', value: '--glass-surface-dark-fg' },
      { label: '暗色背景 muted', value: '--glass-surface-dark-muted-fg' },
      { label: 'hover', value: 'currentColor 12%' },
      { label: '菜单项 hover', value: '--weimo-menu-item-hover-bg' },
      { label: '回退', value: getPressableToken('feedback') },
    ],
    description: '玻璃控件的 hover 背景由 GlassSurface 感知出的 foreground token 派生。',
    scenarioRows: [
      {
        label: '亮色背景 surface',
        source: 'weimo-ui glass-surface[data-background-tone="light"]',
        token: '--glass-surface-hover-bg',
        cellClassName: 'pressable-preview__scenario-cell--smart-glass-light',
        className: 'pressable-preview__scenario--smart-glass',
        stageClassName: 'pressable-preview__surface-stage--light',
        backgroundTone: 'light',
        states: pressableHoverStates,
        note: '亮色背景下用深色 foreground 推导 hover 背景。',
      },
      {
        label: '暗色背景 surface',
        source: 'weimo-ui glass-surface[data-background-tone="dark"]',
        token: '--glass-surface-hover-bg',
        cellClassName: 'pressable-preview__scenario-cell--smart-glass-dark',
        className: 'pressable-preview__scenario--smart-glass',
        stageClassName: 'pressable-preview__surface-stage--dark',
        backgroundTone: 'dark',
        states: pressableHoverStates,
        note: '暗色背景下用亮色 foreground 推导 hover 背景。',
      },
      {
        label: 'Menu item',
        source: 'weimo-ui weimo-menu__popup > .weimo-menu__item',
        token: '--weimo-menu-item-hover-bg',
        cellClassName: 'pressable-preview__scenario-cell--smart-glass-light',
        className: 'pressable-preview__scenario--menu-item',
        stageClassName: 'pressable-preview__surface-stage--light',
        backgroundTone: 'light',
        states: pressableHighlightedStates,
        note: 'Menu popup 在根上由 --glass-surface-fg 派生本地 hover 背景。',
      },
    ],
  },
  {
    key: 'chip-surface-feedback',
    label: '组件本地反馈变量',
    tone: 'ChipSurface hover',
    token: '--chip-surface-hover-background',
    valueRows: [
      { label: 'hover', value: getPressableToken('feedback') },
      { label: 'active', value: '--chip-surface-active-background' },
      { label: '回退 utility', value: feedbackClassName },
    ],
    description: 'ChipSurface 先暴露组件本地变量，再默认接回共享 feedback 背景。',
    scenarioRows: [
      {
        label: 'ChipSurface',
        source: 'weimo-ui chip-surface',
        token: '--chip-surface-hover-background',
        className: 'pressable-preview__scenario--chip-surface',
        states: pressableHoverActiveStates,
        note: 'interactive pill/tag 场景通过本地变量承接 feedback token；不展示真实 CSS 中不存在的持久按下态。',
      },
    ],
  },
]

export function PressableDemo() {
  const [hoveredSampleKey, setHoveredSampleKey] = useState<string | null>(null)
  const [activeSampleKey, setActiveSampleKey] = useState<string | null>(null)

  return (
    <div className="pressable-preview" aria-label="Pressable token 值与真实场景预览">
      {pressableTokenGroups.map((group) => (
        <div className="pressable-preview__row" key={group.key}>
          <div className="pressable-preview__identity">
            <div className="pressable-preview__meta">
              <span className="pressable-preview__label">{group.label}</span>
              <span className="pressable-preview__tone">{group.tone}</span>
            </div>
            <code className="pressable-preview__token">{group.token}</code>
            <code className="pressable-preview__value">
              {group.valueRows.map((valueRow) => (
                <span key={valueRow.label}>
                  {valueRow.label}: {valueRow.value}
                </span>
              ))}
            </code>
          </div>
          <p className="pressable-preview__description">{group.description}</p>
          <div className="pressable-preview__scenario-grid" aria-label={`${group.label} token 使用场景`}>
            {group.scenarioRows.map((scenario) => {
              const sampleKey = `${group.key}-${scenario.label}`
              const isHovered = hoveredSampleKey === sampleKey
              const scenarioStates = scenario.states ?? pressableHoverStates
              const scenarioSupportsActive = scenarioStates.some((state) => state === 'active')
              const isActive = scenarioSupportsActive && activeSampleKey === sampleKey
              const stateLabel = isActive ? 'active' : isHovered ? 'hover' : 'idle'
              const scenarioPreview = (
                <button
                  className={['pressable-preview__scenario', scenario.className].join(' ')}
                  data-active={isActive || undefined}
                  data-background-tone={scenario.backgroundTone}
                  data-hovered={isHovered || undefined}
                  data-state={stateLabel}
                  data-token={scenario.token}
                  onBlur={() => setHoveredSampleKey((currentKey) => (currentKey === sampleKey ? null : currentKey))}
                  onFocus={() => setHoveredSampleKey(sampleKey)}
                  onPointerCancel={() => setActiveSampleKey((currentKey) => (currentKey === sampleKey ? null : currentKey))}
                  onPointerDown={() => setActiveSampleKey(sampleKey)}
                  onPointerEnter={() => setHoveredSampleKey(sampleKey)}
                  onPointerLeave={() => setHoveredSampleKey((currentKey) => (currentKey === sampleKey ? null : currentKey))}
                  onPointerUp={() => setActiveSampleKey((currentKey) => (currentKey === sampleKey ? null : currentKey))}
                  type="button"
                >
                  <span className="pressable-preview__scenario-fill" />
                  <span className="pressable-preview__scenario-label">{scenario.label}</span>
                  <code className="pressable-preview__scenario-token">{scenario.token}</code>
                  <span className="pressable-preview__scenario-state">{stateLabel}</span>
                </button>
              )

              return (
                <div
                  className={['pressable-preview__scenario-cell', scenario.cellClassName ?? ''].filter(Boolean).join(' ')}
                  key={`${group.key}-${scenario.label}`}
                >
                  {scenario.stageClassName ? (
                    <div
                      className={['pressable-preview__surface-stage', scenario.stageClassName].join(' ')}
                      data-background-tone={scenario.backgroundTone}
                    >
                      {scenarioPreview}
                    </div>
                  ) : (
                    scenarioPreview
                  )}
                  <div className="pressable-preview__state-strip" aria-label={`${scenario.label} token 状态色带`}>
                    {scenarioStates.map((state) => (
                      <span className="pressable-preview__state-chip" data-state={state} key={state}>
                        <span className="pressable-preview__scenario-fill" />
                        <span>{pressablePreviewStateLabels[state]}</span>
                      </span>
                    ))}
                  </div>
                  <div className="pressable-preview__scenario-meta">
                    <span>{scenario.source}</span>
                    <span>{scenario.note}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
