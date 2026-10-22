import "dotenv/config"
import { OpenAIEmbeddings } from "@langchain/openai"
import { MilvusClient } from '@zilliz/milvus2-sdk-node'

const embeddings = new OpenAIEmbeddings({
  model: process.env.EMBEDDINGS_MODEL_NAME,
  dimensions: 1024,
  apiKey: process.env.API_KEY,
  configuration: { baseURL: process.env.API_BASE_URL },
})
const client = new MilvusClient({ address: 'localhost:19530' })

// 取两条正文：一条含阿朱剧情，一条无关
const r = await client.query({
  collection_name: 'ebook_collection',
  filter: 'id in ["1_111_23", "1_101_13"]',
  output_fields: ['content'],
  limit: 2,
})
const azhuText = r.data.find(d => d.id === '1_111_23')?.content ?? r.data[0].content
const otherText = r.data.find(d => d.id === '1_101_13')?.content ?? r.data[1].content
console.log('文本A(含阿朱):', azhuText.slice(0, 30))
console.log('文本B(无关):  ', otherText.slice(0, 30))

const query = await embeddings.embedQuery('阿朱的结局是什么？')
const eAzhu = await embeddings.embedQuery(azhuText)
const eOther = await embeddings.embedQuery(otherText)

const cosine = (a, b) => {
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] ** 2; nb += b[i] ** 2 }
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}
console.log('余弦(问题, 含阿朱正文) =', cosine(query, eAzhu).toFixed(4), ' ← 应该明显高')
console.log('余弦(问题, 无关正文)   =', cosine(query, eOther).toFixed(4), ' ← 应该明显低')
process.exit(0)
