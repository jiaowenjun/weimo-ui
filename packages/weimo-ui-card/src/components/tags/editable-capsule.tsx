import { X } from 'lucide-react'

import {
  CapsuleButton,
  type CapsuleButtonProps,
} from 'weimo-ui-core/components/capsule-button'
import { getIconButtonClassName } from 'weimo-ui-core/components/icon-button-model'
import 'weimo-ui-core/styles/icon-button.css'

// 移除后缀:ghost xs 图标圆框,常驻挂载、随 suffixCollapsed 收展。CapsuleButton
// 插槽禁嵌 button,圆框保持
// span;默认装饰性(纯示能),传入 onRemove 时挂点击——后缀元素自身的 onClick
// 先于 CapsuleButton 插槽层的拦截执行,移除动作不会透传触发胶囊 onClick。
// aria-hidden 藏于胶囊按钮内:键盘与读屏的移除路径走标签选择器「留空可移除」,
// X 仅作指针便捷入口。装饰版用模块级常量保引用稳定,不给宽度测量 effect
// 制造每渲染重测;带 onRemove 版本随回调每渲染重建,测量开销可忽略。
const EDITABLE_CAPSULE_REMOVE_SUFFIX = (
  <span aria-hidden="true" className={getIconButtonClassName('ghost', 'xs')}>
    <X aria-hidden="true" />
  </span>
)

export type EditableCapsuleProps = Omit<CapsuleButtonProps, 'state' | 'suffix'> & {
  editable?: boolean
  onRemove?: () => void
}

// 可编辑胶囊:展示态是普通胶囊,编辑态转磨砂材质并展开 X 移除后缀(传入
// onRemove 时点 X 即移除)。X 后缀常驻挂载、由 CapsuleButton 的
// suffixCollapsed 收展:展示态收拢为 0 宽,编辑态槽宽与胶囊 inline-size
// 过渡同步展开,文字不会被 X 挤切;材质与后缀由 editable 一并锁定,其余
// props(点击、前缀、禁用等)原样透传;animateWidth 默认开启,编辑态
// 进出走 180ms 宽度过渡。
export function EditableCapsule({
  animateWidth = true,
  editable = false,
  onRemove,
  ...props
}: EditableCapsuleProps) {
  const removeSuffix = onRemove ? (
    <span
      aria-hidden="true"
      className={getIconButtonClassName('ghost', 'xs')}
      onClick={onRemove}
    >
      <X aria-hidden="true" />
    </span>
  ) : EDITABLE_CAPSULE_REMOVE_SUFFIX

  return (
    <CapsuleButton
      animateWidth={animateWidth}
      state={editable ? 'frosted' : 'default'}
      suffix={removeSuffix}
      suffixCollapsed={!editable}
      {...props}
    />
  )
}
