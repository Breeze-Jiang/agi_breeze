# 从"缸中大脑"到"能动手的 Agent"：Tool Use 如何让 LLM 突破物理限制

> 那个在显卡里疯狂跑的 LLM，本质上还是个词语接龙的游戏。它是被困在服务器里的缸中大脑——看不见屏幕，摸不到键盘，只能预测下一个词的概率。但今天，我们见证了一场技术革命：Tool Use 让这个"缸中大脑"学会了调用 API、读取数据库、操作物理世界的工具。这不是魔法，是协议。

---

## 一、核心论点：LLM + Tools = Agent

用户以为豆包能自动搜索网页、Claude 能分析 Excel 表格，是 LLM 自己完成的。**其实不是。**

LLM 只会做一件事：**Next Token Prediction**（预测下一个词）。它无法：
- 访问实时数据（股价、天气）
- 执行计算
- 读取文件
- 调用 API

**但加上 Tools，它就变成了 Agent。**

```
LLM（缸中大脑） + Tools（外部能力） = Agent（能动手的智能体）
```

今天的核心问题是：**一个只能预测下一个词的概率模型，怎么突破物理限制，去调用 API、读数据库、操作工具？**

答案藏在三个关键词里：**认知植入 → 意图识别 → Runtime 介入**。

---

## 二、认知植入：工具降维为语言

### 2.1 LLM 的根本限制

LLM 不懂什么是天气 API，也不懂数据查询，但它**听得懂语言**。

所以，Tool Use 的第一步，是把复杂的软件接口函数，翻译成 LLM 能理解的"说明书"——这就是**认知植入**。

### 2.2 JSON Schema：函数的"说明书"

看这段代码（`index.mjs` 第 13-30 行）：

```javascript
const tools = [
  {
    "type": "function",
    "function": {
      "name": "get_closing_price",          // 函数名
      "description": "获取指定股票的收盘价",  // 功能描述
      "parameters": {                        // 参数 Schema
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "股票名称"
          }
        },
        "required": ["name"]
      }
    }
  }
]
```

**这就是认知植入的核心**：把一个复杂的软件工具（`get_closing_price` 函数），降维成一个存储的文本描述（JSON Schema）。

| 字段 | 作用 | 为什么需要 |
|------|------|-----------|
| `name` | 函数标识符 | LLM 据此生成调用 |
| `description` | 功能描述 | LLM 据此**决策**是否调用 |
| `parameters` | JSON Schema | LLM 据此生成**合法参数** |
| `required` | 必填字段 | 约束 LLM 必须提供 |

### 2.3 Schema 的本质

**Schema 是对数据结构的正式定义和约束说明**，描述数据应如何组织、验证其合法性，并确保不同系统间数据交换的一致性。

类比数据库设计：

```sql
CREATE TABLE users (
  name VARCHAR(100) NOT NULL UNIQUE
);
```

JSON Schema 做的是同样的事——**用结构化语言约束数据格式**。

### 2.4 为什么描述必须具体清晰？

LLM 是概率模型，**描述写得越具体，LLM 决策越准确**。

```javascript
// ❌ 差的描述
"description": "获取价格"

// ✅ 好的描述
"description": "获取指定股票的收盘价，输入股票名称，返回最新收盘价"
```

前者会让 LLM 困惑："什么价格？商品价格？股价？房价？"后者则精确指向股票场景。

**一句话总结**：认知植入的本质，是把"软件能力"翻译成"语言说明书"，让 LLM 能理解工具的存在和用法。

---

## 三、意图识别：LLM 的决策机制

### 3.1 用户提问时的推理过程

用户问："青岛啤酒的收盘价是多少？"

LLM 的推理引擎开始工作：

```
1. 检查训练语料：我能直接回答吗？
   → 不能，股价是实时数据，不在训练数据里

2. 检查认知植入：有工具吗？
   → 有，get_closing_price 工具

3. 匹配意图：这个问题需要调用工具吗？
   → 需要，用户问的是股价

4. 生成调用：根据 Schema 生成参数
   → tool_calls: [{ name: "get_closing_price", arguments: '{"name":"青岛啤酒"}' }]
```

### 3.2 LLM 返回的结构

看代码（`index.mjs` 第 77-78 行）：

```javascript
const response = await sendMessage(messages);
const message = response.choices[0].message;
```

LLM 返回的 `message` 对象有两种可能：

**情况 A：直接回答（不需要工具）**

```javascript
{
  role: "assistant",
  content: "你好，有什么可以帮你？",
  tool_calls: null
}
```

**情况 B：调用工具（需要外部数据）**

```javascript
{
  role: "assistant",
  content: null,
  tool_calls: [{
    id: "call_abc123",
    type: "function",
    function: {
      name: "get_closing_price",
      arguments: '{"name":"青岛啤酒"}'
    }
  }]
}
```

**关键洞察**：LLM 不执行工具，只是**决策**"该调用什么工具、传什么参数"。它赌这段代码发出后，会有人响应。

### 3.3 为什么是 `tool_calls` 数组？

OpenAI 协议支持**并行工具调用**——LLM 可以一次性请求调用多个工具：

```javascript
// 用户问："青岛啤酒的股价和北京天气"
tool_calls: [
  { id: "call_1", function: { name: "get_closing_price", arguments: '{"name":"青岛啤酒"}' } },
  { id: "call_2", function: { name: "get_weather", arguments: '{"city":"北京"}' } }
]
```

代码中取 `[0]`（第 86 行）是简化处理，假设每次只调用一个工具。

**一句话总结**：意图识别是 LLM 的核心能力——它依赖强大的模式识别和逻辑推理，判断是否需要工具、调用哪个工具、传什么参数。

---

## 四、Runtime 介入：传统软件的执行

### 4.1 LLM 不能执行，但开发者可以

LLM 只生成调用请求（`tool_calls`），**不执行函数**。真正的执行由 Runtime（Node.js/Python/Java）完成。

看代码（`index.mjs` 第 88-91 行）：

```javascript
const args = JSON.parse(toolCall.function.arguments);  // 解析参数
const price = get_closing_price(args.name);             // 执行本地函数
```

**执行流程**：

```
LLM 返回 tool_calls
    ↓
Runtime 解析 arguments（JSON 字符串 → 对象）
    ↓
Runtime 调用本地函数 get_closing_price("青岛啤酒")
    ↓
返回结果 "67.92"
```

### 4.2 为什么用 `JSON.parse`？

LLM 生成的 `arguments` 是**字符串**：

```javascript
arguments: '{"name":"青岛啤酒"}'  // 字符串
```

需要解析成对象才能传给函数：

```javascript
const args = JSON.parse(arguments);
args.name  // "青岛啤酒"
```

### 4.3 工具结果不直接返回给用户

关键设计：工具结果**不直接返回给用户**，而是返回给 LLM。

看代码（`index.mjs` 第 93-99 行）：

```javascript
messages.push({
  role: 'tool',
  content: price,           // "67.92"
  tool_call_id: toolCall.id // "call_abc123"
})
```

**为什么？**

- 用户问的是自然语言问题，期望自然语言回答
- 工具返回的是原始数据（"67.92"），不是用户友好的回答
- LLM 需要把原始数据"翻译"成自然语言："青岛啤酒的收盘价是 67.92 元"

### 4.4 `tool_call_id` 的作用

`tool_call_id` 是**关联工具请求和结果的纽带**：

```javascript
// LLM 返回的请求
tool_calls: [{ id: "call_abc123", ... }]

// Runtime 返回的结果
{ role: 'tool', tool_call_id: "call_abc123", content: "67.92" }
```

LLM 通过 `id` 知道："这个 67.92 是刚才那个工具调用的结果"。

**支持多工具并发**：如果有多个工具调用，每个都有独立的 `id`，结果可以精确关联。

---

## 五、二次调用：LLM 基于真实数据生成回答

### 5.1 完整对话历史

看代码（`index.mjs` 第 104-107 行）：

```javascript
const finalRes = await sendMessage(messages);
console.log(finalRes.choices[0].message.content);
```

此时 `messages` 数组包含：

```javascript
[
  { role: 'user', content: '青岛啤酒的收盘价是多少？' },
  { role: 'assistant', content: null, tool_calls: [{ id: "call_abc123", ... }] },
  { role: 'tool', content: '67.92', tool_call_id: "call_abc123" }
]
```

**第二次调用 LLM 时，它看到了完整上下文**：
- 用户问了什么
- 自己决策调用什么工具
- 工具返回了什么结果

### 5.2 LLM 的最终回答

有了真实数据，LLM 才能生成用户友好的回答：

```
"青岛啤酒的收盘价是 67.92 元。"
```

**不是直接返回 "67.92"，而是用自然语言包装**——这才是用户期望的交互体验。

---

## 六、完整时序图

```
用户          Agent          LLM           本地函数
 │             │              │              │
 │──"青岛啤酒股价？"──→│              │              │
 │             │──messages───→│              │
 │             │              │（检查训练语料：不能回答）
 │             │              │（检查认知植入：有工具）
 │             │              │（意图识别：需要调用）
 │             │←─tool_calls─│              │
 │             │              │              │
 │             │──JSON.parse──→              │
 │             │──执行函数──────────────────→│
 │             │←──"67.92"───────────────────│
 │             │              │              │
 │             │──messages+结果──→│          │
 │             │              │（基于数据生成回答）
 │             │←─"青岛啤酒收盘价是67.92元"─│
 │←──回答──────│              │              │
```

---

## 七、代码架构总结

```javascript
// Layer 1: LLM 客户端（缸中大脑）
const client = new OpenAI({ apiKey, baseURL });

// Layer 2: 工具协议层（认知植入）
const tools = [{ type: "function", function: { name, description, parameters } }];

// Layer 3: 函数实现层（传统软件）
function get_closing_price(name) { ... }

// Layer 4: Agent 编排层（意图识别 + Runtime 介入）
async function main() {
  // 第一次调用：LLM 决策
  const response = await sendMessage(messages);
  
  // Runtime 执行
  const args = JSON.parse(toolCall.function.arguments);
  const result = get_closing_price(args.name);
  
  // 第二次调用：LLM 总结
  const finalRes = await sendMessage(messages + tool_result);
}
```

---

## 八、知识结构总览

```
Tool Use 核心机制
│
├── 认知植入（工具降维为语言）
│   ├── JSON Schema：函数的"说明书"
│   ├── description：LLM 决策依据
│   ├── parameters：参数约束
│   └── required：必填字段
│
├── 意图识别（LLM 决策机制）
│   ├── 检查训练语料：能否直接回答
│   ├── 检查认知植入：有无工具
│   ├── 匹配意图：是否需要工具
│   └── 生成调用：tool_calls 数组
│
├── Runtime 介入（传统软件执行）
│   ├── JSON.parse：解析参数
│   ├── 执行函数：调用本地代码
│   ├── tool_call_id：关联请求和结果
│   └── 返回结果：不直接给用户
│
└── 二次调用（LLM 总结）
    ├── messages：完整对话历史
    ├── 基于真实数据生成回答
    └── 自然语言包装：用户友好
```

---

## 结语

Tool Use 不是魔法，是**协议**。

它解决了一个根本矛盾：**LLM 只会预测下一个词，但用户需要它调用 API、读数据库、操作工具。**

解决方案藏在三个步骤里：

1. **认知植入**：把软件能力翻译成语言说明书（JSON Schema）
2. **意图识别**：LLM 决策该调用什么工具、传什么参数
3. **Runtime 介入**：传统软件执行函数，把结果喂回 LLM

**LLM 负责"思考"，Runtime 负责"动手"。**

这才是 Agent 的本质——不是 LLM 变聪明了，而是我们给缸中大脑装上了手脚。用户看到的"智能"，是协议编织的幻觉。但这个幻觉，恰好能解决问题。

**Tool Use 的真正价值，不是让 LLM 突破物理限制，而是让传统软件的能力，通过语言协议，被 LLM 调用。这是新旧范式的融合——概率模型与确定性代码的协作。**

下一次，当你看到豆包自动搜索网页、Claude 分析 Excel 表格时，请记住：**LLM 只是在预测下一个词，真正干活的是你写的代码。**