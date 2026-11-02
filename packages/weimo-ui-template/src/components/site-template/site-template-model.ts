export type ThemeMode = 'light' | 'dark' | 'system'

export function getNextThemeMode(current: ThemeMode): ThemeMode {
  switch (current) {
    case 'light':
      return 'dark'
    case 'dark':
      return 'system'
    case 'system':
      return 'light'
  }
}

export function getThemeToggleLabel(theme: ThemeMode) {
  switch (theme) {
    case 'light':
      return '切换到深色主题'
    case 'dark':
      return '切换到跟随系统主题'
    case 'system':
      return '切换到浅色主题'
  }
}

export function getSiteDocumentTitle(siteName: string, pageTitle?: string) {
  return pageTitle ? `${pageTitle} - ${siteName}` : siteName
}
