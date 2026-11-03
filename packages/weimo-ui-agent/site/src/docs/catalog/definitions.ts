import { conversationComposerZcodeDefinition } from './packages/weimo-ui-agent/conversation-composer-zcode'
import { conversationComposerDshDefinition } from './packages/weimo-ui-agent/conversation-composer-dsh'
import type { ComponentId } from './manifest'
import type { ComponentDefinition } from './types'

export const componentDefinitionsById = {
  'conversation-composer-zcode': conversationComposerZcodeDefinition,
  'conversation-composer-dsh': conversationComposerDshDefinition,
} satisfies Record<ComponentId, ComponentDefinition>
