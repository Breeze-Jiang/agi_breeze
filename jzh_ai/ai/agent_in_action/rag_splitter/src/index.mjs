import 'dotenv/config'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio'
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory'
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'

import { SPLITTER_CONFIG, buildContext, buildPrompt } from './rag-core.mjs'

const DEFAULT_URL = 'https://juejin.cn/post/7662576341775745058'
const DEFAULT_SELECTOR = '.main-area p'

export async function main({ url = DEFAULT_URL, selector = DEFAULT_SELECTOR } = {}) {
  const loader = new CheerioWebBaseLoader(url, { selector })
  const model = new ChatOpenAI({
    temperature: 0,
    model: process.env.MODEL_NAME,
    apiKey: process.env.OPENAI_API_KEY,
    configuration: { baseURL: process.env.OPENAI_BASE_URL },
  })
  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.EMBEDDINGS_MODEL_NAME,
    configuration: { baseURL: process.env.OPENAI_BASE_URL },
  })

  const documents = await loader.load()
  const splitter = new RecursiveCharacterTextSplitter(SPLITTER_CONFIG)
  const splitDocuments = await splitter.splitDocuments(documents)
  console.log(`文档分割完成，共${splitDocuments.length}个chunk`)

  const vectorStore = await MemoryVectorStore.fromDocuments(splitDocuments, embeddings)
  const retriever = vectorStore.asRetriever({ k: 3 })
  const question = '代码到底是怎么流起来的'
  const docs = await retriever.invoke(question)
  const scoredResults = await vectorStore.similaritySearchWithScore(question, 3)
  console.log(scoredResults)

  const context = buildContext(docs)
  const response = await model.invoke(buildPrompt(question, context))
  console.log(response.content)
  return { splitDocuments, docs, scoredResults, answer: response.content }
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])
if (isDirectRun) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
