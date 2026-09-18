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
import { ChatOpenAI } from '@langchain/openai'
const model = new ChatOpenAI({
  modelName:process.env.MODEL_NAME,
  apiKey:process.env.API_KEY,
  temperature:0,
  configuration:{
    baseURL:process.env.API_BASE_URL,
  }
})



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

async function summarizationMemoryDemo(){
  const history = new InMemoryChatMessageHistory()
  const maxMessages = 6
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
  for (const message of messages) {
    if (message.type === 'human') {
      await history.addMessage(new HumanMessage({content: message.content}))
    } else {
       await history.addMessage(new AIMessage({content: message.content}))
    }
  }

  let allMessages = await history.getMessages()
  console.log(`原始消息数量: ${allMessages.length}`)
  console.log(`原始消息内容: `, allMessages.map(msg => `${msg.constructor.name}: ${msg.content}`).join('\n'))
  if (allMessages.length > maxMessages) {
    const keepRecent = 2
    const recentMessages = allMessages.slice(-keepRecent)
    const messagesToSummarize = allMessages.slice(0, -keepRecent)
    console.log(`\n 历史消息过多，开始总结...`)
    console.log(`\n 将被总结的消息数量：${messagesToSummarize.length}`)

    const summary = await summarizeHistory(messagesToSummarize)
    // 先清空
    await history.clear()
    // 再添加最近的消息
    for (const message of recentMessages) {
      await history.addMessage(message)
    }
    // 再添加总结消息
    await history.addMessage(new AIMessage(summary))

    const newMessages = await history.getMessages()
    for (let mes of newMessages) {
      console.log(`${mes.constructor.name}: ${mes.content}`)
    }
  }
}

summarizationMemoryDemo()
  .catch(console.error)