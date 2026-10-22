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
import { z } from 'zod'

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


const GraphState = Annotation.Root({
  question: Annotation,
  k: Annotation,
  strategy: Annotation,
  routerReason: Annotation,
  documents: Annotation,
  generation: Annotation,
})

const RouteSchema = z.object({
  // 枚举
  strategy: z.enum(["simple", "complex"]),
  reason: z.string()
})


let vectorStore

async function retrieveRelevantContent(question, k = 5) {
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


// llm 完成问题的分辨
// RouteSchema 机构化输出约束
const routeQusetionNode = async (state) => {
  console.log('___ROUTE-QUESTION___')
  const structuredLlm = model.withStructuredOutput(RouteSchema)
  const router = await structuredLlm.invoke(`
    你是问答路由器，请判断用户问题是否需要外部检索。
    规则：
    - simple：常识问答、简短定义、无需特定小说细节即可回答。
    - complex：需要《天龙八部》具体情节、任务关系、章节事实、原文细节或证据支持

    用户问题：${state.question}
  `)
  console.log(`路由策略：${router.strategy} 原因：${router.reason}`)
  return {
    question: state.question,
    k: state.k,
    strategy: router.strategy,
    routerReason: router.reason
  }
}


const directAnswerNode = async (state) => {
  console.log('___DIRECT-ANSWER___')
  process.stdout.write("\n[ai 回答（流式）...]\n")
  let generation = ""
  const stream = await model.stream(`你是一个中文回答助手，
  请直接简洁回答用户问题。
  用户问题：${state.question}
  `)
  for await (const chunk of stream) {
    const text = typeof chunk.content === "string" ? chunk.content : ""
    if (!text) continue
    generation += text
    process.stdout.write(text)
  }
  process.stdout.write("\n[ai 回答（流式）结束]\n")
  return {
    question: state.question,
    k: state.k,
    strategy: state.strategy,
    routerReason: state.routerReason,
    documents: [],
    generation
  }
}

const decideNext = (state) => {
  return state.strategy === "simple" ? "direct_answer" : "retrieve"
}

const graph = new StateGraph(GraphState)
  .addNode("route_question", routeQusetionNode)
  .addNode("direct_answer", directAnswerNode)
  .addNode("retrieve", retrieveNode)
  .addNode("rag_generate", generateNode)
  .addEdge(START, "route_question")
  .addConditionalEdges("route_question", decideNext, {
    direct_answer: "direct_answer",
    retrieve: "retrieve"
  })
  .addEdge("retrieve", "rag_generate")
  .addEdge("rag_generate", END)
  .addEdge("direct_answer", END)
  .compile()

const drawable = await graph.getGraphAsync()
const mermaid = drawable.drawMermaid({ withStyles: true })
console.log(mermaid)

async function mian() {
  const question = "js写一个add函数"
  const k = 5
  vectorStore = await Milvus.fromExistingCollection(embeddings, {
    collectionName: "ebook_collection",
    url: "localhost:19530",
    textField: "content",
    primaryField: "id",
    vectorField: "vector",
    indexCreateOptions: {
      metric_type: "COSINE",
      index_type: "HNSW",
      params: { M: 16, efConstruction: 200 },
      search_params: { ef: 64 }
    }
  })
  vectorStore.indexSearchParams = {
    metric_type: "COSINE",
    params: JSON.stringify({ ef: 64 })
  }
  try {
    await vectorStore.client.loadCollection({
      collection_name: "ebook_collection"
    })
    console.log("加载集合成功")
  } catch (err) {
    if (!err.message.includes("already loaded")) {
      throw err
    }
    console.log("集合已经处于加载状态")
  }
  const result = await graph.invoke({
    question,
    k,
    strategy: "",
    routerReason: "",
    documents: [],
    generation: ""
  })
  console.log(JSON.stringify(result))
}

mian()
  .catch(err => console.log(err))
