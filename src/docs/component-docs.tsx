import type { ReactNode } from 'react'

import { componentDefinitionsById } from './component-definitions'
import {
  componentGroups,
  componentManifest,
  type ComponentGroupId,
  type ComponentId,
} from './components-manifest'

export type ComponentPreviewContext = {
  onOpenSidebar: () => void
}

export type ComponentDoc = {
  id: ComponentId
  name: string
  group: ComponentGroupId
  summary: string
  status: 'Ready' | 'Preview'
  preview: (context: ComponentPreviewContext) => ReactNode
}

export type ComponentDefinition = Pick<
  ComponentDoc,
  'id'
  | 'summary'
  | 'status'
  | 'preview'
>

export type ComponentDocGroup = {
  id: ComponentGroupId
  title: string
  items: ComponentDoc[]
}

export const componentDocs: ComponentDoc[] = componentManifest
  .filter((item) => item.docs)
  .map((item) => {
    const definition = componentDefinitionsById[item.id]

    if (!definition || definition.id !== item.id) {
      throw new Error(`Missing component definition for ${item.id}`)
    }

    return {
      id: item.id,
      name: item.name,
      group: item.group,
      summary: definition.summary,
      status: definition.status,
      preview: definition.preview,
    }
  })

export const componentDocGroups: ComponentDocGroup[] = componentGroups
  .map((group) => ({
    id: group.id,
    title: group.title,
    items: componentDocs.filter((doc) => doc.group === group.id),
  }))
  .filter((group) => group.items.length > 0)
