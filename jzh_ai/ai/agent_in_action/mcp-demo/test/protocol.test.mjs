import assert from 'node:assert/strict'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const serverPath = fileURLToPath(new URL('../my-mcp-server.mjs', import.meta.url))

test('completes stdio handshake, Tool discovery/invocation, and Resource reading', async () => {
  const client = new Client({ name: 'mcp-demo-protocol-test', version: '1.0.0' })
  const transport = new StdioClientTransport({ command: process.execPath, args: [serverPath] })
  try {
    await client.connect(transport)
    const tools = await client.listTools()
    assert.ok(tools.tools.some(({ name }) => name === 'query_user'))

    const found = await client.callTool({ name: 'query_user', arguments: { user_id: '001' } })
    assert.match(found.content[0].text, /姓名jzh/)

    const missing = await client.callTool({ name: 'query_user', arguments: { user_id: '999' } })
    assert.match(missing.content[0].text, /不存在/)

    const resources = await client.listResources()
    assert.ok(resources.resources.some(({ uri }) => uri === 'docs:/guide'))
    const guide = await client.readResource({ uri: 'docs:/guide' })
    assert.match(guide.contents[0].text, /MCP Server 使用指南/)
  } finally {
    await client.close()
  }
})
