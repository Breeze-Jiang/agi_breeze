// 流式输出
import "dotenv/config"
import { ChatOpenAI } from "@langchain/openai"

const model = new ChatOpenAI({
  modelName: process.env.MODEL_NAME,
  apiKey: process.env.API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.API_BASE_URL,
  }
})

const prompt = `详细介绍莫扎特地星系`
console.log("普通流式输出演示：（无结构）\n")
// llm api  容错处理
try{
  // 以前invoke 同步输出
  // 现在stream 流式输出
  const stream = await model.stream(prompt)
  // stream 水流，管子，chunk 一个数据块
  let fullContent = ''
  let chunkCount = 0
  console.log('接受流式数据')
  // 数据块
  for await (const chunk of stream) {
    chunkCount++
    const content = chunk.content
    fullContent += content
    process.stdout.write(content)
  }
  console.log(`\n \n 共接受了${chunkCount}个数据块`)
  console.log(`完整内容：${fullContent}`)
}catch(err){
  console.error(err)
}
