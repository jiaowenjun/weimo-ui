import { tagTreeDefinition } from './packages/weimo-ui-tagtree/tag-tree'
import type { ComponentId } from './manifest'
import type { ComponentDefinition } from './types'

export const componentDefinitionsById = {
  'tag-tree': tagTreeDefinition,
} satisfies Record<ComponentId, ComponentDefinition>
