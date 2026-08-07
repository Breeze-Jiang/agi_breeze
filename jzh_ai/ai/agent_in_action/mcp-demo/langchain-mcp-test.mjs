import 'dotenv/config'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
//agent 配置 mcp client 可以配置多个mcp server 的client
import {MultiServerMCPClient} from '@langchain/mcp-adapters'
import {ChatOpenAI} from '@langchain/openai'
import chalk from 'chalk'
import { 
  HumanMessage,
  AIMessage, 
  SystemMessage ,
  ToolMessage
} from '@langchain/core/messages'

const serverPath = fileURLToPath(new URL('./my-mcp-server.mjs', import.meta.url))

export function createMcpClient() {
  return new MultiServerMCPClient({
    mcpServers:{'my-mcp-server':{
      command: process.execPath,
      args:[serverPath],
    }},
  })
}

export async function loadResources(mcpClient) {
  const resources = await mcpClient.listResources()
  let resourcesContent = ''
  for(const [serverName,serverResources] of Object.entries(resources)){
    for(const resource of serverResources){
      const content = await mcpClient.readResource(serverName, resource.uri)
      resourcesContent += content[0].text + '\n'
    }
  }
  return resourcesContent
}

export async function runAgentWithTools(query, { tools, model, resourcesContent, maxIterations = 30 }){
  const modelWithTools = model.bindTools(tools)
  const messages = [
    new HumanMessage(query),
    new SystemMessage(resourcesContent)
  ]
  for(let i= 0;i<maxIterations;i++){
    console.log(chalk.bgGreen(`正在等待ai思考，第${i+1}轮`))
    const response = await modelWithTools.invoke(messages)
    messages.push(response)
    if(!response.tool_calls || response.tool_calls.length === 0){
      console.log(`AI 最终回复：\n${response.content}`)
      return response.content
    }
    console.log(chalk.bgBlue(`检测到${response.tool_calls.length}个工具调用`))
    console.log(chalk.bgBlue(`工具调用详情：${response.tool_calls.map(t=>t.name).join(', ')}`))
    for(const toolCall of response.tool_calls){
      //find方法 匹配的那一项 如果找到了，后面就不执行了
      //promise.all 只要一个失败了，不会等待剩下的结果，
      // 但是已经发起的任务会继续执行
      const foundTool = tools.find(t=>t.name === toolCall.name);
      if(foundTool){
        const toolResult = await foundTool.invoke(toolCall.args)
        //返回的是纯文本，tool 的返回是由上下文的相关性判断的
        // 但是一定要带上 tool_call_id
        messages.push(new ToolMessage({
          tool_call_id:toolCall.id,
          content:toolResult
        }))
      }
    }
  }
  //循环次数（轮数）达到30次，仍然无法回答问题，返回最后一轮
  return messages[messages.length-1].content
}

export async function main() {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error('Missing required environment variable: DEEPSEEK_API_KEY')
  }
  const mcpClient = createMcpClient()
  try {
    const tools = await mcpClient.getTools()
    const resourcesContent = await loadResources(mcpClient)
    const model = new ChatOpenAI({
      modelName:'deepseek-v4-pro',
      apiKey: process.env.DEEPSEEK_API_KEY,
      temperature: 0,
      configuration: { baseURL: 'https://api.deepseek.com/v1' },
    })
    return await runAgentWithTools('MCP Server 的使用指南是什么？', {
      tools,
      model,
      resourcesContent,
    })
  } finally {
    await mcpClient.close()
  }
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])
if (isDirectRun) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}


