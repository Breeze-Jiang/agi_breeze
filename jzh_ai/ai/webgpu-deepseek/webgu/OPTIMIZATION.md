# WebGPU DeepSeek 项目稳定性优化记录

## 目标

在不改变原有 React + Web Worker + Transformers.js 项目结构的前提下，保证项目在面试演示时能够加载模型、显示真实运行模式、完成文本生成，并在已知 WebGPU 限制出现时自动恢复。

## 优化前的问题

主模型在部分浏览器/运行时组合中创建上传缓冲区时失败：

```text
RangeError: createBuffer failed, size (466747392) is too large for the implementation when mappedAtCreation == true
```

根因是旧版 Transformers.js 3.7.1 搭配的 ONNX Runtime Web 1.22 开发版，在向 WebGPU 上传大权重张量时创建了单个 `mappedAtCreation` 暂存缓冲区。浏览器拒绝约 445 MiB 的映射缓冲区后，模型无法完成初始化。原界面同时还存在以下恢复问题：

- 加载失败后按钮被永久禁用，只能刷新页面。
- 切换模型时旧下载项仍留在列表，导致进度数字与进度条不一致。
- 页面没有展示 Worker 实际运行的模型，兼容模型可能被误认为 DeepSeek。
- 重复点击加载可能创建多份模型加载任务。

## 优化后的行为

1. 默认仍优先加载 `DeepSeek-R1-Distill-Qwen-1.5B`，不改变项目的核心演示目标。
2. Transformers.js 升级到 4.2.0。实机测试中新版运行时已能直接加载并生成 DeepSeek 1.5B 内容。
3. 如果主模型仍命中已确认的大映射缓冲区错误，Worker 才会自动清理失败状态并切换到兼容模型。
4. 兼容模型为 `SmolLM2-135M-Instruct`，使用 WebGPU `q4` 量化。界面明确显示 `Compatibility mode`，不会把它表述为 DeepSeek。
5. 网络错误、模型文件错误等其他异常不会被静默降级，仍会显示真实错误，避免掩盖故障。
6. 加载失败会退出 loading、清空残留进度并恢复按钮，用户可以直接重试。
7. 同一时间只保留一个加载 Promise，避免快速重复点击造成重复下载和显存占用。

## 前后对比

| 场景 | 优化前 | 优化后 |
| --- | --- | --- |
| 默认模型加载 | 旧运行时可能因 466,747,392 字节映射缓冲区失败 | 新运行时已实机完成 DeepSeek 1.5B 加载、预热和生成 |
| 受限 WebGPU 环境 | 加载失败后无法继续演示 | 仅命中已知大缓冲区错误时自动进入兼容模式 |
| 兼容模型身份 | 没有兼容模式和真实模型提示 | 明确显示 `Compatibility mode · SmolLM2-135M-Instruct` |
| 下载进度 | 模型切换后可能残留旧进度，数字与进度条不一致 | 回退前发送 `reset-progress`，重新显示当前模型进度 |
| 错误恢复 | Load 按钮被禁用，需要刷新页面 | 清理错误和进度后可直接重试 |
| 重复操作 | 快速点击可能并发创建多个加载任务 | `loadingPromise` 保证同一时间只执行一次加载 |
| 安装复现 | npm/pnpm 锁文件和 pnpm 构建许可可能不一致 | 两套锁文件同步，冻结锁安装验证通过 |

## 为什么兼容模型使用 135M q4

实机验证中，SmolLM2-360M q4f16 和 SmolLM2-135M q4f16 均在 ONNX 会话创建阶段抛出数值型 WASM 异常；135M q4 则完整通过了下载、会话创建、shader warmup、生成和中断收尾。因此最终选择同系列的 135M q4 作为稳定兜底，而不是仅根据模型文件大小判断可用性。

## 主要改动

- `src/worker.js`
  - 增加主模型与兼容模型配置。
  - 严格识别已知 `createBuffer + too large + mappedAtCreation` 错误。
  - 切换模型时清理失败 Promise、KV cache 和停止条件。
  - 增加加载去重、进度重置、真实模型名和运行模式回报。
  - 保留 Worker 控制台完整错误，界面只展示简洁首行。
- `src/App.tsx`
  - 处理 `reset-progress`，解决模型切换后进度显示不匹配。
  - 加载失败后恢复可重试状态。
  - 展示 Worker 实际加载的模型和兼容模式。
  - 移除重复错误面板，重试前清理旧错误与进度。
- `package.json`、`package-lock.json`、`pnpm-lock.yaml`、`pnpm-workspace.yaml`
  - 将 `@huggingface/transformers` 固定为 4.2.0，并同步 npm/pnpm 锁文件。
  - 明确禁用浏览器项目不需要的 Node/图像原生构建脚本，修复 pnpm 占位配置导致的安装失败。

## 实机验证结果

验证环境为 Windows、Chrome WebGPU、硬件 D3D 适配器；适配器支持 `shader-f16`，`maxBufferSize` 为 2 GiB。

```bash
node --check src/worker.js
npm run lint
npm run build
pnpm install --frozen-lockfile
```

以上命令全部通过。浏览器验证结果：

- 默认路径：DeepSeek 1.5B 下载完成，shader warmup 完成，Worker 回报 `primary`，生成非空 `<think>` 内容并正常 `complete`。
- 强制兼容路径：SmolLM2-135M q4 下载完成，shader warmup 完成，Worker 回报 `compatibility`，生成非空回答并正常 `complete`。
- 桌面与 390 x 844 手机视口均无横向溢出、文字遮挡或控件重叠。
- 浏览器控制台没有应用错误。

## 演示时的外部条件

- 首次运行需要从 Hugging Face 下载模型，网络速度会影响等待时间；下载完成后浏览器缓存可减少后续等待。
- 必须使用支持 WebGPU 的新版 Chrome 或 Edge，并保持硬件加速开启。
- 主模型仍可能受不同显卡驱动和浏览器实现限制；此时项目会按上述严格边界自动进入兼容模式。
- 兼容模式运行的是 SmolLM2-135M-Instruct，不是 DeepSeek，界面会如实标注。

## 面试现场启动

```bash
npm install
npm run dev -- --host 127.0.0.1
```

使用新版 Chrome 或 Edge 打开终端显示的本地地址，点击 `Load model`。正常情况下顶部显示 `Model · DeepSeek-R1-Distill-Qwen-1.5B`；若浏览器命中已知大缓冲区限制，则显示兼容模式和实际模型名。
