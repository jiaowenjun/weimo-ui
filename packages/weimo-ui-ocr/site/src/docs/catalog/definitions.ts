import { ocrCardDefinition } from './packages/weimo-ui-ocr/ocr-card'
import { ocrComposerDefinition } from './packages/weimo-ui-ocr/ocr-composer'
import { ocrDetailDefinition } from './packages/weimo-ui-ocr/ocr-detail'
import { tagBarDefinition } from './packages/weimo-ui-ocr/tag-bar'
import type { ComponentId } from './manifest'
import type { ComponentDefinition } from './types'

export const componentDefinitionsById = {
  'ocr-card': ocrCardDefinition,
  'ocr-composer': ocrComposerDefinition,
  'ocr-detail': ocrDetailDefinition,
  'tag-bar': tagBarDefinition,
} satisfies Record<ComponentId, ComponentDefinition>
