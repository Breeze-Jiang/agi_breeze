import { DataType, IndexType, MetricType } from '@zilliz/milvus2-sdk-node'

export const COLLECTION_NAME = 'ebook'
export const VECTOR_DIM = 1024
export const CHUNK_SIZE = 500
export const CHUNK_OVERLAP = 50

export function buildCollectionFields() {
  return [
    { name: 'id', data_type: DataType.VarChar, max_length: 100, is_primary_key: true },
    { name: 'book_id', data_type: DataType.VarChar, max_length: 100 },
    { name: 'book_name', data_type: DataType.VarChar, max_length: 200 },
    { name: 'chapter_num', data_type: DataType.Int32 },
    { name: 'index', data_type: DataType.Int32 },
    { name: 'content', data_type: DataType.VarChar, max_length: 10000 },
    { name: 'vector', data_type: DataType.FloatVector, dim: VECTOR_DIM },
  ]
}

export function buildIndexRequest() {
  return {
    collection_name: COLLECTION_NAME,
    field_name: 'vector',
    index_type: IndexType.IVF_FLAT,
    metric_type: MetricType.COSINE,
    params: { nlist: 1024 },
  }
}

export function buildSearchRequest(queryVector, k = 3) {
  if (!Array.isArray(queryVector) || queryVector.length === 0) {
    throw new TypeError('queryVector must be a non-empty number array')
  }
  if (!Number.isInteger(k) || k < 1) {
    throw new RangeError('k must be a positive integer')
  }
  return {
    collection_name: COLLECTION_NAME,
    data: [queryVector],
    limit: k,
    metric_type: MetricType.COSINE,
    output_fields: ['id', 'book_id', 'book_name', 'chapter_num', 'index', 'content'],
  }
}

export function formatContext(results = []) {
  return results
    .map((item, index) => `片段${index + 1}\n章节${item.chapter_num}\n内容${item.content}`)
    .join('\n\n------\n\n')
}

export function buildRagPrompt(question, context) {
  return `你是一个专业的《天龙八部》小说助手。请只根据以下小说片段回答问题。\n\n小说片段：\n${context}\n\n用户问题：${question}\n\n回答要求：\n1. 片段包含相关信息时，结合原文给出准确回答。\n2. 可以综合多个片段，但不要补充片段之外的情节。\n3. 片段不包含答案时，只回答“未找到相关内容”。`
}

export function validateRuntimeConfig(env, requiredNames) {
  const missing = requiredNames.filter((name) => !env[name]?.trim())
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
  return Object.fromEntries(requiredNames.map((name) => [name, env[name]]))
}
