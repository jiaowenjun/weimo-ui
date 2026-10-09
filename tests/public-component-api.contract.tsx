import { FrostedIconButton } from 'weimo-ui/components/frosted-icon-button'
import { GhostIconButton } from 'weimo-ui/components/ghost-icon-button'
import { TextButton, type TextButtonProps } from 'weimo-ui/components/text-button'
import type { SideBarProps } from 'weimo-ui/components/sidebar'
import {
  ActionMenu,
  type ActionMenuItem,
  type ActionMenuProps,
} from 'weimo-ui/components/menu'
import type { HeatmapProps } from '../packages/weimo-ui-stats/src/components/heatmap'
import type {
  MdEditorSimpleHandle,
  MdEditorSimpleProps,
  MdEditorSimpleSelectionFormat,
} from 'weimo-ui/components/md-editor-simple'
import {
  getPressableClassName,
  getPressableToken,
  pressableTones,
  type PressableTone,
} from 'weimo-ui/components/pressable'

const textButtonProps: TextButtonProps = { disabled: false, type: 'button' }
const glassIconButton = <FrostedIconButton aria-label="Glass action" />
const ghostIconButton = <GhostIconButton aria-label="Ghost action" />
const textButton = <TextButton {...textButtonProps}>Text action</TextButton>
// @ts-expect-error FrostedIconButton does not expose the removed variant prop.
const glassIconButtonRejectsVariant = <FrostedIconButton aria-label="Glass" variant="glass" />
// @ts-expect-error GhostIconButton does not expose the removed variant prop.
const ghostIconButtonRejectsVariant = <GhostIconButton aria-label="Ghost" variant="ghost" />
// @ts-expect-error TextButton stays a native button surface without variants.
const textButtonRejectsVariant = <TextButton variant="outline">Text</TextButton>

// @ts-expect-error SideBar owns the duplicated panel id internally.
const sideBarRejectsId: Extract<keyof SideBarProps, 'id'> = 'id'
// @ts-expect-error ariaLabel is the only public panel label prop.
const sideBarRejectsNativeAriaLabel: Extract<keyof SideBarProps, 'aria-label'> = 'aria-label'

const menuItems: ActionMenuItem[] = [{ key: 'edit', label: '编辑' }]
const menuProps: ActionMenuProps = { ariaLabel: 'Actions', items: menuItems }
const actionMenu = <ActionMenu {...menuProps} />
// @ts-expect-error ActionMenu uses items instead of arbitrary children.
const actionMenuRejectsChildren = <ActionMenu ariaLabel="Actions" items={[]}>child</ActionMenu>

const heatmapProps: HeatmapProps = { activeDate: '2026-07-22' }
// @ts-expect-error Heatmap owns its local-date anchor.
const heatmapRejectsToday: HeatmapProps = { today: '2026-07-22' }
// @ts-expect-error ariaLabel is the only public root label prop.
const heatmapRejectsNativeAriaLabel: HeatmapProps = { 'aria-label': 'Heatmap' }

const pressableTone: PressableTone = pressableTones[0]
const pressableClassName = getPressableClassName(pressableTone)
const pressableToken = getPressableToken(pressableTone)

const simpleSelectionFormat: MdEditorSimpleSelectionFormat = {
  block: 'heading',
  bold: false,
}
const simpleEditorProps: MdEditorSimpleProps = {
  onSelectionFormatChange: (format) => void format,
}
const simpleEditorRejectsInstance: MdEditorSimpleProps = {
  // @ts-expect-error MdEditorSimple exposes semantic state instead of its Tiptap instance.
  onEditorChange: () => undefined,
}
declare const simpleEditorHandle: MdEditorSimpleHandle
const simpleEditorCommandResult = simpleEditorHandle.toggleBlockFormat('quote')

void glassIconButton
void ghostIconButton
void textButton
void glassIconButtonRejectsVariant
void ghostIconButtonRejectsVariant
void textButtonRejectsVariant
void sideBarRejectsId
void sideBarRejectsNativeAriaLabel
void actionMenu
void actionMenuRejectsChildren
void heatmapProps
void heatmapRejectsToday
void heatmapRejectsNativeAriaLabel
void pressableClassName
void pressableToken
void simpleSelectionFormat
void simpleEditorProps
void simpleEditorRejectsInstance
void simpleEditorCommandResult
