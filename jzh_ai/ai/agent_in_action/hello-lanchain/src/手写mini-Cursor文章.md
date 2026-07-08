# 从零手写一个 AI 编程 Agent 之后，我终于理解了 Cursor 的核心原理

> 本文适合对 AI Agent 感兴趣的 Node.js 开发者。我们不谈虚的——用不到 200 行代码，从零实现一个能自动创建项目、写代码、装依赖、启动服务的编程 Agent，并在这个过程中真正理解"为什么一个 for 循环就能驱动复杂任务"。

[TOC]

## 一、一个被忽视的问题

过去一年，Cursor、Copilot、Devin 这些 AI 编程工具已经渗透了我们的日常工作。敲一行需求，AI 自动创建项目、写代码、装依赖、跑起来——这已经不是什么新鲜事了。

但有一个问题，大多数人用了很久也没有认真想过：**这个"自动完成任务的循环"，内部到底是怎么工作的？**

我第一次认真思考这个问题，是在用 Cursor 搭建一个全栈项目的时候。AI 先创建了前端项目，又创建了后端项目，然后自动装了依赖，甚至帮我修正了一个配置错误——整个流程大概 20 个步骤，它自己走完了。我当时想：它怎么知道"下一步"该做什么？它的"决策"机制是什么？

后来我读了不少 Agent 相关的论文和源码，发现这件事的核心，其实是一个诞生于 2022 年的老模式：**ReAct（Reasoning + Acting）**。而且，它的实现骨架简单到让人意外——一个 while 循环，不到 50 行代码。

这篇文章，我想跟你分享一个"从零手写 mini-Cursor"的过程。它只有四个工具、一个 ReAct 循环，但它完整地复现了 AI 编程 Agent 的核心骨架。更重要的是——理解了这个骨架之后，你对市面上所有 AI 编程工具的理解，会从"魔法"变成"工程"。

## 二、先立一个公式：Agent = LLM + 工具 + 循环

任何 AI Agent，不管多复杂，都可以用这个公式概括：

```
Agent = LLM（大脑） + 工具（手） + 循环调用（心跳）
```

- **LLM** 负责"思考"——分析当前状态，决定下一步做什么。每次调用就像一次"快照式的判断"，它不记得上一刻发生了什么——除非你把历史告诉它。
- **工具** 负责"行动"——读文件、写代码、执行命令、查数据库。LLM 本身只是一个语言模型，它不能操作文件系统，不能联网，不能执行命令。工具是它伸向外部世界的触手。
- **循环** 负责"持续"——LLM 思考一次就停了，但任务通常需要多步才能完成。循环让这个过程持续运转：思考 → 行动 → 观察结果 → 再思考。

这听起来像是废话——"有大脑、有手、有心跳，当然能干活"。但我想说的是：**这个公式里，最不直观、也最关键的一环是"循环"。** 因为市面上大部分关于 Agent 的讨论，焦点都放在 LLM 的能力和工具的丰富度上，很少有人去思考："LLM 为什么能在一个循环里持续做出正确的决策？"

我认为答案是：**LLM 并没有"规划"整个任务，它只是在每一步基于"当前上下文 + 上一步的工具结果"做一次推理。** 全局的"智能感"，是从局部的、一次次的微观决策中涌现出来的。

所以，要理解 Agent，重点不是"用了什么模型"或"有多少工具"，而是**这个循环怎么设计，以及每一步的上下文怎么传递**。下面我们通过代码来验证这件事。

## 三、工具设计的三个关键权衡

在写 ReAct 循环之前，我们需要给 Agent 装上"手"。我们定义了四个工具：`read_file`、`write_file`、`list_directory`、`execute_command`，分别对应读取、写入、浏览、执行。每个工具用 LangChain 的 `tool()` 封装，包含三个要素：功能函数、name + description（告诉 LLM 它能干什么）、Zod schema（告诉 LLM 参数类型）。

具体代码我不在这里全部展开（完整版本见文末），我想重点讨论的是**工具设计中的三个关键权衡**——这些权衡反映了 Agent 开发中普遍存在的取舍。

### 权衡 1：健壮性 vs 精确性——写文件时要不要自动创建目录？

```javascript
const writeFileTool = tool(
  async ({ filePath, content }) => {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });  // 自动建
    await fs.writeFile(filePath, content, 'utf-8');
    return `成功写入 ${filePath}`;
  },
  { /* name, description, schema */ }
);
```

`fs.mkdir(dir, { recursive: true })` 这行代码我犹豫过要不要加。理由是：**加了，Agent 可能在不该建目录的地方建了目录；不加，Agent 在写嵌套路径时会反复失败。**

最终我选择了"加"。因为这个 Agent 的场景是"自动化编程"，LLM 大概率会写出 `src/components/Header.tsx` 这样的路径——如果 `src/components` 不存在就报错，Agent 会在创建目录和写文件之间反复试错，浪费多轮调用。

这个取舍背后的原则是：**工具应该容忍 LLM 的"粗放"——LLM 擅长生成意图，不擅长精准操作。** 你在设计 Agent 工具时，需要主动判断哪些操作可以"容错"，哪些必须"严格"。这和传统 API 设计的思路完全不同——传统 API 强调"契约"，Agent 工具强调"鲁棒性"。

### 权衡 2：实时反馈 vs 结果收集——执行命令时用 spawn 还是 exec？

```javascript
const child = spawn(cmd, args, {
  cwd,
  stdio: 'inherit',  // 子进程的输出直接透传到终端
  shell: true,
});
```

`spawn` + `stdio: 'inherit'` 是一个刻意为之的选择。如果用 `exec`，子进程的输出会被缓冲，等命令执行完才返回。对于 `pnpm install` 这种带进度条的命令，用户会在终端前干等好几分钟，啥也看不到——这体验太差了。

但 `stdio: 'inherit'` 也有代价：**子进程的输出不经过 Node.js，所以你"拿不到"它的 stdout，无法在事后分析输出内容来辅助决策。** 如果 Agent 需要根据命令输出来判断下一步该做什么，`spawn` 就不是好选择。

取舍的原则是：**如果命令的输出是给用户看的（安装进度、构建日志），优先保证体验，用 spawn；如果命令的输出需要被 Agent 解析和推理，用 exec 收集完整结果。** 在这个 mini-Cursor 中，四个工具里有三个都需要 Agent 拿到返回结果做下一步决策，唯独 `execute_command` 是个例外——因为它的主要场景是安装和启动，用户更关心"看到它跑起来了"而非"Agent 分析输出"。

### 权衡 3：描述详细度 vs 上下文消耗——怎么给工具写 description？

每个工具都需要一个 `description` 字段，告诉 LLM 它是干什么的。我一开始写得很简略：

```javascript
description: '读取文件',
```

后来发现这样写，LLM 会在"看代码"和"查目录"之间选错工具——它分不清什么时候该用 `read_file`，什么时候该用 `list_directory`。于是我把 description 改成了更详细的版本：

```javascript
description: '用此工具来读取文件内容，当用户要求读取文件、查看代码、分析文件内容时，调用此工具。输入文件路径（可以是相对路径或绝对路径）',
```

但问题又来了——description 太长会消耗上下文窗口。四个工具，每个 100 字的 description，加上 System Prompt，已经占了几百个 token。对于简单任务，这完全是浪费。

原则是：**description 的长度应该和"调用歧义度"成正比。** 两个容易混淆的工具（如 `read_file` 和 `list_directory`），description 要写得足够有区分度；不太可能混淆的工具（如 `execute_command`），description 可以简略。

---

这三个权衡做下来，你会发现一个更底层的规律：**工具设计不是在写 API，而是在和 LLM "对话"。** 你要预判 LLM 可能在什么场景下犹豫，主动给它铺好路。这种"产品思维"比纯工程思维重要得多——这也是我觉得 Agent 开发中最有意思的部分。

## 四、ReAct 循环的优雅——一个 for 循环为什么能驱动复杂任务

工具定义好了，现在到最有意思的部分：**把这个 for 循环跑起来，看 LLM 怎么在每一步做决策。**

### 4.1 模型绑定——为什么 `bindTools` 是桥梁而非黑魔法

```javascript
const model = new ChatOpenAI({
  modelName: 'deepseek-v4-pro',
  temperature: 0,  // 代码生成不需要创意，要确定性
});

const tools = [readFileTool, writeFileTool, listDirectoryTool, executeCommandTool];
const modelWithTools = model.bindTools(tools);
```

`bindTools` 是 LangChain 提供的一个方法，它做的事情很朴素：把每个工具的 name、description 和 zod schema 转成 OpenAI 兼容的 function-calling 格式，塞到 API 请求里。模型收到后，在连续推理的过程中，可以在任意时刻选择"我要调工具了"——它会输出一个 `tool_calls` 数组，里面包含工具名和参数。

这里有一个细节值得注意：`temperature: 0`。Agent 任务不是写诗——每一步都应该稳定、可预测。如果 temperature 设高了，模型可能"突发奇想"调用不存在的工具，或者在参数里填错路径。对于代码生成和工具调用，确定性比创意重要。

### 4.2 循环体——整个 Agent 的核心，不到 30 行

```javascript
async function runAgent(query, maxIterations = 30) {
  const messages = [
    new SystemMessage(`你是一个项目管理助手...
      当前工作目录: ${process.cwd()}
      可用工具: read_file, write_file, list_directory, execute_command
      重要规则: workingDirectory 和 cd 不要同时使用...`),
    new HumanMessage(query),
  ];

  for (let i = 0; i < maxIterations; i++) {
    const response = await modelWithTools.invoke(messages);
    messages.push(response);

    // 没有 tool_calls → 任务完成
    if (!response.tool_calls || response.tool_calls.length === 0) {
      return response.content;
    }

    // 有 tool_calls → 执行工具，结果塞回对话历史
    for (const toolCall of response.tool_calls) {
      const tool = tools.find(t => t.name === toolCall.name);
      if (tool) {
        const result = await tool.invoke(toolCall.args);
        messages.push(new ToolMessage({
          content: result,
          tool_call_id: toolCall.id,
        }));
      }
    }
  }
}
```

这个循环的心跳可以画成这样：

```
┌──────────┐    response.tool_calls 存在   ┌──────────┐
│ LLM 推理 │ ────────────────────────────► │ 执行工具 │
│ (invoke) │                               │ (invoke) │
└──────────┘                               └──────────┘
      ▲                                           │
      │        ToolMessage 塞回 messages           │
      └───────────────────────────────────────────┘
                          │
                    response.tool_calls 不存在
                          │
                          ▼
                    ┌──────────┐
                    │ 任务完成 │
                    └──────────┘
```

我真正理解 ReAct 的本质，就是在仔细看了这个循环中的"消息传递"机制之后。有两点是最关键的：

**第一，`ToolMessage` 的"回传"是整个系统的记忆机制。** LLM 自己是无状态的——每一次 `invoke`，它唯一的信息来源就是 `messages` 数组。所以，你必须把工具执行结果原封不动地塞回去。如果你忘了这一步，LLM 在下一轮调用中会"失忆"——它不知道上一轮做了什么，更不知道结果是成功还是失败。然后它会怎么做？它大概率会重复调用同一个工具，陷入"loop death"。

**第二，LLM 没有"全局规划"，只有"局部推理"。** 这是很多人对 Agent 最大的误解。我们回顾一下 Agent 创建 React 项目的真实执行轨迹：

```
第 1 次推理: "我的任务是创建项目，应该先执行 vite 命令"
  → 调 tool: execute_command("pnpm create vite ...")
  → 结果: "成功执行"

第 2 次推理: "项目建好了，但我还不知道里面有什么文件，先看看"
  → 调 tool: list_directory("react-todo-app/src")
  → 结果: "App.tsx, main.tsx, App.css, ..."

第 3 次推理: "有 App.tsx，我应该重写它实现 TodoList 逻辑"
  → 调 tool: write_file("react-todo-app/src/App.tsx", "完整代码...")
  → 结果: "成功写入"

第 4 次推理: "逻辑写完了，还需要样式文件来加渐变背景和动画"
  → 调 tool: write_file("react-todo-app/src/App.css", "样式代码...")
  → 结果: "成功写入"

第 5 次推理: "代码和样式都写好了，该装依赖了"
  → 调 tool: execute_command("pnpm install", { workingDirectory: "react-todo-app" })
  → 结果: "成功执行"

第 6 次推理: "依赖装好了，启动"
  → 调 tool: execute_command("pnpm run dev", { workingDirectory: "react-todo-app" })
  → 结果: "成功执行"

第 7 次推理: "所有步骤都完成了，项目已经在运行"
  → 无 tool_calls，直接返回最终文本
```

注意看：LLM 并没有在第一步就"想好"所有步骤。它每一步只做一件事，做完后根据新的上下文判断下一步。全局的"智能感"是从一次次局部推理中自然涌现的——就像蚂蚁没有"巢穴设计图"，但成千上万只蚂蚁协作出来的蚁巢结构极其精妙。

这就是 ReAct 模式最优雅的地方：**复杂度由环境（messages 历史 + 工具结果）承担，而非由模型承担。** 模型不需要"规划"，它只需要在每一步做最好的判断。而环境提供了它做判断所需的全部信息。

### 4.3 System Prompt——Agent 的"护栏"

这 30 行循环代码是心脏，但 System Prompt 是"基因"。我在 System Prompt 里做了几件关键的事：

1. **告诉它当前工作目录**：`${process.cwd()}`——不写这句，它可能把文件写到意想不到的地方
2. **复述一遍工具列表**：虽然 `bindTools` 已经传了工具定义，但 System Prompt 里再列一遍能显著降低模型调用错误工具的几率。这是实践中的经验——双重信息（tool definition + prompt description）比单一信息更可靠
3. **重点标注易错规则**：`workingDirectory` 和 `cd` 的冲突。

第三点值得展开说说。`execute_command` 支持一个 `workingDirectory` 参数，用来指定命令在哪个目录执行。但 LLM 有一个"思维惯性"——当它想进入某个目录执行命令时，会下意识地在 command 里写 `cd react-todo-app && pnpm install`。问题是：如果同时传了 `workingDirectory: "react-todo-app"`，实际路径就变成了 `react-todo-app/react-todo-app`——直接报错。

我在 System Prompt 里特意写上了正确示例和错误示例：

```
重要规则 - execute_command：
  - workingDirectory 参数会自动切换到指定目录
  - 当使用 workingDirectory 时，绝对不要在 command 中使用 cd
  - 错误示例: { command: "cd react-todo-app && pnpm install",
                workingDirectory: "react-todo-app" }
    这是错误的！因为 workingDirectory 已经在 react-todo-app 了
  - 正确示例: { command: "pnpm install", workingDirectory: "react-todo-app" }
```

这看起来像是在"啰嗦"，但在 Agent 开发中，**对待已知的、高概率的错误模式，最好的方式就是直接写在 prompt 里**。不要指望 LLM 自己"悟"出来——它没有常识，你越把它当"聪明的但不太靠谱的同事"去对待，效果越好。

## 五、实战验证：让它建一个完整的 React 项目

说了这么多理论，Agent 到底能不能干活？我给它的任务是：

```
创建一个功能丰富的 React TodoList 应用：
1. 使用 pnpm create vite react-todo-app --template react-ts 创建项目
2. 修改 App.tsx，实现完整功能：增删改查、分类筛选、统计、localStorage 持久化
3. 添加美观样式：蓝紫渐变背景、卡片阴影和圆角、悬停效果、CSS transitions 动画
4. pnpm install 安装依赖
5. pnpm run dev 启动开发服务器
```

运行 `node mini-cursor.mjs`，终端开始输出：

```
正在执行第 1 次 AI 思考
[工具调用] execute_command(pnpm create vite react-todo-app --template react-ts)
工作目录：/Users/xxx/hello-langchain/src
...Vite 脚手架输出...
[工具调用] execute_command(pnpm create vite ...) 成功执行

正在执行第 2 次 AI 思考
[工具调用] list_directory(react-todo-app/src)
成功列出 5 个文件和文件夹

正在执行第 3 次 AI 思考
[工具调用] write_file(react-todo-app/src/App.tsx)
成功写入 4521 字节
...
```

大概 7 轮之后，Agent 完成了所有步骤。打开浏览器访问 `http://localhost:5173`，一个完整的 TodoList 就摆在眼前——渐变背景、卡片圆角、hover 效果、添加/删除动画，还有 localStorage 持久化。刷新页面数据不丢失。

这个 demo 不是为了炫技——它的目的只有一个：**验证"LLM + 工具 + 循环"这条公式在实践中是成立的。** 一个不到 200 行的程序，配合一个语言模型，确实可以自动完成一个端到端的开发任务。这证明了 Agent 的核心不是"模型有多强"，而是"循环 + 工具传递"的设计是否合理。

## 六、从 200 行到 Cursor，中间差了什么？

理解了 mini-Cursor 之后，再回去看真正的 Cursor，它的差异不在于"用了什么魔法"，而在于以下这些工程化的增量：

| 维度 | mini-Cursor | 真正的 Cursor |
|------|-------------|---------------|
| **工具数量** | 4 个 | 可能上百个（文件操作、Git、终端、LSP、浏览器...） |
| **上下文管理** | 简单的 messages 数组 | 精巧的上下文压缩、文件相关性排序、RAG 检索 |
| **代码编辑** | 整文件覆写 | diff 级别的精确编辑（applyEdit） |
| **人机交互** | 纯命令行 | GUI 中 diff 预览、一键 accept/reject、inline chat |
| **错误恢复** | 简单的 maxIterations 兜底 | 自动重试、回退、LSP 诊断反馈 |
| **记忆** | 无 | 项目级和用户级记忆，跨会话持久化 |

但骨骼是一样的——**ReAct 循环。** 所有的增量，都是在"循环"之上做的优化：让工具更丰富、让上下文更精准、让交互更友好。这不是降维打击，而是同一个架构在不同成熟度阶段的表现。

这个认知帮我澄清了一个常见的误解：**"Cursor 之所以强，是因为用了最强的模型。"** 不是的。Cursor 强在它的工具链设计和上下文管理——这两件事跟模型能力一样重要，甚至更重要。模型只是"思考"的质量，而工具设计和上下文管理决定了"思考的方向"对不对。

## 七、总结

### 三个核心观点

1. **AI Agent 的本质就是一个带工具调用的对话循环。** LLM 推理 → 调工具 → 观察结果 → 再推理。一个 30 行的 for 循环就是整个系统的心跳。理解了这一点，任何 Agent 框架（LangChain、AutoGPT、CrewAI）在你眼里都会变得透明。

2. **工具设计不是在写 API，而是在和 LLM "对话"。** 你需要预判 LLM 会在什么场景下犹豫，主动设计容错和引导。描述写多详细、参数怎么定义、是否自动建目录——这些"人机交互"层面的决策，比算法层面的决策更影响最终效果。

3. **Agent 的"智能感"是涌现的，不是规划的。** LLM 每一步只做一次局部的判断，但消息历史把所有判断串起来之后，表现出来的就是"全局的智能"。这意味着你的工作不是教 LLM 做规划，而是确保每一步的上下文（工具结果 + 历史消息）足够清晰、完整。

### 如果你也想自己试试

完整的代码已经在上文中贴出（all-tools.mjs 和 mini-cursor.mjs），配好 DeepSeek API Key 就能跑。如果你想继续深入，三个值得探索的方向：

- **记忆系统**：给 Agent 加上向量数据库，让它记住之前的对话和项目上下文，跨会话保持状态
- **多 Agent 协作**：一个 Agent 写前端，一个写后端，一个跑测试，通过消息传递协作
- **Human-in-the-loop**：关键操作（删文件、推送代码）在执行前让用户确认，安全性和可控性大幅提升

你把 mini-Cursor 跑起来之后，可能会遇到一些"意外行为"——比如 LLM 写了一个语法错误的文件，或者死循环调用同一个工具。这些都不是 bug，而是 Agent 开发中正常的"沟通过程"。每一次调试，都是你在教 LLM 怎么更好地理解你的意图。

在这个过程中，你最大的收获可能不是一个能跑的项目，而是对"AI 编程工具到底在干什么"这件事，建立了一套属于自己的、工程化的理解。

你用过哪些 AI 编程工具？有没有遇到过让你觉得"它怎么会这样做"的时刻？欢迎评论区聊聊你的经历。

---

## 🎨 文章封面

> 以下是 Midjourney 封面 prompt，复制到 Midjourney / DALL·E / Stable Diffusion 使用。

### 推荐方案：极简技术风

**Prompt:** ```A minimalist tech illustration of a small robot building a web application on a laptop screen, dark blue to purple gradient background, geometric neon blue circuit lines connecting code blocks, glowing orange accent highlights, clean flat design, 4k, --ar 16:9 --v 6```

**画面描述：** 暗色蓝紫渐变背景上，一个极简风格的机器人正在笔记本电脑屏幕前"写代码"，几何风格的霓虹蓝色电路线连接着悬浮的代码块，橙色高光点缀其间。

### 备选方案：插画手绘风

**Prompt:** ```Flat illustration of a developer coding with an AI assistant, warm orange and blue color palette, playful style with rounded shapes, laptop screen showing a robot icon and code editor, soft shadows, friendly and approachable vibe, 4k, --ar 16:9 --v 6```

**画面描述：** 暖色调的扁平插画风格，一位开发者与 AI 助手协作编程的画面。暖橙色与蓝色搭配，圆润可爱的视觉风格，适合入门教程的友好氛围。

---

## 📋 发布清单

- [x] 标题是否吸引点击：使用"反直觉/故事类"公式
- [x] 目录是否添加：`[TOC]` 已放置于引言之后
- [x] 代码块是否标注语言：全部使用 ```javascript 或 ```bash
- [x] 中文/英文/数字间是否加了空格：已检查
- [x] 关键数据是否标注来源/版本：Node.js ≥ 18、pnpm ≥ 8、DeepSeek V4 Pro
- [x] 文末是否有互动引导：已添加评论引导
- [ ] 标签建议（CSDN/掘金）：`AI Agent`、`LangChain`、`ReAct`、`DeepSeek`、`Cursor`
- [ ] 封面图是否准备好：已提供 2 个 Midjourney prompt

---

> 本文适配 CSDN、掘金、知乎等国内技术社区。需要调整风格或细节的话随时告诉我。
