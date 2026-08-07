import 'dotenv/config'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import {
  MilvusClient,
} from '@zilliz/milvus2-sdk-node'
import{
  OpenAIEmbeddings
} from '@langchain/openai'
import { COLLECTION_NAME, VECTOR_DIM, buildDiarySearchRequest } from './rag-core.mjs'

const ADDRESS = process.env.MILVUS_ADDRESS
const TOKEN = process.env.MILVUS_TOKEN

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
  try {
    console.log('Connecting to Milvus...')
    await client.connectPromise; // 链接milvus 服务器
    console.log('Connected to Milvus successfully')
    const query = '我想看看关于户外活动的日记'
    console.log('查询文本:', query)
    const queryVector = await getEmbedding(query)
    const searchres = await client.search(buildDiarySearchRequest(queryVector, 2))
    console.log('查询结果:', searchres.results.length ,'条')
    searchres.results.forEach((item,index) => {
      console.log(`第${index+1}条结果:`,item)
    })
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
