# Document 切割

- 知识库 放的知识
  知识的来源很多，一个word文档，一个pdf文件，一个bilibili适配，一个url，一个挺靠谱的twitter
  各种格式的问而建 -> 向量化前的document对象 -> 向量化后的向量
   不能直接创建document对象

  怎么处理
  
  document langchain 提供的标准格式的文档 pageContent ，pageMetadata

## loader
知识库 -> 向量数据库
各种知识文件，后缀不同，需要根据后缀选择不同的loader 不同的文件格式，需要不同的loader
输入时文件，输出是document对象
两件事情要做
1.选择相应的loader
2.分块 文件太大 要检索的时一定大小具有一定语义的chunk
来自社区的@langchain/community 主要由社区维护，我们都可以写loader
langchain @langchain/core 官方维护

- 爬虫 crawl 
  - 从目标 url 开始 ，发送请求，拿到 html字符串
  - 解析html 字符串，提取需要的文本内容（正则）
  - cheerio 另辟蹊径 前端思维 css 选择器 提取需要的文本内容

## ai 时代程序员的价值
- 不在codign 交给ai
- vibe coding 问出的问题 （prompt），提供 丰富准确的上下文（context），（harness）并部署（fde） agent 产品 ，设计长时间运行的loop，用好ai 快速成为一名ai 架构师

- 切割的意义
  保持语义的完整性
  - separators 语义的最基本构成符号。？！， 不会是，
  - 按chunkSize的大小 切割
  - 切断 chunk 的最后一句和下一个chunk 第一句，他们的语义相关性是最大的，但是因为chunksize 切开了，语义遗憾用 overlap 用一定的冗余来确保语义的完整性