import 'dotenv/config'
// 被截断的数组 -> 字符串拼接 -> ai summarization
import { InMemoryChatMessageHistory } from '@langchain/core/chat_history' 
import {
  AIMessage,
  HumanMessage, 
  SystemMessage,
  getBufferString,   // langchain 自带的history 裁剪工具，留下最近的
  trimMessages      // 被裁剪的老消息（总结） ， 留下来的（作为新的message）
} from '@langchain/core/messages'

import { getEncoding } from 'js-tiktoken'
import { ChatOpenAI } from '@langchain/openai'
const model = new ChatOpenAI({
  modelName:process.env.MODEL_NAME,
  apiKey:process.env.API_KEY,
  temperature:0,
  configuration:{
    baseURL:process.env.API_BASE_URL,
  }
})

function countTokens(messages,enc) {
  let total = 0
  for (const msg of messages) {
    const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
    total += enc.encode(content).length
  }
  return total
}

async function summarizeHistory(messages) {
  if(messages.length === 0) return ''
  // 对象数组 -> 拼接的消息字符串
  const conversationText = getBufferString(messages,'用户','助手')
  // console.log(conversationText)
  const summary = `请总结以下对话的核心内容，保留重要消息：${conversationText}
  总结：
  `
  // langchain 编排线性的工作流 workflow pipe
  // langgraph 非线性的工作流 workflow graph
  const summaryResponse = await model.invoke([new SystemMessage(summary)]) 
  // model.invoke() 不收“裸字符串”
  // 模型的 invoke() 只接受消息对象数组，每条消息必须标明“谁说的"。
  // console.log(summaryResponse.content)
  return summaryResponse.content
}


async function summarizeHistoryDemo() {
  const history = new InMemoryChatMessageHistory()
  const encoder = getEncoding('cl100k_base')
  // 超过maxTokens 时触发总结
  const maxTokens = 200
  const keepRecentTokens = 80
  const messages = [
    { type: 'human', content: '我叫李四' },
    { type: 'ai', content: '你好李四，很高兴认识你！' },
    { type: 'human', content: '我是一名设计师' },
    { type: 'ai', content: '设计师是个很有创造力的职业！你主要做什么类型的设计？' },
    { type: 'human', content: '我喜欢艺术和音乐' },
    { type: 'ai', content: '艺术和音乐都是很好的爱好，它们能激发创作灵感。' },
    { type: 'human', content: '我擅长 UI/UX 设计' },
    { type: 'ai', content: 'UI/UX 设计非常重要，好的用户体验能让产品更成功！' },
  ];

  for (const msg of messages) {
    if (msg.type === 'human') {
      await history.addMessage(new HumanMessage(msg.content))
    }
    else {
      await history.addMessage(new AIMessage(msg.content))
    }
  }
  let allMessages = await history.getMessages()
  const totalTokens = countTokens(allMessages,encoder)
  // console.log(totalTokens)
  if (totalTokens > maxTokens) {
    // 触发总结
    const recentMessages = []
    let recentTokens = 0
    for (let i = allMessages.length - 1; i >= 0; i--) {
      const msg = allMessages[i]
      const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
      const msgTokens = encoder.encode(content).length
      if (recentTokens + msgTokens <= keepRecentTokens) {
        recentMessages.unshift(msg)
        recentTokens += msgTokens
      }else {
        break
      }
      
    }
    const messageToSummarize = allMessages.slice(0,allMessages.length - recentMessages.length)
    const summary = await summarizeHistory(messageToSummarize)
    await history.clear()
    //  /clear 和 /compact
    for (const msg of recentMessages) {
      await history.addMessage(msg)
    }
    await history.addMessage(new AIMessage(summary))
  }
}

summarizeHistoryDemo()
  .catch(console.error)