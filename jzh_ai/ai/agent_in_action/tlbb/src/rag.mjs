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

const REQUIRED_RAG_CONFIG = [
  'MILVUS_ADDRESS',
  'MILVUS_TOKEN',
  'OPENAI_API_KEY',
  'OPENAI_BASE_URL',
  'EMBEDDING_MODEL_NAME',
  'MODEL_NAME',
]

export function createRagRuntime(env = process.env) {
  // 修复说明：统一校验问答链路配置，模块导入时不再创建任何远程 Client。
  validateRuntimeConfig(env, REQUIRED_RAG_CONFIG)
  const ADDRESS = env.MILVUS_ADDRESS;
  // api key
  const TOKEN = env.MILVUS_TOKEN;
  const embeddings = new OpenAIEmbeddings({
    apiKey: env.OPENAI_API_KEY,
    model: env.EMBEDDING_MODEL_NAME,
    configuration: {
      baseURL: env.OPENAI_BASE_URL
    },
    dimensions: VECTOR_DIM
  });
  const model = new ChatOpenAI ({
    temperature: 0.1,
    model: env.MODEL_NAME,
    apiKey: env.OPENAI_API_KEY,
    configuration: {
      baseURL: env.OPENAI_BASE_URL,
    },
  })
  const client = new MilvusClient({
    address: ADDRESS,
    token: TOKEN
  })
  return {
    client,
    model,
    getEmbedding: async (text) => await embeddings.embedQuery(text),
  }
}
// rag 图书业务知识库化
//函数可读性
//一个函数一个功能
//只有一个返回值
export async function retrieveRelevantContent(question,k = 3,runtime = createRagRuntime(process.env)){
  try{
    const queryVector = await runtime.getEmbedding(question)
    const searchResult = await runtime.client.search(buildSearchRequest(queryVector, k))
    console.log(searchResult.results)
    return searchResult.results ?? []
    
  }catch(err){
    console.error('检索失败:', err.message)
    // 修复说明：远程检索失败必须向上抛出，避免被误判为“成功但没有结果”。
    throw err
  }
}

export async function answerEbookQuestion(question,k = 3,runtime = createRagRuntime(process.env)){
  try{
    const retrievedContent = await retrieveRelevantContent(question,k,runtime)
    if(retrievedContent.length === 0){
      return '未找到相关内容'
    }
    const context = formatContext(retrievedContent)
    const prompt = buildRagPrompt(question, context)
    const response = await runtime.model.invoke(prompt)
    return response.content
  }catch(err){
    console.error('回答生成失败:', err.message)
    throw err
  }
}

export async function main(){
  try{
    const runtime = createRagRuntime(process.env)
    const { client } = runtime
    await client.connectPromise
    try{
      await client.loadCollection({
        collection_name: COLLECTION_NAME,
      })
      console.log('集合加载成功')
    }catch(err){
      console.log(err)
    }
    const answer = await answerEbookQuestion('鸠摩智会什么武功',5,runtime)
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
