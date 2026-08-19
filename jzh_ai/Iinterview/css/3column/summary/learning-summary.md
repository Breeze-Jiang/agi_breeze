---
type: learning-summary
title: "CSS 三栏布局与格式化上下文"
aliases: ["CSS 三栏布局·学习总结"]
tags: [learning, CSS, layout, BFC, Flexbox, Grid]
source_scope: "Iinterview/css/3column"
coverage:
  deep_read: ["1.html", "2.html", "readme.md"]
  shallow_read: []
  supplement: []
  skipped: []
review_status: learning
next_review: null
---

## 一页速览

> [!summary]
> - 目标布局是左右固定宽度、中间自适应。
> - Flex 一维布局最直接；Grid 能直接声明三列轨道。
> - BFC 是块级布局的独立格式化环境，不等于块级元素。
> - `display: flex` 创建 Flex Formatting Context，`display: grid` 创建 Grid Formatting Context，不应统称为传统 BFC。
> - 现有两个 HTML 都是不完整示例，浏览器运行未验证。

导航：[[#学习范围]] · [[#知识地图]] · [[#核心知识]] · [[#重点语法与 API]] · [[#面试高频知识]]

## 学习范围

- **深读**：`readme.md`，三栏目标与格式化上下文笔记；`1.html`，Flex 结构；`2.html`，Grid 注释。
- **浅读/补读/跳过**：无，目录内三个文件均已读取。
- **未知**：没有截图、浏览器测试结果和兼容性目标。
- **冲突**：笔记将 BFC、Flex Formatting Context、Grid Formatting Context 混合描述；代码也没有完成三栏尺寸规则。

## 知识地图

```text
三栏布局
├─ 布局目标：左固定 + 中间自适应 + 右固定
├─ Flex：一维主轴分配空间
├─ Grid：直接声明三列轨道
├─ Float：传统实现，需要处理浮动与宽度计算
└─ 格式化上下文
   ├─ BFC：块级布局环境
   ├─ FFC：Flex 子项布局环境
   └─ Grid Formatting Context：Grid 子项布局环境
```

## 核心知识

### 三栏布局的验收标准

材料目标是 PC 端常见三栏：左右栏固定，中间栏占据剩余空间（E1）。仅写三个语义标签不能完成布局，还要定义列宽和中间列伸缩行为。

### Flex 方案

`1.html` 已有 `.layout { display: flex; }`，因此三个直接子元素会成为 flex items（E5），但还缺少：

```css
.sidebar { flex: 0 0 200px; }
.main { flex: 1; min-width: 0; }
```

`flex: 1` 让中间列吸收剩余空间；`min-width: 0` 允许中间项在内容较长时收缩，避免撑破布局。这是基于材料目标的外部补充，源码尚未包含。

### Grid 方案

Grid 可直接表达轨道：

```css
.layout {
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr) 200px;
}
```

材料只提到 Grid 适合二维布局，未提供实现（E6）。三栏本身是一维问题，Flex 和 Grid 都适合；Grid 的优势是列定义更直观。

### BFC 到底是什么

BFC（Block Formatting Context）是块级格式化上下文，是一块按块级布局规则计算的独立区域，不等于 `display: block` 元素。

常见创建方式包括 `display: flow-root`、浮动元素、绝对定位元素，以及 `overflow` 不为 `visible`/`clip` 的块级元素等。现代代码若只为显式创建 BFC，优先考虑 `display: flow-root`。

BFC 常用于：包含内部浮动、隔离部分外边距折叠、避免块盒与浮动重叠。它不是解决现代三栏布局的首选工具。

### 三种格式化上下文不能混称

- `display: flex`：创建 Flex Formatting Context。
- `display: grid`：创建 Grid Formatting Context。
- `display: flow-root`：创建 BFC。

它们都规定内部子元素如何布局，但使用不同布局算法。笔记中“block 元素 + display:flex/grid 都开启新 BFC”的表述不准确（E4）。

### 内容优先与源码顺序

笔记希望 `main` 最先加载（E1），但 `1.html` 的 DOM 顺序是左栏、主内容、右栏（E5），所以现有代码不满足“主内容源码优先”。视觉顺序与 DOM 顺序应谨慎分离，因为 DOM 顺序还影响键盘导航和阅读器体验。

## 重点语法与 API

| 语法 | 来源 | 作用 | 易错点 |
| --- | --- | --- | --- |
| `display: flex` | [材料中出现] | 建立 Flex 布局 | 创建 FFC，不是传统 BFC |
| `flex-direction` | [材料中出现] | 设置主轴方向 | 三栏默认 `row` 即可 |
| `justify-content` | [材料中出现] | 分配主轴剩余空间 | 不能代替中间列 `flex: 1` |
| `align-items` | [材料中出现] | 控制交叉轴对齐 | 不负责列宽 |
| `float` | [材料中出现] | 使元素浮动 | 会脱离普通流的块级布局，需要处理包含问题 |
| `overflow: hidden` | [材料中出现] | 裁剪溢出，也可能创建 BFC | 可能误裁剪内容，不能只为清浮动盲用 |
| `display: grid` | [材料推导] | 建立 Grid 布局 | 材料没有实际实现 |
| `display: flow-root` | [外部补充] | 明确创建 BFC | 比副作用明显的 `overflow:hidden` 更语义化 |

## 注释重点解读

`1.html` 注释“开启新的格式”方向基本正确，但应准确写成“建立 Flex Formatting Context”。

`2.html` 注释认为 Grid 可定义二维布局，这个方向正确；但“旧的 BFC 不好做 GFC”容易误导。更准确的理解是：BFC、Flex、Grid 是不同布局机制；三栏应直接选择 Flex 或 Grid，而不是让 BFC 与 Grid 竞争。

> [!warning]
> 笔记中的“float、position、overflow 都能开启 BFC”缺少条件。例如普通 `position: relative` 不创建 BFC，`float: none` 也不创建 BFC。

## 面试高频知识

### 如何实现左右固定、中间自适应？[材料推导]

Flex：容器设置 `display:flex`，左右栏固定 `flex-basis`，中间栏设置 `flex:1; min-width:0`。Grid：使用 `grid-template-columns: 200px minmax(0,1fr) 200px`。

### BFC 是什么？[材料中出现 + 外部纠正]

BFC 是独立的块级格式化上下文，内部块盒按其规则布局；常用于包含浮动、隔离外边距折叠及避免与浮动重叠。它不等于块级元素。

### Flex、Grid 会创建 BFC 吗？[外部补充]

不会创建传统 BFC；它们分别建立 Flex 和 Grid 格式化上下文。Flex/Grid 容器本身可能对外参与其他格式化上下文，但其内部采用自己的布局算法。

### 为什么中间栏常写 `min-width: 0`？[外部补充]

Flex item 默认最小尺寸可能受内容影响，长文本可能使中间栏无法继续收缩。`min-width:0` 允许其缩小到内容固有宽度以下。

## 复习卡片

> [!tip] 问：BFC 和块级元素相同吗？
> 答：不同。块级元素是盒的外在显示类型之一，BFC 是内部布局环境。

> [!tip] 问：`display:flex` 创建什么？
> 答：Flex Formatting Context。

> [!tip] 问：三栏 Flex 的核心是什么？
> 答：左右不伸缩且固定基准宽度，中间 `flex:1` 吸收剩余空间。

> [!tip] 问：为什么不推荐用 `overflow:hidden` 专门清浮动？
> 答：它会裁剪溢出内容；只为创建 BFC 时可优先 `flow-root`。

> [!tip] 问：现有示例完成了吗？
> 答：没有。Flex 示例缺宽度规则，Grid 示例没有 CSS 实现。

## 实践与复习计划

- [ ] 当天：补全一版 Flex 三栏，验证左右固定、中间伸缩。
- [ ] 1 天后：用 Grid 重写，并比较两版代码表达。
- [ ] 3 天后：手写 BFC、FFC、Grid Formatting Context 的区别。
- [ ] 7 天后：口述面试题“如何实现三栏布局，并说明内容优先与可访问性”。

> [!question]
> 当前材料没有浏览器运行结果；布局表现、窄屏行为和长内容溢出均未验证。
