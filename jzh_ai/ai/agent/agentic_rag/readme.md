# Agentic RAG 
AI Agent 全栈开发岗
- 你用的什么向量数据库
milvus ,  ts 
qdrant python 
pipecone 
...
## RAG 
公司内部的Agent 基本都要用到RAG。
llm能思考， 但不知道公司内部的文档，我们需要基于内部文档来回答。
这个流程太固定了，有些缺点
- 所有问题都走RAG检索? 简单问题不需要检索， 浪费资源（token 和 检索，增强流程）
  1+1 = ？
  两个分支 ， 一个简单问题， 一个复杂问题。
  llm 来判断简单？ 
- 没有纠错和评估机制， 无法判断检索内容是否精确， 是否足够。
  llm 评估函数 
- 处理不了需要多步检索的复杂问题， 比如先查A, 再查B 才能得出结论。 
  天龙八部 中 四大恶人 排行第二的是谁？此人之子在身世揭晓前， 其生父在武林中的公开身份是什么？
  llm 规划能力 拆分 分步骤  
- 专业术语、精确实体更适合关键词检索， 纯语义检索容易匹配不准。
  mysql like 查询 正则 文字匹配 
  高血糖、低血糖  自然语义相似度 相近
  关键词检索
- 本地知识库没有的内容， 去网络搜索补充？ 
  llm 胡说

死板的检索生成 流程， 升级为可思考、可判断、可纠错的智能RAG架构。

## Agentic RAG
自主规划， 更智能， 评估  
langgraph 设计一个graph表示 Agentic RAG 流程？ 

## RAG graph
- 简单问题 任然会走retrieve, 浪费token 和时间
  重新设计graph 

## 继续来优化现在RAG 的问题
- 处理不了需要多步检索的复杂问题， 比如先查A， 再查B 才能得出结论 

## 网络搜索来兜底

本地知识库没有的内容， 不会主动去网络搜索补充，容易编造答案。

网络搜索的结果，增强prompt 
混合检索 = 向量数据库 + 网络搜索 + elasticsearch

## 倒排索引
ES 相比于MySql 最大的核心优势， 基于**倒排索引**底层机制

普通MySQL 使用的是正向索引：
以一行为单位存储完整数据， 检索文本内容时， 需要逐行遍历，逐字匹配内容。 
数据量越大， 文本越长，模糊/文本搜索就越慢， 性能越差， 不适合大范围关键词检索。
ES 使用倒排索引机制：
正向索引： 文档 -> 关键词
会自动对text 类型字段进行分词处理， 才结尾一个个独立词条， 再以词条为核心，反向
关联所有包含该词条的文档。
倒排索引 关键词-> 文档 

用户输入关键词检索， ES只需要通过词条快速匹配对应的文档， 无需全表遍历， 实现
**海量**文本下**毫秒**级的全文检索。

- 基于请求
  GET 查询  /_cat/indicies
  输出所有的索引    table 组织并显示
- 创建索引 PUT /article
  建表一样 mappings  schema 
  properties 和搜索相关的各个字段
  title,content  分词 type: text 全文检索 
  author   不分词  精确匹配 
- 自动去分词建索引  将ID放入列表 
  keyword 不分词，整值精确匹配
  type="text"  type="keyword"
  **全文检索**加**精确过滤**

- 检索API 
  GET /article/_search 
  {
    "query": {
      "match": {
        field: "词 "
      }
    }
  }

  

- DSL
  Mysql SQL 
  Milvus embedding 
  DSL 全称 Domain Specific Language，领域特定语言
  Elastic Search  http 查询

- ik_max_word + ik_smart 中文友好分词器的两种
  存的时候 ik_max_word， 尽量的多存索引， 粒度更细
  ik_smart 去的时候， 粒度粗一点， 

- evaludate_local
条件边考虑 网络搜索的死循环护栏

if (state.webContext && string(state.webContext).trim()) {
    return "generate"
  }
