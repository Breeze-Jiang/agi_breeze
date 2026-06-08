# Bun
Bun是比node 更快，开箱即用，零配置的JS/TS 运行时+包管理器
node 优化的升级版，性能特别好
anthropic 收购了bun 用于Claude Code 底层

## typescript
来自微软，是js的超集，添加了类型约束
js 弱类型，经常会出类型错误
- 静态的类型编译 ts -> js文件 ，检查类型或代码错误
- ts 非常的强大，已经是AI Agent 的标配

## js 的易错性

- 浏览器input 输入 我们以为是数字，实际上是字符串

- + 是加法也是字符串拼接
- 又不报错，导致错误隐藏在系统里很久
ts 来解决