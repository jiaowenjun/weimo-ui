import { conversationComposerDefinition } from './packages/weimo-ui-agent/conversation-composer'
import type { ComponentId } from './manifest'
import type { ComponentDefinition } from './types'

export const componentDefinitionsById = {
  'conversation-composer': conversationComposerDefinition,
} satisfies Record<ComponentId, ComponentDefinition>
