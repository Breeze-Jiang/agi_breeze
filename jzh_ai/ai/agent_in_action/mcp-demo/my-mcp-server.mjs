import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';     
import { z } from 'zod'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { GUIDE_TEXT, GUIDE_URI, queryUser } from './src/user-service.mjs'

export function createServer() {
  const server = new McpServer({ name:'my-mcp-server', version:'1.0.0' })
  server.registerTool('query_user', {
    description:'查询数据库中的用户信息。输入用户ID，返回该用户的详细信息（姓名、邮箱、角色）',
    inputSchema:{ user_id:z.string().describe('用户ID,例如001') },
  }, async ({ user_id }) => ({
    content: [{ type:'text', text: queryUser(user_id).text }],
  }))
  server.registerResource(
    '使用指南',
    GUIDE_URI,
    { description:'MCP Server 使用指南', mimeType:'text/plain' },
    async () => ({
      contents:[{ uri: GUIDE_URI, mimeType:'text/plain', text: GUIDE_TEXT }],
    }),
  )
  return server
}

export async function main() {
  const transport = new StdioServerTransport()
  await createServer().connect(transport)
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])
if (isDirectRun) {
  await main()
}
