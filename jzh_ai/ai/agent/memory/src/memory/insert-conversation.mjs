// vector store 小龙虾 ， workbuddy 等  memory
// milvus 本地安装
import 'dotenv/config'
import {
  MilvusClient,
  DataType,
  MetricType,
  IndexType
} from '@zilliz/milvus2-sdk-node'
import { OpenAIEmbeddings } from '@langchain/openai'

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

async function main (){
  try {
    console.log('连接Milvus数据库...')
    await client.connectPromise
    console.log('连接到Milvus数据库成功')

    console.log('创建集合...')
    await client.createCollection({
      collection_name: COLLECTION_NAME,
      fields: [
        // uuid 唯一的id， 更安全
        {
          name: "id",
          data_type: DataType.VarChar,
          max_length: 50,
          is_primary_key: true,
        },
        // 向量字段
        {
          name: "vector",
          data_type: DataType.FloatVector,
          dim: VECTOR_DIM
        },
        {
          name:"content",
          data_type: DataType.VarChar,
          max_length: 5000
        },
        {
          name:"round",
          data_type: DataType.Int64
        },
        // 没有datetime 类型， 所以用 varchar 字段
        {
          name:"timestamp",
          data_type: DataType.VarChar,
          max_length: 100
        }
      ]
    })
    await client.createIndex({
      collection_name: COLLECTION_NAME,
      field_name: "vector",               // 频繁查询的字段
      index_type: IndexType.IVF_FLAT,
      metric_type: MetricType.COSINE,
    })
    console.log('索引创建成功')

    await client.loadCollection({
      collection_name: COLLECTION_NAME,
    })
    console.log('集合加载成功')
    const conversations = [
  {
    id: 'conv_001',
    content: '用户：我叫赵六，是一名数据科学家\n助手：很高兴认识你，赵六！数据科学是一个很有趣的领域。',
    round: 1,
    timestamp: new Date().toISOString()
  },
  {
    id: 'conv_002',
    content: '用户：我最近在研究机器学习算法\n助手：机器学习确实很有意思，你在研究哪些算法呢？',
    round: 2,
    timestamp: new Date().toISOString()
  },
  {
    id: 'conv_003',
    content: '用户：我喜欢打篮球和看电影\n助手：运动和文化娱乐都是很好的爱好！',
    round: 3,
    timestamp: new Date().toISOString()
  },
  {
    id: 'conv_004',
    content: '用户：我周末经常去电影院\n助手：看电影是很好的放松方式。',
    round: 4,
    timestamp: new Date().toISOString()
  },
  {
    id: 'conv_005',
    content: '用户：我的职业是软件工程师\n助手：软件工程师是个很有前景的职业！',
    round: 5,
    timestamp: new Date().toISOString()
  }
  ];
  console.log('插入数据...')
  const conversationData = await Promise.all(conversations.map(async (conv) => ({
    ...conv,
    vector: await getEmbedding(conv.content)
  }
  )))
  const insertResult = await client.insert({
    collection_name: COLLECTION_NAME,
    data: conversationData
  })

  console.log('数据插入成功', insertResult)

  } catch (error) {
    console.error('Error connecting to Milvus:', error)
    return
  }
}

main()
  .catch(console.error)