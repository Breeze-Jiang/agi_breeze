# 流式输出 streamable

一次性返回，等待，等很久
  复杂的计算，推理生成，耗时太久，让人等的不耐烦
  如何优化，一个一个token 推理生成,实时的展示
  不用一次性给
  api，计算机网络底层去理解
  chatbot 客户端 不断地拼接token，流式输出就成了水流，llm服务器和chatbot客户端 两端 接根管子
  生成的token 就像流水一样不断流向客户端.

llm chatbot 像打字机一样流式输出，体验很好
前端工程师来说有点复杂，AI产品的第一个关键用户体验

## 耗时
主要是推理所花费的时间（transform）和问题复杂度（难度和长度）


## 约定
- 服务器端约定 接受 stream ：true token 生成后就输出
- 客户端 发送 stream:true 表示需要流式输出

## 使用流式（streamable）传输减少等待时间
用户体验的打造，前端的责任。必考内容 AI 产品的核心体验

- vite 前端项目中 集成 deepseek apikey
  vite 会帮我们读取 .env.local 文件
  vite 是脚手架（node），node 后端 

## vue 基础
- .vue 后缀
  文件，也叫组件文件（component）
  facebook 网页由一万多个组件组成
  组件就是组成网页的最小单位，乐高积木
  方便封装，复用，维护
## 封装 三部分
- template 模板 html是静态的，模板是动态的
  一段html，可以绑定数据，实现响应式更新
- script 脚本 js 逻辑
  引用 vue/react  {{}} .vue ref/reactive 
  setup vue3 新增的语法糖 支持宏函数
  把script 全局的数据直接可以被template 模板使用
- style 样式 


- 表单元素
  显示值
  用户又要修改值
  dom编程不要
  count {{count}}单向数据流绑定
  保证数据和界面状态的一致性
  数据驱动的概念 data driven
  表单元素是个例外，用户的输入需要传回给数据
  双向的数据流 v-model



const response = await fetch(
  url,        // ① 请求地址（发给谁）
  options     // ② 配置对象（怎么发、发什么）
)

// 输出：一个 Response 对象
// response 包含：
//   response.status      → 状态码（200=成功）
//   response.headers     → 响应头
//   response.body        → 响应体（流式数据）
//   response.json()      → 把响应体解析成 JSON
//   response.text()      → 把响应体解析成文本