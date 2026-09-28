export type CardSaveShortcutEvent = {
  altKey: boolean
  ctrlKey: boolean
  key: string
  metaKey: boolean
  shiftKey: boolean
}

function isCardModShortcut(event: CardSaveShortcutEvent, key: string): boolean {
  return (
    event.key.toLowerCase() === key &&
    (event.metaKey || event.ctrlKey) &&
    !event.altKey &&
    !event.shiftKey
  )
}

export function isCardSaveShortcut(event: CardSaveShortcutEvent): boolean {
  return isCardModShortcut(event, 's')
}

export function isCardInlineMathShortcut(event: CardSaveShortcutEvent): boolean {
  return isCardModShortcut(event, 'e')
}
