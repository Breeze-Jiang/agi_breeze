import 'dotenv/config';
import { fileURLToPath } from 'url';
import { resolve } from 'path';
import {
  MilvusClient,    // C/S B/S
} from '@zilliz/milvus2-sdk-node';
import {
  OpenAIEmbeddings
} from '@langchain/openai';
import {
  COLLECTION_NAME,
  VECTOR_DIM,
  buildSearchRequest,
  validateRuntimeConfig,
} from './rag-core.mjs';

const REQUIRED_QUERY_CONFIG = [
  'MILVUS_ADDRESS',
  'MILVUS_TOKEN',
  'OPENAI_API_KEY',
  'OPENAI_BASE_URL',
  'EMBEDDING_MODEL_NAME',
]

export function createQueryRuntime(env = process.env) {
  // 修复说明：先校验完整配置，再创建查询所需的 Milvus 和 Embedding Client。
  validateRuntimeConfig(env, REQUIRED_QUERY_CONFIG)
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
  const client = new MilvusClient({
    address: ADDRESS,
    token: TOKEN
  })
  return {
    client,
    getEmbedding: async (text) => await embeddings.embedQuery(text),
  }
}

export async function main(){
  try {
    const { client, getEmbedding } = createQueryRuntime(process.env)
    console.log('Connecting to Milvus...')
    await client.connectPromise
    console.log('Connected \n')

    await client.loadCollection({
      collection_name: COLLECTION_NAME,
    })
    const query = '段誉会什么武功'
    const queryVector = await getEmbedding(query)
    const searchResult = await client.search(buildSearchRequest(queryVector, 3))
    searchResult.results.forEach((item,index) => {
      console.log(`\n 第${index+1}条结果：.[score:${item.score.toFixed(4)}]`)
      console.log(item)
    })
  } catch(err){
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
