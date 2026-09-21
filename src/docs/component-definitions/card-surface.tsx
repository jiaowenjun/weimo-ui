import { bgColorToneMap, getBgColorToken } from '../../components/bg-color'
import {
  borderColorToneMap,
  getBorderColorToken,
} from '../../components/border-color'
import {
  borderRadiusScaleMap,
  getBorderRadiusToken,
} from '../../components/border-radius'
import { CardSurface } from '../../components/card-surface'
import { ComponentPreviewCard } from '../../components/component-preview-card'
import type { ComponentPreviewCardItem } from '../../components/component-preview-card'
import { getTextColorToken, textColorToneMap } from '../../components/text-color'
import type { ComponentDefinition } from '../component-docs'

// 顺序与 card-surface.css 的材质声明一致：color / border / border-radius / background / box-shadow。
const cardSurfaceMaterialTokens = [
  {
    darkValue: textColorToneMap.primary.value.dark,
    token: getTextColorToken('primary'),
    value: textColorToneMap.primary.value.light,
  },
  {
    darkValue: borderColorToneMap.default.value.dark,
    token: getBorderColorToken('default'),
    value: borderColorToneMap.default.value.light,
  },
  {
    token: getBorderRadiusToken('base'),
    value: borderRadiusScaleMap.base.value,
  },
  {
    darkValue: bgColorToneMap.card.value.dark,
    token: getBgColorToken('card'),
    value: bgColorToneMap.card.value.light,
  },
  {
    darkValue: 'none',
    token: '--shadow-card',
    value: '0 1px 4px hsl(0 0% 0% / 0.035)',
  },
] as const satisfies readonly ComponentPreviewCardItem[]

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function CardSurfaceDemo() {
  return (
    <ComponentPreviewCard items={cardSurfaceMaterialTokens} label="卡片材质">
      <div aria-hidden="true" className="card-surface-preview">
        <span className="component-preview-card__surface-backdrop" />
        <CardSurface className="card-surface-preview__tile">
          <span className="card-surface-preview__title">Card Surface</span>
          <span className="card-surface-preview__meta">静态实体卡片材质</span>
        </CardSurface>
      </div>
    </ComponentPreviewCard>
  )
}

export const cardSurfaceDefinition = {
  id: 'card-surface',
  summary: '统一静态实体卡片的背景、边框、圆角与轻量阴影',
  status: 'Preview',
  frame: 'plain',
  searchAliases: [
    'CardSurface',
    '材质',
    '卡片材质',
    ...cardSurfaceMaterialTokens.map((item) => item.token),
  ],
  preview: () => <CardSurfaceDemo />,
} satisfies ComponentDefinition
