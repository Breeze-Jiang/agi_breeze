// 上下文 memory  管理的三个手段， 截断
import { InMemoryChatMessageHistory } from '@langchain/core/chat_history'
import {
  AIMessage,
  HumanMessage, 
  SystemMessage,
  trimMessages      // langchain 自带的history 裁剪工具，留下最近的
  // trimMessages      // 被裁剪的老消息（总结） ， 留下来的（作为新的message）
} from '@langchain/core/messages'
import { getEncoding } from 'js-tiktoken'  // 用于计算token数量

async function messageCountTruncation() {
  const history = new InMemoryChatMessageHistory()
  const maxMessages = 4 // 最大消息数量
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
    } else  {
      await history.addMessage(new AIMessage(msg.content))
    }
  }
  // invoke 之前截断
  let allMessages = await history.getMessages()
  const trimmedMessages = allMessages.slice(-maxMessages)
  console.log(`保留消息数量：${trimmedMessages.length}`)
  console.log(`保留消息内容：\n`,trimmedMessages.map(msg => `${msg.constructor.name}: ${msg.content}`).join('\n'))
}

function countTokens(messages,enc) {
  let total = 0
  for (const msg of messages) {
    const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
    total += enc.encode(content).length
  }
  return total
}

async function tokenCountTruncation() {
  
  const history = new InMemoryChatMessageHistory()
  const maxTokens = 100 // token 上限
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
    } else  {
      await history.addMessage(new AIMessage(msg.content))
    }
  }

  let allMessages = await history.getMessages()
  const enc = getEncoding('cl100k_base')  // 编码
  // 最近的，content定制的token 长度计算， 截取
  const trimmedMessages = await trimMessages(allMessages,{
    maxTokens,
    // 不同模型的token 的计算方式不一样
    tokenCounter: async (messages) => countTokens(messages,enc),
    strategy: 'last',
  })
  const totalTokens = await countTokens(trimmedMessages,enc)
  console.log(`保留消息token数量：${totalTokens}`)
}

async function runAll() {
  await messageCountTruncation()  // 消息数量阶段 简单 slice
  await tokenCountTruncation()  // token数量阶段 复杂 精确计算token开销
}
runAll()
  .catch(console.error)
  .finally(() => {
    console.log("done")
  })