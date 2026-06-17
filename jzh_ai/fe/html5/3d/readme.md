# 3d 
- canvas
html5 新增标签，js api绘制

# css 3d
哪怕是2d的界面，有时我们也会手动3d化

### 布局layout
- 外层盒子布局
- 内层 展示

### 水平垂直居中
- 父容器
  body 100% 100vh（css3新单位）
  都分为100份，1份为1vh（等比例）
  移动端适配
  viewport-height 视口高度
  vw viewport-width 视口宽度
- 子元素
## 行内/块级
- html 元素有两种 行内 块级
div ul 等块级
span 等行内
- 块级 block 盒子
  - 可以设置宽高
  - 独占一行
- 行内 inline
  - 不可以设置宽高
  - 也不会把兄弟元素挤下去
- display 属性
  flex 开启弹性格式上下文
  inline-block 行内块
  - 可以设置宽高
  - 不会独占一行
浏览器默认块级/行内元素->手动切换inline/block ->
格式化上下文（flex/inline-block/grid）
