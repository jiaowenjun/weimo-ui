import type { PackageCatalog } from '../../types'

export const agentCatalog = {
  id: 'weimo-ui-agent',
  title: 'weimo-ui-agent',
  pages: [
    {
      id: 'conversation-composer',
      name: '会话输入框',
      exportName: 'ConversationComposer',
      registryName: 'conversation-composer',
      packageExport: './components/conversation-composer',
    },
  ],
} as const satisfies PackageCatalog
