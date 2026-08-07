import {
  IndexType, //索引的类型 Milvus 存的是高维向量，没有索引时，查询会很慢，每次查询都要把库里的向量和查询向量逐一算相似度（O(n)），数据量大了，查询会很慢，所以需要创建索引，索引类型有：IVF_FLAT 聚簇索引, IVF_HNSW , IVF_PQ
  MetricType, // 指标类型 余弦相似度, L2 距离, IP 内积相似度
  MilvusClient  // client 链接 zilliz server 的客户端
} from '@zilliz/milvus2-sdk-node'
import 'dotenv/config'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

// 云端地址
const ADDRESS = process.env.MILVUS_ADDRESS
// api key 
const TOKEN = process.env.MILVUS_TOKEN
export async function main (){
  const client = new MilvusClient({
    address: ADDRESS,
    token: TOKEN
  })
  console.log('正在链接 zilliz cloud ...')
  const checkHealth = await client.checkHealth()
  if(!checkHealth.isHealthy){
    console.log('链接失败',checkHealth.reasons)
    return
  }
  console.log('链接成功，集群状态正常')

  // 在mysql 里面 叫table表  ，在milvus 里面 叫collection 集合
  const COLLECTION_NAME = 'test'
  const DIMENSION = 4 // 维度
  try {
    await client.createCollection({
      collection_name: COLLECTION_NAME,
      dimension: DIMENSION,
      auto_id: true, // 自动创建id 
      // 创建索引 让查询更快
    })
    console.log('创建集合成功')
     await client.createIndex({
        collection_name: COLLECTION_NAME,
        field_name:'vector',// 给某字段建索引
        index_type: IndexType.AUTOINDEX, // 自动创建索引，根据数据量和维度选择合适的索引类型
        metric_type: MetricType.COSINE, // 余弦相似度
      })
      console.log('创建索引成功')
      const data = [
        // row fields
        // 相比于mysql 宽松一点， 可以在插入数据时建立字符串
        { vector: [0.1, 0.2, 0.3, 0.4] ,content:'这是第一条数据'},
        { vector: [0.5, 0.6, 0.7, 0.8] ,content:'这是第二条数据'},
        { vector: [0.9, 0.1, 0.1, 0.2] ,content:'这是第三条数据'},
      ]
      const insertResult = await client.insert({
        collection_name: COLLECTION_NAME,
        data // 太简单 json 不用写sql 
      })
      console.log('插入数据成功',insertResult.IDs)
      const searchres = await client.search({
        collection_name: COLLECTION_NAME,
        data: [[0.1, 0.2, 0.3, 0.4]],
        limit: 2,
        output_fields: ['content'],
      })
      console.log('查询成功',JSON.stringify(searchres.results,null,2))
  }catch(err){
    console.log('创建集合失败',err.message)
  }
}
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])
if (isDirectRun) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
