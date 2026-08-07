import { DataType, IndexType, MetricType } from '@zilliz/milvus2-sdk-node'

export const COLLECTION_NAME = 'ai_dairy2'
export const VECTOR_DIM = 1024

export function buildDiaryFields() {
  return [
    { name: 'id', data_type: DataType.VarChar, max_length: 50, is_primary_key: true },
    { name: 'vector', data_type: DataType.FloatVector, dim: VECTOR_DIM },
    { name: 'content', data_type: DataType.VarChar, max_length: 5000 },
    { name: 'date', data_type: DataType.VarChar, max_length: 50 },
    { name: 'mood', data_type: DataType.VarChar, max_length: 50 },
    {
      name: 'tags',
      data_type: DataType.Array,
      element_type: DataType.VarChar,
      max_capacity: 10,
      max_length: 50,
    },
  ]
}

export function buildDiaryIndexRequest() {
  return {
    collection_name: COLLECTION_NAME,
    field_name: 'vector',
    index_type: IndexType.IVF_FLAT,
    metric_type: MetricType.COSINE,
  }
}

export function buildDiarySearchRequest(vector, k = 2) {
  if (!Array.isArray(vector) || vector.length === 0) {
    throw new TypeError('vector must be a non-empty number array')
  }
  if (!Number.isInteger(k) || k < 1) {
    throw new RangeError('k must be a positive integer')
  }
  return {
    collection_name: COLLECTION_NAME,
    data: [vector],
    limit: k,
    metric_type: MetricType.COSINE,
    output_fields: ['id', 'date', 'mood', 'tags', 'content'],
  }
}

export function formatDiaryContext(diaries = []) {
  return diaries.map((diary, index) => `[日记 ${index + 1}]\n日期：${diary.date}\n心情：${diary.mood}\n标签：${(diary.tags ?? []).join(',')}\n内容：${diary.content}`).join('\n\n-----\n\n')
}
