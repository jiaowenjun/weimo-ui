import { conversationComposerDefinition } from './packages/weimo-ui-agent/conversation-composer'
import { conversationComposerDshDefinition } from './packages/weimo-ui-agent/conversation-composer-dsh'
import type { ComponentId } from './manifest'
import type { ComponentDefinition } from './types'

export const componentDefinitionsById = {
  'conversation-composer': conversationComposerDefinition,
  'conversation-composer-dsh': conversationComposerDshDefinition,
} satisfies Record<ComponentId, ComponentDefinition>
