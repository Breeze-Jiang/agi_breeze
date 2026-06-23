# 从文字到向量：LLM 如何让计算机"读懂"人类语言？

> 大语言模型（LLM）并不理解文字，它理解的是数字。从你输入一句"你好"，到模型生成一段回答，中间经历了一场精密的"翻译"——文字切分成 token，token 转换成向量，向量送入神经网络。这场翻译的质量，决定了 LLM 的上限。今天，我们拆解这条流水线。

---

## 一、Tokenization：文字到数字的第一道翻译

### 1.1 为什么 LLM 必须分词？

神经网络有一个根本性约束：**它只能处理数字**。无论是 Transformer 架构还是 attention 机制，底层运算都是矩阵乘法、向量点积。你给它一段中文、一串英文，它束手无策。

所以，必须先把文字翻译成数字。这个翻译过程，就是 **Tokenization（分词）**。

```
"hello tiktoken!你好！"
        ↓ tokenize
[15339, 83, 16040, 0, 57668, 53901, 244, 81669]
        ↓ 送入神经网络
       LLM
```

**Token 是 LLM 处理文本的最小单位，也是计价的最小单位。** OpenAI 按 token 收费，1 个英文字符约 0.3 token，1 个中文字符约 0.7 token。理解 token，既理解了模型的工作方式，也理解了它的成本结构。

### 1.2 Token 不等于单词

一个常见的误解：token = 单词。**并非如此。**

```
"hello"      → 1 个 token
"tiktoken"   → 可能被切成 "tik" + "token" 两个 token
"你好"       → 可能是 2 个 token（每个字一个）
"unhappiness" → "un" + "happiness" 或 "un" + "happ" + "iness"
```

Token 的切分规则由**编码方案**决定。OpenAI 的 GPT-3.5/4 使用 `cl100k_base`，词表约 10 万个 token。这套方案基于 BPE（Byte Pair Encoding）算法，通过统计高频子串来构建词表——既不是按字符切，也不是按词切，而是按"高频片段"切。

**这种设计是工程上的折中**：
- 按字符切：词表太小（中英文加起来几百个），序列太长，模型学不到语义
- 按词切：词表太大（几百万），低频词学不好，OOV（Out of Vocabulary）问题严重
- 按 BPE 切：词表适中（10 万级），高频词完整保留，低频词拆成子串，兼顾效率和泛化

### 1.3 代码实现：js-tiktoken

```javascript
import { getEncoding } from 'js-tiktoken';

const enc = getEncoding('cl100k_base');
const text = "hello tiktoken!你好！";

const tokens = enc.encode(text);      // 文字 → token 数组
console.log(tokens, tokens.length);

const decodeText = enc.decode(tokens); // token 数组 → 文字
console.log(decodeText);
```

`getEncoding('cl100k_base')` 返回一个编码器对象，提供两个核心方法：
- `encode(text)`：正向编码，文字 → token ID 数组
- `decode(tokens)`：反向解码，token ID 数组 → 文字

**编码器是可逆的**——encode 后再 decode，能还原原文。这保证了 token 化过程不丢失信息。

---

## 二、Embedding：从离散 ID 到连续语义

### 2.1 Token ID 还不够

Token ID 只是一个离散编号，比如 `[15339, 83]`。这个数字本身没有语义——15339 和 83 的大小关系，不代表 "hello" 和 "tiktoken" 的语义关系。

**神经网络需要的是连续的、能表达语义关系的向量。** 这就是 Embedding（嵌入）的职责。

```
"猫"  → token [1234] → embedding [0.21, -0.33, 0.55, ..., 0.12]  ← 1024 维
"狗"  → token [5678] → embedding [0.19, -0.30, 0.58, ..., 0.10]  ← 与"猫"接近
"汽车" → token [9012] → embedding [-0.45, 0.67, -0.12, ..., 0.88] ← 与"猫"相差甚远
```

**Embedding 的核心特性：语义相近的文本，向量也相近。** 这让计算机能通过向量距离"计算"语义关系——这是所有语义搜索、RAG、推荐系统的数学基础。

### 2.2 完整的 LLM 处理流水线

```
prompt(文本输入)
    ↓ tokenizer
tokens(离散 ID 序列)
    ↓ embedding
向量(连续语义表示)
    ↓ Transformer
处理后的向量
    ↓ decoder
tokens(输出 ID)
    ↓ detokenize
output(文本输出)
```

**Embedding 是连接"符号世界"与"连续数学世界"的桥梁。** 没有它，LLM 无法把文字送入神经网络。

### 2.3 代码实现：调用嵌入模型

```javascript
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
});

async function getEmbedding(text) {
  const response = await client.embeddings.create({
    model: 'text-embedding-v4',    // 阿里百炼嵌入模型
    input: text,
    dimension: 1024                // 输出向量维度
  });
  return response.data[0].embedding;
}
```

这段代码值得注意的几个工程细节：

**第一，用 OpenAI SDK 连阿里云。** OpenAI SDK 是一个通用客户端，只要接口协议兼容，就能连任何 LLM 服务。阿里百炼提供了 OpenAI 兼容接口，所以只需改 `baseURL` 和 `apiKey`，代码完全复用。**这是工程上的解耦——SDK 与服务提供商无关。**

**第二，用 dotenv 管理 API Key。** 密钥不能硬编码在代码里（会泄露），也不能提交到 Git。`.env` 文件存储敏感配置，`dotenv.config()` 加载到 `process.env`，代码通过环境变量读取。这是生产环境的基本规范。

**第三，`dimension: 1024` 指定向量维度。** 维度越高，语义表达能力越强，但计算成本也越高。1024 是工程上的常用平衡点。

---

## 三、余弦相似度：让计算机"计算"语义距离

### 3.1 为什么需要相似度计算？

有了向量，就能计算两段文本的语义相似度。这是 embedding 最直接的应用。

```javascript
function cosineSimilarity(vecA, vecB) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];      // 点积
    magA += vecA[i] ** 2;          // 向量 A 的模平方
    magB += vecB[i] ** 2;          // 向量 B 的模平方
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}
```

**余弦相似度**衡量两个向量的方向一致性，取值范围 `[-1, 1]`：
- 接近 1：方向一致，语义高度相似
- 接近 0：正交，语义无关
- 接近 -1：方向相反，语义对立

### 3.2 实验：字面不同，语义相近

```javascript
const text  = "Andrej Karpathy LLM Tokenization 分词原理";
const text2 = "karpathy 讲解大模型BPE字词分词";   // 字面不同，语义相近
const text3 = "今天天气很好";                      // 字面不同，语义无关

const embedding  = await getEmbedding(text);
const embedding2 = await getEmbedding(text2);
const embedding3 = await getEmbedding(text3);

const similarity  = cosineSimilarity(embedding, embedding2);  // ≈ 0.85，高
const similarity3 = cosineSimilarity(embedding, embedding3);  // ≈ 0.3，低
```

**这个实验揭示了一个重要事实：传统的字面匹配会失效，但语义匹配不会。**

`text` 和 `text2` 没有几个相同的词，字面匹配算法会判定它们不相关。但它们讲的是同一件事——Karpathy 讲解 LLM 分词。Embedding 捕捉到了这个语义关系。

**这就是为什么搜索引擎、推荐系统、RAG 系统都在从"关键词匹配"转向"语义匹配"。**

### 3.3 为什么用余弦而不是欧氏距离？

向量的"长度"受文本长度、词频等因素影响，可能干扰相似度判断。余弦相似度只看**方向**，不看长度，更纯粹地反映语义关系。

```
向量 A = [1, 2, 3]      长度 √14
向量 B = [2, 4, 6]      长度 √56（是 A 的 2 倍）

欧氏距离 = √(1+4+9) × √3 ≈ 7.35  ← 距离很大？
余弦相似度 = 1.0                    ← 方向完全一致 ✅
```

A 和 B 方向完全相同（B = 2A），语义应该一致。余弦相似度给出了正确答案，欧氏距离却被长度干扰了。

---

## 四、工程实践：从理论到代码的落地

### 4.1 项目结构

```
demo/
├── package.json          # 依赖声明
├── .env                  # API Key（不提交 Git）
├── index.mjs             # Tokenization 演示
└── main.mjs              # Embedding + 相似度计算
```

### 4.2 依赖管理

```json
{
  "dependencies": {
    "js-tiktoken": "^1.0.21",   // OpenAI 官方分词库的 JS 版
    "openai": "^6.44.0",         // OpenAI SDK（兼容阿里百炼）
    "dotenv": "^17.4.2"          // 环境变量管理
  }
}
```

三个包各司其职：
- `js-tiktoken`：本地分词，不调用 API，纯计算
- `openai`：调用远程 embedding/chat 接口
- `dotenv`：安全管理密钥

### 4.3 `.mjs` 后缀的意义

文件用 `.mjs` 而非 `.js`，表示使用 **ES Module** 语法（`import/export`），而非 CommonJS（`require/module.exports`）。这是现代 JavaScript 的标准模块系统，支持顶层 `import`、tree-shaking 等特性。

---

## 五、知识结构总览

```
LLM 文本处理流水线
│
├── Tokenization（分词）
│   ├── 必要性：神经网络只能处理数字
│   ├── 方案：BPE 算法，cl100k_base 词表约 10 万
│   ├── 工具：js-tiktoken（encode / decode）
│   └── 计价：token 是 LLM 的计费单位
│
├── Embedding（向量化）
│   ├── 必要性：token ID 是离散的，无语义关系
│   ├── 原理：token → 神经网络 → 连续向量
│   ├── 特性：语义相近 → 向量相近
│   └── 工具：text-embedding-v4（阿里百炼，1024 维）
│
├── 相似度计算
│   ├── 方法：余弦相似度（看方向，不看长度）
│   ├── 范围：[-1, 1]，越接近 1 越相似
│   └── 价值：超越字面匹配，实现语义匹配
│
└── 工程实践
    ├── SDK 复用：OpenAI SDK 兼容阿里百炼
    ├── 密钥管理：dotenv + .env
    └── 模块系统：ES Module（.mjs）
```

---

## 结语

今天的学习揭示了一个核心事实：**LLM 的"智能"，建立在一系列精密的数学翻译之上。**

文字不是文字，是 token 序列；token 不是编号，是高维向量；向量不是数字，是语义的坐标。每一次翻译，都在把人类的模糊语义，转化为计算机可计算的精确数学对象。

理解这条流水线，就理解了 LLM 的工作原理，也理解了现代 AI 应用的技术基石——无论是 RAG、语义搜索、推荐系统，还是 Agent 开发，底层都是同一套机制：**文本 → token → 向量 → 计算 → 输出。**

Tokenization 决定了 LLM 能处理什么，Embedding 决定了 LLM 能理解什么，相似度计算决定了 LLM 能关联什么。这三层翻译，构成了大语言模型与人类语言之间的全部桥梁。

**计算机并不"懂"语言，但它懂向量——而向量，恰好能表达语义。这或许就是深度学习最深刻的洞察。**
