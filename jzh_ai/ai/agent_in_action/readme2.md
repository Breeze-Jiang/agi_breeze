# Tool, 让大模型自动干活

## demo

创建一个react + vite 的todolist
  
要用到那些tool？

编程任务 planning 分三步
- vite 创建项目
- llm 编程能力比较强的模型 就能做的 写入文件tool
- 项目运行起来 调用cli 命令的tool 

##　手写一个简单版本的clade code agent
llm + tool （fs + cli）

## langchain
llm开发框架 比openai（transformer,generative,） 还早诞生
- llm 有很多家 
  langchain 兼容各家大模型
  @langchain/openai

## Message
system message 设置ai是谁，可以干什么，有什么能力，以及一些回答，行为规范等
Human message 用户的问题
AI message ai 回答用户的问题
tool message 调用工具的返回结果
tool id

原生的openai返回工具调用 additional_kwargs -> tools -> 每个tool
langchain invoke 原样输出上面的，同时还会细心地准备tools 加到后面
llm 工程开发的便捷性，可读性 帮助

## AI 工程
- 工程目录
  根目录 package.json node_modules
- src 开发代码目录
  - promise 特性
  async 函数 就是promise 实例， return resolve 并且return 的结果就

## 总结第一个编程助手agent
- react agent 工作流框架
  分析agent 的执行流程 每一步的reason act observe
- langchain 
  tools 声明（asunc fn + schema（zod））执行函数 + 名称 + 描述 + 参数约束
  invoke 执行 （message ，tool，......）
  4中message 派生类
  modelwithtools llm工作流 coze 节点 之间连线
  langchain 工作流 chatopenai -> tools -> bindtools -> invoke 
  llm  工作流编排框架
- agent 工作流程
  - llm 能力边界
    stateless + 不能够直接干活
  - 不停的维护messages 数组
  - llm reason 分析出来不能直接生成，直接返回 带来tool message
  - tool 执行 toolmessage tool_id 加入
  - 最简单的loop 有工具调用 
    没有 拿着所有的message 去 最后一次调用llm ，完成任务，拿到结果
- promise 升级
  async 函数执行完之后 是promise 实例，return resolve值
  Promise.all   ，find，map
  if(tool)
  try catch
  