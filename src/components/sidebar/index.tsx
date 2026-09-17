import { SideBarShell, type SideBarShellProps } from './sidebar-shell'

export { SideBarShell, type SideBarShellProps } from './sidebar-shell'

export type SideBarProps = SideBarShellProps

export function SideBar({ children, ...props }: SideBarProps) {
  return <SideBarShell {...props}>{children}</SideBarShell>
}
