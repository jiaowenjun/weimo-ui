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
  exportName: string
  group: ComponentGroupId
  registryName: string
  packageExport: string
  searchAliases: readonly string[]
  summary?: string
  status: 'Ready' | 'Preview'
  frame?: 'stage' | 'plain'
  preview: (context: ComponentPreviewContext) => ReactNode
}

export type ComponentDefinition = Pick<
  ComponentDoc,
  'id'
  | 'summary'
  | 'status'
  | 'frame'
  | 'preview'
> & {
  searchAliases?: readonly string[]
}

export type ComponentDocGroup = {
  id: ComponentGroupId
  title: string
  items: ComponentDoc[]
}

export const componentDocs: ComponentDoc[] = componentManifest
  .filter((item) => item.docs)
  .map((item) => {
    const definition: ComponentDefinition = componentDefinitionsById[item.id]

    if (!definition || definition.id !== item.id) {
      throw new Error(`Missing component definition for ${item.id}`)
    }

    return {
      id: item.id,
      name: item.name,
      exportName: ('exportName' in item ? item.exportName : undefined) ?? item.name,
      group: item.group,
      registryName: item.registryName,
      packageExport: item.packageExport,
      searchAliases: definition.searchAliases ?? [],
      summary: definition.summary,
      status: definition.status,
      frame: definition.frame,
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
