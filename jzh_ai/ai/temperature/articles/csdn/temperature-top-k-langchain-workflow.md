# 用 temperature 和 top_k 控制大模型输出：一个 LangChain 双链路实验

同一个 Prompt，为什么大模型有时写得很保守，有时又充满想象力？核心原因之一是：模型不是每次都机械选择概率最高的下一个 Token，而是会根据采样参数从候选 Token 中选择。

本文基于一个 LangChain Demo，搭建“创意写作”和“严谨写作”两条调用链，对比 `temperature`、`top_k` 和 Prompt 工作流的作用。

> 文中代码基于本地项目梳理，**运行未验证**；具体参数支持情况以模型服务商 API 文档为准。

## 1. 大模型生成：从概率分布中采样

大模型每生成一个 Token，都会预测候选 Token 的概率。

```text
候选 Token → 概率分布 → 采样策略 → 下一个 Token
```

如果永远选概率最高的 Token，结果通常稳定，但可能重复、缺少变化。采样参数的作用是在“稳定”和“多样”之间找平衡。

## 2. temperature：控制发散程度

示例中创建了两个 `ChatOpenAI` 实例：

```js
const creativeModel = new ChatOpenAI({
  model: 'deepseek-v4-flash',
  temperature: 0.8,
  topK: 4,
  maxTokens: 600,
})

const preciseModel = new ChatOpenAI({
  model: 'deepseek-v4-flash',
  temperature: 0.2,
  topK: 8,
  maxTokens: 600,
})
```

可以先这样理解：

- `temperature` 较低：更偏向高概率词，输出更稳定；
- `temperature` 较高：概率差距被拉平，更多候选词有机会被选中，表达更有变化。

常见经验：

| 场景 | 建议 temperature |
|---|---:|
| 代码、事实问答、合同类文本 | 0 ～ 0.3 |
| 普通对话、改写、总结 | 0.4 ～ 0.7 |
| 文案、故事、头脑风暴 | 0.7 ～ 1.0 |

这不是固定标准。模型不同、Prompt 不同，最佳值也不同，必须通过样本评测确定。

## 3. top_k：先缩小候选集合

`top_k` 的思路是：每一步只保留概率最高的 K 个候选 Token，再从中选择。

```text
所有候选 Token
  → 只保留概率最高的 K 个
  → 按采样策略选择
```

K 较小时，候选范围窄，通常更保守；K 较大时，候选更多，表达可能更多样。

要注意：不同模型服务对 `top_k` 的支持并不完全一致。有的服务只支持 `temperature` 或 `top_p`；调用前应阅读 API 文档，并确认请求参数是否真正传递到服务端。

## 4. 不要同时“拉满”多个随机性参数

调参常见误区是同时将 `temperature`、`top_k`、`top_p` 调得很激进。这样即使输出变得新颖，也容易降低稳定性。

更可靠的实验方式：

1. 固定模型版本、Prompt 和测试输入；
2. 先只调一个参数；
3. 记录输出的可读性、重复率、事实性和任务完成度；
4. 选出合适区间后再调下一个参数。

Demo 中用同一主题“秋日山野晚风”分别跑两条链，就是“固定输入，对比配置”的基本实验框架。

## 5. LangChain 如何组织这条调用链

Demo 用到了三个核心对象：

```js
import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
```

- `PromptTemplate`：保存带 `{theme}` 变量的提示词；
- `ChatOpenAI`：调用聊天模型；
- `StringOutputParser`：把结果整理为字符串。

Prompt 模板：

```js
const storyPrompt = PromptTemplate.fromTemplate(`
请你写一篇短篇散文，主题：{theme}
风格治愈温柔，篇幅 200 字左右，文字细腻又有画面感
`)
```

通过 `pipe()` 按数据流顺序连接：

```js
const parser = new StringOutputParser()

const creativeChain = storyPrompt
  .pipe(creativeModel)
  .pipe(parser)
```

完整数据流：

```text
invoke({ theme })
  → PromptTemplate 替换变量
  → ChatOpenAI 请求模型
  → StringOutputParser 提取文本
```

顺序不能写反。模型需要接收格式化后的 Prompt，而不是直接接收 `{ theme }` 这个普通对象。

## 6. 两条链的价值

```js
const creativeChain = storyPrompt.pipe(creativeModel).pipe(parser)
const preciseChain = storyPrompt.pipe(preciseModel).pipe(parser)
```

同一个 Prompt 复用，不同任务只替换模型配置。这种拆法有两个好处：

- Prompt 和模型参数解耦，便于维护；
- 可针对不同业务选择不同“输出风格”。

例如，营销文案可走创意链路；提取结构化信息、生成代码说明时可走更稳定的链路。

## 总结

`temperature` 控制概率分布的发散程度，`top_k` 限制采样候选集合。它们的目标不是单独追求随机或保守，而是让输出匹配具体业务。

LangChain 通过 `PromptTemplate → ChatOpenAI → OutputParser` 将 AI 调用拆成清晰的工作流。先固定测试集，再逐项调参，才能让“大模型随机性”变得可观测、可控制。

**标签：** 大模型、LangChain、Prompt Engineering、temperature、top_k、Node.js、AI 应用开发
