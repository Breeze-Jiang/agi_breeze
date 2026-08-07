import 'dotenv/config';
import { fileURLToPath } from 'url';
import { resolve } from 'path';
import {
  MilvusClient,    // C/S B/S
} from '@zilliz/milvus2-sdk-node';
import {
  ChatOpenAI,
  OpenAIEmbeddings
} from '@langchain/openai';
import {
  COLLECTION_NAME,
  VECTOR_DIM,
  buildRagPrompt,
  buildSearchRequest,
  formatContext,
  validateRuntimeConfig,
} from './rag-core.mjs';

const ADDRESS = process.env.MILVUS_ADDRESS;
// api key
const TOKEN = process.env.MILVUS_TOKEN;

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDING_MODEL_NAME,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL
  },
  dimensions: VECTOR_DIM
});
const model = new ChatOpenAI ({
  temperature: 0.1,
  model: process.env.MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
})

const client = new MilvusClient({
  address: ADDRESS,
  token: TOKEN
})
const getEmbedding = async (text) => {
  const result = await embeddings.embedQuery(text);
  return result;
}
// rag 图书业务知识库化
//函数可读性
//一个函数一个功能
//只有一个返回值
export async function retrieveRelevantContent(question,k = 3){
  try{
    const queryVector = await getEmbedding(question)
    const searchResult = await client.search(buildSearchRequest(queryVector, k))
    console.log(searchResult.results)
    return searchResult.results ?? []
    
  }catch(err){
    console.error('检索失败:', err.message)
    return []
  }
}

export async function answerEbookQuestion(question,k = 3){
  try{
    const retrievedContent = await retrieveRelevantContent(question,k)
    if(retrievedContent.length === 0){
      return '未找到相关内容'
    }
    const context = formatContext(retrievedContent)
    const prompt = buildRagPrompt(question, context)
    const response = await model.invoke(prompt)
    return response.content
  }catch(err){
    console.error('回答生成失败:', err.message)
    throw err
  }
}

export async function main(){
  try{
    validateRuntimeConfig(process.env, [
      'MILVUS_ADDRESS',
      'MILVUS_TOKEN',
      'OPENAI_API_KEY',
      'OPENAI_BASE_URL',
      'EMBEDDING_MODEL_NAME',
      'MODEL_NAME',
    ])
    await client.connectPromise
    try{
      await client.loadCollection({
        collection_name: COLLECTION_NAME,
      })
      console.log('集合加载成功')
    }catch(err){
      console.log(err)
    }
    const answer = await answerEbookQuestion('鸠摩智会什么武功',5)
    console.log(answer)

  }catch(err){
    console.error(err)
    throw err
  }
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])
if (isDirectRun) {
  main().catch(() => {
    process.exitCode = 1
  })
}
