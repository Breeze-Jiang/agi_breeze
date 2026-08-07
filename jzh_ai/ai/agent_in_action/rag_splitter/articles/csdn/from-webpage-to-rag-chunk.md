# 从网页正文到 RAG Chunk：用 Cheerio 与 LangChain 拆解文档预处理

> **摘要**：RAG 项目的检索质量，往往在向量化之前就已经被“抓什么、怎么切”决定了。本文基于一个 Node.js 学习示例，拆解网页正文提取、LangChain `Document` 加载和递归文本切分三步；重点解释 `chunkSize: 400`、中文句末分隔符和 `chunkOverlap: 100` 的含义与边界。**文中代码运行未验证。**

[TOC]

## 先说结论：RAG 的第一道质量门是预处理

面对网页、PDF、Word 或视频字幕等知识来源，RAG 并不是把原始内容直接交给模型。更常见的前置链路是：先把内容加载为统一文档，再拆成可检索的 Chunk，最后才进入 Embedding、向量数据库和检索流程。

本文只分析一个学习项目中已经展示的“网页加载 + 切分”部分，不讨论向量库、Embedding、重排序或最终问答。对希望理解 LangChain 文档预处理、且正在处理中文网页文章的开发者，这三步足以建立关键心智模型：**正文选择器决定语料质量，切分策略决定检索粒度。**

## 项目实际演示了什么

材料包含两个源码文件：

- `src/crawl.mjs`：使用 `axios + cheerio` 手动完成网页 HTML 获取、DOM 解析与正文抽取。
- `src/index.mjs`：使用 `CheerioWebBaseLoader` 获取 LangChain 文档，并用 `RecursiveCharacterTextSplitter` 生成多个 Chunk。

两条路径的关系可以概括为：

```mermaid
flowchart LR
  A[网页 URL] --> B[获取 HTML]
  B --> C[Cheerio / CSS 选择器]
  C --> D[正文文本]
  D --> E[LangChain Document]
  E --> F[RecursiveCharacterTextSplitter]
  F --> G[多个 Chunk]
  G -. 后续未实现 .-> H[Embedding / 向量检索]
```

这里的虚线很重要：材料只到 `splitDocuments` 为止。后续能力不应被误写成项目已实现功能。

## 第一步：把网页 HTML 变成正文文本

`crawl.mjs` 采用的是最直观的手写方式：先请求 URL，得到 HTML 字符串；再把 HTML 载入 Cheerio；最后用 CSS 选择器取正文。

```js
const { data: html } = await axios.get(targetUrl)
const $ = cheerio.load(html)
const pageContent = $(".main-area p").text()
```

这三行对应了三个不同层次的工作：

1. `axios.get()` 负责网络请求；
2. `cheerio.load()` 把 HTML 字符串转换成可查询的 DOM；
3. `$(".main-area p").text()` 从 DOM 中抽出目标容器下的段落文本。

`".main-area p"` 是该材料中最值得保留的独有细节。它不是通用网页规则，而是针对当前目标页结构的选择器。换一个站点、换一次页面改版，选择器都可能需要重新检查。

### 为什么不能直接把整个 HTML 丢进知识库？

页面源代码通常混有导航、推荐内容、按钮、页脚、评论或脚本。即便向量化服务能处理这些文本，它们也会成为检索噪声。用户问文章正文时，系统可能召回菜单项或相关推荐。

所以，RAG 的网页加载不是“抓到 HTML 就结束”，而是要先明确：**哪些内容值得成为知识，哪些只是页面外壳。**

## 第二步：用 Loader 统一为 Document

`index.mjs` 把手写抓取的多个环节封装进 LangChain Loader：

```js
const cheerioLoader = new CheerioWebBaseLoader(targetUrl, {
  selector: ".main-area p"
})

const documents = await cheerioLoader.load()
```

README 将 LangChain 文档概念描述为正文与元数据的组合，可理解为：

```text
Document = pageContent + metadata
```

在这个示例中，`load()` 的结果被直接交给切分器。源码没有打印元数据字段，因此不能依据本地材料断言具体字段内容；但统一文档对象的价值很清楚：无论知识来自 URL、PDF、Word 还是其他来源，后续切分流程都可以面对相同的数据接口。

### 手写 Cheerio 与 CheerioWebBaseLoader 怎么选？

| 需求 | 更合适的起点 |
| --- | --- |
| 想理解 HTML、DOM、CSS 选择器的基本链路 | `axios + cheerio` |
| 想接入 LangChain 的文档处理流程 | `CheerioWebBaseLoader` |
| 需要极其定制的清洗、分页或异常处理 | 手写流程后再封装 |
| 页面必须依赖前端 JavaScript 渲染 | 本示例方案未必适用，需要评估浏览器自动化或数据接口 |

材料中也提示了 Cheerio 的边界：它适合 HTML 源码中已经包含正文的页面；如果关键内容只有浏览器执行 JavaScript 后才出现，可能需要 Puppeteer、Playwright 或 Browser Loader 一类工具。

## 第三步：把长文档切成能被检索的 Chunk

示例使用的是 `RecursiveCharacterTextSplitter`：

```js
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 400,
  separators: ["。", "？", "！"],
  chunkOverlap: 100,
})

const splitDocuments = await textSplitter.splitDocuments(documents)
```

这段配置的重点不是背参数，而是理解三个约束之间如何平衡。

### `chunkSize: 400`：限定块的目标长度

材料配置每个 Chunk 的目标大小为 400 个字符。块太大时，一个 Chunk 容易混入多个话题，召回结果不够聚焦；块太小时，解释上下文又可能不完整，Chunk 数量也会显著增加。

因此，400 只是当前示例的选择，而不是中文 RAG 的固定答案。实际项目应当以真实问题和检索结果验证：读者问某个概念时，召回的文本是否既相关又足够完整？

### `separators`：先按自然句子边界切

```js
separators: ["。", "？", "！"]
```

这组中文句末标点表达的意图是：先在句子边界附近切分，尽量避免从一句话中间硬截断。

对普通中文文章，这比纯粹按固定字符位置截断更容易保持语义完整。但它也有边界：Markdown 标题、代码函数、表格或问答对，未必应该只依赖这三个标点。切分策略应该跟随内容结构，而不是只跟随字符长度。

### `chunkOverlap: 100`：给相邻块留下共同上下文

相邻块保留 100 个字符重叠，可以降低关键说明刚好落在分界线两侧时的信息断裂。例如，一个概念的定义在前一块、原因在后一块，适量重叠能让两个块都不至于完全失去上下文。

但重叠会制造重复文本。重叠越大，后续需要向量化与存储的内容越多，检索结果也可能出现相似块堆叠。因此它同样需要通过数据与问题集调优，不能简单理解为越大越稳妥。

## `splitDocuments` 之后还缺什么

当前示例最终输出：

```js
console.log(splitDocuments)
```

这说明项目的教学重点止步于文档切分。一个完整 RAG 系统通常还要继续完成：

```text
Chunk
  → Embedding 向量化
  → 写入向量数据库
  → 用户问题向量化
  → 相似度检索
  → 可选重排序
  → 把召回片段连同问题交给大模型
```

这些步骤在本地材料中没有实现，因而本文也不把它们包装成项目的现成功能。

## 实践时优先检查的四件事

1. **检查正文选择器。** 抓取后先确认文本是否为空、是否混入导航和评论、是否缺失正文。
2. **保存可回溯元数据。** URL、标题、抓取时间、Chunk 序号等信息，有助于后续展示来源、调试检索和更新索引。该项是基于后续工程需要的建议，不是当前代码已实现内容。
3. **按文档结构设计切分。** 文章适合考虑段落和句末；代码应更多考虑文件、类、函数；Markdown 应优先考虑标题层级。
4. **用真实问题验证参数。** 不要只看 Chunk 长度是否整齐。应准备问题集，对比不同 `chunkSize`、`chunkOverlap` 和分隔符配置下的召回内容。

## 小结：先让知识变得“可检索”

这个小项目展示的核心不是复杂的 RAG 编排，而是一个更基础的判断：在进入模型之前，外部知识必须先被正确抽取并切成合适的语义单元。

从 `axios + cheerio` 的手写路径，可以理解网页正文如何从 HTML 中被定位；从 `CheerioWebBaseLoader + RecursiveCharacterTextSplitter` 的路径，可以看到如何把这件事接入 LangChain 的文档处理链路。真正需要持续迭代的，是选择器质量、Chunk 边界和参数取舍，而不是盲目追求某一组“标准数字”。

---

标签：RAG，LangChain，Node.js，Cheerio，文本切分

**材料与验证说明**：本文仅基于 `readme.md`、`src/crawl.mjs` 与 `src/index.mjs` 的静态阅读撰写。示例代码**运行未验证**；目标网页可访问性、页面选择器当前有效性、依赖和运行时版本均未验证。证据映射见 `../../summary/evidence.json`（本地交付文件）。
