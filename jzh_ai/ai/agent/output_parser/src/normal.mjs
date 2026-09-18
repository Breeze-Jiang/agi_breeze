import 'dotenv/config'
import { ChatOpenAI } from '@langchain/openai'
import { JsonOutputParser } from '@langchain/core/output_parsers'

const model = new ChatOpenAI({
  modelName: process.env.MODEL_NAME,
  apiKey: process.env.API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.API_BASE_URL,
  }
})

const parser = new JsonOutputParser()
 // 解析器

const prompt = `
请介绍一下爱因斯坦的信息，请以json格式返回
包含以下字段：
name(姓名),
birth_year(出生年份),
nationality(国籍),
major_achievement(主要成就,数组)
famous_theory(著名的理论)





---------------------------------------
${parser.getFormatInstructions()}  
`

console.log(prompt)

// try {
//   console.log("正在调用大模型...\n")
//   const response = await model.invoke(prompt)  // 同步输出
//   // console.log(response.content)
//   // 大模型返回的一般是 md 格式
//   // 用正则提取 markdown 代码块里的内容（如 ```json ... ```），没包裹则退回原文
//   // 括号表示分组
//   // const match = response.content.match(/```(?:json)?\s*([\s\S]*?)```/)
//   // const jsonStr = match ? match[1] : response.content
//   // // console.log(jsonStr)
//   // const jsonResult = JSON.parse(jsonStr.trim())
//   // console.log(`\n 解析后的json结果：`)
//   // console.log(jsonResult)
//   // 解析json
//   const Result = await parser.parse(response.content)
//   console.log(`\n 解析后的json结果：`)
//   console.log(Result,"解析后的json结果",Result.name)
  
// } catch (error) {
//   console.error(error.message)
// }