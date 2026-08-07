# 做 RAG 时，最先该跑通的不是大模型，而是“资料找回”

**摘要：** 用《天龙八部》EPUB 做知识库时，真正容易出错的不是 Prompt，而是文本切分、向量入库和 Milvus SDK 的响应字段。本文基于一个 Node.js + LangChain + Milvus/Zilliz 练习项目，拆解从 EPUB 到检索增强生成的最小链路，并给出一份排错清单。**运行未验证。**

当你问“鸠摩智会什么武功”时，大模型当然可能直接回答。但如果目标是做一个**基于指定小说内容**的问答系统，不能只依赖模型参数里的知识。

更可靠的流程是：先从书里找相关段落，再让模型基于段落回答。这是 RAG 的核心。对初学者来说，先把“找对资料”这件事跑通，比不断修改 Prompt 更重要。

## 这个项目如何把一本 EPUB 变成可问答知识库

项目分成三个脚本，职责很清晰：

| 脚本 | 职责 | 关键输出 |
|---|---|---|
| `main.mjs` | 加载 EPUB、切分、向量化、入库 | `ebook` 集合中的文本向量 |
| `query.mjs` | 将固定问题变成向量并检索 | 相似文本片段 |
| `rag.mjs` | 将检索片段交给聊天模型 | 基于上下文生成的回答 |

可以把全流程记成一条线：

```text
书籍内容 → 文本块 → 向量 → Milvus
问题 → 问题向量 → 相似文本块 → Prompt → 回答
```

这里有两个模型角色：

- **Embedding 模型**：把文本和问题都变成向量，用来检索；
- **Chat 模型**：读取“问题 + 检索到的文本”，负责生成自然语言回答。

一个负责定位，一个负责表达。

## 文本切分决定检索粒度

项目先按章节加载 EPUB，再以 500 字符为目标切块，并保留 50 字符重叠：

```js
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
})

const chunks = await textSplitter.splitText(chapterContent)
```

整章直接入库会让一个向量承载太多话题；切得过碎又会让每个片段缺少上下文。`500 / 50` 是当前练习项目的参数，不是通用标准答案，但它体现了两个思路：

1. 每个 chunk 应该足够聚焦，便于被命中；
2. 相邻 chunk 需要少量重叠，避免句意在边界处断裂。

### 这里最容易写错的一行

`splitText()` 返回的是字符串数组，而不是 Document 数组。也就是说，`chunk` 本身已经是文本：

```js
const insertData = chunks.map((chunk) => ({
  content: chunk,
}))
```

不要继续写：

```js
content: chunk.pageContent
```

否则 `content` 会变成 `undefined`。这类问题非常隐蔽：向量可能生成了，但原文没正确保存，后面检索到结果也无法拿到可用上下文。

## 向量库不只存 vector，也要存可读信息

项目中的 `ebook` 集合包含：

```text
id、book_id、book_name、chapter_num、index、content、vector
```

`vector` 用来计算相似度；`content` 用来拼 Prompt；`chapter_num` 用来知道片段来自哪里。

因此向量库可以理解为“文本 + 元数据 + 语义坐标”的组合，而不只是一个浮点数数组仓库。

项目为向量字段设置了 1024 维，并使用余弦相似度：

```js
{ name: 'vector', data_type: DataType.FloatVector, dim: 1024 }

metric_type: MetricType.COSINE
```

一个必须检查的约束是：**Embedding 返回的向量维度必须与 `dim` 一致。** 不一致时，写入或搜索无法正常完成。

## 为什么 `insert()` 后还要 `flush()`

所有 chunk 入库后，项目执行：

```js
await client.flush({
  collection_names: [COLLECTION_NAME],
})
```

它的职责不是插入，而是让批量写入的数据完成刷新并进入可稳定查询的状态。

放置位置也很关键：放在**所有章节全部插入之后**即可。不要每处理一个 chunk 就调用一次，这会让批处理变得低效。

## 查询成功的标准：先拿到原始片段

查询脚本将问题转成向量，然后搜索 top 3：

```js
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

它是最相关的若干条结果。这里不应凭印象猜 SDK 返回结构。项目调试过程就出现过两种典型错误：

- 使用 `searchResult.result`，导致 `undefined.forEach`；
- 使用 `item.fields`，但结果对象的字段实际直接挂在 `item` 上。

正确的调试方式永远是先观察：

```js
console.log(searchResult.results)
```

确认真实对象形状后，再读取 `item.chapter_num` 与 `item.content`。

## RAG 的最后一步：把检索结果变成上下文

RAG 脚本将结果格式化成多个片段：

```js
const context = retrievedContent.map((item, index) => {
  return `片段${index + 1}
章节${item.chapter_num}
内容${item.content}`
}).join('\n\n------\n\n')
```

然后将 `context` 与问题一起交给 `ChatOpenAI`。

这一步的工程意义是：模型的回答被约束在“检索到的材料”附近。检索为空时，应直接返回“未找到相关内容”，而不是让模型自由补全。

## 一份可以直接复用的排错清单

当 RAG 项目出现“没有数据”“查询为空”“结果 undefined”时，按下面顺序检查：

1. **模型是否支持**：Embedding 模型名是否被当前 OpenAI 兼容接口支持；
2. **维度是否一致**：模型输出维度与 Milvus `FloatVector.dim` 是否相同；
3. **文本是否真的保存**：`splitText()` 后使用的是 `chunk`，不是 `chunk.pageContent`；
4. **插入统计是否可信**：打印完整 `insertResult`，不要猜 `inserted_count` 这类字段；
5. **是否已刷新**：批量入库后执行一次 `flush()`；
6. **SDK 响应结构是什么**：搜索后先打印 `searchResult.results` 和单条 `item`；
7. **检索与生成是否拆开验证**：先确认能取到正确 `content`，再接入聊天模型。

## 一个可迁移的结论

RAG 不是“向量库 + 一个 Prompt”这么简单。它至少有三段独立链路：

```text
文档入库链路
检索链路
生成链路
```

任何一段错误，最终看起来都像“模型回答不对”。但只要每一段都打印输入和输出，就能快速定位问题是在文本切分、向量生成、Milvus 查询，还是 Prompt 组装。

下一步可以把固定问题改为命令行输入，并按 `book_id` 做 metadata 过滤。这样，这个练习项目就能从“能跑的脚本”变成一个更完整的最小 RAG Demo。

**建议标签：** RAG、LangChain、Milvus、Node.js、向量数据库
