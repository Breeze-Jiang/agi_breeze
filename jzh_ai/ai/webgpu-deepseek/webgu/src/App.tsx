import { useEffect, useState, useRef } from "react";

import Chat from "./components/Chat";
import ArrowRightIcon from "./components/icons/ArrowRightIcon";
import StopIcon from "./components/icons/StopIcon";
import Progress from "./components/Progress";

// ### 卡顿根因
// Worker 每生成几个 token 就 postMessage({ status: "update", output }) 一次（频率非常高，每秒几十次）。主线程每次收到 update 会：

// 1. setTps() + setNumTokens() + setMessages() → 触发 React 重渲染
// 2. Chat 组件重渲染 → 每个 Message 调用 render(text)
// 3. render(text) 里跑 marked.parse() （Markdown 解析）+ DOMPurify.sanitize() （HTML 消毒）+ <MathJax dynamic> （数学公式渲染） ——这三个操作每次都在 越来越长的文本 上重跑一遍
// 4. 文本越长，解析越慢 → 后期卡顿越来越明显
// ### 不改代码的缓解办法
// 1. 换 Chrome 浏览器 ：WebGPU + V8 引擎性能最好，Edge 次之，Firefox 不支持 WebGPU
// 2. 关闭其他占 GPU 的标签页 ：模型推理和渲染都在抢 GPU
// 3. 不要在生成时展开"思维链" ：展开后 MathJax 要渲染更多公式，更卡
// 4. 缩短问题 ：生成 token 越少，文本越短，解析越快
// ### 如果将来愿意改代码（面试可答的优化方向）
// - 节流/防抖 update 消息 ：用 requestAnimationFrame 合并多次 setMessages ，每帧只渲染一次
// - Message 组件加 React.memo ：只重渲染最后一条消息，历史消息不重复解析
// - render() 结果缓存 ：用 useMemo 按 content 长度做增量解析，不每次全量跑 marked.parse + DOMPurify
// - MathJax 延迟渲染 ：生成中只显示纯文本， complete 后再触发 MathJax 渲染

const IS_WEBGPU_AVAILABLE = !!navigator.gpu;
const STICKY_SCROLL_THRESHOLD = 120; // 距底部的距离
const EXAMPLES = [
  "Solve the equation x^2 - 3x + 2 = 0",
  "Lily is three times older than her son. In 15 years, she will be twice as old as him. How old is she now?",
  "Write python code to compute the nth fibonacci number.",
];

type AppStatus = "loading" | "ready" | null;
type ModelMode = "primary" | "compatibility";
type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  answerIndex?: number;
};
type ProgressItem = {
  file: string;
  progress: number;
  total: number;
};
type WorkerResponse = {
  status: "loading" | "initiate" | "progress" | "done" | "reset-progress" | "ready" | "start" | "update" | "complete" | "error";
  data?: string;
  file?: string;
  progress?: number;
  total?: number;
  output?: string;
  tps?: number;
  numTokens?: number;
  state?: "thinking" | "answering";
  mode?: ModelMode;
};

function App() {
  // Create a reference to the worker object. 
  const worker = useRef<Worker | null>(null);// 创建一个worker线程

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);// useRef 创建一个"钩子"，直接抓到页面上真实的 <textarea> DOM 元素，用来操作它（比如调整高度、聚焦等）。
  const chatContainerRef = useRef<HTMLDivElement | null>(null); // 和 textareaRef 是同一个东西：给聊天消息容器贴个钩子，用来读取滚动位置 + 控制自动滚动。

  // Model loading and progress
  const [status, setStatus] = useState<AppStatus>(null); // 状态
  const [error, setError] = useState<string | null>(null);   // 报错
  const [loadingMessage, setLoadingMessage] = useState(""); // 加载阶段的文字提示
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);   // 每个文件的进度条列表
  // 这里的progressItems 是一个数组，包含了每个文件的进度信息。如下:
  // [
  //   { file: "tokenizer.json", progress: 100, loaded: 10000, total: 10000 },
  //   { file: "model.onnx",     progress: 30,  loaded: 1500000, total: 5000000 },
  //   { file: "config.json",    progress: 100, loaded: 2000, total: 2000 },
  // ]
  const [isRunning, setIsRunning] = useState(false);        // 模型是不是正在生成文字
  // 修复说明：记录 Worker 实际加载的模型，兼容模式下明确展示 SmolLM2，避免被误认为 DeepSeek。
  const [activeModel, setActiveModel] = useState("");
  const [modelMode, setModelMode] = useState<ModelMode>("primary");

  // Inputs and outputs
  const [input, setInput] = useState("");                   // 输入框里用户正在打的字
  const [messages, setMessages] = useState<ChatMessage[]>([]);             // 整个聊天记录（最重要的 state）
  const [tps, setTps] = useState<number | null>(null);                     // 生成速度（每秒多少 token）
  const [numTokens, setNumTokens] = useState<number | null>(null);         // 回答一共生成了多少 token

  function onEnter(message: string) {
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: message }];
    setMessages(nextMessages);
    setTps(null);
    setIsRunning(true);
    setInput("");
    // Send the messages to the worker thread whenever the `messages` state changes.
    //  这是用户发消息后的"自动触发器"：当 messages 数组发生变化且最后一条是用户刚发的新消息时，自动清空上次的性能数据，把完整的聊天记录发给 Worker 让它开始生成回答。
    // 修复说明：改为在用户提交事件里发送同一份消息快照，避免 effect 同步 setState 和重复触发生成。
    worker.current?.postMessage({ type: "generate", data: nextMessages });
  }

  function onInterrupt() {
    // NOTE: We do not set isRunning to false here because the worker
    // will send a 'complete' message when it is done.
    worker.current?.postMessage({ type: "interrupt" });
  }

  function resizeInput() {
    if (!textareaRef.current) return;

    const target = textareaRef.current;
    target.style.height = "auto";
    const newHeight = Math.min(Math.max(target.scrollHeight, 24), 200);
    target.style.height = `${newHeight}px`;
  }

  useEffect(() => {
    resizeInput();
  }, [input]);

  // We use the `useEffect` hook to setup the worker as soon as the `App` component is mounted.
  useEffect(() => {
    // Create the worker if it does not yet exist.
    // 修复说明：每次 effect 挂载只创建一个 Worker，cleanup 时终止，兼容 React StrictMode 的重复挂载检查。
    const currentWorker = new Worker(new URL("./worker.js", import.meta.url), {
      type: "module",
    });
    worker.current = currentWorker;
    currentWorker.postMessage({ type: "check" }); // Do a feature check

    // Create a callback function for messages from the worker thread.
    const onMessageReceived = (e: MessageEvent<WorkerResponse>) => {
      switch (e.data.status) {
        // 模型加载


        case "loading":
          // Model file start load: add a new progress item to the list.
          setStatus("loading");
          setLoadingMessage(e.data.data ?? "Loading model...");
          break;

        case "initiate":
          // 给函数为了获取最新状态
          // 多个文件并发下载时，进度回调频繁触发
          if (e.data.file) {
            setProgressItems((prev) => [...prev, {
              file: e.data.file as string,
              progress: e.data.progress ?? 0,
              total: e.data.total ?? 0,
            }]);
          }
          break;

        case "progress":
          // Model file progress: update one of the progress items.
          setProgressItems((prev) =>
            prev.map((item) => {
              if (item.file === e.data.file) {
                return {
                  ...item,
                  progress: e.data.progress ?? item.progress,
                  total: e.data.total ?? item.total,
                };
              }
              return item;
            }),
          );
          break;

        case "done":
          // Model file loaded: remove the progress item from the list.
          setProgressItems((prev) =>
            prev.filter((item) => item.file !== e.data.file),
          );
          break;

        case "reset-progress":
          // 修复说明：主模型触发兼容回退时清空旧下载项，避免旧模型数字与新模型进度条不匹配。
          setProgressItems([]);
          break;

        case "ready":
          // Pipeline ready: the worker is ready to accept messages.
          // 修复说明：以 Worker 回报为准保存实际模型身份，同时清除加载阶段的旧错误和进度。
          setActiveModel(e.data.data ?? "Loaded model");
          setModelMode(e.data.mode ?? "primary");
          setError(null);
          setProgressItems([]);
          setStatus("ready");
          break;
        // 开始推理



        case "start":
          {
            // Start generation
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: "" },
            ]);
          }
          break;

        case "update":
          {
            // Generation update: update the output text.
            // Parse messages
            const { output, tps, numTokens, state } = e.data;
            setTps(tps ?? null);
            setNumTokens(numTokens ?? null);
            setMessages((prev) => {
              const cloned = [...prev]; // 1. 浅拷贝数组（不直接改原数组）
              const last = cloned.at(-1); //  取最后一条（即助手的回答）
              // 修复说明：异常或乱序 update 没有助手消息时直接忽略，避免读取 undefined 导致页面崩溃。
              if (!last || last.role !== "assistant") return prev;
              const data: ChatMessage = {
                ...last,
                content: last.content + (output ?? ""),
              };
              //               - data.answerIndex === undefined （之前没记过分界点，只记第一次）
              //               - state === "answering" （Worker 说刚从 thinking 切到 answering）
              if (data.answerIndex === undefined && state === "answering") {
                // When state changes to answering, we set the answerIndex
                data.answerIndex = last.content.length;
              }
              cloned[cloned.length - 1] = data;
              return cloned;
            });
          }
          break;

        case "complete":
          // Generation complete: re-enable the "Generate" button
          setIsRunning(false);
          break;

        case "error":
          // 修复说明：加载失败后退出 loading 并清空残留进度，使用户无需刷新页面即可重试。
          setError(e.data.data ?? "Unknown worker error");
          setProgressItems([]);
          setStatus((prev) => prev === "loading" ? null : prev);
          setIsRunning(false);
          break;
      }
    };

    const onErrorReceived = (e: ErrorEvent) => {
      console.error("Worker error:", e);
      // 修复说明：Worker 线程级错误同样恢复加载按钮，避免界面永久卡在 loading。
      setError(e.message || "Worker failed unexpectedly");
      setProgressItems([]);
      setStatus((prev) => prev === "loading" ? null : prev);
      setIsRunning(false);
    };

    // Attach the callback function as an event listener.
    currentWorker.addEventListener("message", onMessageReceived);
    currentWorker.addEventListener("error", onErrorReceived);

    // Define a cleanup function for when the component is unmounted.
    return () => {
      currentWorker.removeEventListener("message", onMessageReceived);
      currentWorker.removeEventListener("error", onErrorReceived);
      currentWorker.terminate();
      if (worker.current === currentWorker) worker.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chatContainerRef.current || !isRunning) return;
    const element = chatContainerRef.current;
    if (
      element.scrollHeight - element.scrollTop - element.clientHeight <
      STICKY_SCROLL_THRESHOLD
    ) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages, isRunning]);

  return IS_WEBGPU_AVAILABLE ? (
    <div className="flex flex-col h-screen mx-auto justify-end text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900">
      {status === null && messages.length === 0 && (
        <div className="h-full overflow-auto scrollbar-thin flex justify-center items-center flex-col relative">
          <div className="flex flex-col items-center mb-1 max-w-[400px] text-center">
            <h1 className="text-4xl font-bold mb-1">DeepSeek-R1 WebGPU</h1>
            <h2 className="font-semibold">
              A next-generation reasoning model that runs locally in your
              browser with WebGPU acceleration.
            </h2>
          </div>

          <div className="flex flex-col items-center px-4">
            <p className="max-w-[510px] mb-4">
              <br />
              You are about to load{" "}
              <a
                href="https://huggingface.co/onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline"
              >
                DeepSeek-R1-Distill-Qwen-1.5B
              </a>
              , a 1.5B parameter reasoning LLM optimized for in-browser
              inference. Everything runs entirely in your browser with{" "}
              <a
                href="https://huggingface.co/docs/transformers.js"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                🤗&nbsp;Transformers.js
              </a>{" "}
              and ONNX Runtime Web, meaning no data is sent to a server. Once
              loaded, it can even be used offline. The source code for the demo
              is available on{" "}
              <a
                href="https://github.com/huggingface/transformers.js-examples/tree/main/deepseek-r1-webgpu"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline"
              >
                GitHub
              </a>
              .
            </p>

            <button
              className="border px-4 py-2 rounded-lg bg-blue-400 text-white hover:bg-blue-500 disabled:bg-blue-100 cursor-pointer disabled:cursor-not-allowed select-none"
              onClick={() => {
                // 修复说明：每次重试前清理旧错误和进度，只在本次加载期间禁用按钮。
                setError(null);
                setProgressItems([]);
                worker.current?.postMessage({ type: "load" });
                setStatus("loading");
              }}
              disabled={status === "loading"}
            >
              Load model
            </button>
          </div>
        </div>
      )}
      {status === "loading" && (
        <>
          <div className="w-full max-w-[500px] text-left mx-auto p-4 bottom-0 mt-auto">
            <p className="text-center mb-1">{loadingMessage}</p>
            {progressItems.map(({ file, progress, total }, i) => (
              <Progress
                key={i}
                text={file}
                percentage={progress}
                total={total}
              />
            ))}
          </div>
        </>
      )}

      {status === "ready" && (
        <div
          ref={chatContainerRef}
          className="overflow-y-auto scrollbar-thin w-full flex flex-col items-center flex-1 min-h-0"
        >
          {/* 修复说明：兼容模式必须展示真实模型名称，不把 SmolLM2 表述为 DeepSeek。 */}
          {activeModel && (
            <p className="w-full px-4 py-2 text-center text-xs text-gray-500 dark:text-gray-300">
              {modelMode === "compatibility" ? "Compatibility mode · " : "Model · "}
              {activeModel}
            </p>
          )}
          <Chat messages={messages} />
          {messages.length === 0 && (
            <div className="w-full max-w-[960px] px-4 flex flex-wrap justify-center gap-2 py-2">
              {EXAMPLES.map((msg, i) => (
                <div
                  key={i}
                  className="m-1 border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-gray-100 dark:bg-gray-700 cursor-pointer"
                  onClick={() => onEnter(msg)}
                >
                  {msg}
                </div>
              ))}
            </div>
          )}
          <p className="text-center text-sm min-h-6 text-gray-500 dark:text-gray-300 mt-auto">
            {tps !== null && numTokens !== null && messages.length > 0 && (
              <>
                {!isRunning && (
                  <span>
                    Generated {numTokens} tokens in{" "}
                    {(numTokens / tps).toFixed(2)} seconds&nbsp;&#40;
                  </span>
                )}
                {
                  <>
                    <span className="font-medium text-center mr-1 text-black dark:text-white">
                      {tps.toFixed(2)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-300">
                      tokens/second
                    </span>
                  </>
                }
                {!isRunning && (
                  <>
                    <span className="mr-1">&#41;.</span>
                    <span
                      className="underline cursor-pointer"
                      onClick={() => {
                        worker.current?.postMessage({ type: "reset" });
                        setMessages([]);
                      }}
                    >
                      Reset
                    </span>
                  </>
                )}
              </>
            )}
          </p>
        </div>
      )}

      {error && (status === "ready" || status === "loading" || status === null) && (
        <div className="w-full max-w-[600px] mx-auto px-4 py-2 mb-2 border border-red-400 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">
          <p className="font-semibold mb-1">Something went wrong:</p>
          <p className="whitespace-pre-wrap break-all">{error}</p>
        </div>
      )}

      <div className="mt-2 border border-gray-300 dark:bg-gray-700 rounded-lg w-[600px] max-w-[80%] max-h-[200px] mx-auto relative mb-3 flex">
        {/* 修复说明：textarea 没有 type 属性，移除无效属性后保持原输入行为。 */}
        <textarea
          ref={textareaRef}
          className="scrollbar-thin w-[550px] dark:bg-gray-700 px-3 py-4 rounded-lg bg-transparent border-none outline-hidden text-gray-800 disabled:text-gray-400 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 disabled:placeholder-gray-200 resize-none disabled:cursor-not-allowed"
          placeholder="Type your message..."
          rows={1}
          value={input}
          disabled={status !== "ready"}
          title={status === "ready" ? "Model is ready" : "Model not loaded yet"}
          onKeyDown={(e) => {
            if (
              input.length > 0 &&
              !isRunning &&
              e.key === "Enter" &&
              !e.shiftKey
            ) {
              e.preventDefault(); // Prevent default behavior of Enter key
              onEnter(input);
            }
          }}
          onInput={(e) => setInput(e.currentTarget.value)}
        />
        {isRunning ? (
          <div className="cursor-pointer" onClick={onInterrupt}>
            <StopIcon className="h-8 w-8 p-1 rounded-md text-gray-800 dark:text-gray-100 absolute right-3 bottom-3" />
          </div>
        ) : input.length > 0 ? (
          <div className="cursor-pointer" onClick={() => onEnter(input)}>
            <ArrowRightIcon
              className={`h-8 w-8 p-1 bg-gray-800 dark:bg-gray-100 text-white dark:text-black rounded-md absolute right-3 bottom-3`}
            />
          </div>
        ) : (
          <div>
            <ArrowRightIcon
              className={`h-8 w-8 p-1 bg-gray-200 dark:bg-gray-600 text-gray-50 dark:text-gray-800 rounded-md absolute right-3 bottom-3`}
            />
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center mb-3">
        Disclaimer: Generated content may be inaccurate or false.
      </p>
    </div>
  ) : (
    <div className="fixed w-screen h-screen bg-black z-10 bg-opacity-[92%] text-white text-2xl font-semibold flex justify-center items-center text-center">
      WebGPU is not supported
      <br />
      by this browser :&#40;
    </div>
  );
}

export default App;
