# Claude Code

- AIGC 代码生产
  豆包复制代码
- vscode + cc插件
  AI Coding Agent
  结合编辑器
  生产的代码直接写入文件

- cc 的命令行工具
 - 基于node.js
 - npm config set registry https://registry.npmmirror.com
  包的来源设置为淘宝源 国内 快

 - npm install -g @anthropic-ai/claude-code
   全局安装 cc命令 npm 包
   claude --version验证是否安装好

## cc 开发网页 jima
- claude
是否信任文件夹
就像你请了个程序员来改项目，得先把办公室门禁给他，他才能去看代码，改文件，跑命令，但权限也只限你授权的这个文件夹

这体现了Anthropic 在Claude code里强调
最小权限 + 安全边界 思想

## Vibe coding
- 不要急于将任务交给llm
- 先思考
  五个构建块
  llm 擅长执行准确详细的任务
  Prompt 设计能力是关键

## cc 提供plan模式

通过询问一些问题，cc会根据你的回答，生成一个计划，帮助你完成任务
代替Prompt

## plan 模式
- 不是直接执行任务
- 先规划一下

/plan 规划模式

- 新的工作模式
  不太了解行业或领域，/plan可以降低难度
  - claud code 非常智能
    思考，规划，建议并执行
  - 对新手友好

## 使用cc 维护一个已有的项目

- 先思考，了解项目
  运行起来，
  按模块看代码

- cc
 - 如果之前就是 cc开发的
 直接查看根目录下的 claude.md 文件（项目描述文件）
 - 如果不是
  /init
  初始化项目，生成 Claude.md文件
  将项目都分析一遍
