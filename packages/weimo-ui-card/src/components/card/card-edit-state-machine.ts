export type CardMode = 'view' | 'preparing-edit' | 'edit'

export type CardInitialMode = 'view' | 'edit'

export type CardEditTransitionEvent =
  | { type: 'request-edit' }
  | { type: 'editor-ready' }
  | { type: 'request-view' }

export type ResolvedCardModeState = {
  isEditing: boolean
  isPreparingEdit: boolean
  preloadEditor: boolean
  viewMode: 'view' | 'edit'
}

const CARD_EDIT_TRANSITIONS: Record<
  CardMode,
  Partial<Record<CardEditTransitionEvent['type'], CardMode>>
> = {
  view: {
    'request-edit': 'preparing-edit',
  },
  'preparing-edit': {
    'editor-ready': 'edit',
  },
  edit: {
    'request-view': 'view',
  },
}

export function resolveInitialCardMode(initialMode: CardInitialMode): CardMode {
  return initialMode === 'edit' ? 'edit' : 'view'
}

export function reduceCardMode(
  mode: CardMode,
  event: CardEditTransitionEvent,
): CardMode {
  return CARD_EDIT_TRANSITIONS[mode][event.type] ?? mode
}

export function resolveCardModeState(mode: CardMode): ResolvedCardModeState {
  const isEditing = mode === 'edit'
  const isPreparingEdit = mode === 'preparing-edit'

  return {
    isEditing,
    isPreparingEdit,
    preloadEditor: isPreparingEdit,
    viewMode: isEditing ? 'edit' : 'view',
  }
}
