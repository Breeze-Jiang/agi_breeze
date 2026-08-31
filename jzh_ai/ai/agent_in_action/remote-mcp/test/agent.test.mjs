import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import {
  buildMcpServers,
  runAgentWithTools,
  validateRuntimeConfig,
} from '../mcp-test.mjs'

test('reports missing live configuration without exposing configured values', () => {
  assert.throws(
    () => validateRuntimeConfig({ DEEPSEEK_API_KEY: 'configured' }, ['DEEPSEEK_API_KEY', 'AMAP_MCP_KEY']),
    /AMAP_MCP_KEY/,
  )
})

test('builds the local MCP path from the module and keeps paths and keys out of source', () => {
  const servers = buildMcpServers({ AMAP_MCP_KEY: 'configured' })
  const localServerPath = servers['my-mcp-server'].args[0]
  const expectedServerPath = fileURLToPath(new URL('../../mcp-demo/my-mcp-server.mjs', import.meta.url))
  const source = readFileSync(new URL('../mcp-test.mjs', import.meta.url), 'utf8')

  // 修复说明：运行时必须使用绝对路径启动子进程，但源码不能写死某台机器的绝对路径或密钥。
  assert.equal(localServerPath, expectedServerPath)
  assert.doesNotMatch(source, /[A-Za-z]:\\\\Users\\\\[^'"\n]+\\\\Desktop\\\\workspace/)
  assert.doesNotMatch(source, /mcp\.amap\.com\/mcp\?key=[a-f0-9]{32}["']/)
  assert.match(servers['amap-mcp'].url, /key=configured$/)
})

test('appends a correlated ToolMessage and returns the final model response', async () => {
  const capturedMessages = []
  const responses = [
    { content: '', tool_calls: [{ id: 'call-1', name: 'query_user', args: { user_id: '001' } }] },
    { content: '完成', tool_calls: [] },
  ]
  const tools = [{
    name: 'query_user',
    invoke: async ({ user_id }) => `用户${user_id}`,
  }]
  const model = {
    bindTools(boundTools) {
      assert.equal(boundTools, tools)
      return {
        invoke: async (messages) => {
          capturedMessages.push([...messages])
          return responses.shift()
        },
      }
    },
  }

  const answer = await runAgentWithTools('查询用户', { tools, model, maxIterations: 3 })

  assert.equal(answer, '完成')
  assert.equal(capturedMessages.length, 2)
  assert.equal(capturedMessages[1].at(-1).tool_call_id, 'call-1')
  assert.equal(capturedMessages[1].at(-1).content, '用户001')
})
