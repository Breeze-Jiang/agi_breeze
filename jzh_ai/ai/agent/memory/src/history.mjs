import 'dotenv/config'
import { ChatOpenAI } from '@langchain/openai'
import {
  InMemoryChatMessageHistory  // 内存记忆 短期记忆模块
} from '@langchain/core/chat_history'
import {
  HumanMessage, SystemMessage 
} from '@langchain/core/messages'

const model = new ChatOpenAI({
  modelName:process.env.MODEL_NAME,
  apiKey:process.env.API_KEY,
  temperature:0,
  configuration:{
    baseURL:process.env.API_BASE_URL,
  }
})

async function inMemoryDemo() {  // async 定义的函数，返回值是 Promise
//   这里的 async 表示：这个函数一定返回一个 Promise 对象。
// 即使函数内部没有手动写 return Promise，JavaScript 也会自动包装。
  // 数组升华到内存记忆的实例
  const history = new InMemoryChatMessageHistory()
  const systemMessage = new SystemMessage(
    '你是一个友好，幽默的做菜助手，喜欢分享美食和烹饪技巧'
  )
  console.log("[第一轮对话]")
  const userMessage1 = new HumanMessage("你今天吃什么？")
  await history.addMessage(userMessage1) // message 数组添加了对话
  const message1 = [systemMessage, ...(await history.getMessages())]
  console.log(message1)
  const response1 = await model.invoke(message1)
  // console.log(`助手: ${response1.content}\n`)
  // 维护memory
  await history.addMessage(response1)
  // console.log(await history.getMessages())
  console.log("[第二轮对话，基于历史记忆]")
  const userMessage2 = new HumanMessage("好吃吗？")
  await history.addMessage(userMessage2) // message 数组添加了对话
  const message2 = [systemMessage, ...(await history.getMessages())]
  const response2 = await model.invoke(message2)
  console.log(`助手: ${response2.content}\n`)
  await history.addMessage(response2)
  const allMessages = await history.getMessages();
  console.log(`共保存了${allMessages.length}条对话`)
  allMessages.forEach((element, index) => {
    const type = element.type
    const prefix = type === 'human' ? '用户:' : '助手:'
    console.log(`${index + 1}. ${prefix}${element.content}`)
  });
}
// Promise<T>
// promise 对象上有 then, catch, finally 方法，用于处理异步操作的结果
inMemoryDemo()
  // 链式调用 chain
  .catch(console.error)
  .finally(() => {
    console.log("done")
  })