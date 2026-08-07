# 把 EPUB 做成可检索问答：一套最小 RAG 实战链路

> 本文基于一个本地练习项目的静态代码阅读整理，技术栈为 Node.js、LangChain、Milvus/Zilliz 与 OpenAI 兼容接口。**运行未验证**。

很多人第一次做 RAG 时，会把重点放在“调用大模型”。但真正决定回答是否能依据资料的，是前半段：**文档能否切对、向量能否写对、检索结果能否正确带回原文。**

本文用一个《天龙八部》EPUB 问答项目串起完整流程：EPUB 入库、向量检索、RAG 生成，并整理几个最容易卡住的接口细节。

[TOC]

## 先看全链路：RAG 到底在做什么

这个项目并没有训练一个“读过小说”的模型，而是将小说内容做成向量知识库。用户提问时，系统先找相关片段，再把片段交给聊天模型组织答案：

```text
EPUB
  → 按章节加载
  → 按文本块切分
  → 文本转 Embedding 向量
  → 写入 Milvus

用户问题
  → 问题转向量
  → Milvus 检索相似片段
  → 片段拼入 Prompt
  → Chat 模型回答
```

这里的关键判断是：**Embedding 模型负责“找资料”，聊天模型负责“基于资料回答”。** 两者不是同一个职责。

## 第一步：从 EPUB 到文本块

项目的入库入口位于 `main.mjs`，它使用 `EPubLoader` 并配置 `splitChapters: true`，先将电子书拆成多个章节文档。

之后再用 `RecursiveCharacterTextSplitter` 做二次切分：

```js
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
})

const chunks = await textSplitter.splitText(chapterContent)
```

这里有两个参数需要理解：

| 参数 | 当前值 | 作用 |
|---|---:|---|
| `chunkSize` | 500 | 单个文本块的目标字符数，决定检索粒度 |
| `chunkOverlap` | 50 | 相邻块重复的字符数，降低切断上下文的影响 |

为什么不把整章直接入库？因为一章通常很长：向量会概括过多内容，检索命中后也会带来大量无关文字。切成 chunk 后，检索结果更精确，传给模型的上下文也更可控。

### 一个高频坑：`splitText()` 返回什么？

`splitText()` 返回的是**字符串数组**：

```js
['第一段文本', '第二段文本']
```

因此入库时应直接使用 `chunk`：

```js
content: chunk
```

不能写成：

```js
content: chunk.pageContent
```

`pageContent` 是 LangChain `Document` 对象上常见的属性；而这里的 `chunk` 已经是普通字符串。把字符串当 Document 读取，会得到 `undefined`，最终会让保存的原文内容不正确。

## 第二步：设计 Milvus 集合

项目创建了名为 `ebook` 的集合，保存文本、章节号和向量：

```js
{ name: 'id', data_type: DataType.VarChar, is_primary_key: true }
{ name: 'chapter_num', data_type: DataType.Int32 }
{ name: 'content', data_type: DataType.VarChar }
{ name: 'vector', data_type: DataType.FloatVector, dim: 1024 }
```

可以把它理解成一张“带语义坐标的表”：

- `content`：用于回答的原始文本；
- `chapter_num`：帮助定位片段来自哪一章；
- `vector`：用于相似度计算；
- `id`：唯一标识每一个 chunk。

项目使用 `IVF_FLAT` 索引和 `COSINE` 度量：

```js
await client.createIndex({
  collection_name: COLLECTION_NAME,
  field_name: 'vector',
  index_type: IndexType.IVF_FLAT,
  metric_type: MetricType.COSINE,
  params: { nlist: 1024 },
})
```

对于这个练习，先记住即可：`COSINE` 用来比较两个向量在“方向”上是否相近；分数越高通常表示语义越接近。索引和度量类型的选择会影响检索效率与结果，但第一版项目应先保证“维度一致、可写入、可查询”。

## 第三步：写入数据后为什么还要 flush？

每个 chunk 会先调用 Embedding 接口生成向量，再通过 `client.insert()` 写入集合。

全部章节处理结束后，项目调用：

```js
await client.flush({
  collection_names: [COLLECTION_NAME],
})
```

`flush()` 不是“插入数据”，而是让已提交的数据刷新到可稳定查询的状态。它适合放在**全部批量插入完成后**，不建议每个 chunk 或每章都调用，否则会产生不必要的频繁刷新。

## 第四步：把问题转成向量并检索

查询脚本的任务很单一：把“段誉会什么武功”转成向量，然后在 `ebook` 集合中找最相近的 3 段文本。

```js
const queryVector = await getEmbedding(query)

const searchResult = await client.search({
  collection_name: COLLECTION_NAME,
  vector: queryVector,
  limit: 3,
  metric_type: MetricType.COSINE,
  output_fields: ['chapter_num', 'content'],
})
```

随后读取：

```js
searchResult.results
```

它代表检索结果数组。每个元素包含相似度分数和请求返回的字段。

### 第二个高频坑：SDK 返回字段名不能想当然

项目调试中出现过：

```js
searchResult.result.forEach(...)
```

报错的根因是 `result` 为 `undefined`。实际应读取 `results`。同理，输出结果时也不应默认字段被嵌套在 `item.fields`，应先打印一次 `item`，以实际 SDK 响应结构为准。

推荐的排错方式：

```js
console.log(searchResult.results)
```

先确认返回对象，再决定用 `item.content`、`item.chapter_num`，还是其他层级。不要仅凭其他语言 SDK 或旧教程猜字段名。

## 第五步：将检索结果交给 Chat 模型

RAG 脚本将检索与回答拆为两个函数：

```text
retrieveRlevantContent(question, k)
  → 返回相关片段

answerEbookQuestion(question, k)
  → 拼接片段为 context
  → 调用 ChatOpenAI
  → 返回回答
```

上下文拼接的核心是：

```js
const context = retrievedContent.map((item, index) => {
  return `片段${index + 1}
章节${item.chapter_num}
内容${item.content}`
}).join('\n\n------\n\n')
```

再将 `context` 和用户问题同时传入 Prompt。这样模型不是只看到“鸠摩智会什么武功”，而是还看到了检索出的小说片段，回答会更有资料依据。

## 从这次项目中提炼的排错表

| 表象 | 根因 | 应检查什么 |
|---|---|---|
| 日志显示插入 0 条 | 可能读错 SDK 返回字段，如 `inserted_count` 与实际字段不一致 | 打印完整 `insertResult` |
| 入库内容为空或 `undefined` | 把 `splitText()` 的字符串当成 Document | 使用 `content: chunk` |
| 第一章就无法入库 | Embedding 模型名不受当前 OpenAI 兼容接口支持 | 检查供应商支持的模型名与账户权限 |
| `forEach` 报错 | 对 `searchResult` 读取了不存在的 `result` | 打印响应，确认是否为 `results` |
| 搜到了结果但打印 `undefined` | 假设有 `item.fields` 嵌套对象 | 先打印 `item`，按真实字段读取 |
| RAG 启动时报 `OpenAI is not defined` | 使用了未导入的类 | 使用并导入 `ChatOpenAI` |

## 最小自检清单

在扩展功能前，按下面顺序逐条确认：

- [ ] Embedding 输出向量长度与 Milvus `FloatVector.dim` 相同；
- [ ] 每个 chunk 的 `content` 是实际字符串，不是 `undefined`；
- [ ] `insert()` 后记录一次完整返回值，确认计数属性；
- [ ] 批量写入完成后执行一次 `flush()`；
- [ ] `search()` 结果先整体打印一次，再读取字段；
- [ ] 检索为空时，RAG 不继续访问 `retrievedContent.length` 之外的内容；
- [ ] 聊天模型与 Embedding 模型分别配置并分别验证。

## 结尾：先把三条链路拆开

一个 RAG 项目最容易出现“看似都是模型问题”的错觉。实际上它至少包含三条需要独立验证的链路：

1. EPUB → chunk → 向量库写入；
2. 问题 → 向量 → 相似文本检索；
3. 检索文本 → Prompt → 聊天模型回答。

先让每条链路都有可观察的输入和输出，再把它们组合起来，排错效率会高很多。下一步可以为检索加入 `book_id` 等元数据过滤，并把固定问题改为命令行输入，形成一个可重复演示的最小 RAG Demo。

**标签：** `RAG` `LangChain` `Milvus` `Node.js` `向量数据库`
