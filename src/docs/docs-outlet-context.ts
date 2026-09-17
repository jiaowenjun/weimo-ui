import { useOutletContext } from 'react-router'

import { type ComponentDoc } from './component-docs'

export type DocsOutletContext = {
  docs: ComponentDoc[]
  onOpenSidebar: () => void
  openComponent: (id: string) => void
}

export function useDocsOutletContext() {
  return useOutletContext<DocsOutletContext>()
}
