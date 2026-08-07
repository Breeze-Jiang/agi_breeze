# 向量数据库
- loader and splitter
- 内存向量数据库

## Milvus
文档向量化放到数据库，每次查询根据向量化的query 去数据库做相似度匹配，查出相关文档放到prompt里给到大模型，大模型来生成回答

- 从内存到向量数据库
Milvus 是一款开源的向量数据库，专为处理海量高维向量数据而设计
AI Agent 产品都会使用Milvus 这样的vector store

向web应用会把数据存在MySQL 里面， Sqlite ，paql，基于对数据的增删改查，实现各种业务功能。 CRUD 。

根据id 或者关键词去关联查询一些列表的数据
agent 会把知识，记忆 放在Milvus 数据库中， 对知识，记忆语义检索，增删改等各种功能

## AI 日记本 diary
- 日记的增删改查 CRUD mysql 非AI 功能 结构化数据
mysql管的 是什么
- 最近心情比较好的日记
  同时， 将entity 向量化存储到milvus 中

## zilliz
基于milvus 的全托管向量数据库服务

用户名: db_749d74e524d2120
密码: Gr0;5B<^ko?4N<0c