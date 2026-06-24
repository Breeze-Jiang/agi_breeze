# Tool Use
工具调用，背后真正的技术逻辑，不只是 api

- 豆包可以自动的搜索网页
  两个工具  日期获取工具，网络搜索工具
- claude 可以分析excel 表格
  读取文件， excel 分析工具 
- AI Agent 操作电脑 mac 

LLM + tools = Agent

用户以为是llm完成的，其实不是

那个再显卡里疯狂跑的LLM，本质上还是个词语接龙的游戏。它是被困在服务器里的缸中大脑。它看不见屏幕，摸不到键盘

一个只能去预测下一个词的概率模型，Next Token Prediction 怎么突破物理限制 它是怎么去调用API，怎么去读数据库，怎么去操作物理世界的工具的

## tool use
工具是函数，
- 认知植入
  工具降维为语言， llm 只能做自然语言编程 。
  在system prompt 里**配置工具**的时候，就在做一件非常精妙的事，就是**认知植入**，tool成为语言？
  大模型不懂什么是天气api，也不懂数据查询，但是它听得懂语言。
  JSON schema 去将复杂的软件接口函数，翻译成大模型能理解的使用**说明书**。
  JSON tools 格式，
  schema？ 约束 Schema 是对数据结构的正式定义和约束说明，描述数据应如何组织、验证其合法性，并确保不同系统间数据交换的一致性。
  users name string not null unique

  llm 概率随机, 工具描述得具体清晰  

  在这个阶段,一个复杂的软件工具(get_closing_price等),被降维成了一个存储的文本描述(JSON schema)
  用户提问 青岛啤酒的收盘价是多少?
  llm回答不了
- 意图识别
  llm 告知调用工具 content "",tool_calls 要调用的工具并执行中断执行. id function name ,arguments
  API转成语言的精确性(description,schema)
  用户问:上海的天气怎么样?
    llm推理引擎开始工作， 它会进行一系列的快速评估。
  首先,在原始训练语料中,问,不能回答
  接着绕回来,认知植入里有工具吗
  它真有, get_weather 工具
  AI 会停止和你的对话,转而开始自自言自语,它严格按照我们刚刚定义的那套说明书,去生成一段自然语言的调用代码
  tool_calls[
    {
      type: 'function',
      function: {
        name: 'get_weather',
        arguments: '{"city": "上海"}'
      }
    }
  ]

  llm不能执行， 开发者可以！
  它依赖的是强大的模式识别和逻辑推理能力。
  它赌这段代码发出后， 会有人响应。

- runtime 的介入
  传统软件runtime 调用工具,执行任务.node/python/java
  人/AI 都可以调用,只管一件事,执行,拿到结果
  不是直接返回给用户,而是返回给大模型,(用户交互接口),
  大模型再根据结果继续执行
  最开始用户问什么,llm怎么决策,runtime 给了什么,根据上下文生成最后的返回结果

