import 'dotenv/config'
import { 
  OpenAIEmbeddings,
  ChatOpenAI
 } from '@langchain/openai'
import { InMemoryChatMessageHistory } from '@langchain/core/chat_history'
import { MilvusClient,MetricType } from '@zilliz/milvus2-sdk-node'
import {
  HumanMessage,
  SystemMessage
} from '@langchain/core/messages'


const COLLECTION_NAME = 'conversation'
const VECTOR_DIM = 1024 // 1024 维向量

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.API_KEY,
  model: process.env.EMBEDDINGS_MODEL_NAME,
  configuration:{
    baseURL:process.env.API_BASE_URL
  },
  dimensions:VECTOR_DIM
})

async function getEmbedding(text){
  const result = await embeddings.embedQuery(text)
  return result
}

const client = new MilvusClient({
  address: 'localhost:19530',
  
})

const model = new ChatOpenAI({
  modelName:process.env.MODEL_NAME,
  apiKey:process.env.API_KEY,
  temperature:0,
  configuration:{
    baseURL:process.env.API_BASE_URL,
  }
})

async function retrievalRelevantConversations(query,k=2){
  try{
    const queryVector = await getEmbedding(query)
    const searchResult = await client.search({
      collection_name:COLLECTION_NAME,
      vector:queryVector,
      metric_type:MetricType.COSINE,
      limit:k,
      output_fields:['id','content','round','timestamp'],
    })
    return searchResult.results
  }catch(err){
    console.error('无法检索相关历史对话:',err)
    return []
  }
}

async function retrievalMemoryDemo(){
  try {
    console.log('连接到 Milvus...')
    await client.connectPromise
    console.log('连接到 Milvus 成功')    
  }catch(err){
    console.error('无法连接到 Milvus:',err)
    return
  }

  const history = new InMemoryChatMessageHistory()
  const conversations = [
    {input:"我之前提到的机器学习项目进展如何？"},
    {input:"我周末进场做什么"},
    {input:"我的职业是什么"},
  ]

  for (let i = 0; i < conversations.length; i++) {
    const { input } = conversations[i]
    const userMessage = new HumanMessage(input)
    console.log(`\n 第${i+1} 轮对话`)
    console.log(`用户：${input}`)
    console.log(`\n 系统：[检索相关历史对话]`)
    const retrievalConversations = 
      await retrievalRelevantConversations(input,2)
      let relevantHistory = ''
      if(retrievalConversations.length > 0){
        relevantHistory = retrievalConversations.map((conv,index) => {
          return `[历史对话 ${index+1}] 
          轮次：${conv.round}
          内容：${conv.content}`
        }).join('\n\n--------------\n\n')
      }else{
        console.log('暂无相关历史对话')
      }
    // milvus 检索历史会话
    console.log(relevantHistory,'--------------------')
    const contextMessages = relevantHistory ? 
      [new HumanMessage(`相关历史会话：\n ${relevantHistory} \n\n 
        用户问题：${input}`)]
      : [userMessage]
    const response = await model.invoke(contextMessages)
    console.log(response.content)
    await history.addMessage(userMessage)
    await history.addMessage(response)
    // 当前会话 持久化到 milvus
    const conversationText = `用户：${input}\n 助手：${response.content}`
    const convId = `conv_${Date.now()}_${i+1}`  // 时间 + 下标i 构成唯一ID
    const convVector = await getEmbedding(conversationText)
    
    try{
      await client.insert({
        collection_name:COLLECTION_NAME,
        data:[{
          id:convId,
          content:conversationText,
          round:i+1,
          timestamp:new Date().toISOString(),
          vector:convVector,
        }],
      })
      console.log(`当前会话 ${convId} 持久化成功`)
    }catch(err){
      console.error('无法持久化当前会话:',err)
    }
  }
}

retrievalMemoryDemo()
  .catch(err=>{
    console.error('检索记忆失败:',err)
  })