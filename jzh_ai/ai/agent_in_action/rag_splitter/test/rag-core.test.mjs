import assert from 'node:assert/strict'
import test from 'node:test'

import { SPLITTER_CONFIG, buildContext, buildPrompt } from '../src/rag-core.mjs'

test('keeps the verified 400/100 recursive splitting configuration', () => {
  assert.deepEqual(SPLITTER_CONFIG, {
    chunkSize: 400,
    chunkOverlap: 100,
    separators: ['。', '！', '？'],
  })
})

test('builds ordered retrieval context and a constrained prompt', () => {
  assert.equal(buildContext([]), '')
  const context = buildContext([{ pageContent: '片段甲' }, { pageContent: '片段乙' }])
  assert.ok(context.indexOf('片段甲') < context.indexOf('片段乙'))
  const prompt = buildPrompt('代码怎么流动？', context)
  assert.match(prompt, /只根据文章内容/)
  assert.match(prompt, /代码怎么流动/)
})
