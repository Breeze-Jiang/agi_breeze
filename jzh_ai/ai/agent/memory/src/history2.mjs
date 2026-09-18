import 'dotenv/config'
import { ChatOpenAI } from '@langchain/openai'
import { FileSystemChatMessageHistory } from '@langchain/community/stores/message/file_system'
import {
  HumanMessage, SystemMessage 
} from '@langchain/core/messages'
import path from 'node:path' // fs path 模块

const model = new ChatOpenAI({
  modelName:process.env.MODEL_NAME,
  apiKey:process.env.API_KEY,
  temperature:0,
  configuration:{
    baseURL:process.env.API_BASE_URL,
  }
})
async function fileSystemDemo() {
  // 文件记忆 长期记忆模块
  const filePath = path.join(process.cwd(), 'chat_history.json')
  const sessionId = "user_session_001" // 区分多用户
  const systemMessage = new SystemMessage(
    '你是一个友好，幽默的做菜助手，喜欢分享美食和烹饪技巧'
  )
  console.log("[第一轮对话]")
  const history = new FileSystemChatMessageHistory({
    filePath,
    sessionId,
  })
  const userMessage1 = new HumanMessage(
    "红烧肉怎么做"
  )
  await history.addMessage(userMessage1)
  const message1 = [systemMessage, ...(await history.getMessages())]
  const response1 = await model.invoke(message1)
  // console.log(`用户: ${userMessage1.content}`)
  // console.log(`助手: ${response1.content}\n`)
  await history.addMessage(response1)
  console.log(await history.getMessages())
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

fileSystemDemo()
  .catch(console.error)
  .finally(() => {
    console.log("done")
  })