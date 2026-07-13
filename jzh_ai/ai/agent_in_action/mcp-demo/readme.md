# MCP 

- 这里的 tool 有什么问题？
1.只能在我们这个项目里面使用，不能在其他项目里面使用
2.node写的 ，如果用java /python /rust 写的tool呢

tool 独立于 llm，本地/远程/ 跨进程，跨语言调用

## MCP 协议
Model Control Protocol
- 标准化llm 与tool 和资源 之间的通信协议
llm 和 tool 解耦
- 基于stdio 标准输入输出流 键盘输入，控制台输出，当一个进程（agent）调用一个子进程（node child_process）或其他语言进程时，可以通过 stdio 标准输入输出流来实现通信
- http 远程通信 依然是 MCP 来掌管 

不管是本地工具，还是远程工具，agent 想**跨进程**调用某个工具，通过 MCP 协议来实现

给model 扩展context 上下文 让它能做更多（tool），知道的更多的（resource） Protocol 协议

## MCP 的特点
MCP 最大的特点就是可以**跨进程**调用工具
跨本地的进程调用 就是stdio
跨远程的进程调用 就是http
ai agent 是MCP 客户端（host），可以通过MCP 协议来调用各种MCP server，client 配置添加，实现**跨进程**工具调用
他和fetch 不同 不是接口调用 不是直接拿接口数据，它是扩展context （tool&resource）

## MCP Tool


##　resource 资源
- MCP stdio/http 跨进程提供 Tool / Resource/ Prompt 等资源
  tool 最常见 和tool use 没啥区别，跨进程（抛诱饵）
  - IPC 
  父子进程 child_process 通信
  其他语言 ，远程client（child_process，MultiServerMCPClient）和 MCP server 通信
  - js单线程 异步无阻塞  主线程里面的异步
- resource 可以作为SystemMessage Prompt 的一部分 成为Context
 - server 里通过 registerResource 注册资源
  URI doc://
 - host 
    MutiServerMCPClient getResource
    Object.entries(resources)拼成字符串
    RAG之外 丰富上下文的手段 文档，没有那么长的（考虑到上下文窗口的长度限制）
    RAG 先检索