# 吴恩达ai应用中的prompt

## prompt principles
- 使用清晰详细的prompt
- llm的响应约束返回的格式 json

- 五个构建块

## get_response 函数
- 参数的默认值是函数的代码优化的重要语法特性
- 好复用，灵活，简便
- llm api
  - completions 完成接口
    prompt
  - chat.completions 聊天完成接口
    messages:[
      {"role":"system","content":"system prompt"},
      {"role":"user","content":"prompt"},
      {"role":"assistant","content":"response"}
    ]


## 吴恩达 prompt 规则
- 清晰 具体的表达
  清晰 让大模型理解我们的目的，不偏离主题或少犯错误
  具体 提供上下文
  - 总结的案例里使用清晰的格式区间告诉llm我们待处理的文本在哪里
  {text} {}是字符串模板中的占位符 只能在“”“ 三个引号之间使用 不能在单引号或双引号之间使用
  - 例如：{text} 是一个占位符，用于替换用户输入的文本

使用特殊的字符串```来清晰地指出要处理的文本
总结，summarize nlp 机器学习的常见任务

- 对相应的结果格式做约束，一般为JSON，继续丰富JSON的key，还加点注释(自然语义的加持)

 - 分布式提示

 - Few-shot是提示工程技巧，在给大模型的提示中提供少量示例（通常2-5个），
   引导模型理解任务格式和期望输出，无需微调即可提升特定任务的表现。

 - llm 有幻觉