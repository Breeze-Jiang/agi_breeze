# Elastic Search

- 基于Milvus 向量数据库 简单线性的RAG 
- 基于LangGraph实现闭环的Agentic RAG, 也就是Agent 自主决策要不要
检索，用什么检索（web search+milvus+es）,信息够不够，效果怎么样，
要不要重新搜。
具体的Agentic RAG 要根据业务场景设计，理解这个闭环的思路就可以。

向量数据库有个问题
专业术语、精确实体更适合关键词检索，纯语义检索容易匹配不准。
=== 关键词 es  土豆  马铃薯  跨语言 tomatoo 
+ 
like  embedding 语义相近  
mysql 行列， milvus 语义  es 关键词索引   id 
混合检索 = es 关键词检索 + milvus 相似度检索 
解决方案：
  - 同时结合关键词检索和语义检索，由模型统一融合多路结果，提升
  专业场景准确率。
关键词检索的服务

## Elastic Search 
实现全文检索的。
Mysql **原始**数据的， es 是特种兵（关键词检索）
- es 9200 存放的是索引 
- kibana 类似于phpMyAdmin 之于Mysql
  kibana 可视化查看es 