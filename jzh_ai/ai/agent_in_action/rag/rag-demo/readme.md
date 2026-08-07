# RAG
Retrival Agument Generation
Retrival 检索器 名词
知识库 -> 先embedding 基于向量数据库 -> 检索器 （embedding + 运行速度 + prompt embedding）

# langchain  RAG 业务能力
- @langchain/openai  Chat OpenAI Embedding
- @langchain/core/documents 
  embedding的最小单元
  知识库 由文件构成 （文本，声音，图片，视频等）
  某个段落的文字 有我们要找的语义
  {
    pageContent:'要单独embedding的文本',
    mata:{元数据，不做embedding的
      ...
      link:'https://www.baidu.com'
    }
  }
  document...  简单就放内存  复杂，


- @langchain/classic llm 开发以来 langchain 的经典常用模块
memoryVectorStore 内存向量数据库 （内存向量存储）

检索器 = 知识库 -> 文档 -> documents-> embedding -> memoryVectorStore 

invoke()

AI 发展太迅猛 langchain 版本更新太快， 看文档 

- retriever.invoke(3) top_k
  在相似度 查询的基础上， 还会做去重，过滤，rerank 等
- vectorStore.similaritySearchWithScore(question,3) 
  只做向量查询 
score 会表达内容的质量 增强高质量的数据， 向量化 
