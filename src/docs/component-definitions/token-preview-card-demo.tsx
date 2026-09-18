import { bgBlurToneMap, getBgBlurClassName } from '../../components/bg-blur'
import { bgColorToneMap, getBgColorClassName } from '../../components/bg-color'
import {
  borderColorToneMap,
  getBorderColorClassName,
} from '../../components/border-color'
import { borderRadiusScaleMap } from '../../components/border-radius'
import { fontSizeScaleMap, getFontSizeClassName } from '../../components/font-size'
import { getHeatColorClassName, heatColorMap } from '../../components/heat-color'
import { pressableToneMap } from '../../components/pressable'
import { getTextColorClassName, textColorToneMap } from '../../components/text-color'
import { TokenPreviewCard } from '../../components/token-preview-card'

export function TokenPreviewCardDemo() {
  const opaqueBackground = bgColorToneMap.primary
  const transparentBackground = bgColorToneMap.selection
  const backgroundBlur = bgBlurToneMap.backdrop
  const borderRadius = borderRadiusScaleMap.base
  const borderColor = borderColorToneMap.accent
  const fontSize = fontSizeScaleMap.stat
  const textColor = textColorToneMap.danger
  const heatColor = heatColorMap[3]
  const pressable = pressableToneMap.feedback

  return (
    <>
      <h2 className="token-preview-card-demo__category">背景与材质</h2>

      <TokenPreviewCard
        darkValue={opaqueBackground.value.dark}
        label="非透明背景色"
        token={opaqueBackground.token}
        value={opaqueBackground.value.light}
      >
        <div className="bg-color-preview__sample" aria-hidden="true">
          <span
            className={`bg-color-preview__sample-fill ${getBgColorClassName('primary')}`}
          />
        </div>
      </TokenPreviewCard>

      <TokenPreviewCard
        darkValue={transparentBackground.value.dark}
        label="透明背景色"
        token={transparentBackground.token}
        value={transparentBackground.value.light}
      >
        <div className="token-preview-card__surface-preview" aria-hidden="true">
          <span className="token-preview-card__surface-backdrop" />
          <span
            className={`token-preview-card__surface ${getBgColorClassName('selection')}`}
          />
        </div>
      </TokenPreviewCard>

      <TokenPreviewCard
        label="背景模糊度"
        token={backgroundBlur.blurToken}
        value={backgroundBlur.blurValue}
      >
        <div className="token-preview-card__surface-preview" aria-hidden="true">
          <span className="token-preview-card__surface-backdrop" />
          <span
            className={`token-preview-card__surface ${getBgBlurClassName('backdrop')}`}
          />
        </div>
      </TokenPreviewCard>

      <h2 className="token-preview-card-demo__category">边框与形状</h2>

      <TokenPreviewCard
        label="边框圆角"
        token={borderRadius.token}
        value={borderRadius.value}
      >
        <div
          aria-hidden="true"
          className="border-radius-preview__sample"
          style={{ borderRadius: `var(${borderRadius.token})` }}
        />
      </TokenPreviewCard>

      <TokenPreviewCard
        darkValue={borderColor.value.dark}
        label="边框色"
        token={borderColor.token}
        value={borderColor.value.light}
      >
        <div
          aria-hidden="true"
          className={`border-color-preview__sample ${getBorderColorClassName('accent')}`}
        />
      </TokenPreviewCard>

      <h2 className="token-preview-card-demo__category">排版</h2>

      <TokenPreviewCard label="字号" token={fontSize.token} value={fontSize.value}>
        <p
          aria-hidden="true"
          className={`font-size-preview__sample ${getFontSizeClassName('stat')}`}
        >
          Aa
        </p>
      </TokenPreviewCard>

      <TokenPreviewCard
        darkValue={textColor.value.dark}
        label="字色"
        token={textColor.token}
        value={textColor.value.light}
      >
        <p
          aria-hidden="true"
          className={`text-color-preview__sample ${getTextColorClassName('danger')}`}
        >
          Aa
        </p>
      </TokenPreviewCard>

      <h2 className="token-preview-card-demo__category">状态与自定义内容</h2>

      <TokenPreviewCard
        darkValue={heatColor.value.dark}
        label="热力色"
        token={heatColor.token}
        value={heatColor.value.light}
      >
        <div
          aria-hidden="true"
          className={`heat-color-preview__sample ${getHeatColorClassName(3)}`}
        />
      </TokenPreviewCard>

      <TokenPreviewCard
        darkValue={pressable.value.dark}
        label="按压反馈"
        token={pressable.token}
        value={pressable.value.light}
      >
        <button type="button" className="pressable-preview__sample">
          悬停 / 按压
        </button>
      </TokenPreviewCard>

      <TokenPreviewCard
        label="自定义内容"
        token="--font-mono"
        value="SFMono-Regular, Menlo, monospace"
      >
        <div className="md-style-preview__effect" aria-hidden="true">
          <code className="md-style-preview__mini-code md-style-preview__mini-code--mono">
            token: value
          </code>
        </div>
      </TokenPreviewCard>
    </>
  )
}
