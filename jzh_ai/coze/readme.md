# Prompt 在NLP 中的应用

自然语言处理 NLP

## 情感推断与信息提取

## 图片生成
- text generation 到 image generation
  多模态
- openai sdk 换成了fetch 请求
 - 本质都是向llm 远程服务器发送http 请求
 - url 地址
 - 配置请求对象
  - method POST 请求 比 GET 更安全
  - headers 请求头指定apikey
    Authorization 权限 
  - 请求体 body
    messages
    多张图片和文字指令