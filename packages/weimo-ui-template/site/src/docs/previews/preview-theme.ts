import type { ThemeMode } from 'weimo-ui-template/components/site-template'

const themeModes: readonly ThemeMode[] = ['light', 'dark', 'system']

/** 解析 ?theme=light|dark|system 查询参数,预览源路由共用 */
export function parseThemeMode(value: string | null): ThemeMode | undefined {
  return themeModes.find((mode) => mode === value)
}
