import { FrostedIconButton } from '../src/components/frosted-icon-button'
import { GhostIconButton } from '../src/components/ghost-icon-button'
import { TextButton, type TextButtonProps } from '../src/components/text-button'
import type { SideBarShellProps } from '../src/components/sidebar'
import {
  ActionMenu,
  type ActionMenuItem,
  type ActionMenuProps,
} from '../src/components/menu'
import type { HeatmapProps } from '../src/components/heatmap'
import {
  getPressableClassName,
  getPressableToken,
  pressableTones,
  type PressableTone,
} from '../src/components/pressable'

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

// @ts-expect-error SideBarShell owns the duplicated panel id internally.
const sideBarRejectsId: Extract<keyof SideBarShellProps, 'id'> = 'id'
// @ts-expect-error ariaLabel is the only public panel label prop.
const sideBarRejectsNativeAriaLabel: Extract<keyof SideBarShellProps, 'aria-label'> = 'aria-label'

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
