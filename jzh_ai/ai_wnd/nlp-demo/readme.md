# Prompt 做NLP任务开发
- 有哪些东西可以模块化
  import from
  export default
  - 维护和可读性
  - 好复用 引入
- 项目的模块化搭建
  - main.mjs 单点入口 （鉴权，路由）
  - client.mjs  封装client对象，负责向外提供
  - component.mjs  完成任务的函数

## es6 语法特性
es6是js在2015年发布的新版本，新增了很多语法特性，比如箭头函数、模板字符串、解构赋值等。目标是让js成为企业级大型项目开发的语言。
- let const 声明提升bug，支持块级作用域
  let const 不能重复声明，const简单数据类型不能重新赋值，复杂数据类型可以重新赋值，但不能改变其指向的内存地址（类型）
- ...rest 剩余参数  展开运算符
- 解构赋值
  - 对象
  - 数组 简洁性能好
- 模块化 esm 模块
  - import from
  - export default
  - export