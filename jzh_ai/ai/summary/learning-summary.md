# 学习总结：从网页知识到 AI 输出的三段式链路

## 1. 整体概览

本次材料围绕一个共同主题：**把原始信息处理成 AI 可用、可读、可执行的结果**。

学习路径可以分为三段：

1. **RAG 数据预处理**：从网页提取正文，转成 `Document`，切成文本块，再进行向量检索与问答。
2. **LLM 流式输出**：浏览器从 `ReadableStream` 持续读取二进制数据，用 `TextDecoder` 解码、用 `buffer` 处理不完整消息，再逐字更新 Vue 页面。
3. **Skill 固化流程**：把“整理会议纪要”这类重复任务写进 `SKILL.md`，让 Agent 按固定边界、步骤和模板稳定完成工作。

已读取材料：RAG 脚本、Vue 流式组件、流式学习笔记、会议纪要 Skill 说明及其配置。未运行项目；所有代码结论均为静态分析。

## 2. 知识地图

```text
网页 / 用户问题 / 会议文字稿
        ↓
加载、读取或接收原始数据
        ↓
结构化处理
├─ RAG：Document → chunk → embedding → 检索结果
├─ 流式：Uint8Array → 文本 → SSE data 行 → JSON → delta 内容
└─ Skill：原始记录 → 事实边界 → 主题归纳 → 行动项
        ↓
面向用户的结果
├─ 基于上下文的问答
├─ 逐步出现的模型回复
└─ 结构化会议纪要
```

## 3. 核心概念

### 3.1 RAG：不是“把整篇文章交给模型”

**材料事实**：`rag_splitter/src/index.mjs` 使用 `CheerioWebBaseLoader` 指向网页，并通过 CSS 选择器限制抓取范围；随后用 `RecursiveCharacterTextSplitter` 配置 `chunkSize: 400`、`chunkOverlap: 100` 和中文句末分隔符。之后代码意图将切分结果写入 `MemoryVectorStore`，检索相关片段后拼接为 prompt。

RAG 的关键目标是：先在知识库中找出与问题最相关的片段，再让模型基于这些片段作答。切块能让检索粒度更细；重叠区能减少一句话被硬切断导致的上下文丢失。

### 3.2 流式输出：网络块不等于一条完整业务消息

**材料事实**：`stream_demo/src/App.vue` 调用 `fetch` 后，通过 `response.body.getReader()` 逐次读取；每次得到的 `value` 是二进制数据，`TextDecoder` 将其解码为文本。代码再按换行切分 `data: ` 开头的 SSE 行，将 JSON 中 `choices[0].delta.content` 追加到响应式变量 `content`。

`buffer` 的意义是保存上一次没有接收完整的一行 JSON。网络层可能把一条 SSE 消息拆成两次，也可能把多条消息放进一次读取结果。因此“读取一次”不能等同于“拿到一条完整 JSON”。

### 3.3 Skill：把重复工作变成可复用的执行规范

**材料事实**：会议纪要 Skill 的元数据声明了触发场景，例如“会议纪要”“整理会议记录”“会议行动项”。工作流要求先建立事实边界，再清理噪声、按主题归纳、提取行动项，最后严格按固定 Markdown 模板输出。

Skill 的本质不是一段普通提示词，而是为一个高频任务定义：**何时触发、输入边界、处理步骤、输出格式与自检标准**。这样能降低遗漏负责人、截止时间或“把提议写成结论”的风险。

## 4. 三条数据流

### 4.1 网页到 RAG 回答

```text
URL
  → CheerioWebBaseLoader
  → Document[]
  → RecursiveCharacterTextSplitter
  → splitDocuments
  → Embeddings
  → MemoryVectorStore
  → retriever.invoke(question)
  → 上下文 context
  → model.invoke(prompt)
```

### 4.2 模型到浏览器页面

```text
fetch 请求
  → HTTP 响应体 ReadableStream
  → reader.read()
  → Uint8Array
  → TextDecoder
  → SSE 的 data: 行
  → JSON.parse()
  → delta.content
  → content.value
  → Vue 响应式更新页面
```

### 4.3 会议文字到会议纪要

```text
文字稿 / 录音转写 / 聊天记录
  → 识别事实、决定、分歧、行动项
  → 去除口头禅和重复内容
  → 按议题组织
  → 提取负责人、时间、交付物
  → 固定模板会议纪要
```

## 5. 实践要点

1. **先确认数据是否存在，再排查后续流程。** RAG 脚本打印出空数组时，意味着加载器或 CSS 选择器没有得到文档；此时即使后续向量库代码正确，也不会有可检索内容。
2. **区分构造函数和静态工厂方法。** 静态分析发现，`MemoryVectorStore.fromDocuments` 被写成了 `new MemoryVectorStore.fromDocuments(...)`；从错误信息“is not a constructor”可推断该方法不能和 `new` 连用，调用方式需以当前依赖版本 API 为准。
3. **先检查 HTTP 状态码。** 流式页面曾收到 `402 Payment Required`。这说明请求已经到达第三方接口，但账户余额、套餐或可用额度存在问题；它不是 `ReadableStream` 或 JSON 解析的直接错误。
4. **不要把 API Key 放在前端。** `App.vue` 使用 `import.meta.env.VITE_DEEPSEEK_API_KEY` 构造 Authorization 请求头。Vite 中以 `VITE_` 开头的变量会暴露给浏览器端代码，因此这是安全风险。应改由后端持有密钥，前端只请求自己的服务端接口。
5. **流式解析要保留残片。** 当前代码仅在 `JSON.parse` 失败时回填 buffer，适合学习演示；更稳健的做法是先按行拆分，并把最后一个未以换行结束的片段留给下一轮读取。

## 6. 易混淆点、未知与下一步

### 易混淆点

- **HTTP 底层传输的是字节流**；文本只是字节按 UTF-8 等规则解码后的结果。
- `JSON.parse()` 是 JSON 字符串转 JavaScript 对象；`JSON.stringify()` 则相反。
- `new Loader()` 创建的是加载器实例，不等于已经抓取了网页；真正的数据来自 `await loader.load()`。
- 网络 chunk、SSE 行和 JSON 对象是三个不同层次的边界，不能混为一谈。

### 未知信息

- 未验证目标网页当前 HTML 是否存在 `.main-area p`，因此无法断言文档为空的唯一原因。
- 未运行 RAG 代码，向量模型、接口配置和当前 LangChain 版本下的完整调用结果均未验证。
- 未运行流式项目，不能确认除 402 外是否还存在 CORS、模型名或 SSE 格式兼容问题。

### 下一步

1. 在 RAG 脚本中先输出 `documents.length` 和少量 `pageContent`，确认抓取与选择器是否有效。
2. 将 `fromDocuments` 的调用方式按已安装 LangChain 版本的官方 API 修正，并在确认有 chunk 后再创建向量库。
3. 把 DeepSeek 调用移动到后端；前端仅消费自己的流式接口。
4. 为流式解析补充“未结束行缓存”的逻辑，并覆盖“一次多行、半行、`[DONE]`”三种输入。
5. 为高频任务持续补充 Skill 的输入样例和评估用例，但不要让 Skill 补全原始材料中不存在的事实。
