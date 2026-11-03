import type { PackageCatalog } from '../../types'

export const agentCatalog = {
  id: 'weimo-ui-agent',
  title: 'weimo-ui-agent',
  pages: [
    {
      id: 'conversation-composer-zcode',
      name: '会话输入框 · zcode',
      exportName: 'ConversationComposerZcode',
      registryName: 'conversation-composer-zcode',
      packageExport: './components/conversation-composer-zcode',
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
