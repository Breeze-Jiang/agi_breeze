import 'dotenv/config'
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


const mcpClient = new MultiServerMCPClient({
  mcpServers:{'my-mcp-server':{
    command:'node',
    args:['C:\\Users\\38335\\Desktop\\workspace\\jzh_ai\\ai\\agent_in_action\\mcp-demo\\my-mcp-server.mjs']
  }}
})
const model = new ChatOpenAI({
  modelName:'deepseek-v4-pro',
  apiKey: process.env.DEEPSEEK_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: 'https://api.deepseek.com/v1',
  },
});

const tools = await mcpClient.getTools()

const res = await mcpClient.listResources()
let resourcesContent = ''
for(const [serverName,resources] of Object.entries(res)){
  for(const resource of resources){
    const content = await mcpClient.readResource(
      serverName,
      resource.uri
    )
    resourcesContent += content[0].text + '\n'
  }
}
console.log(resourcesContent,'------------------------------')

const modelWithTools = model.bindTools(tools)

async function runAgentWithTools(query,maxIterations=30){
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

// await runAgentWithTools('查询用户ID为002的详细信息')
await runAgentWithTools('MCP Server 的使用指南是什么？')
//关闭所有 MCP 子进程 与通信的通道 释放进程资源
// 关闭和 MCP server 的通信通道
// my-mcp-server.mjs 被启动了， 手动关闭进程， 释放相关资源， 避免脚本挂着不退出
// node langchain-mcp-test.mjs 会启动一个进程
// 启动一个子进程 child_process client 子进程连接 my-mcp-server.mjs 
// 主进程通stdio 和 他们通话 （先和子进程通话， 再和mcp server 通话）
// close() 把这个链接和子进程一起关掉
await mcpClient.close();


