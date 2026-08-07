import assert from 'node:assert/strict'
import test from 'node:test'
import { DataType, IndexType, MetricType } from '@zilliz/milvus2-sdk-node'

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
