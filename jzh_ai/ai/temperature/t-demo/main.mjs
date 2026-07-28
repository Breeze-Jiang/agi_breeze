import 'dotenv/config'
import {ChatOpenAI} from '@langchain/openai'
// 把大模型输出解析成纯字符串
// chain上 不用那么复杂，直接给我们content内容
import {StringOutputParser} from '@langchain/core/output_parsers'
// prompt 好复用
// 以前是硬编码，写在代码里面，不好维护，不好模块化
// ai业务，只需要换prompt 就行
// 会在ai工作流前面
import {PromptTemplate} from '@langchain/core/prompts'

const creativeModel = new ChatOpenAI({
  model: 'deepseek-v4-flash',
  temperature: 0.8,  //增强创意的发散性
  topK: 4,           // 仅从概率前4的词汇采样，
  maxTokens: 600,   // 最大输出token数
  apiKey: process.env.DEEPSEEK_API_KEY,
  configuration: {
    baseURL: process.env.DEEPSEEK_API_URL,
  }
})
const preciseModel = new ChatOpenAI({
  model: 'deepseek-v4-flash',
  temperature: 0.2,  //增强创意的发散性
  topK: 8,           // 仅从概率前8的词汇采样，
  maxTokens: 600,   // 最大输出token数
  apiKey: process.env.DEEPSEEK_API_KEY,
  configuration: {
    baseURL: process.env.DEEPSEEK_API_URL,
  }
})
 
const storyPrompt = PromptTemplate.fromTemplate(`
请你写一篇短篇散文，主题 ：{theme}
风格治愈温柔，篇幅200字左右，文字细腻又有画面感
`)
 
const Parser = new StringOutputParser()

// 工作流 pipe 工作流的流转
//AI 工程复杂了 设计好 ai 工作流 storyPrompt.pipe(creativeModel).pipe(Parser)
const creativeChain = storyPrompt.pipe(creativeModel).pipe(Parser)
const preciseChain = storyPrompt.pipe(preciseModel).pipe(Parser)

// 原料送到
async function runWriteDemo(){
  const theme = '秋日山野晚风'
  console.log('创意写作模式')
  const creativeText = await creativeChain.invoke({theme})
  console.log(creativeText)

  console.log('严谨写作模式')
  const preciseText = await preciseChain.invoke({theme})
  console.log(preciseText)
}

runWriteDemo()
