# 面试项目稳定性修复设计

## 目标

在不改变现有项目结构、不删除现有注释的前提下，修复简历对应项目的现有代码问题。所有新增或修改的代码逻辑附近添加中文说明注释。第一阶段只修复真实运行链路，不增加离线模拟、回放或降级演示模式。

## 项目范围

1. `jzh_ai/ai/agent_in_action/remote-mcp` 与 `jzh_ai/ai/agent_in_action/mcp-demo` 共同组成 MCP 工具协作与资料问答 Agent。
2. `jzh_ai/ai/agent_in_action/tlbb` 对应 EPUB 文档知识库（Milvus RAG）。
3. `jzh_ai/ai/webgpu-deepseek/webgu` 对应 DeepSeek-R1 WebGPU 浏览器端推理应用。

`skills`、沿途项目和误识别的 `jzh_ai/ai/agent_in_action/milvus/demo` 不在本次范围内。

## 修复策略

### MCP Agent

- 保留 `remote-mcp` 的多服务器 Agent 和 `mcp-demo` 的本地 stdio Server 分工。
- 修复硬编码绝对路径，使本地 Server 路径从当前模块位置解析。
- 移除源码中的服务密钥，改为运行配置并在启动外部链路前明确校验。
- 确保 Client 在成功、异常和提前退出时都可靠关闭。
- 避免导入模块时立即连接外部服务或启动 Agent，使核心逻辑可被测试。
- 保留并扩充真实 stdio Client/Server 协议测试，只测试不依赖外部模型的能力。

### EPUB Milvus RAG

- 保留现有 EPUBLoader、递归分块、Embedding、Milvus Schema、索引和问答结构。
- 修复 EPUB 文件路径依赖当前工作目录的问题。
- 在创建外部客户端和发起调用之前完成配置校验。
- 检查 Collection、索引、Load、Insert 和 Flush 的可重复运行行为，避免重复演示直接失败或静默吞错。
- 保留真实外部链路；本阶段不添加模拟 Milvus 或模拟模型。
- 扩充不依赖外部服务的纯函数、EPUB 加载和分块验证。

### WebGPU 应用

- 在保留现有未提交改动的基础上修复 TypeScript 构建错误和 ESLint 错误。
- 补齐 React state、ref、Worker 消息和组件边界的类型，不通过关闭严格检查掩盖问题。
- 修复 Worker 异常传播、React 错误展示和资源清理问题，但不改变真实 WebGPU 推理链路。
- 保留现有 UI 结构和所有原注释；恢复当前差异中被删除的原注释。
- 本阶段不添加模拟推理或无 WebGPU 回放模式。

## 验证顺序

修复前的基线已经记录：MCP 协议测试通过，`tlbb` 的 4 项测试与 EPUB 实际加载通过，WebGPU 构建失败且 lint 有 2 个错误，`remote-mcp` 没有有效测试脚本。

代码修复完成后按以下顺序验证：

1. 对所有修改的 Node.js 模块执行语法检查。
2. 运行 MCP 真实 stdio 协议测试。
3. 运行 EPUB RAG 单元测试和实际 EPUB 加载、分块烟测。
4. 运行 WebGPU TypeScript 构建和 ESLint。
5. 在本机条件允许时启动实时链路；外部 API、Milvus、模型下载或 WebGPU 环境不可用时，明确记录为外部验证缺口，不把它报告为通过。

## 完成标准

- 已发现的本地测试、构建和 lint 失败全部解决。
- 没有删除原注释，所有改动逻辑有就近中文说明注释。
- 没有移动、合并或重命名现有项目目录。
- 不覆盖 WebGPU 项目已有的用户改动。
- 不提交密钥、Token 或机器专属绝对路径。
- 若真实外部链路仍无法稳定演示，再基于具体失败证据讨论离线或降级方案，不提前增加模拟实现。
