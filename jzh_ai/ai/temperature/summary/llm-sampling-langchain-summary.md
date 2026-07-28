# 大模型随机性与 LangChain 工作流：学习总结

> 材料范围：`readme.md`、`t-demo/main.mjs`、`t-demo/package.json`。代码运行结果未验证；文章不包含环境变量中的密钥。

## 1. 大模型“随机说话”的本质

大模型会为下一个 Token 计算概率分布，再按照采样策略选出一个 Token。随机性参数不是让模型“变聪明”，而是在稳定性、准确性与表达多样性之间调节。

## 2. temperature

`temperature` 用于缩放概率分布：

- 值低：更偏向选择高概率 Token，输出更稳定；
- 值高：候选 Token 的概率差距被拉平，输出更多样、更发散。

示例中的两种模型配置：

- 创意写作：`temperature: 0.8`；
- 严谨写作：`temperature: 0.2`。

一般可将低温度用于代码、合同、事实问答等需要稳定结果的任务；将较高温度用于文案、故事、头脑风暴等创作任务。具体可用范围取决于模型与服务商实现。

## 3. top_k

`top_k` 表示每次采样前只保留概率最高的 K 个候选 Token，再从中采样：

- K 小：候选范围窄，更保守；
- K 大：候选范围宽，更多样。

它通常与 `temperature` 一起影响输出风格，但实际是否支持、如何生效要以具体模型服务的 API 文档为准。不要一次大幅调整多个采样参数，应在固定 Prompt 和评测样本下逐步观察效果。

## 4. LangChain 的职责

项目使用：

- `@langchain/openai` 的 `ChatOpenAI`：创建兼容 OpenAI 风格接口的聊天模型实例；
- `PromptTemplate`：将变量填充到可复用提示词；
- `StringOutputParser`：将模型返回内容解析为普通字符串；
- `pipe()`：把每一步编排为可调用工作流。

正确的数据流是：

```text
{ theme }
  → PromptTemplate
  → ChatOpenAI
  → StringOutputParser
  → string
```

因此链条写成：

```js
storyPrompt.pipe(creativeModel).pipe(parser)
```

不能让模型先接收普通对象，否则输入类型不匹配。

## 5. 用同一 Prompt 对比两种采样配置

代码为同一篇短文 Prompt 配置两个模型：

- `creativeModel`：`temperature: 0.8`、`topK: 4`；
- `preciseModel`：`temperature: 0.2`、`topK: 8`。

随后用相同主题调用两条链。这是一种有效实验思路：固定 Prompt 与输入，只改变模型参数，观察输出在发散性、重复率、事实性和可读性上的差异。

注意，当前 `package.json` 只声明了 LangChain 与 dotenv；模型服务的可用性、模型名称、`topK` 是否被服务端接受、实际输出效果均未运行验证。

## 面试速记

> 大模型生成通过对下一个 Token 的概率分布进行采样完成。temperature 控制分布的平滑程度，影响随机性；top_k 限制参与采样的高概率候选数。LangChain 将 Prompt、模型与输出解析器抽象为可组合 Runnable，通过 pipe 构建从输入变量到最终结果的工作流。
