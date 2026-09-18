# 结构化大模型输出：

## 流式输出
- stream : true 开启流式输出
- 水管， 一头接着llm server ，一头 客户端 ， 不断地又token 流向客户端
  buffer

## stream  服务器端的本质
- llm server
- http协议
  基于请求响应的简单协议
- 响应？ response
  - 同步
  - 流式？ pipe


## SSE 
Server-Sent Events ()
服务器单向不停的往浏览器推送消息，发送多次，不会断开连接
浏览器简历一条长连接，服务器一点一点（chunk发数据），也就是流式输出
```(流式传输)
Content-Type: text/event-stream (响应头)
Cache-Control: no-cache  (不缓存)
Connection: keep-alive  (保持连接)
```
相比于传统的http同步传输，请求，响应，断开连接？
```(同步传输)
Content-Type: text/plain
Content-Type: text/html
```

## EventSource 类
`EventSource` 是浏览器原生的 SSE 客户端——new 时自动发长连接 GET 请求，自动按`data:\n\n` 协议解析，自动断线重连；它是“协议的消费端封装”，和后端`res.write` 一唱一和，两端合起来才构成完整的 SSE。

sse 不止有llm返回，股票...
stream fs里pip一下
当服务器端有新的数据chunk达到后，触发 onmessage 事件

## output_parser
json  ->  继续执行
prompt 
大模型按照格式要求，返回一个json
key: value,...
JSON.parse()

## 有时候会错误
原因是 json格式 固定了kv ， 被md格式包裹 ， llm 输出一般是md格式
这是展示的需要
- 移除```json```包裹
- 正则 replace 方法

prompt output 技巧 -> llm 返回 md 格式 -> 正则业务取出md格式 -> JSON.parse()
每次ai 调用的常见业务， langchain提供相应的业务api，省去开发的复杂度

## JsonOutputParser
langchain 用来解析json 结果
约束返回格式json ， JSON.parse()
parser.parse(response.content) 可以直接解析大模型的返回结果

本质 就是 通过 getFormatInstruction() 在 prompt 里添加 对output 的结构化格式格式约定
parser.parse() 去除md ，拿到json 

## StructuredOutputParser
- fromNamesAndDescriptions()
- fromZodSchema()

下流业务用上靠谱的JSON 输出