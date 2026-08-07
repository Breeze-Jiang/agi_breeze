import 'dotenv/config'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import {
  MilvusClient,
} from '@zilliz/milvus2-sdk-node'
import{
  OpenAIEmbeddings
} from '@langchain/openai'
import {
  COLLECTION_NAME,
  VECTOR_DIM,
  buildDiaryFields,
  buildDiaryIndexRequest,
} from './rag-core.mjs'

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

export async function main (){
  console.log('正在链接 zilliz cloud ...')
  const checkHealth = await client.checkHealth()
  if(!checkHealth.isHealthy){
    console.log('链接失败',checkHealth.reasons)
    return
  }
  console.log('链接成功，集群状态正常')
  
  await client.createCollection({
    collection_name: COLLECTION_NAME,
    fields: buildDiaryFields(),
  })
  console.log('创建集合成功')
  await client.createIndex(buildDiaryIndexRequest())
  console.log('创建索引成功')
  console.log('loading collection')
  await client.loadCollection({
    collection_name: COLLECTION_NAME,
  })
  console.log('collection 加载成功')
  const diaryContents = [
              {
                id: 'diary_001',
                content: '今天天气很好，去公园散步了，心情愉快。看到了很多花开了，春天真美好。',
                date: '2026-01-10',
                mood: 'happy',
                tags: ['生活', '散步']
              },
              {
                id: 'diary_002',
                content: '今天工作很忙，完成了一个重要的项目里程碑。团队合作很愉快，感觉很有成就感。',
                date: '2026-01-11',
                mood: 'excited',
                tags: ['工作', '成就']
              },
              {
                id: 'diary_003',
                content: '周末和朋友去爬山，天气很好，心情也很放松。享受大自然的感觉真好。',
                date: '2026-01-12',
                mood: 'relaxed',
                tags: ['户外', '朋友']
              },
              {
                id: 'diary_004',
                content: '今天学习了 Milvus 向量数据库，感觉很有意思。向量搜索技术真的很强大。',
                date: '2026-01-12',
                mood: 'curious',
                tags: ['学习', '技术']
              },
              {
                id: 'diary_005',
                content: '晚上做了一顿丰盛的晚餐，尝试了新菜谱。家人都说很好吃，很有成就感。',
                date: '2026-01-13',
                mood: 'proud',
                tags: ['美食', '家庭']
              }
            ];
  console.log('generating embeddings...')
  const diaryData = await Promise.all(
    diaryContents.map(async (diary)=>({
      ...diary,
      vector: await getEmbedding(diary.content)
    }))
  )
  const insertResult = await client.insert({
    collection_name: COLLECTION_NAME,
    data: diaryData // 太简单 json 不用写sql 
  })
  console.log(insertResult.IDs,'插入数据成功')
}
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])
if (isDirectRun) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
