// 从tool-call zod shema 中得到灵感
import "dotenv/config"
import { ChatOpenAI } from '@langchain/openai'
import { z } from 'zod'

const model = new ChatOpenAI({
  modelName: process.env.MODEL_NAME,
  apiKey: process.env.API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.API_BASE_URL,
  }
})

const scientistSchema = z.object({
  name: z.string().describe("姓名"),
  birth_year: z.number().describe("出生年份"),
  nationality: z.string().describe("国籍"),
  biography: z.string().describe("简短传记，100字以内")
})

const modelWithTool = model.bindTools([
  {
    name: "get_scientist_info",
    description: "获取科学家的信息",
    args: scientistSchema,
  },
])


// 这个工具不是为了直接调用，只做schema的 校验， 而是为了方便后续的解析和处理
const response = await modelWithTool.invoke("介绍一下爱因斯坦")

console.log(response)
console.log(response.tool_calls[0].args)
// 通过返回tool_calls 信息，也能拿到结构化的结果
// 这种方式比output parser 更好
// 没有这种需求