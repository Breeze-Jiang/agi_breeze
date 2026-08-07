export const SPLITTER_CONFIG = Object.freeze({
  chunkSize: 400,
  chunkOverlap: 100,
  separators: Object.freeze(['。', '！', '？']),
})

export function buildContext(documents = []) {
  return documents
    .map((document, index) => `[片段${index + 1}]\n${document.pageContent}`)
    .join('\n\n------\n\n')
}

export function buildPrompt(question, context) {
  return `你是一个文章辅助阅读助手，只根据文章内容回答问题。\n\n文章内容：\n${context}\n\n问题：${question}\n\n回答：`
}
