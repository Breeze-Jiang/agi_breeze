import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';     
import { z } from 'zod'

const database = {
  users:{
    '001':{
      id:'001',
      name:'jzh',
      email:'zh@qq.com',
      role:'admin'
    },
    '002':{
      id:'002',
      name:'guangguang',
      email:'guangguang@qq.com',
      role:'user'
    },
    '003':{
      id:'003',
      name:'li',
      email:'li@qq.com',
      role:'user'
    }
  }
}

const server = new McpServer({
  name:'my-mcp-server',
  version:'1.0.0'
})
server.registerTool('query_user',{
  description:'查询数据库中的用户信息。输入用户ID，返回该用户的详细信息（姓名、邮箱、角色）',
  inputSchema:{
    user_id:z.string().describe('用户ID,例如001')
  }
},async ({user_id})=>{
  const user = database.users[user_id]
  if(!user){//mcp返回规范
    return {
      content:[
        {type:'text',text:`用户ID${user_id}不存在.可用id:001,002,003`}
      ]
    }
  }
  return {
    content:[
      {type:'text',
        text:`用户ID${user_id}的详细信息为:姓名${user.name},邮箱${user.email},角色${user.role}`}
    ]
  }
})

// 提供静态资源
server.registerResource(
  '使用指南',
  //http:// stdio -> 定义的访问路径
  'docs:/guide',
  {
    description:'MCP Server 使用指南',
    mimeType:'text/plain',
  },
  async () => {
    return {
      contents:[
        {
          uri:'docs:/guide',
          mimeType:'text/plain',
          text:`MCP Server 使用指南
          功能：提供用户查询等工具。
          使用：在 Cursor 等 MCP Client 中通过自然语言对话，Cursor 会自动调用相应工具。`
        }
      ]
    }
  }
)
//跨进程通信方式 stdio 
const transport = new StdioServerTransport();
await server.connect(transport)
