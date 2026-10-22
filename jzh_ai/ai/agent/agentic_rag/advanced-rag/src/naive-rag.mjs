import "dotenv/config"
import {
  ChatOpenAI,
  OpenAIEmbeddings
} from "@langchain/openai"
import {
  Annotation,
  END,
  START,
  StateGraph
} from '@langchain/langgraph'
import { Milvus } from '@langchain/community/vectorstores/milvus'

const COLLECTION_NAME = "ebook_collection"
const TOP_K = 5

// 状态声明
const GraphState = Annotation.Root({
  question: Annotation,// 问题
  k: Annotation,       // 检索数量
  documents: Annotation,// 检索到得文档
  generation: Annotation,// 生成的内容
})

const model = new ChatOpenAI({
  modelName: process.env.MODEL_NAME,
  apiKey: process.env.API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.API_BASE_URL,
  }
})

const embeddings = new OpenAIEmbeddings({
  model: process.env.EMBEDDINGS_MODEL_NAME,  // text-embedding-v3
  dimensions: 1024,
  apiKey: process.env.API_KEY,
  configuration: { baseURL: process.env.API_BASE_URL },
})

let vectorStore

async function retrieveRelevantContent(question, k = TOP_K) {
  try {
    const docsWithScores = await vectorStore.similaritySearchWithScore(question, k)
    return docsWithScores.map(([doc, score]) => ({
      score,
      content: doc.pageContent,
      id: doc.metadata?.id ?? "unknown",
      book_id: doc.metadata?.book_id ?? "unknown",
      chapter_num: doc.metadata?.chapter_num ?? "unknown",
      index: doc.metadata?.index ?? "unknown",
    }))
  } catch (error) {
    console.error("Error retrieving relevant content:", error.message);
    return [];
  }
}

const retrieveNode = async (state) => {
  const documents = await retrieveRelevantContent(state.question, state.k)
  return {
    question: state.question,
    k: state.k,
    documents
  }
}

const generateNode = async (state) => {
  const context = state.documents.map((item, i) => `[片段${i + 1}]
  章节：${item.chapter_num}章
  内容：${item.content}`).join("\n\n-------------------------------\n\n")
  const prompt = `
  你是一个专业的《天龙八部》小说助手。基于小说内容回答问题，用准确，详细的语言。
  请根据以下《天龙八部》小说片段内容回答问题：
  ${context}
  用户问题：${state.question}

  回答要求：
  1. 如果片段中有相关信息，请结合小说内容给出详细、准确的回答
  2. 可以综合多个片段的内容，提供完整的答案
  3. 如果片段中没有相关信息，请如实告知用户
  4. 回答要准确，符合小说的情节和人物设定
  5. 可以引用原文内容来支持你的回答
  
  AI 助手的回答：
  `
  process.stdout.write("\n[AI 回答（流式）...]\n")
  let generation = ""
  const stream = await model.stream(prompt)
  for await (const chunk of stream) {
    const text = typeof chunk.content === "string" ? chunk.content : ""
    if (!text) continue
    generation += text
    process.stdout.write(text)
  }
  return {
    question: state.question,
    k: state.k,
    documents: state.documents,
    generation
  }
}

const graph = new StateGraph(GraphState)
  .addNode("retrieve", retrieveNode)
  .addNode("generate", generateNode)
  .addEdge(START, "retrieve")
  .addEdge("retrieve", "generate")
  .addEdge("generate", END)
  .compile()

const drawable = await graph.getGraphAsync()
const mermaid = drawable.drawMermaid({ withStyles: true })
console.log(mermaid)

async function main() {
  const question = "阿朱的结局是什么？"
  const kArg = 5

  console.log("连接到milvus...")
  vectorStore = await Milvus.fromExistingCollection(embeddings, {
    collectionName: COLLECTION_NAME,
    url: "localhost:19530",
    textField: "content",
    primaryField: "id",
    vectorField: "vector",
    indexCreateOptions: {
      metric_type: "COSINE",
      index_type: "IVF_FLAT",  // 和 writter 建的索引一致（IVF_FLAT 按 nprobe 查桶）
      search_params: { nprobe: 16 },  // 检索时扫 16 个桶，越大越准越慢
    }
  })
  console.log('已连接')
  try{
    await vectorStore. client.loadCollection({collection_name:COLLECTION_NAME})
    console.log(`集合:${COLLECTION_NAME} 已加载`)
  } catch (error) {
    if (!error.message.includes("already loaded")){
      throw error
    }
    console.log(`集合:${COLLECTION_NAME} 已处于加载状态`)
  }

  console.log("=".repeat(80))
  console.log(`问题：${question}`)
  console.log("=".repeat(80))

  const result = await graph.invoke({ 
    question, 
    k: Number.isInteger(kArg) ? kArg : TOP_K ,
    documents: [],
    generation: "",
  })

  console.log("检索相关内容")
  if (result.documents.length === 0) {
    console.log("未检索到相关文档")
    console.log("\n[AI 回答]")
    console.log("没有找到相关《天龙八部》相关内容")
    return
  } else {
    result.documents.forEach((item, i) => {
      console.log(`\n 【片段：${i+1} 相似度】：${item.score.toFixed(4)}`)
      console.log(`书籍：${item.book_id}`)
      console.log(`章节：${item.chapter_num}章`)
      console.log(`内容：${item.content.substring(0, 200)}...`)
    })
  }
  if(!result.generation){
    console.log("模型未返回内容。")
  }else{
    console.log(result.generation)
  }
}

main()
  .catch(err => console.error(err))
