import 'dotenv/config'
import { ChatOpenAI } from '@langchain/openai'
// 结构化
import { StructuredOutputParser } from '@langchain/core/output_parsers'

const model = new ChatOpenAI({
  modelName: process.env.MODEL_NAME,
  apiKey: process.env.API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.API_BASE_URL,
  }
})

// json , name , description  更靠谱
// JsonOutputParser
const parser = StructuredOutputParser.fromNamesAndDescriptions({
  name: "姓名",
  birth_year: "出生年份",
  nationality: "国籍",
  major_achievement: "主要成就,用逗号隔开的字符串",
  famous_theory: "著名的理论",
}) 

const question = `
请介绍一下爱因斯坦的信息
${parser.getFormatInstructions()}  
`

console.log(question)  

try{
  console.log(`正在调用大模型（使用StructuredOutputParser \n`)
  const response = await model.invoke(question)
  console.log(response.content)
  const result = await parser.parse(response.content)
  console.log(`姓名：${result.name}`)
  console.log(`出生年份：${result.birth_year}`)
} catch(error){
  console.error(error.message)
}