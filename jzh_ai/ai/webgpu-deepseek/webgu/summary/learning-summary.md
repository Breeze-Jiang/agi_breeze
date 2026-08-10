---
type: learning-summary
title: "用 Transformers.js 和 WebGPU 在浏览器运行 DeepSeek"
aliases: ["WebGPU DeepSeek·学习总结"]
tags: [learning, WebGPU, Transformers.js, React, WebWorker]
source_scope: "webgu 项目与项目根目录 readme.md"
coverage:
  deep_read: ["readme.md", "webgu/src/App.tsx", "webgu/src/worker.js", "webgu/src/components/Chat.jsx"]
  shallow_read: ["webgu/package.json", "webgu/vite.config.ts", "webgu/src/main.tsx"]
  supplement: ["zh-writing 写作规则与平台规则"]
  skipped: ["依赖锁文件、node_modules、图片与图标、未直接参与调用链的样式文件"]
review_status: learning
next_review: null
---

# 一页速览

> [!summary] 核心结论
> - 这是一个 React + Transformers.js + WebGPU + Web Worker 的浏览器端 DeepSeek 文本生成项目。
> - 主线程负责页面、输入和状态展示；Worker 负责模型下载、初始化和推理，避免阻塞页面。
> - `TextGenerationPipeline` 用静态属性和 `??=` 缓存 tokenizer 与 model，体现了延迟加载和单例思想。
> - 模型通过 `device: "webgpu"` 请求 GPU 推理，`TextStreamer` 让回答流式返回。
> - 本总结基于源码静态阅读，运行结果未验证；项目中还存在依赖和文件命名等需要继续自检的边界。

## 学习范围

- **深读**：`readme.md`；`webgu/src/App.tsx`（React 入口逻辑、Worker 通信、状态流转）；`webgu/src/worker.js`（模型加载、生成、消息分发）；`webgu/src/components/Chat.jsx`（Markdown、HTML 安全处理和消息渲染）。
- **浅读**：`webgu/package.json`（脚本和依赖）；`webgu/vite.config.ts`（Vite、React、Tailwind 插件）；`webgu/src/main.tsx`（React 挂载入口）。
- **补读**：项目中使用到的 `@webgpu/types`、`dompurify` 依赖配置；写作阶段规则。
- **跳过**：锁文件、`node_modules`、图片/图标细节和与调用链无关的 CSS。
- **未知**：模型实际下载时间、浏览器兼容性、实际生成速度和部署环境表现，材料未提供运行验证结果。

## 知识地图

```text
main.tsx
  ↓ 挂载 App
App.tsx
  ↓ 创建 Worker，发送 check/load/generate/interrupt/reset
worker.js
  ↓ 检测 WebGPU
  ↓ TextGenerationPipeline.getInstance()
  ├─ AutoTokenizer：文字 ↔ token
  └─ AutoModelForCausalLM：WebGPU 模型推理
  ↓ TextStreamer 流式输出
App.tsx
  ↓ 更新 messages、进度、TPS 和页面
Chat.jsx
  ↓ marked 转 Markdown + DOMPurify 清理 + MathJax 渲染
```

## 核心知识

### 1. Web Worker：把重计算放到后台

`App.tsx` 使用 `new Worker(new URL("./worker.js", import.meta.url), { type: "module" })` 创建 Worker，并通过 `postMessage` 发送任务。Worker 用 `self.addEventListener("message", ...)` 接收消息，再将 `loading`、`ready`、`update`、`complete`、`error` 等状态发回主线程。

**为什么这样做**：模型加载和推理可能耗时，放在 Worker 中可以减少主线程卡顿。Worker 不能直接使用 `window`、`document`，但能用 `self.postMessage` 通信。[材料中出现]

### 2. WebGPU 能力检查

`App.tsx` 中的 `!!navigator.gpu` 只判断浏览器是否暴露 WebGPU API；`worker.js` 中进一步调用 `navigator.gpu.requestAdapter()` 获取适配器。前者是快速判断，后者更接近实际可用性。[材料中出现]

### 3. 单例式延迟加载

```js
class TextGenerationPipeline {
  static model_id = "onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX";

  static async getInstance(progress_callback = null) {
    this.tokenizer ??= AutoTokenizer.from_pretrained(this.model_id, {
      progress_callback,
    });
    this.model ??= AutoModelForCausalLM.from_pretrained(this.model_id, {
      dtype: "q4f16",
      device: "webgpu",
      progress_callback,
    });
    return Promise.all([this.tokenizer, this.model]);
  }
}
```

`static` 让方法和缓存属于类本身；`??=` 只在属性为空时初始化。第一次调用加载资源，后续调用复用缓存。严格说它没有禁止外部创建实例，而是用静态缓存实现了“单例式管理”。[材料推导]

### 4. 文本生成数据流

`generate(messages)` 先用 `apply_chat_template` 把聊天消息转成模型输入，再调用 `model.generate`。`TextStreamer` 把生成 token 转成文字，通过回调逐步发送给主线程；生成结束后再 `batch_decode` 得到完整文本。[材料中出现]

### 5. 前端安全渲染

`Chat.jsx` 使用 `marked.parse` 把 Markdown 转 HTML，再使用 `DOMPurify.sanitize` 清理 HTML，最后通过 `dangerouslySetInnerHTML` 插入页面。`dangerouslySetInnerHTML` 本身有 XSS 风险，先清理是必要的安全边界。[材料中出现]

## 重点语法与 API

| 语法/API | 作用 | 标记 |
|---|---|---|
| `async/await` | 等待模型下载和推理等异步任务 | [材料中出现] |
| `Promise.all` | 并行等待 tokenizer 和 model | [材料中出现] |
| `??=` | 为空时才赋值，适合一次初始化缓存 | [材料中出现] |
| `static` | 让属性/方法属于类本身 | [材料中出现] |
| `postMessage` | 主线程与 Worker 通信 | [材料中出现] |
| `useEffect` | React 中处理 Worker、输入尺寸和滚动副作用 | [材料中出现] |
| `dangerouslySetInnerHTML` | 插入 HTML，必须配合清理 | [材料中出现] |
| `as any` | 暂时绕过 TypeScript 类型检查 | [材料推导] |

## 注释重点解读

源码注释说明 Worker 不能进行 DOM 编程；实现中也没有调用 `window` 或 `document`，而是通过 `self.postMessage` 回传结果，注释和实现一致。源码还注明模型缓存用于避免重复初始化；实现通过 `this.tokenizer ??=` 和 `this.model ??=` 完成缓存。`past_key_values_cache` 已保存但传入模型的代码被注释，说明缓存复用目前未真正启用。

## 面试高频知识

1. **为什么用 Worker？** [材料中出现] 将模型推理从主线程移出，避免页面交互被长任务阻塞；代价是需要序列化消息和设计通信协议。
2. **`??=` 与 `||=` 有什么区别？** [外部补充] `??=` 只把 `null/undefined` 当作空；`||=` 会把 `0`、`false`、空字符串也当作空。
3. **为什么需要 tokenizer？** [材料中出现] 模型处理的是 token 数字序列，tokenizer 负责文本与 token 之间的转换。
4. **流式输出怎么实现？** [材料中出现] `TextStreamer` 在生成过程中通过回调持续发送片段，主线程追加到最后一条 assistant 消息。
5. **`postMessage` 是否共享对象？** [外部补充] 默认使用结构化克隆传递数据，不是普通 JS 对象引用；特定对象可使用 Transferable 转移所有权。
6. **为什么要用 DOMPurify？** [材料推导] Markdown 转 HTML 后内容可能包含危险 HTML，清理可以降低 XSS 风险。
7. **WebGPU 检查是否等于一定能推理？** [材料推导] 不是；还要考虑适配器获取、设备创建、模型格式、浏览器实现和显存等因素。
8. **`Promise.all` 的价值是什么？** [材料中出现] tokenizer 和 model 都是异步资源时，可以同时等待并在全部完成后继续。

## 复习卡片

> [!tip] 记忆模型
> 主线程管 UI，Worker 管模型；消息是协议，状态是反馈，缓存避免重复初始化。

- [ ] 什么是 Web Worker？它与主线程如何通信？
- [ ] `static getInstance` 为什么可以不用 `new` 调用？
- [ ] `this.model ??=` 第一次和第二次调用分别发生什么？
- [ ] `AutoTokenizer` 和 `AutoModelForCausalLM` 各自负责什么？
- [ ] `TextStreamer` 为什么能实现逐字显示？
- [ ] `loading/ready/update/complete` 分别对应什么阶段？
- [ ] 为什么 `dangerouslySetInnerHTML` 需要 DOMPurify？
- [ ] `q4f16` 和 `device: "webgpu"` 在项目中表达什么意图？

> [!warning] 易混淆点
> `!!navigator.gpu` 只能做 API 存在性判断；`requestAdapter()` 才是进一步获取 GPU 适配器。另需检查源码引用的 Worker 文件名与实际文件是否一致，以及 `Chat.jsx` 中使用的依赖是否已安装。

## 实践与复习计划

- [ ] 当天：画出 `App.tsx → worker.js → App.tsx` 的消息时序图，标注每个 `status`。
- [ ] 1 天后：手写一个最小 Worker，完成 `check` 和 `postMessage` 往返。
- [ ] 3 天后：解释 `??=`、`Promise.all`、数组解构，并对比 `||=`。
- [ ] 7 天后：检查项目依赖、Worker 路径、WebGPU 类型配置，并完成一次真实构建；运行未验证。

> [!question] 未解决问题
> 运行环境是否支持 WebGPU、模型是否能完整下载、模型实际性能和浏览器缓存行为，当前材料没有给出验证证据。
