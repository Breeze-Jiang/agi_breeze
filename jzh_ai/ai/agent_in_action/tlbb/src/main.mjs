import "dotenv/config"
import { fileURLToPath } from 'url'
import { parse, resolve } from 'path'// path 路径解析
import { MilvusClient } from '@zilliz/milvus2-sdk-node'
import { OpenAIEmbeddings } from '@langchain/openai'
import { EPubLoader } from '@langchain/community/document_loaders/fs/epub'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import {
  CHUNK_OVERLAP,
  CHUNK_SIZE,
  COLLECTION_NAME,
  VECTOR_DIM,
  buildCollectionFields,
  buildIndexRequest,
  validateRuntimeConfig,
} from './rag-core.mjs'

// config 
export const EPUB_PATH = fileURLToPath(new URL('../天龙八部.epub', import.meta.url)) // 天龙八部 epub 路径

const BOOK_NAME = parse(EPUB_PATH).name
const REQUIRED_INGESTION_CONFIG = [
  'MILVUS_ADDRESS',
  'MILVUS_TOKEN',
  'OPENAI_API_KEY',
  'OPENAI_BASE_URL',
  'EMBEDDING_MODEL_NAME',
]

export function createIngestionRuntime(env = process.env) {
  // 修复说明：先校验配置再创建外部 Client，导入模块和本地测试不会意外初始化远程连接。
  validateRuntimeConfig(env, REQUIRED_INGESTION_CONFIG)
  const Embeddings = new OpenAIEmbeddings({
    apiKey: env.OPENAI_API_KEY,
    model: env.EMBEDDING_MODEL_NAME,
    configuration: {
      baseURL: env.OPENAI_BASE_URL,
    },
    dimensions: VECTOR_DIM,
  })

  // 向量数据库的初始化
  const client = new MilvusClient({
    address: env.MILVUS_ADDRESS,
    token: env.MILVUS_TOKEN,
  })
  return {
    client,
    getEmbedding: async (text) => await Embeddings.embedQuery(text),
  }
}

export async function ensureCollection(client) {
  //没有就建立
  //有就返回
  // 判断是否已经创建
  try{
    const hasCollection = await client.hasCollection({
      collection_name: COLLECTION_NAME,
    })
    console.log(hasCollection.value)
    if(!hasCollection.value){
      // 创建集合
      await client.createCollection({
        collection_name: COLLECTION_NAME,
        
        fields: buildCollectionFields(),
      })
      console.log('集合创建成功')
      console.log('创建索引...')
      await client.createIndex(buildIndexRequest())
      // cosin 高纬度相似度， 不慢， 数据量大了

      console.log('索引创建成功')
    }
    // 细节补充错误
    // 修复说明：loadCollection 本身可重复调用，真实加载错误不能伪装成“已经加载”。
    await client.loadCollection({
      collection_name: COLLECTION_NAME,
    })
    console.log('集合加载成功')
  }catch(err){
    console.error('集合创建失败:', err.message)
    throw err
  }
}
// node 后端开发尽量多用try catch
export async function loadAndProcessEPubStreaming(bookId, runtime){
  try{
    console.log(`\n 开始加载EPUB 文件:${EPUB_PATH}`)
    const loader = new EPubLoader(EPUB_PATH,{
      splitChapters: true, // 在加载的时候 按章节切分 生成多个document 内存需求的必然
    })
    const documents = await loader.load()
    console.log(`\n 加载完成，共加载${documents.length}个文档`)

    const textSplitter = new RecursiveCharacterTextSplitter({
      // 没有传separtor 用默认的分隔符 \n
      chunkSize: CHUNK_SIZE,
      chunkOverlap: CHUNK_OVERLAP, // 重叠50个字符， 保持上下文连贯性
    })
    let totalInserted = 0 // 已插入的文档数
    let documentLength = documents.length;//缓存

    for (let chapterIndex = 0;chapterIndex < documentLength; chapterIndex++){
      // 处理每个章节
      const chapter = documents[chapterIndex]
      const chapterContent = chapter.pageContent
      // 切分章节内容
      console.log(`\n 处理章节${chapterIndex+1}，内容长度：${chapterContent.length}`)
      const chunks = await textSplitter.splitText(chapterContent)
      console.log(`\n 切分完成，共切分${chunks.length}个chunk`)
      if(chunks.length === 0){
        console.log(`章节${chapterIndex+1}为空，跳过`)
        continue
      }
      // 插入章节内容
      console.log(`生成向量并插入中...章节${chapterIndex+1}`)
      const insertedCount = await insertChunksBatch(chunks,bookId,chapterIndex+1,runtime)
      totalInserted += insertedCount
      console.log(`已插入${insertedCount}条记录`)
    }
    console.log(`\n 共插入${totalInserted}条记录`)
  }catch(err){
    console.error(err)
    throw err
  }
}
// 将一批chunk 插入向量数据库
export async function insertChunksBatch(chunks,bookId,chapterNum,{ client, getEmbedding }){
  try{
    // 为空 不需要做的
    if(chunks.length === 0){
      return 0
    }
    // promise.all 并行处理
    const insertData = await Promise.all(chunks.map(async (chunk,index) => {
      const vector = await getEmbedding(chunk)
      return{
        id:`${bookId}-${chapterNum}-${index}`,
        book_id: bookId,
        book_name: BOOK_NAME,
        chapter_num: chapterNum,
        index: index,
        content: chunk,
        vector: vector,
      }
    }))
    // 修复说明：固定主键重复演示时使用 upsert，避免同一书籍分块不断产生重复记录。
    await client.upsert({
      collection_name: COLLECTION_NAME,
      data: insertData,
    })
    return insertData.length

    // 函数的返回结果要有可预测性 一致
  }catch(err){
    console.error(`插入章节${chapterNum}失败，错误信息：${err.message}`)
    throw err // 抛出错误， 使调用者能够处理
  }
}

export const main = async () => {
  try{
    const runtime = createIngestionRuntime(process.env)
    const { client } = runtime
    console.log('='.repeat(80))
    console.log('电子书开始处理程序')
    console.log('='.repeat(80))
    console.log('\n 链接 Milvus...')
    await client.connectPromise
    console.log('连接成功')
    const bookId = 1
    // 确保集合存在
    await ensureCollection(client)
    // 一边切割一边embedding， 一边存数据库
    await loadAndProcessEPubStreaming(bookId,runtime)
    await client.flush({
    collection_names: [COLLECTION_NAME],
    })
    console.log('数据刷新完成')
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
