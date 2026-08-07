import 'dotenv/config'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import {
  MilvusClient,
} from '@zilliz/milvus2-sdk-node'
import{
  ChatOpenAI,
  OpenAIEmbeddings
} from '@langchain/openai'
import {
  COLLECTION_NAME,
  VECTOR_DIM,
  buildDiarySearchRequest,
  formatDiaryContext,
} from './rag-core.mjs'

const ADDRESS = process.env.MILVUS_ADDRESS 
const TOKEN = process.env.MILVUS_TOKEN

const model = new ChatOpenAI ({
  temperature: 0.1,
  model: process.env.MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
})
const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDING_MODEL_NAME,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
  dimensions: VECTOR_DIM,
})

const client = new MilvusClient({
  address: ADDRESS,
  token: TOKEN,
})
const getEmbedding = async (text) => {
  const results = await embeddings.embedQuery(text)
  return results
}

export async function main() {
  try{
    console.log('连接到Milvus...')
    await client.connectPromise; // 链接milvus 服务器
    console.log('连接成功')
    await answerDiaryQuestion('我最近做了什么让我快乐的事情？',2)

   }catch(err){
    console.log(err)
  }
}

export async function retrieveRelevantDiaries(question,k = 2){
  try{
    const queryVector = await getEmbedding(question)
    const searchres = await client.search(buildDiarySearchRequest(queryVector, k))
    return searchres.results ?? []
   }catch(err){
    console.log(err)
    return []
  }
}

export async function answerDiaryQuestion(question,k = 2){
  try{
    console.log('='.repeat(80))
    console.log(`问题：${question}`)
    console.log('='.repeat(80))
    // rag 模块化
    console.log('检索相关日记...')
    const retrievedDiaries = await retrieveRelevantDiaries(question,k)
    if (retrievedDiaries.length === 0){
      console.log('未找到相关日记')
      return
    }
    retrievedDiaries.forEach((diary,index) => {
      console.log(`第${index+1}条日记相似度：${diary.score.toFixed(4)} \n 内容：${diary.content}`)
    })
    const content = formatDiaryContext(retrievedDiaries)

    const prompt = `你是一个温暖贴心的AI 日记助手。基于用户的日记内容回答问题，用亲切自然的语言。请根据以下日记内容回答问题：
    ${content}
    ${question}
    回答要求：
    1.如果日记中有相关信息，请结合日记内容给出详细，温暖的回答。
    2.可以总结多篇日记的内容，找出共同点或趋势
    3.如果日记中没有相关信息，请温和告知用户
    4.用第一人称“你”来称呼日记的作者。
    5.回答要有同理心，让用户感到被理解和关心
    AI 助手的回答:
    `
    console.log('[AI 回答]')
    const response = await model.invoke(prompt)
    console.log(response.content)
    return response.content
  }catch(err){
    console.log(err)
  }
}
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])
if (isDirectRun) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
