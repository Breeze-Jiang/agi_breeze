# deepseek-r1-webgpu

简历中的超燃项目，将覆盖以下技能

## 端侧模型
有别于openai，deepseek api调用
llm在远程，和调用端分离 ，和调用客户端不在一起
- 贵
- 不安全
  context 会随着请求发送到

ollama 本地开源模型，在用户端，端侧模型
手机端，汽车端，agent 任务 划分的 
开源小参数模型就能完成这些任务
浏览器端，随时下载，随时使用
webgpu

## react + ts
ai时代的大型项目首选前端技术
  - react 比vue 难入门
  - 大型项目
  - ai

### 新建项目
react + ts + eslint （代码约束，大公司必备，代码风格一致）
'' ""; eslint 约束代码风格

## tailwindcss
几乎不再需要写css，原子css类， 

## react 组件化
搭积木的方式搭建页面，是由一组html，css ，js 组合在一起，成为一个组件，一个功能单位

vue不同，它是template ， script ，style 三明治结构 一个文件 所以vue好入门

react呢？
封装一个组件（函数）， 函数就是组件
函数 返回html 就是 组件 
函数的return 之前 js部分， css 引入样式



## src/：你主要写业务代码的地方
- App.tsx ：根组件，页面主体通常从这里开始写。
- main.tsx ：项目入口，负责把 <App /> 挂载到 HTML 页面。
- App.css ： App.tsx 的样式文件。
- index.css ：全局样式，如页面默认边距、字体；接入 Tailwind 后通常也会在这里引入它。
- assets/ ：放会被代码 import 的图片、图标等资源。
开发时最常改： App.tsx 、组件文件、 index.css 。

## tailwindcss 运行原理
- 不是原生css
- 原子类css框架，提供唯一的css类名（原子类）
- 不用写css ， 选择器， css rules太低效了
- vite 插件就可以使用了，将我们声明的类名 它的样式提取出来，加到代码里
- 原子类名

tailwindcss 已经成为了 vibe ui 的基本构成
- className
  class是js里的类名（oop）关键字，函数里面写jsx
  所以不能用class，理解为你要声明一个js类

- jsx 
  jsx 是react 专用（模板）语法，能在js代码里面直接写html 标签，编译后转为原生dom 操作
  react 最为骄傲的一大特性之一，非常方便的表达UI 界面
  JavaScript with xml
  <div></div> 是html 特有的xml


## react 合成事件 
- onClick 最原始的 DOM 0级事件监听   缺点：HTML、JavaScript 混在一起，不利于维护；实际项目中通常不推荐。
  html,css,js 不要耦合在一起
- DOM 1 ?
  DOM n ? html 标准的执行迭代
  DOM 1 这个版本没有更新事件相关
- addEventListener DOM 2级 事件监听
同一dom元素可以多次监听同一事件

所以原生的只有 onclick 和addEventListener DOM 2 级事件监听

- react 代码洁癖 ， 直接用已有概念 
onClick 
- react 里的时间并不是原生事件，是合成事件

## 封装进度条组件
比较独立，可复用的业务模块
把它单独app.vue 中抽离出来，作为组件

## 组件树
- 代替DOM 树
- 基于组件封装的组件树
  一眼看出来页面的组件构成
  页面的组件化程度，粒度 
  前端发展的必然
  页面及交付越来越复杂，组件作为开发的最小单元
  团队好协作，好复用，好维护
  
## 进度条组件
- 容器 100%
- 子元素（进度条，宽度 props percentage 来长大）
设计组件
percentage 使用es12 提供的控制合并运算符 ??=
如果percentage 为 undefined 或 null，就赋值为 0
如果percentage 不为 undefined 或 null，就保持原值
初始化的时候，没有下载进度这个概念 没传percentage，就默认是 0
封装者多考虑， 使用者用的

## 两种数据
- state 状态数据
  useState 声明 组件的自有状态 ， 组件自己大力
  
- props 属性数据
  从父组件传递到子组件的属性，不能在子组件里修改
  报告父组件， 才可以修改
- 子组件主要负责展示，父组件给我什么props，就显示什么
- 组件的封装和健壮性 做的好， 


App.tsx 中的 Tailwind 类名
          ↓
@tailwindcss/vite 扫描并生成所需 CSS
          ↓
Vite 把 CSS 提供给浏览器
          ↓
页面显示样式

当你保存代码时，Vite 的 HMR（热更新）会让插件重新生成受影响的 CSS，浏览器通常无需整页刷新。