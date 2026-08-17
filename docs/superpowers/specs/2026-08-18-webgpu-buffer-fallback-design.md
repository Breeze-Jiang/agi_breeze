# WebGPU 大缓冲区兼容降级设计

## 背景

`webgpu-deepseek/webgu` 默认加载 `onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX`。该模型包含约 466,747,392 字节的单个权重张量。当前 Transformers.js 3.7.1 捆绑的 ONNX Runtime Web 会通过 `mappedAtCreation: true` 创建同等大小的暂存 GPUBuffer；部分 Chrome/Dawn 和集成显卡实现无法映射如此大的单个缓冲区，最终抛出 `createBuffer failed, size ... is too large`。

本次目标是在保留 DeepSeek 主路径的前提下，让项目在受限 WebGPU 环境中仍能完成面试演示，并且不把兼容模型伪装成 DeepSeek。

## 方案

### 模型配置

Worker 内维护两个明确的模型配置：

- 主模型：`DeepSeek-R1-Distill-Qwen-1.5B-ONNX`，`q4f16`、WebGPU，支持 `<think>` / `</think>` 思维链分段。
- 兼容模型：`SmolLM2-360M-Instruct-ONNX`，`q4f16`、WebGPU，不支持 DeepSeek 思维链标记。

默认始终先加载主模型。只有当主模型抛出的错误明确包含 WebGPU 大缓冲区特征，例如 `createBuffer`、`too large` 或 `mappedAtCreation` 时，才自动切换到兼容模型。网络错误、模型文件错误和其他未知错误不得触发降级，以免掩盖真实故障。

### Worker 数据流

1. 主线程发送 `load`。
2. Worker 尝试加载主模型。
3. 若加载成功，完成预热并发送 `ready`，同时返回实际模型标签和运行模式。
4. 若命中大缓冲区错误，Worker 清理失败的 tokenizer/model Promise、KV 缓存和停止条件，通知主线程清空旧进度，然后加载兼容模型。
5. 兼容模型成功后发送 `ready`，并明确标记 `compatibility` 模式。
6. 两个模型均失败时发送精简、可操作的错误消息，不把完整调用栈渲染到页面。

Worker 保留显式的强制兼容加载参数，仅用于自动化测试；正常界面不启用该参数。

### UI 状态

- 加载兼容模型时显示清晰的降级说明并重置原模型的下载进度。
- 模型就绪后显示实际加载的模型名；兼容模式必须带可见标签。
- 加载失败时退出 `loading` 状态、停止生成状态并恢复 Load/Retry 操作。
- 用户重试时清空旧错误和旧进度，不创建重复 Worker，也不改变现有页面结构。

### 生成差异

DeepSeek 继续按照 `<think>` / `</think>` 分割思考和最终回答。兼容模型从第一个 token 开始标记为 `answering`，避免全部内容被错误放进折叠的思维链区域。

## 约束

- 不删除现有注释。
- 新增或修改的关键逻辑旁添加中文“修复说明”。
- 不移动目录或重构现有项目结构。
- 不修改 node_modules，也不依赖一次性的本地补丁。
- 不静默更换模型；UI 必须展示实际运行模型。

## 验证

- `npm run build`
- `npm run lint`
- 浏览器正常主模型加载路径回归。
- 通过 Worker 的强制兼容参数实际加载 `SmolLM2-360M-Instruct-ONNX`，完成预热并生成至少一个回答。
- 模拟主模型大缓冲区错误，验证只在该错误下自动降级。
- 验证失败后 Retry 可用，页面不展示完整堆栈且不会停留在不可恢复的 Loading 状态。
