# 大前端手里的next.js
Next 是React 全栈框架，Nuxt 是Vue 全栈框架，Nest 是Node.js 全栈框架
NextJS 适合做全栈项目，可以写页面（前端），也可以写API（后端）
背靠Vercel，seo做的非常棒，很多AI产品用NextJS 做官网
## SEO 搜索引擎优化
SPA好处
体验很好，组件是在前端挂载(useEffect去异步请求数据), 不需要刷新页面
前端路由的支持,让页面切换效果更好
SPA短板
像Native 移动端App  Android ios 
SPA 抄的原生App 体验做的和原生App 一样好
在大部分app 里有80%的页面使用SPA
原生的要写要写两套,WebView 组件 用于显示网页, 前端来做
现在做的前端根本就不是为了SEO 不是用浏览器搜索引擎推荐打开(baidu,google  在pc时代是流量的路口  SEO 就是最关键的)
在移动端时代(超级app 20% 原生, 80% SPA)
html 只需要写一次, 不需要写两套
SEO 非常差,没有SEO  #root 节点
ai 超级厉害, opc 产品多如牛毛, ai agent 产品站点
seo 去推广
掘金产品
csdn 老牌的内容类的网站
流量来自seo 
主流的spa 开发之外,全栈seo 良好的next.js (nuxt.js)

#root (spa) -> seo (react jsx -> html)(next.js)

## 创建全栈项目
npx create-next-app@latest
选择的是默认配置
nuxt react 全栈框架
react / react-dom react 界面
ts
tailwindcss
eslint 代码风格规范

GEO Generative Engine Optimization
用户入口:豆包
生成的时候,带上我们的内容,购买链接
- SEO 友好 怎么实现
  - SPA #/todos
  Routes
    Route path="/todos" element={<Todos />} />
    懒加载Todos组件, 在前端(client 客户端) 挂载, 不需要刷新页面
    index.html #root script src="main.js"
    CSR (client side rendering) 客户端渲染'
    Server 前端项目所在的服务器 / index.html
    爬虫通过url 来爬取的时候 #/root script
    Client 用户的浏览器 用户看得到的页面, main.js app.jsx todos.jsx
    在client 端的运行 CSR Client Side Rendering  客户端渲染

java 全栈
  server , 3000
  /todos 后端路由
  controller 处理请求,service mysql 查询
  todos 数据? seo需要的
  react dom 才是前端
  react 是js node 的方式
  react 组件只要不做事件监听, 不做useEffect ,
  组件函数 + todos 数据 模板的编译在一起就好
  服务器端不是dom 是字符串的格式化
  前后端分离 /todos api todos json 数组
  全栈项目/ todos 返回的就是 react 组件编译过后的html 
  jsx + todos (数据) = 服务器 UI html
  SSR (server side rendering) 服务器端渲染

## CSR 和 SSR
SEO 的根本
组件到底在哪里渲染
CSR client 客户端 浏览器  SPA
SSR server 服务器 服务端  Next.js

## next.js 语法
约定俗成
- App Router
不需要建, 文件就是路由, 嵌套路由 就建立子文件夹 pages/about
  page.jsx 就是页面
  nav 公用的, layout 布局文件
  next.js 是给react 开发者的开箱即用的利器
  渲染规则:
  /about 后端路由
  /about/page.jsx 组件编译 tsx -> html

## SEO 的基本做法
第一层 你是谁? title 做什么的? description 有什么价值提供? keyword
<title>这是一个标题</title>
<meta name="description" content="这是一个描述" />
<meta name="keywords" content="这是一个关键词" />
第二层 
做内容 用户来的原因
第三层
ssr 服务器端渲染
/post/:id 一个页面 千万篇文章 ssr 整站被seo 收录的内容给你加权


## 客户端组件
next.js 将react server component 带到服务器端渲染,ssr 开发模式

有些页面 强交互
'use client'声明
不只是在浏览器渲染, 现在服务器端把能渲染的渲染完,再去客户端渲染,
Hydration 水合:浏览器拿到静态HTML 之后,挂载客户端 js,绑定点击事件, 激活交互;
csr 组件会执行两次, 一次在服务器端, 一次在客户端, 客户端会覆盖服务器端的渲染



纯 React SPA（Vite）      vs      Next.js（即便是 'use client'）
─────────────────────────────────────────────────────────────
服务器只返回空 #root        │  服务器会先渲染一遍组件，把能渲染的
内容等浏览器跑 JS 才出现    │  静态内容塞到 HTML，再返回
                           │
源码里什么都没有 ❌         │  源码里能看到静态内容 ✅ 即和state 无关的部分
                           │  动态部分（state）初始值占位


### Next.js 对客户端组件的处理流程
步骤 1【服务器端】：
  把客户端组件在服务器上"静态执行"一次
  - 不执行 useEffect（因为这是浏览器 API）
  - useState 取**初始值**（所以 todos 是 []）
  - 把能渲染出来的 JSX（<h1>、空 <ul>）拼成 HTML
  ↓
步骤 2【返回给浏览器】：
  返回已经带内容的 HTML（<h1>在里面）
  ↓
步骤 3【浏览器端】：
  显示 HTML（用户立刻看到标题）
  下载 JS bundle
  Hydration：把静态 HTML 激活成 React 组件
  useEffect 触发 → fetch 数据 → setTodos → 列表出来


服务端组件  →  带内容 HTML  ✅ 对
客户端组件  →  空 HTML       ❌ 不对（Next.js 里不空，纯 SPA 才空）

