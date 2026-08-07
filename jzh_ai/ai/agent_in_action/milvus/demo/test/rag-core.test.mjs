import assert from 'node:assert/strict'
import test from 'node:test'
import { DataType, IndexType, MetricType } from '@zilliz/milvus2-sdk-node'

import {
  VECTOR_DIM,
  buildDiaryFields,
  buildDiaryIndexRequest,
  buildDiarySearchRequest,
  formatDiaryContext,
} from '../src/rag-core.mjs'

test('defines a 1024-dimensional diary collection and cosine IVF_FLAT index', () => {
  assert.equal(VECTOR_DIM, 1024)
  assert.deepEqual(
    buildDiaryFields().find(({ name }) => name === 'vector'),
    { name: 'vector', data_type: DataType.FloatVector, dim: VECTOR_DIM },
  )
  assert.deepEqual(buildDiaryIndexRequest(), {
    collection_name: 'ai_dairy2',
    field_name: 'vector',
    index_type: IndexType.IVF_FLAT,
    metric_type: MetricType.COSINE,
  })
})

test('builds SDK-compatible Top-K search data and formatted context', () => {
  const vector = [0.1, 0.2]
  assert.deepEqual(buildDiarySearchRequest(vector, 3), {
    collection_name: 'ai_dairy2',
    data: [vector],
    limit: 3,
    metric_type: MetricType.COSINE,
    output_fields: ['id', 'date', 'mood', 'tags', 'content'],
  })
  assert.equal(formatDiaryContext([]), '')
  const context = formatDiaryContext([{ date: '2026-01-01', mood: 'happy', tags: ['学习'], content: '学习 Milvus' }])
  assert.match(context, /心情：happy/)
  assert.match(context, /学习 Milvus/)
})
