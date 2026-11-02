import { canvasTransparencyDefinition } from './packages/weimo-ui-image/canvas-transparency'
import { imageUploaderDefinition } from './packages/weimo-ui-image/image-uploader'
import { imageViewDefinition } from './packages/weimo-ui-image/image-view'
import type { ComponentId } from './manifest'
import type { ComponentDefinition } from './types'

export const componentDefinitionsById = {
  'image-view': imageViewDefinition,
  'image-uploader': imageUploaderDefinition,
  'canvas-transparency': canvasTransparencyDefinition,
} satisfies Record<ComponentId, ComponentDefinition>
