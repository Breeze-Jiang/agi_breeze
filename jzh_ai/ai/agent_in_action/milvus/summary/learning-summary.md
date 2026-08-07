# Milvus 与 Zilliz Cloud 学习总结

## 学习范围

- 笔记：[readme.md](file:///C:/Users/38335/Desktop/workspace/jzh_ai/ai/agent_in_action/milvus/readme.md)
- 建库与写入示例：[index.mjs](file:///C:/Users/38335/Desktop/workspace/jzh_ai/ai/agent_in_action/milvus/demo/src/index.mjs)
- RAG 检索与回答示例：[rag.mjs](file:///C:/Users/38335/Desktop/workspace/jzh_ai/ai/agent_in_action/milvus/demo/src/rag.mjs)

> 注意：材料中曾出现连接凭据。本文不记录、不复述任何密钥、Token 或密码。

## 1. 核心目标：让大模型基于私人数据回答

本练习实现的是“AI 日记本”：把日记文本转换为向量，存入 Milvus；用户提问时，也把问题转换为向量，从日记中找语义最接近的内容，再交给大模型生成回答。

流程：

```text
日记文本 → Embedding → Milvus Collection
用户问题 → Embedding → 向量检索 Top K
检索到的日记 → Prompt → 大模型回答
```

这就是 RAG（检索增强生成）的基础闭环。

## 2. Milvus、Zilliz 与传统数据库的分工

- **MySQL**：适合按 ID、日期、状态等结构化条件做 CRUD。
- **Milvus**：适合“语义相近”检索，例如“什么事情让我快乐”。
- **Zilliz Cloud**：基于 Milvus 的托管云服务，负责部署、运维与扩缩容。

实际系统中常常两者并用：MySQL 保存业务主数据，Milvus 保存可检索的向量及必要元数据。

## 3. Collection 的数据模型

本例创建 `ai_dairy2` 集合，包含：

| 字段 | 类型 | 作用 |
|---|---|---|
| `id` | VarChar 主键 | 唯一定位一篇日记 |
| `vector` | FloatVector，1024 维 | 执行相似度搜索 |
| `content` | VarChar | 原始日记文本 |
| `date` | VarChar | 日记日期 |
| `mood` | VarChar | 心情 |
| `tags` | Array<VarChar> | 标签 |

关键约束：

1. 向量维度必须和 Embedding 模型输出维度一致；本例为 1024。
2. `VarChar` 必须定义 `max_length`。
3. 插入对象的字段名必须与 Collection 字段名完全一致，包括大小写。
4. Collection 创建后不能直接更改字段结构；开发期调整 Schema 常需要删旧集合后重建。

## 4. 写入过程

示例用 `OpenAIEmbeddings` 调用 `embedQuery` 把每篇日记 `content` 转成向量，再把原文、元数据和向量一起插入：

```js
const diaryData = await Promise.all(
  diaryContents.map(async (diary) => ({
    ...diary,
    vector: await getEmbedding(diary.content)
  }))
)
```

这说明：**向量库通常不只存向量，也要存原文和元数据**，否则检索命中后无法给用户展示内容，也难以做日期、标签等过滤。

## 5. 索引与相似度

示例为 `vector` 建立 `IVF_FLAT` 索引，并使用 `COSINE` 余弦相似度。

- **索引**：避免每次都把查询向量与全部日记逐个比较，提升检索速度。
- **COSINE**：衡量两个向量方向的接近程度；数值越高通常表示语义越相近。
- **Top K**：`limit: k` 决定返回最相关的 k 条日记。

索引类型、参数和距离度量需要与数据规模、延迟目标和召回要求一起设计；不能只追求速度或只追求精度。

## 6. RAG 检索模块

RAG 代码分成三个职责：

1. `getEmbedding(text)`：文本转向量。
2. `retrieveRlevantDiaries(question, k)`：问题向量化后，调用 Milvus 搜索。
3. `answerDiaryQuestion(question, k)`：把检索结果整理成上下文 Prompt，再调用聊天模型回答。

关键代码逻辑：

```js
const queryVector = await getEmbedding(question)

const searchres = await client.search({
  vector: queryVector,
  metric_type: MetricType.COSINE,
  collection_name: COLLECTION_NAME,
  limit: k,
  output_fields: ['id', 'date', 'mood', 'tags', 'content']
})
```

常见错误是直接使用未定义的 `queryVector`。正确顺序永远是：**问题 → 向量 → 搜索**。

## 7. 本次排错经验

| 现象 | 根因 | 处理方式 |
|---|---|---|
| `address property is missing` | 环境变量未被读取 | 确认 `.env` 位置、变量名和运行目录 |
| `fields or collection_name is missing` | SDK 参数结构不符合当前版本 | 使用 `collection_name` 与 `fields` |
| `max_length should be specified` | VarChar 字段缺少长度限制 | 为字符串字段增加 `max_length` |
| `duplicate collection with different parameters` | 同名集合已存在但 Schema 不同 | 开发期删旧集合并重建 |
| `some field does not exist` | 插入字段名与 Schema 不一致 | 统一字段命名 |
| `queryVector is not defined` | 检索前未生成问题向量 | 调用 Embedding 生成向量 |

## 8. 面试速记

- **Milvus 是什么？** 专门存储和检索高维向量的数据库，用于语义相似搜索。
- **Milvus 和 MySQL 的区别？** MySQL 擅长结构化精确查询；Milvus 擅长向量近邻查询。两者常组合使用。
- **RAG 为什么需要 Milvus？** 用向量检索取回与问题相关的私有资料，作为大模型回答依据，降低幻觉。
- **为什么要存 metadata？** 检索后需要拿到原文、来源、时间、标签；还可用于 Filter。
- **为什么要建索引？** 加速大规模相似搜索；通常要在延迟、召回率、内存间权衡。

## 下一步学习

1. 给查询增加 metadata filter，例如只检索某个日期或某种心情的日记。
2. 理解 `IVF_FLAT`、HNSW、AUTOINDEX 的适用场景。
3. 加入删除、更新及幂等写入策略，避免重复插入。
4. 给 RAG 加上相似度阈值和引用来源展示。
5. 将密钥移入 `.env`，并通过 `.gitignore` 排除，避免泄露。
