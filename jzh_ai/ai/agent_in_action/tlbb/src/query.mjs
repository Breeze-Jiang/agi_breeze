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

const client = new MilvusClient({
  address: ADDRESS,
  token: TOKEN
})
const getEmbedding = async (text) => {
  const result = await embeddings.embedQuery(text);
  return result;
}

export async function main(){
  try {
    validateRuntimeConfig(process.env, [
      'MILVUS_ADDRESS',
      'MILVUS_TOKEN',
      'OPENAI_API_KEY',
      'OPENAI_BASE_URL',
      'EMBEDDING_MODEL_NAME',
    ])
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
