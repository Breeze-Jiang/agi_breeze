import 'dotenv/config';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { ChatOpenAI } from '@langchain/openai';
import chalk from 'chalk';
import {
  HumanMessage,
  ToolMessage
} from '@langchain/core/messages';

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
const localServerPath = resolve(moduleDirectory, '../mcp-demo/my-mcp-server.mjs');
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';

export const DEFAULT_QUERY = '北京南站附近的酒店，最近的 3 个酒店，拿到酒店图片，打开浏览器，展示每个酒店的图片，每个 tab 一个 url 展示，并且在把那个页面标题改为酒店名';

export function validateRuntimeConfig(env, requiredNames) {
  const missing = requiredNames.filter((name) => !env[name]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  return Object.fromEntries(requiredNames.map((name) => [name, env[name]]));
}

export function buildMcpServers(env) {
  // 修复说明：本地 Server 和文件系统目录从当前模块解析，避免项目换机器后绝对路径失效。
  return {
    'amap-mcp': {
      url: `https://mcp.amap.com/mcp?key=${encodeURIComponent(env.AMAP_MCP_KEY ?? '')}`
    },
    'my-mcp-server': {
      command: process.execPath,
      args: [localServerPath]
    },
    'filesystem': {
      command: npxCommand,
      args: [
        '-y',
        '@modelcontextprotocol/server-filesystem',
        // 允许访问的文件夹，可以配置多个，用空格隔开
        moduleDirectory
      ]
    },
    // Chrome‑DevTools MCP，默认连接本地打开的Chrome（开启远程调试：chrome --remote-debugging-port=9222）
    'chrome-devtools': {
      command: npxCommand,
      args: [
        '-y',
        'chrome-devtools-mcp@latest',
      ]
    }
  };
}

export function createMcpClient(env) {
  return new MultiServerMCPClient({
    mcpServers: buildMcpServers(env)
  });
}

export function createModel(env) {
  return new ChatOpenAI({
    modelName: env.MODEL_NAME || 'deepseek-chat',
    apiKey: env.DEEPSEEK_API_KEY,
    temperature: 0,
    configuration: {
      baseURL: env.OPENAI_BASE_URL || 'https://api.deepseek.com/v1',
    },
  });
}

function normalizeToolResult(toolResult) {
  if (typeof toolResult === 'string') {
    return toolResult;
  }
  if (toolResult?.text) {
    return toolResult.text;
  }
  // 修复说明：MCP 工具可能返回结构化对象，统一序列化后才能安全写入 ToolMessage。
  return JSON.stringify(toolResult ?? null);
}

export async function runAgentWithTools(query, {
  tools,
  model,
  maxIterations = 30,
  logger = console,
}) {
  const modelWithTools = model.bindTools(tools);
  const message = [
    new HumanMessage(query)
  ];
  for (let i = 0; i < maxIterations; i++) {
    logger.log(chalk.bgGreen(`第${i + 1}轮`));
    const response = await modelWithTools.invoke(message);
    message.push(response);

    if (!response.tool_calls || response.tool_calls.length === 0) {
      logger.log(chalk.bgGreen(`ai回答：${response.content}`));
      return response.content;
    }

    logger.log(chalk.bgBlue(`工具调用：${response.tool_calls.map(t => t.name).join(',')}`));

    for (const tool_call of response.tool_calls) {
      const foundTool = tools.find(t => t.name === tool_call.name);
      // 修复说明：即使模型请求了未知工具，也要返回同一 tool_call_id 的结果，保持消息协议完整。
      const content = foundTool
        ? normalizeToolResult(await foundTool.invoke(tool_call.args))
        : `未找到工具：${tool_call.name}`;

      message.push(new ToolMessage({
        tool_call_id: tool_call.id,
        content
      }));
    }
  }

  //最后一个消息是ai的回复
  //改进
  return message[message.length - 1]?.content ?? '';
}

export async function main() {
  validateRuntimeConfig(process.env, ['DEEPSEEK_API_KEY', 'AMAP_MCP_KEY']);
  const mcpClient = createMcpClient(process.env);
  try {
    const tools = await mcpClient.getTools();
    const model = createModel(process.env);
    return await runAgentWithTools(DEFAULT_QUERY, { tools, model });
  } finally {
    // 修复说明：无论模型或任一 MCP Server 是否报错，都关闭 Client 及其子进程。
    await mcpClient.close();
  }
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isDirectRun) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
