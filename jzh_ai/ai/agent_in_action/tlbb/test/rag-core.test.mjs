import assert from 'node:assert/strict'
import { basename } from 'node:path'
import test from 'node:test'
import { EPubLoader } from '@langchain/community/document_loaders/fs/epub'
import { DataType, IndexType, MetricType } from '@zilliz/milvus2-sdk-node'

import { EPUB_PATH } from '../src/main.mjs'
import { createQueryRuntime } from '../src/query.mjs'
import { createRagRuntime, retrieveRelevantContent } from '../src/rag.mjs'
import {
  CHUNK_OVERLAP,
  CHUNK_SIZE,
  VECTOR_DIM,
  buildCollectionFields,
  buildIndexRequest,
  buildRagPrompt,
  buildSearchRequest,
  formatContext,
  validateRuntimeConfig,
} from '../src/rag-core.mjs'

test('resolves and loads the bundled EPUB independently of process.cwd()', async () => {
  // 修复说明：面试时可能从 workspace 根目录启动，EPUB 路径不能依赖当前工作目录。
  assert.equal(basename(EPUB_PATH), '天龙八部.epub')
  const documents = await new EPubLoader(EPUB_PATH, { splitChapters: true }).load()
  assert.ok(documents.length > 100)
})

test('exposes the verified EPUB chunking and vector settings', () => {
  assert.equal(CHUNK_SIZE, 500)
  assert.equal(CHUNK_OVERLAP, 50)
  assert.equal(VECTOR_DIM, 1024)
  assert.deepEqual(
    buildCollectionFields().find(({ name }) => name === 'vector'),
    { name: 'vector', data_type: DataType.FloatVector, dim: VECTOR_DIM },
  )
})

test('builds a cosine IVF_FLAT index and an SDK-compatible Top-K request', () => {
  assert.deepEqual(buildIndexRequest(), {
    collection_name: 'ebook',
    field_name: 'vector',
    index_type: IndexType.IVF_FLAT,
    metric_type: MetricType.COSINE,
    params: { nlist: 1024 },
  })
  const queryVector = [0.1, 0.2, 0.3]
  assert.deepEqual(buildSearchRequest(queryVector, 5), {
    collection_name: 'ebook',
    data: [queryVector],
    limit: 5,
    metric_type: MetricType.COSINE,
    output_fields: ['id', 'book_id', 'book_name', 'chapter_num', 'index', 'content'],
  })
})

test('formats ordered source context and constrains unsupported answers', () => {
  assert.equal(formatContext([]), '')
  const context = formatContext([
    { chapter_num: 2, content: '第一段原文' },
    { chapter_num: 5, content: '第二段原文' },
  ])
  assert.match(context, /片段1/)
  assert.match(context, /章节2/)
  assert.ok(context.indexOf('第一段原文') < context.indexOf('第二段原文'))
  const prompt = buildRagPrompt('人物会什么武功？', context)
  assert.match(prompt, /未找到相关内容/)
  assert.match(prompt, /人物会什么武功/)
})

test('reports missing variable names without exposing values', () => {
  assert.throws(
    () => validateRuntimeConfig({ OPENAI_API_KEY: '' }, ['OPENAI_API_KEY', 'MILVUS_ADDRESS']),
    /OPENAI_API_KEY, MILVUS_ADDRESS/,
  )
  assert.deepEqual(
    validateRuntimeConfig({ OPENAI_API_KEY: 'configured' }, ['OPENAI_API_KEY']),
    { OPENAI_API_KEY: 'configured' },
  )
})

test('validates query and RAG configuration before creating external clients', () => {
  // 修复说明：工厂必须先报告缺失配置，不能在模块导入阶段创建远程 Client。
  assert.throws(() => createQueryRuntime({}), /MILVUS_ADDRESS/)
  assert.throws(() => createRagRuntime({}), /MILVUS_ADDRESS/)
})

test('does not report an external retrieval failure as an empty search result', async () => {
  const runtime = {
    getEmbedding: async () => {
      throw new Error('embedding unavailable')
    },
    client: { search: async () => ({ results: [] }) },
  }

  // 修复说明：服务异常必须明确失败，只有真实空结果才能返回“未找到相关内容”。
  await assert.rejects(
    () => retrieveRelevantContent('测试问题', 3, runtime),
    /embedding unavailable/,
  )
})
