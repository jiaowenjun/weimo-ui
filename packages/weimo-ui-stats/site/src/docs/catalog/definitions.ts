import { heatmapDefinition } from './packages/weimo-ui-stats/heatmap'
import type { ComponentId } from './manifest'
import type { ComponentDefinition } from './types'

export const componentDefinitionsById = {
  heatmap: heatmapDefinition,
} satisfies Record<ComponentId, ComponentDefinition>
