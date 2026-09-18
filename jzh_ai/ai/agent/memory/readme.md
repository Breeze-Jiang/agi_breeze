# Memory 管理

Agent = LLM + Harness(tool + RAG + Memory...)
给模型扩展Tool，不只是回答问题，干活
RAG ，基于query 获取向量数据库相关知识放入prompt
都依赖与Memory

大模型是无状态的，基于上次的问答继续问，回答。
之前已经通过chatMessage 数组？  做了简单的Memory 管理

- 持久化
- 上下文窗口大小 200k？ 开销
- /compact 总结，最近的问答，压缩到 200k 内存
- /clear 清除所有问答


Agent 执行流程 RaAct ，message 数组 -> Memory

上下文大小，开销，持久化
Memory 三种思路 截断，总结，检索

临时记忆
长期记忆

## 临时记忆
用InMemoryHistory 管理message ，放到内存中
用addMessage 方法添加HumanMessage ， AIMessage， SystemMessage ，ToolMessage 等类型
调用大模型， 返回 AIMessage 直接添加到history
getMessages 方法获取所有message 每个message对象
message 数组，每个message对象有type，content，extra 等属性

## 长期记忆
- 文件
- 向量数据库

## memory 逻辑
- 存储逻辑
  内存 文件 数据库
- 管理逻辑
  截断，总结，检索
- trimMessages 
  帮我们实现了基于token 的截断
- getBufferString 将history 转换为字符串






开发一个聊天应用，
没聊20条就触发一次总结，生成摘要，存入milvus 向量数据库
从milvus 取出对话历史，接着回答，Agent 更懂我们，Harness 的核心模块