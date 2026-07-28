---
title: 同一个 Prompt，为什么 AI 写作风格不同？用 LangChain 试试 temperature 和 top_k
---

我写了一个很小的 LangChain Demo：同一个散文主题，同时交给两条链路生成。

一条偏创意：

```js
temperature: 0.8
topK: 4
```

一条偏稳定：

```js
temperature: 0.2
topK: 8
```

目的不是证明哪个参数组合“最好”，而是理解：**大模型输出为什么会有风格差异，以及如何让这种差异可控。**

> 基于当前项目代码整理，**运行未验证**。模型服务是否支持 `topK` 及其具体效果，要以服务商文档为准。

## temperature：让模型更保守还是更发散

大模型生成时会预测下一个 Token 的概率。`temperature` 会影响这个概率分布的采样倾向。

- 低 temperature：更倾向高概率 Token，结果更稳定；
- 高 temperature：更多候选 Token 有机会被选到，表达更有变化。

我会先这样选：

```text
代码 / 事实问答：0 ～ 0.3
常规对话 / 总结：0.4 ～ 0.7
文案 / 故事 / 脑暴：0.7 ～ 1.0
```

但这只是起点，不同模型、不同 Prompt 的效果会不同。

## top_k：先圈定候选 Token

`top_k` 的思路更直接：每次生成前，只让概率最高的 K 个候选 Token 参与采样。

```text
完整候选集合 → 前 K 个高概率候选 → 选择下一个 Token
```

K 小，范围更窄；K 大，选择更多。它也会影响输出多样性。

实际调参时，我不会同时把所有随机性参数都大幅修改，而是固定 Prompt 和主题，一次只调一个参数，再比较结果。

## 用 PromptTemplate 复用提示词

Demo 中提示词只写一份：

```js
const storyPrompt = PromptTemplate.fromTemplate(`
请你写一篇短篇散文，主题：{theme}
风格治愈温柔，篇幅 200 字左右，文字细腻又有画面感
`)
```

调用时再传入主题：

```js
chain.invoke({ theme: '秋日山野晚风' })
```

这样比把 Prompt 硬编码在每次调用里更容易维护。

## LangChain 链路的正确顺序

这部分是我实践时容易写错的地方。链路应该是：

```text
输入变量 → PromptTemplate → ChatOpenAI → StringOutputParser
```

代码如下：

```js
const parser = new StringOutputParser()

const creativeChain = storyPrompt
  .pipe(creativeModel)
  .pipe(parser)
```

先让 `PromptTemplate` 用 `{theme}` 生成完整 Prompt，再交给模型。最后用 `StringOutputParser` 拿到普通文本。

如果把 `ChatOpenAI` 放到最前面，模型先收到的是普通对象 `{ theme }`，就会发生输入类型不匹配。

## 两条链路能用在哪

```js
const creativeChain = storyPrompt.pipe(creativeModel).pipe(parser)
const preciseChain = storyPrompt.pipe(preciseModel).pipe(parser)
```

这个结构可以扩展到实际业务：

- 创意链路：营销文案、故事、标题候选；
- 稳定链路：信息提取、代码说明、结构化回答。

关键不是盲调参数，而是先确定业务更需要“多样性”还是“稳定性”，再设计固定样本做对比。

一句话总结：`temperature` 影响随机程度，`top_k` 缩小候选范围；LangChain 用 `pipe` 把 Prompt、模型和解析器串成可复用的 AI 工作流。

话题：#LangChain #大模型 #AI应用开发 #Prompt #Nodejs
