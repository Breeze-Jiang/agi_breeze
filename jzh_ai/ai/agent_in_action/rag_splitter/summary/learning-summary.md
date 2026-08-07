# RAG splitter 学习总结

## 1. 整体概览

本次材料围绕 **RAG 知识库的“网页加载与文本切分”前置环节** 展开。它没有实现完整问答系统，而是用两个 ES Module 文件说明：如何从一个公开网页中抽取正文、如何把抽取结果转换为 LangChain 的 `Document`，以及如何使用 `RecursiveCharacterTextSplitter` 生成可供后续向量化与检索使用的文本块（Chunk）。

**读取范围与覆盖率**：已读取 `readme.md`、`src/index.mjs`、`src/crawl.mjs`，即用户指定的 README 与 `src` 下全部两个源码文件。未执行项目、未请求目标网页，也未读取或审查 `node_modules`；因此网页可访问性、页面选择器当前是否有效、依赖版本和实际输出均为**未知/未验证**。

## 2. 知识地图

```text
网页 URL
  ├─ 手写路径：axios 请求 → HTML 字符串 → Cheerio DOM → CSS 选择器 → 纯文本
  └─ LangChain 路径：CheerioWebBaseLoader → Document[]
                                             ↓
                        RecursiveCharacterTextSplitter
                        ├─ chunkSize: 400
                        ├─ separators: 中文句末标点
                        └─ chunkOverlap: 100
                                             ↓
                                      splitDocuments（多个 Chunk）
                                             ↓
                           后续可接 Embedding / 向量库 / 检索（材料未实现）
```

## 3. 核心概念

- **Loader（加载器）**：把不同来源的数据转换为后续流程可处理的文档对象。README 将 Word、PDF、视频、URL、社交媒体等列为潜在知识源；本项目实际演示的是 URL 页面。
- **Document**：README 指出 LangChain 的文档标准由 `pageContent` 与 `pageMetadata` 构成。源码只直接使用 `documents`，其元数据的确切字段未在本地材料中打印验证。
- **CSS 选择器**：`".main-area p"` 是材料独有的正文定位实例，表示选择目标页面中 `.main-area` 容器内的段落。它决定进入知识库的是正文还是噪声。
- **Chunk**：为避免长文档直接进入后续流程而产生的较小文本单元。本项目以字符数量和句末标点控制切分。
- **Overlap（重叠）**：相邻 Chunk 共享的一段文本。材料的意图是减轻跨边界句子或上下文被切断的问题。

## 4. 代码、模块与数据流

### `src/crawl.mjs`：理解底层抓取链路

**材料事实**：文件使用 `axios` 获取目标 URL 的 HTML，用 `cheerio.load(html)` 构造可查询 DOM，随后用 `$(".main-area p").text()` 取出正文文本，并在异常时输出错误。

```js
const { data: html } = await axios.get(targetUrl)
const $ = cheerio.load(html)
const pageContent = $(".main-area p").text()
```

该文件适合学习“HTML 字符串 → DOM → CSS 选择器 → 文本”的转换。它只打印结果，没有把文本包装为 LangChain Document，也没有执行切分。

### `src/index.mjs`：接入 LangChain 的加载与切分

**材料事实**：文件创建 `CheerioWebBaseLoader`，同样以 `".main-area p"` 作为选择器；`load()` 得到 `documents` 后，将其传给 `splitDocuments()`。

```js
const cheerioLoader = new CheerioWebBaseLoader(targetUrl, {
  selector: ".main-area p"
})

const documents = await cheerioLoader.load()
const splitDocuments = await textSplitter.splitDocuments(documents)
```

切分器的材料配置为：

```js
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 400,
  separators: ["。", "？", "！"],
  chunkOverlap: 100,
})
```

- `chunkSize: 400`：每个块的目标上限是 400 个字符；这是项目配置，不是通用最佳值。
- `separators`：优先以中文句末标点寻找边界，体现“尽量避免把句子硬切断”的思路。
- `chunkOverlap: 100`：相邻块保留 100 个字符的上下文；其取舍是更完整的局部上下文与更多重复内容之间的平衡。

## 5. 实践要点

1. **先选对 Loader，再谈切分。** README 明确指出，不同文件后缀或来源需要不同 Loader；网页只是其中一类。
2. **正文选择器是质量控制点。** 选择器过宽会把导航、推荐、广告或评论带入语料；过窄可能漏正文。当前选择器只对该目标页面结构有意义，换站点需要重新检查。
3. **切分参数应由真实检索问题校准。** 400/100 是当前示例值，不应直接视为所有中文资料的标准答案。可用一组实际问题比较不同块长、重叠量和分隔符带来的召回差异。
4. **按内容结构切分。** 普通文章可优先按段落与句末标点；Markdown、代码和表格往往需要围绕标题、函数、类或表格边界设计更合适的策略。
5. **保留来源元数据。** 这是合理推断：后续若要展示引用来源、排查低质量召回或进行增量更新，需要让 Chunk 能回溯到 URL、标题或位置；本项目没有展示元数据增强实现。

## 6. 易混淆点、未知信息与下一步

### 易混淆点

- **Cheerio 与浏览器自动化不是一回事。** README 说明 Cheerio 更适用于 HTML 源码中已具备正文的静态或服务端渲染页面；对必须执行前端 JavaScript 才出现内容的页面，可能需要 Puppeteer、Playwright 或 Browser Loader。
- **抓取成功不等于 RAG 可用。** `crawl.mjs` 只完成文本抽取；`index.mjs` 只完成加载与切分。Embedding、向量数据库、检索、重排序和大模型生成均不在材料覆盖范围内。
- **Chunk 重叠不是“越大越好”。** 更大重叠可减少边界断裂，但会增加重复文本、索引规模和后续成本；当前材料没有提供任何实验数据或最佳参数结论。

### 未知/未验证

- `package.json`、Node.js 版本及依赖版本未作为本次材料读取对象，运行时要求未知。
- 未执行脚本，故不能声称脚本已跑通；代码状态为：**运行未验证**。
- 目标 URL 的可访问性、网页是否为当前静态 HTML、`.main-area p` 是否仍能命中正文均未验证。
- README 中提到的 PDF、Word、Bilibili、Twitter 等来源没有对应实现文件，属于概念性范围而非本项目已演示功能。

### 可执行的下一步

1. 将目标 URL 与 CSS 选择器提取为配置，并在抓取后检查文本长度与空文本情况。
2. 为 Document 补充来源 URL、标题、抓取时间、块序号等元数据。
3. 准备实际问答样本，对 `chunkSize`、`chunkOverlap` 和分隔符组合做静态与检索效果评估。
4. 在确认依赖与运行环境后，再接入 Embedding、向量库和 Retriever，形成闭环。

## 证据分类说明

- **材料事实**：本总结中关于文件职责、导入模块、目标 URL、选择器及 `400 / 100 / ["。","？","！"]` 参数的描述，均来自指定 README 和两个源码文件。
- **合理推断**：关于参数调优、元数据回溯、网页噪声和后续模块的建议，基于材料中的 RAG 链路作出，未表述为项目已实现效果。
- **外部事实**：本总结未依赖外部网页或文档。
- **未知信息**：已在上文单独标注。
