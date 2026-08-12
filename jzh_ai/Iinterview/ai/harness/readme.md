# Harness 工程
用工程化手段，进一步解决llm 幻觉和落地
harness 是一种将llm 生成（让大模型当评委）， 自动评测， 择优筛选，串联成闭环的流水线编排框架。像被马具（harness）驾驭的马一样，结构化流程中自动产出更高质量的结果。
ReAct Agent思维框架

这是一个LLM as Judge + Best of N Sampling 组合的harness 模式

核心思想：
1.Best of N Sampling 并行生成多个候选代码，通过随机性覆盖多个可能性
2.llm as judge 用llm 充当自动化评分器， 替代人工测评， 实现闭环自动化
3.harness 抽象 将生成，评测，择优三阶段 解耦为流水线

