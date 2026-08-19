# 3列布局
- PC端常见的布局方案
- 左右两列指定宽度， 中间自适应宽度
- main 最先加载 中间先渲染，最快看到最有效的内容，
- 左右两侧往往是广告，导航，可以晚一点加载，不影响用户阅读。

考察 flex & grid & Float  

## BFC
- Block Formatting Context
  - 块级化上下文
  - 用于解决浮动问题，清除浮动，避免元素重叠。
  - 例如：
  - float: left;
  - float: right;
  - overflow: hidden;

- Flex Formatting Context
  - 弹性化上下文
  - 用于解决弹性布局问题，清除弹性布局问题。
  - 例如：
  - display: flex;
  - flex-direction: column;
  - justify-content: center;
  - align-items: center;

整个网页从html 开始， html是根，开启了第一个格式化上下文 BFC
块级元素从上到下，行内元素从左到右排列 最基本的文档流

一个块， 加上多列？ inline 不适合做盒子（容器）
局部布局方案，可以开启一个新的BFC **不等于Block 元素**
block 元素 + display: flex | grid | table ... float : left
position, overflow: hidden  这些都可以开启一个新的BFC
新的格式化上下文， 有自己的主意（格式化）
外层BFC 格式化上下文不会影响到内部的新的格式化上下文