import 'dotenv/config';
import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { ChatOpenAI } from '@langchain/openai';
import chalk from 'chalk';
import {
  HumanMessage,
  SystemMessage,
  ToolMessage
} from '@langchain/core/messages';

const model = new ChatOpenAI({
  modelName: 'deepseek-v4-pro',
  apiKey: process.env.DEEPSEEK_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: 'https://api.deepseek.com/v1',
  },
});

const mcpClient = new MultiServerMCPClient({
  mcpServers: {
    'amap-mcp': {
      "url": "https://mcp.amap.com/mcp?key=f58f8879063a5f61df94bbb40a6305cb"
    },
     "my-mcp-server": {
        "command": "node",
        "args": ["C:\\Users\\38335\\Desktop\\workspace\\jzh_ai\\ai\\agent_in_action\\mcp-demo\\my-mcp-server.mjs"]
      },
    'filesystem': {
      command: 'npx',
      args: [
        '-y',
        '@modelcontextprotocol/server-filesystem',
        // 允许访问的文件夹，可以配置多个，用空格隔开
        'C:\\Users\\38335\\Desktop\\workspace\\jzh_ai\\ai\\agent_in_action\\remote-mcp'
      ]
    },
    // Chrome‑DevTools MCP，默认连接本地打开的Chrome（开启远程调试：chrome --remote-debugging-port=9222）
    'chrome-devtools': {
      command: 'npx',
      args: [
        '-y',
        'chrome-devtools-mcp@latest',
      ]
    }
  }
})

const tools = await mcpClient.getTools();
console.log(tools);

const modelWithTools = model.bindTools(tools);

async function runAgentWithTools(query, maxIterations = 30) {
  const message = [
    new HumanMessage(query)
  ];
  for (let i = 0; i < maxIterations; i++) {
    console.log(chalk.bgGreen(`第${i + 1}轮`));
    const response = await modelWithTools.invoke(message);
    message.push(response);

    if (!response.tool_calls || response.tool_calls.length === 0) {
     console.log(chalk.bgGreen(`ai回答：${response.content}`));
     return response.content;
    }

  console.log(chalk.bgBlue(`工具调用：${response.tool_calls.map(t => t.name).join(',')}`))

  for (const tool_call of response.tool_calls) {
    const foundTool = tools.find(t => t.name === tool_call.name);

    if (foundTool) {
      const toolResult = await foundTool.invoke(tool_call.args);
      let contenStr;

      if (typeof toolResult === 'string') {
        contenStr = toolResult;
      } else if (toolResult && toolResult.text) {
        contenStr = toolResult.text;
      }

      message.push(new ToolMessage({
        tool_call_id: tool_call.id,
        content: contenStr
      }));
    }
  }
 }
  

  //最后一个消息是ai的回复
  //改进
  return message[message.length - 1].content;
}

await runAgentWithTools("北京南站附近的酒店，最近的 3 个酒店，拿到酒店图片，打开浏览器，展示每个酒店的图片，每个 tab 一个 url 展示，并且在把那个页面标题改为酒店名");

await mcpClient.close();