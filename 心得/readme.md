了解各种技术的应用场景，这样方便在用ai做项目是选择合适技术
同时想确定细节，还是需要深入学习各种技术的实现原理
作为AI全栈新手，建议按以下路径学习：

1. 先打好基础（2-3个月）
前端：HTML/CSS → JavaScript → 一个框架（推荐 React，生态最广）
后端：选一门语言深入（Python 最实用，AI 生态最好）→ FastAPI/Flask → 数据库基础（PostgreSQL）
工具链：Git、命令行基础、VS Code
2. 进入 AI 相关（2-3个月）
调 API 阶段：先用 Claude API / OpenAI API 做几个小项目（聊天机器人、文档问答），理解 prompt、token、temperature 这些概念
RAG（检索增强生成）：学向量数据库（Chroma/Pinecone）、embedding、文档分块。做一个"上传 PDF 并提问"的项目
Agent 开发：了解 function calling / tool use，让 AI 能调用外部工具
3. 全栈串联项目（持续）
做一个完整项目，比如：

一个 AI 客服系统（前端聊天界面 + 后端 RAG + 知识库管理后台）
一个代码审查助手（对接 GitHub API + AI review）
核心建议
70% 时间写代码，30% 时间看教程。不要陷入教程地狱
先会用，再理解原理。先调通 API，再回头看 transformer 论文
用 AI 辅助学习，但不要让它替你写你不理解的代码
GitHub 上找项目模仿，改造成自己的东西
建一个博客/笔记，记录踩过的坑，是最好的学习方式