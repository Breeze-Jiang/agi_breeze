import {
  AutoTokenizer,// 分词器
  AutoModelForCausalLM,
  TextStreamer,
  InterruptableStoppingCriteria,
} from "@huggingface/transformers";

const MODEL_PROFILES = {
  primary: {
    id: "onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX",
    label: "DeepSeek-R1-Distill-Qwen-1.5B",
    mode: "primary",
    dtype: "q4f16",
    supportsThinking: true,
  },
  compatibility: {
    // 修复说明：360M 在当前 ONNX Runtime 创建会话时仍抛出 WASM 数值异常，135M 保持同系列交互格式并显著降低浏览器内存压力。
    id: "onnx-community/SmolLM2-135M-Instruct-ONNX",
    label: "SmolLM2-135M-Instruct",
    mode: "compatibility",
    // 修复说明：兼容模型使用 q4，避开 q4f16 图在部分 ONNX Runtime Web 环境中的会话创建异常。
    dtype: "q4",
    supportsThinking: false,
  },
};

function getErrorMessage(error) {
  return String((error && (error.stack || error.message)) || error || "Unknown worker error");
}

function isLargeMappedBufferError(error) {
  const message = getErrorMessage(error);
  // 修复说明：只对已确认的 WebGPU 大映射缓冲区错误降级，网络等真实故障继续明确失败。
  return /createBuffer/i.test(message)
    && /too large/i.test(message)
    && /mappedAtCreation/i.test(message);
}

function formatWorkerError(error) {
  const firstLine = getErrorMessage(error).split("\n", 1)[0];
  return firstLine || "Unknown worker error";
}

// 不能做dom编程
// worker中不能用DOM 相关的API 比如window ， document 

/**
 * Helper function to perform feature detection for WebGPU
 */
// let fp16_supported = false;
async function check() {
  // window 是浏览器窗口 里面有DOM 对象和BOM 对象
  // DOM Document Object Model document
  // BOM Browser Object Model navigator
  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error("WebGPU is not supported (no adapter found)");
    }
    // fp16_supported = adapter.features.has("shader-f16")
  } catch (e) {
    self.postMessage({
      status: "error",
      data: e.toString(),
    });
  }
}

/**
 * This class uses the Singleton pattern to enable lazy-loading of the pipeline
 */
// pipeline 流水线 文本生成
// 分词器 大模型 配置文件

class TextGenerationPipeline {
  static profile = MODEL_PROFILES.primary;
  static tokenizer = null;
  static model = null;
  // 单例模式 llm 只需要初始化一次 ， 后面可以一直用， 实例化特别耗性能， 单例管理
  // 下载
  // 
  static useProfile(profile) {
    // 修复说明：切换模型前清理失败的 Promise 和会话缓存，否则重试会立即复用上一次拒绝结果。
    this.profile = profile;
    this.tokenizer = null;
    this.model = null;
    past_key_values_cache = null;
    stopping_criteria.reset();
  }

  static async getInstance(progress_callback = null) {
    const profile = this.profile;
    this.tokenizer ??= AutoTokenizer.from_pretrained(profile.id, {
      progress_callback,  
    //   (x) => {
    // self.postMessage(x);
    });
    // console.log(this.tokenizer,"-----------------");
    this.model ??= AutoModelForCausalLM.from_pretrained(profile.id, {
      dtype: profile.dtype,
      device: "webgpu",
      progress_callback,
    });

    const [tokenizer, model] = await Promise.all([this.tokenizer, this.model]);
    return [tokenizer, model, profile];
  }
}

const stopping_criteria = new InterruptableStoppingCriteria();


// 每次对话, 都会KV 注意力计算 大量的算力计算,
// 下一次计算的时候message 数组 添加上一条, 缓存之前的计算, 跳过了
let past_key_values_cache = null;
async function generate(messages) {
  // Retrieve the text-generation pipeline.
  const [tokenizer, model, profile] = await TextGenerationPipeline.getInstance();

  const inputs = tokenizer.apply_chat_template(messages, {
    add_generation_prompt: true,
    return_dict: true,   
  });

  // 151648: <think>
  // 151649: </think>
  let END_THINKING_TOKEN_ID = null;
  if (profile.supportsThinking) {
    const [START_THINKING_TOKEN_ID, endThinkingTokenId] = tokenizer.encode(
      "<think></think>",
      { add_special_tokens: false },
    );
    END_THINKING_TOKEN_ID = endThinkingTokenId;
    void START_THINKING_TOKEN_ID;
  }

  // 修复说明：兼容模型没有 DeepSeek 思维链标记，从首个 token 起按正式回答渲染。
  let state = profile.supportsThinking ? "thinking" : "answering"; // 'thinking' or 'answering'
  let startTime;
  let numTokens = 0;
  let tps;
// 这是每生成一个 token（词）就会被调用一次的回调函数，主要干两件事：计算生成速度（tps）+ 判断模型什么时候从"思考中"切换到"开始回答"。
  const token_callback_function = (tokens) => {
    startTime ??= performance.now();

    if (numTokens++ > 0) {
      tps = (numTokens / (performance.now() - startTime)) * 1000;
    }
    if (END_THINKING_TOKEN_ID !== null && tokens[0] == END_THINKING_TOKEN_ID) {
      state = "answering";
    }
  };
// 这个是 TextStreamer 解码出可读文字后的回调，把最新的文字片段 + 当前的生成速度 + 状态打包，通过 postMessage 发给主线程，用于打字机效果更新 UI。
  const callback_function = (output) => {
    self.postMessage({
      status: "update",
      output,
      tps,
      numTokens,
      state,
    });
  };
// TextStreamer 是流水线调度器：每生成一个原始 token 就调用 token_callback_function 做性能统计和状态切换；攒够几个 token 解码成文字后，调用 callback_function 把文字+统计结果发给主线程，最终用户看到实时打字机效果。
  const streamer = new TextStreamer(tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function,
    token_callback_function,
  });

  // Tell the main thread we are starting
  self.postMessage({ status: "start" });

  const { past_key_values, sequences } = await model.generate({
    ...inputs,
    // TODO: Add back when fixed
    // past_key_values: past_key_values_cache,

    // Sampling
    do_sample: false,
    // repetition_penalty: 1.1,
    // top_k: 3,
    // temperature: 0.2,

    max_new_tokens: 2048,
    streamer,
    stopping_criteria,
    return_dict_in_generate: true,
  });
  past_key_values_cache = past_key_values;

  const decoded = tokenizer.batch_decode(sequences, {
    skip_special_tokens: true,
  });

  // Send the output back to the main thread
  self.postMessage({
    status: "complete",
    output: decoded,
  });
}

let loadingPromise = null;

async function loadModel(profile, progress_callback) {
  TextGenerationPipeline.useProfile(profile);
  return await TextGenerationPipeline.getInstance(progress_callback);
}

async function performLoad({ forceCompatibility = false } = {}) {
  self.postMessage({
    status: "loading",
    data: forceCompatibility ? "Loading compatibility model..." : "Loading model...",
  });

  const progress_callback = (x) => {
    // We also add a progress callback to the pipeline so that we can
    // track model loading.
    self.postMessage(x);
// 这里的x 是一个对象，包含了模型加载的进度信息。如下:
// {
//   status: "progress",
//   file: "model.onnx",      // 哪个文件
//   progress: 35,            // 新的百分比 35%
//   loaded: 1750000,
//   total: 5000000,
// }
  };

  let pipeline;
  if (forceCompatibility) {
    pipeline = await loadModel(MODEL_PROFILES.compatibility, progress_callback);
  } else {
    try {
      // Load the pipeline and save it for future use.
      pipeline = await loadModel(MODEL_PROFILES.primary, progress_callback);
    } catch (error) {
      if (!isLargeMappedBufferError(error)) throw error;

      // 修复说明：主模型命中已知缓冲区上限时仅降级一次，并清掉主模型遗留的下载进度。
      self.postMessage({ status: "reset-progress" });
      self.postMessage({
        status: "loading",
        data: "GPU buffer limit detected. Loading compatibility model...",
      });
      try {
        pipeline = await loadModel(MODEL_PROFILES.compatibility, progress_callback);
      } catch (compatibilityError) {
        throw new Error(`Compatibility model failed to load: ${formatWorkerError(compatibilityError)}`);
      }
    }
  }

  const [tokenizer, model, profile] = pipeline;

  self.postMessage({
    status: "loading",
    data: "Compiling shaders and warming up model...",
  });

  // Run model with dummy input to compile shaders
  const inputs = tokenizer("a");
  await model.generate({ ...inputs, max_new_tokens: 1 });
  self.postMessage({ status: "ready", data: profile.label, mode: profile.mode });
}

async function load(options = {}) {
  // 修复说明：复用同一个加载 Promise，避免快速重复点击创建多份模型和 GPU 会话。
  if (loadingPromise) return await loadingPromise;
  loadingPromise = performLoad(options);
  try {
    return await loadingPromise;
  } finally {
    loadingPromise = null;
  }
}
// Listen for messages from the main thread
// 事件监听
self.addEventListener("message", async (e) => {
  const { type, data } = e.data;

  try {
    switch (type) {
      case "check":
        await check();
        break;

      case "load":
        await load(data);
        break;

      case "generate":
        stopping_criteria.reset();// 清除上一次的中断状态，让模型能正常开始新一轮生成。
        await generate(data);
        break;

      case "interrupt":
        stopping_criteria.interrupt(); //  interrupted 设置为true , llm 实例的属性 每次生成token 检测
        break;

      case "reset":
        past_key_values_cache = null;
        stopping_criteria.reset();
        break;

      default:
        self.postMessage({
          status: "error",
          data: `Unknown worker message type: ${String(type)}`,
        });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[worker] unhandled error for type", type, err);
    self.postMessage({
      status: "error",
      // 修复说明：界面只展示首行可操作错误，完整堆栈仍保留在 Worker 控制台供调试。
      data: formatWorkerError(err),
    });
  }
});
