import { describe, expect, it } from 'vitest'

import { resolveLeadingCommand } from '../src/components/conversation-composer-dsh/use-dsh-composer'
import type { DshCommand } from '../src/components/conversation-composer-dsh/submit-machine'

const commands: readonly DshCommand[] = [
  { name: 'clear', token: '/clear ', hint: '清空', run: async () => ({ kind: 'success' }) },
  { name: 'model', token: '/model ', run: async () => ({ kind: 'success' }) },
]

describe('resolveLeadingCommand 草稿前导命令形态', () => {
  it('token(含分隔符)完整出现即命中', () => {
    expect(resolveLeadingCommand('/model glm', commands)?.name).toBe('model')
    expect(resolveLeadingCommand('/clear ', commands)?.name).toBe('clear')
  })

  it('裸 token 要求词边界或恰好等值,/clearx 不得误配 /clear', () => {
    expect(resolveLeadingCommand('/clear', commands)?.name).toBe('clear')
    expect(resolveLeadingCommand('/clear extra', commands)?.name).toBe('clear')
    expect(resolveLeadingCommand('/clearx', commands)).toBeUndefined()
    expect(resolveLeadingCommand('/mod', commands)).toBeUndefined()
  })

  it('非命令草稿与空草稿返回 undefined', () => {
    expect(resolveLeadingCommand('普通消息', commands)).toBeUndefined()
    expect(resolveLeadingCommand('', commands)).toBeUndefined()
    expect(resolveLeadingCommand('前缀 /clear', commands)).toBeUndefined()
  })
})
