import type { ReactNode } from 'react'

import { componentDefinitionsById } from './component-definitions'
import {
  componentPackages,
  componentManifest,
  type ComponentId,
  type ComponentPackageName,
} from './components-manifest'

export type ComponentPreviewContext = {
  onOpenSidebar: () => void
}

export type ComponentDoc = {
  id: ComponentId
  name: string
  exportName: string
  packageName: ComponentPackageName
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

export type ComponentDocPackage = {
  id: ComponentPackageName
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

    const pageComponents = componentManifest.filter(
      (component) => component.page === item.id,
    )

    return {
      id: item.id,
      name: item.name,
      exportName: ('exportName' in item ? item.exportName : undefined) ?? item.name,
      packageName: item.packageName,
      registryName: item.registryName,
      packageExport: item.packageExport,
      searchAliases: [
        item.packageName,
        ...(definition.searchAliases ?? []),
        ...pageComponents.flatMap((component) => [
          component.id,
          component.name,
          component.registryName,
          component.packageExport,
          ...('exportName' in component ? [component.exportName] : []),
        ]),
      ],
      summary: definition.summary,
      status: definition.status,
      frame: definition.frame,
      preview: definition.preview,
    }
  })

export const componentDocPackages: ComponentDocPackage[] = componentPackages
  .map((packageItem) => ({
    id: packageItem.id,
    title: packageItem.title,
    items: componentDocs.filter((doc) => doc.packageName === packageItem.id),
  }))
  .filter((packageItem) => packageItem.items.length > 0)
