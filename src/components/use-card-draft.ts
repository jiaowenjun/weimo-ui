import { useRef, useState } from 'react'
import type { CardDraft, CardNote } from './card'

function createDraftFromNote(note: CardNote): CardDraft {
  return {
    content: note.content,
    tags: note.tags ?? [],
    title: note.title,
  }
}

export function useCardDraft(
  note: CardNote,
  onDraftChange?: (draft: CardDraft) => void,
) {
  const [draft, setDraft] = useState(() => createDraftFromNote(note))
  const draftRef = useRef(draft)

  function commitDraft(nextDraft: CardDraft, notify = true) {
    draftRef.current = nextDraft
    setDraft(nextDraft)
    if (notify) onDraftChange?.(nextDraft)
  }

  function resetFromNote(nextNote: CardNote, notify = false) {
    commitDraft(createDraftFromNote(nextNote), notify)
  }

  function updateContent(content: string) {
    commitDraft({
      ...draftRef.current,
      content,
    })
  }

  function updateTitle(title: string) {
    commitDraft({
      ...draftRef.current,
      title,
    })
  }

  function updateTags(tags: string[]) {
    commitDraft({
      ...draftRef.current,
      tags,
    })
  }

  return {
    draft,
    current: draftRef.current,
    resetFromNote,
    updateContent,
    updateTags,
    updateTitle,
  }
}
