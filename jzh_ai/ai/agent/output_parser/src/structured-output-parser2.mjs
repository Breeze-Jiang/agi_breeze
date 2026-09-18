import "dotenv/config"
import { ChatOpenAI } from '@langchain/openai'
// 结构化
import { StructuredOutputParser } from '@langchain/core/output_parsers'
import { z } from 'zod/v3'

const model = new ChatOpenAI({
  modelName: process.env.MODEL_NAME,
  apiKey: process.env.API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.API_BASE_URL,
  }
})

// output的结构化输出，再严苛一点，schema 来约束
const scientistSchema = z.object({
  name: z.string().describe("姓名"),
  birth_year: z.number().describe("出生年份"),
  nationality: z.string().describe("国籍"),
  awards: z.array(z.object({
    award_name: z.string().describe("奖项名称"),
    award_year: z.number().describe("奖项年份"),
    award_reason: z.string().describe("获得原因"),
  })).describe("获得的奖项列表"),
  major_achievement: z.array(z.string().describe("主要成就")).describe("主要成就列表"),
  famous_theory: z.array(z.object({
    theory_name: z.string().describe("理论名称"),
    theory_year: z.number().describe("理论年份"),
    theory_description: z.string().describe("理论描述"),
  })).describe("著名的理论列表"),
  biography: z.string().describe("简短传记，100字以内")
})

const parser = StructuredOutputParser.fromZodSchema(scientistSchema)

const question = `
请介绍一下居里夫人的信息
${parser.getFormatInstructions()}  
`
console.log(question)
try {
  console.log(`正在调用大模型(使用StructuredOutputParser) \n`)
  const response = await model.invoke(question)
  console.log(response.content + "\n\n")
  const result = await parser.parse(response.content)
  console.log(`姓名：${result.name}`)   
  console.log(`出生年份：${result.birth_year}`)
} catch (error) {
  console.error(error.message)
}
