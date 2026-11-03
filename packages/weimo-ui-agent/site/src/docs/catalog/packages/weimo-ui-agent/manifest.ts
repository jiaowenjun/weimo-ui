import type { PackageCatalog } from '../../types'

export const agentCatalog = {
  id: 'weimo-ui-agent',
  title: 'weimo-ui-agent',
  pages: [
    {
      id: 'conversation-composer',
      name: '会话输入框 · zcode',
      exportName: 'ConversationComposer',
      registryName: 'conversation-composer',
      packageExport: './components/conversation-composer',
    },
    {
      id: 'conversation-composer-dsh',
      name: '会话输入框 · dsh',
      exportName: 'ConversationComposerDsh',
      registryName: 'conversation-composer-dsh',
      packageExport: './components/conversation-composer-dsh',
    },
  ],
} as const satisfies PackageCatalog
