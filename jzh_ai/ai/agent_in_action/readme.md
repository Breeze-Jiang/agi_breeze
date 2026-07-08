# Agent
最值钱的agent开发
如何打造自己的agent？

## 不是直接调用大模型接口
llm有那些问题
- 你上周和他说的话，它能记住吗
llm stateless 不可以
数据库 ，前端储存，redis

llm + 后端
Memory 模块
- 让llm 帮访问一个网页，做一些事情，llm只能告诉你思路 我们自己做tool use模块
- 访问内部私有文档， llm不知道
  RAG 模块
- 最新的世界杯新闻， 新的不在预训练数据中
  mcp（第三方tool，llm协议） tool
- 做ppt，分析股市并自动买卖
  skills 技能 蒸馏
Agent 就是围绕以上问题 给llm 加上Memory 记忆模块，tool工具调用能力，RAG ,MCP ,Skills 等
Agent = llm + Memory + tool + RAG + MCP + Skills

claude code， codex coding  agent
小龙虾

## agent 的工作流程
user 以prompt 的形式 提出一个任务（复杂） 交给agent 智能体
llm planning + reasoning（规划+推理 ） -> 要不要加载memory -> 要不要调用工具tool （分步骤调用多个工具）-> rag （查询出来的内容 放到 Prompt Template）

## agent 开发框架 Langchain 
node (nestjs) + langchain(单智能体开发框架) + langgraph(多智能体开发框架)

结合后端技术，开发AI 全栈agent产品，让ai技术通过Harness Engineering 落地 ，实现ai技术的商业价值（fde）

agent 其实也不复杂， llm本身也可以思考，规划，给tool扩展能力，能自己做事情了，用memory管理记忆，它就可以记住你要记住的东西，还可以用rag查询内部知识库来获取知识

这样一个知道内部知识，能思考，规划，能够帮你做事情的扩展后的大模型，就是一个agent
- nestjs
- langchain
- langgraph
- mcp/rag/skills


# langchain 
- LLM 
统一且兼容 chatOpenAI 
@langchain/openai
按需加载的llm 
-Tool
langchain 又来接管@langchain/core zod 验证工具
tool openai 接口 里有描述和格式的约束
- 2个部分 （异步）处理函数
  函数描述对象
  description 详细功能，覆盖场景，参数需求

  schema 参数约束 tool 与llm 要调用此工具，必须提供
- tool 的返回格式
  - llm 有自知之明，当要调用tool 的时候，不生成，停下来告诉用户tool_calls 要调用的工具列表
  id ， name， arguments 多个工具id关联等下tool 函数调用结果 需要历史会话列表 才能组成完整的任务上下文
  tool 异步的，llm 那个任务细节有哪个工具执行了，id 关联
  llm 基于自然语言 

## llm tool 性能
- llm任务复杂 可能调用多个tool，或者每个tool调用多次
- promise.all static 方法**并行之星** ，等待所有Promise完成，才返回结果
  - Promise es6 提供的异步语法 三种状态
    - pending 等待中
    - resolved() 成功 pending -> fulfilled
    - rejected() 已拒绝
    只能从pending -> fulfilled 或 rejected 不能再变了
    - await es8 最优雅的异步变同步语法
    - Promise.all([promise数组]) 并行执行多个任务，等待所有任务 都完成，才放回结果，结果顺序与promise顺序一致

即将打造高性能的第一个agent  