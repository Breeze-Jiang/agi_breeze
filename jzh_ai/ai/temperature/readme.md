# 大模型是怎么随机说话的
控制大模型随机性的关键参数
temperature 温度 随机性 0-1 文艺创作 | 代码创作
top-k 随机样本 得分预测

- 幻觉问题
- 开发者有效，靠谱的去使用，控制AI 应用的随机性

- 把temperature 拉高 随机性增加 生成会不太靠谱
- 有些创作类的 随机性 去增加创意，但想保证质量
- 先用top-k 把高概率的词选出来  保证质量
  3 | 2 默认值8
  AI 应用效果观测
- 再用temperature 控制随机性 增加创意
- 0.2 代码 ，法律 公司合同 
  0.8 创意创作 多模态模型 AI 漫剧
    top-k
- temperature 和 top-k 不能都太大或太小
  temperature 小 top-k 大 准确，艺术性高
  temperature 大 top-k 小 ，靠谱的创意

## langchain
lang + chain （llm 工作链 | 编排流）

### 核心模块 @langchain/core
- message 对话列表
- output_parsers 输出解析器
  帮我们自动的解析出相应的格式
- tools 
- prompts 提示词模板

为什么需要langchain
开发更快，业务类 
AI Agent 应用 生成式，概率分布 有点黑盒
要不是觉得干得活太智能，要不是太智能了，不知道它是怎么干出来的
chain 就是把AI 工作链条上的每个节点

## AI 工作流
- llm 两个创意和严谨的， 适合不同业务
- promptTemplate 提示词模板
- stringOutputParser 字符串输出解析器
  llm -> PromptTemplate -> llm
