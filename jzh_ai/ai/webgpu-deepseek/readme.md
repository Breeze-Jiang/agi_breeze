# webgpu-deepseek
## huggingface
AI 圈最火的开源模型社区，各个厂商都会把ai模型放到这里，用户可以免费使用。
国内的是modelscope

transform.js 
web访问 id 远程下载， 访问， 并执行nlp任务

deepseek deepseek-r1-distill-qwen 1.5  B 文件上传到 -> huggingface -> transformer.js -> load -> web 下载到浏览器本地（慢）-> 浏览器缓存 -> webgpu（新特性，兼容性） -> 执行nlp任务
## 安装依赖
- "@huggingface/transformers": "3.7.1",
  js 版本的transformers 库，用于加载模型， 执行nlp任务
- "marked": "^15.0.5",
  标式化markdown 格式，aigc返回的是markdown 格式，需要格式化一下，才能显示在浏览器上

aigc生成md格式文本是因为更简洁

## 引入webworker
个人介绍， 聊一下自己的项目 webgpu-deepseek
怎么学习？ 看你不知道的JavaScript（看书），关注一些博主，掘金等社区，github 看源码，输出内容到社区

## !!navigator.gpu 报错
as 类型断言 
any ts 的原生类型 任意类型，
比较新， 实验阶段的属性，ts 没有很好的识别Navigator 类
ts 的理解和学习
ts里面有专门的类型声明文件，@types/webgpu 本质上是缺失类型声明文件
npm install -D @webgpu/types
开发阶段用ts ， 代码打包后是js
tsconfig.app.json ts 配置文件， 引入@webgpu/types 类型声明文件
根据项目需求， 配置tsconfig.app.json 文件
## 设计模式
OOP 面向对象编程， 总结出来的23中解决特定问题的模式
数据解构，ADT 
面向设计， 而不是实现 Design Pattern
### 单例模式
类只实例化一次， 全局只有一个实例。
用于解决全局变量的问题，以及全局状态的问题

## load 
- 空值合并运算符 ??= 用于在变量为null 或 undefined 时， 赋值给变量
  用于避免重复赋值，保持变量的原始值。AutoTokenizer.from_pretrained() 方法， 用于加载模型的 tokenizer。 开销较大
- web 异步下载
  AutoTokenizer.from_pretrained()   promise
  文件比较大， 文件的chunk 慢慢到达， 提供一个process_callback 回调函数， 用于处理下载的chunk。
  AutoModelForCausalLM.from_pretrained()   promise
  Promise.all() 用于等待多个promise 完成， 然后再执行后续操作










用户打开网页
  ↓
网页通过模型 id 找到 Hugging Face 上的模型
  ↓
Transformers.js 下载模型文件到浏览器
  ↓
浏览器缓存模型文件
  ↓
用户输入问题
  ↓
Transformers.js 将文本转换为 Token
  ↓
浏览器使用 WebGPU / WebAssembly 在本地执行模型推理
  ↓
模型生成结果
  ↓
网页显示结果