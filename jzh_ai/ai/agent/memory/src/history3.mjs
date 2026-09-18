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
  // 文件系统记忆
  const filePath = path.join(process.cwd(), 'chat_history.json')
  const sessionId = "user_session_001"
  const systemMessage = new SystemMessage(
    '你是一个友好，幽默的做菜助手，喜欢分享美食和烹饪技巧'
  )
  // 从文件中恢复历史记录
  const restoredHistory = new FileSystemChatMessageHistory({
    filePath,
    sessionId,
  })
  const restoredMessages = await restoredHistory.getMessages();
  console.log(`从文件中恢复了${restoredMessages.length}条历史对话`)
  restoredMessages.forEach((msg, index) => {
    const type = msg.type
    const prefix = type === 'human' ? '用户:' : '助手:'
    console.log(`${index + 1}. ${prefix}${msg.content}\n`)
  });
  console.log("[第三轮对话]\n")
  const userMessage3 = new HumanMessage("需要哪些食材")
  await restoredHistory.addMessage(userMessage3)
  const message3 = [systemMessage, ...(await restoredHistory.getMessages())]
  const response3 = await model.invoke(message3)
  await restoredHistory.addMessage(response3)
  console.log(`助手: ${response3.content}\n`)
  
}

fileSystemDemo()
  .catch(console.error)
  .finally(() => {
    console.log("done")
  })
