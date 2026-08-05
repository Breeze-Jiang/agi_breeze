# Benchmark

benchmark 是用标准题目给大模型打分的体系

每次一个新的模型发布，宣传页都有一堆数字

- MMLU 
- GPQA
- HUMAN-EVAL

benchmark 是llm在一系列测试中的得分集合（多维，可测）


## 基准测试
给一堆测试标准题目，让ai模型去打分，模型的高考，考完之后会出一个分数
- 为什么需要benchmark
大模型太多，gpt，claude，gemini ，deepseek，qwen ， 需要一个客观标准，benchmark 就是这个标准
llm 的能力是多维的
- MMLU 综合知识
  Massive Multitask Language Understanding
  57 个学科 领域选择题 从初中历史到大学医学，考的是模型的知识广度
  相当于文理综合卷。
- GPQA Diamond
  顶级推理能力 
  Graduate-Level Google-Proof Q & A
  专门去出研究生级别的物理，化学，生物难题
  为什么叫google proof，因为这些题目就算上网页难找到答案
  考的是模型是不是真正能去推理，而不是去背答案

- Human-eval 代码能力 SWE-bench
  两套试卷 164到编程题目，让大模型写出能够跑通的代码
  SWE-bench 让大模型直接去修真实的github项目 的bug

- MATH/AIME 数学推理
竞赛级的数学题

AIME 美国数学邀请赛的原题

- C-Eval 中文能力
专门针对中文语境， 覆盖52个学科，4种难度
训练语料

厂商怎么去用benchmark

厂商会挑自家模型擅长的说

模型在xx上说第一，不代表整体最强，
可能只是在某一项考试里拿了最高分

## benchmark 作用
是个门槛， 不是排名
一个模型连benchmark 都差，大概率能力也差
但分数高，也不一定好用
要看多个维度，不是看单一分数


要看具体业务，以及使用的实际效果

## 总结
Benchmark 是用标准题给大模型打分的体系，不同测试靠不同的题目
知识，推理，代码，数学，中文等能力，厂商会选择展示对自家有利的数据，
所以要结合自身需求和体验判断