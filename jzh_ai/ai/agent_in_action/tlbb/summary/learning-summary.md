# 《天龙八部》EPUB 到 RAG 问答：项目学习总结

## 1. 整体概览

本项目实现的是一个小说知识库问答练习：读取《天龙八部》EPUB，按章节和文本块切分内容，调用 Embedding 模型把每段文本转为向量，写入 Milvus/Zilliz；用户提问时，再把问题转成向量检索相关片段，并交给聊天模型生成回答。

核心目标不是让大模型“记住”整本小说，而是让它在回答前先从向量数据库中取回相关原文。这就是 RAG（Retrieval-Augmented Generation，检索增强生成）。

## 2. 知识地图

```text
EPUB 文件
  ↓ EPubLoader（按章节加载）
Document[]
  ↓ RecursiveCharacterTextSplitter（500 字符切分，50 字符重叠）
chunk 文本
  ↓ OpenAIEmbeddings.embedQuery()
1024 维向量
  ↓ Milvus insert + flush
ebook 集合
  ↓
用户问题 → 问题向量 → Milvus 相似度检索（COSINE）
  ↓
相关文本片段 + Prompt → ChatOpenAI → 最终回答
```

## 3. 核心概念

### 3.1 Chunk：文本块

EPUB 章节通常很长，不能直接整章作为一次检索或一次模型输入。项目使用 `RecursiveCharacterTextSplitter` 按 `chunkSize: 500` 切分，并设置 `chunkOverlap: 50`。

- `chunkSize`：一个文本块大约包含多少字符。
- `chunkOverlap`：相邻文本块重复的字符数，用于避免一句话刚好被切断后丢失上下文。

### 3.2 Embedding：文本向量

Embedding 模型把文本转换为一串浮点数，例如 1024 维数组。语义相近的句子，向量位置通常更接近。

项目中集合向量字段的维度为 1024，Embedding 配置也使用 1024 维；二者必须一致，否则无法写入或检索。

### 3.3 Milvus Collection：向量表

`ebook` 是项目创建的 Milvus 集合。每条记录不仅保存向量，还保存原文和定位信息：`id`、`book_id`、`book_name`、`chapter_num`、`index`、`content`、`vector`。

这样检索到向量后，程序能同时得到对应的小说原文与章节位置。

### 3.4 RAG：先检索，再生成

RAG 的关键流程是：

1. 将问题转成向量；
2. 在向量库中按余弦相似度找最接近的文本；
3. 将这些文本拼成 `context`；
4. 将 `context` 和问题一起交给聊天模型；
5. 聊天模型基于检索内容作答。

它的价值是减少模型脱离资料“凭记忆回答”的概率，并允许知识库随时更新。

## 4. 三个脚本的数据流

### 4.1 `main.mjs`：建库和入库

`main.mjs` 是离线数据处理脚本：

- 连接 Milvus；
- 检查 `ebook` 集合是否存在，不存在则创建字段和向量索引；
- 通过 `EPubLoader` 加载 EPUB；
- 逐章切分文本；
- 对每个 chunk 调用 `embedQuery()`；
- 调用 `client.insert()` 写入 Milvus；
- 全部写入后调用 `flush()`，让已接收的数据可持久化、可查询。

材料中的关键实现是将 `splitText()` 返回的字符串直接作为 `content` 写入，而不是读取不存在的 `chunk.pageContent` 属性。

```js
const chunks = await textSplitter.splitText(chapterContent)

const insertData = await Promise.all(chunks.map(async (chunk, index) => ({
  id: `${bookId}-${chapterNum}-${index}`,
  content: chunk,
  vector: await getEmbedding(chunk),
})))
```

运行未验证；代码来源于本地项目的静态阅读。

### 4.2 `query.mjs`：只做向量检索

`query.mjs` 用固定问题生成查询向量，再调用 `client.search()`：

```js
const searchResult = await client.search({
  collection_name: COLLECTION_NAME,
  vector: queryVector,
  limit: 3,
  metric_type: MetricType.COSINE,
  output_fields: ['chapter_num', 'content'],
})
```

它返回 `searchResult.results`，即最相近的若干条记录。材料显示，结果对象的字段应直接从 `item.chapter_num`、`item.content` 读取，而不是假设存在 `item.fields`。

### 4.3 `rag.mjs`：检索后交给聊天模型回答

`rag.mjs` 把检索和生成组合起来：

- `retrieveRlevantContent(question, k)`：生成问题向量，返回 `searchResult.results`；
- `answerEbookQuestion(question, k)`：将检索结果拼接为上下文；
- `ChatOpenAI.invoke(prompt)`：基于上下文生成答案。

这体现了 RAG 中“检索器”和“生成器”的职责分离。

## 5. 实践要点

| 环节 | 项目选择 | 原因 |
|---|---|---|
| 数据源 | EPUB | 适合小说、文档等长文本 |
| 加载方式 | `splitChapters: true` | 先按章节组织，便于保留章节信息 |
| 切分参数 | 500 / 50 | 控制检索粒度，并保留相邻上下文 |
| 向量维度 | 1024 | 必须与 Milvus `FloatVector` 字段一致 |
| 索引 | `IVF_FLAT` | 用于向量相似度检索 |
| 相似度 | `COSINE` | 比较向量方向的相近程度 |
| 检索条数 | `k` 或 `limit` | 控制给大模型的参考片段数量 |
| 生成温度 | `0.1` | 问答任务更倾向稳定、少发散的回答 |

## 6. 易混淆点、未知与下一步

### 易混淆点

1. **`splitText()` 与 Document 的区别**：`splitText()` 返回字符串数组，字符串没有 `pageContent` 属性。
2. **`insert_cnt` 与 `inserted_count`**：Milvus SDK 返回字段必须按实际响应读取；读取错误字段会让日志显示 0，不能据此判断没有插入。
3. **`flush()` 的作用**：它不是生成向量，也不是插入动作；它用于将已写入的数据刷新，使其可稳定查询。
4. **向量检索成功不等于 RAG 成功**：检索脚本有结果，只能证明“问题向量→Milvus”的链路通了；还要验证上下文拼接和聊天模型调用。
5. **Embedding 模型与聊天模型不同**：Embedding 负责“找资料”，Chat 模型负责“组织答案”。

### 材料中已观察到的排错记录

- 使用 `text-embedding-async-v2` 时，OpenAI 兼容模式返回“不支持该模型”的 404，导致第一个 chunk 就无法生成向量；应使用当前接入方式支持的 Embedding 模型名。
- `searchResult.result.forEach` 报错，是因为 `result` 为 `undefined`；材料后续调整为读取 `searchResult.results`。
- 查询结果对象中访问 `item.fields` 得到 `undefined`；材料后续改为直接读取对象字段。

### 未知信息

- 环境变量具体值、模型供应商配置和令牌已按安全规则跳过，无法据此确认当前账户权限或模型可用性。
- 未执行脚本，因此不能声明项目已完整跑通。
- 现有集合是否含有重复入库数据、索引是否已完成构建，材料未提供可验证状态。

### 下一步建议

1. 把入库、检索、RAG 三条链路分别验证，不要一次调试全部模块。
2. 在写入后记录 `insertResult` 的完整结构一次，确认 SDK 字段。
3. 为 `retrieveRlevantContent` 增加“空数组兜底”，避免检索失败后访问 `length` 报错。
4. 将问题和答案改为命令行输入，形成可重复演示的最小 RAG Demo。
5. 后续可加入 metadata 过滤，例如按 `book_id` 限制检索范围。

## 7. 材料范围与证据说明

- 深读：`src/main.mjs`、`src/query.mjs`、`src/rag.mjs`。
- 浅读：`package.json`，用于确认依赖与项目脚本。
- 跳过：`.env`、锁文件、`node_modules`、EPUB 二进制文件；原因是可能包含敏感配置、体积过大或不直接解释核心实现。
- 外部事实：对 RAG、Embedding、Milvus 向量字段和余弦相似度的解释属于通用技术背景，未额外联网核验。

## 8. 重要事实证据映射

```json
[
  {
    "claim": "项目使用 EPUB 加载、文本切分、Embedding 和 Milvus 写入完成知识库构建。",
    "source": "src/main.mjs",
    "locations": ["1-11", "103-167"]
  },
  {
    "claim": "集合 ebook 的向量字段维度为 1024，并使用 IVF_FLAT 与 COSINE。",
    "source": "src/main.mjs",
    "locations": ["14-16", "53-83"]
  },
  {
    "claim": "查询脚本使用 searchResult.results 输出检索结果。",
    "source": "src/query.mjs",
    "locations": ["45-57"]
  },
  {
    "claim": "RAG 脚本使用 ChatOpenAI，并将检索结果拼为上下文后调用 invoke。",
    "source": "src/rag.mjs",
    "locations": ["27-34", "48-93"]
  }
]
```
