import { X } from 'lucide-react'

import {
  CapsuleButton,
  type CapsuleButtonProps,
} from 'weimo-ui-core/components/capsule-button'
import { getIconButtonClassName } from 'weimo-ui-core/components/icon-button-model'
import 'weimo-ui-core/styles/icon-button.css'

// 编辑态移除后缀:装饰性 ghost xs 图标圆框。CapsuleButton 插槽禁嵌 button,
// 点击交互由外层胶囊统一承接,这里只承担「可移除」示能;模块级常量保引用
// 稳定,不给 CapsuleButton 的宽度测量 effect 制造每渲染一次的重测。
const EDITABLE_CAPSULE_REMOVE_SUFFIX = (
  <span aria-hidden="true" className={getIconButtonClassName('ghost', 'xs')}>
    <X aria-hidden="true" />
  </span>
)

export type EditableCapsuleProps = Omit<CapsuleButtonProps, 'state' | 'suffix'> & {
  editable?: boolean
}

// 可编辑胶囊:展示态是普通胶囊,编辑态转磨砂材质并挂 X 移除后缀。材质与
// 后缀由 editable 一并锁定,其余 props(点击、前缀、禁用等)原样透传;
// animateWidth 默认开启,编辑态进出的后缀增删走 180ms 宽度过渡。
export function EditableCapsule({
  animateWidth = true,
  editable = false,
  ...props
}: EditableCapsuleProps) {
  return (
    <CapsuleButton
      animateWidth={animateWidth}
      state={editable ? 'frosted' : 'default'}
      suffix={editable ? EDITABLE_CAPSULE_REMOVE_SUFFIX : null}
      {...props}
    />
  )
}
