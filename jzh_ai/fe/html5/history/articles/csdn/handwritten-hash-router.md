# 手写 Hash 路由：把 `#/page1` 变成局部页面切换

很多初学者第一次接触 SPA 时，会把“路由”理解成页面跳转。但普通链接跳转到另一个 HTML 文档，和前端路由在一个页面里切换内容，并不是同一件事。

这篇文章用一个 HTML + JavaScript 示例串起多页跳转、Hash 事件和手写路由表。你会知道 `hashchange`、`bind(this)`、`register()` 和 `container.innerHTML` 分别在解决什么问题。文中示例来自本地学习材料的静态分析，**运行未验证**。

[TOC]

## 先看区别：多页跳转与单页切换

普通多页应用会把链接指向另一个 HTML 文件：

```html
<a href="index.html">首页</a>
<a href="about.html">关于我们</a>
```

点击后，浏览器导航到另一份文档；材料中的 `demo/index.html` 与 `demo/about.html` 就是这一模式。

SPA 的目标则是：页面外壳保留，只替换一个挂载点中的内容。材料把该挂载点写成：

```html
<div id="container"></div>
```

此时需要一个“地址变化 → 找到对应内容 → 更新挂载点”的机制，这就是前端路由的最小职责。

## Hash 为什么可以做前端路由

URL 中 `#` 之后的部分叫 hash：

```text
http://localhost:5500/#/page2
                         ^^^^^^ hash
```

浏览器提供两个关键能力：

1. 改变 hash 会改变地址栏；
2. hash 改变时触发 `hashchange` 事件。

材料中的锚点页已经验证了监听方式：

```js
window.addEventListener('hashchange', function () {
  console.log(event.newURL)
  console.log(event.oldURL)
})
```

锚点本来用于定位长页面的某个位置，例如 `#bottom`。Hash 路由只是把它改作前端路径：`#/page1`、`#/page2`。

## 路由表：路径对应一个渲染函数

手写路由器首先要保存规则。材料中的 `Hashrouter` 使用对象作为路由表：

```js
class Hashrouter {
  constructor() {
    this.routers = {}
  }

  register(hash, callback) {
    this.routers[hash] = callback
  }
}
```

注册路由：

```js
router.register('/page2', function () {
  container.innerHTML = '<h1>页面二</h1>'
})
```

注册完成后可以理解为：

```text
'/page2' → 显示“页面二”的函数
```

这就是路由系统最核心的数据结构：**路径到处理函数的映射**。

## 从 hash 到页面内容的完整调用链

导航链接：

```html
<a href="#/page2">首页</a>
```

路由器监听地址变化：

```js
window.addEventListener('hashchange', this.load.bind(this))
```

再由 `load()` 完成匹配：

```js
load() {
  const hash = location.hash.slice(1)
  const handler = this.routers[hash]
  handler.call(this)
}
```

完整链路如下：

```text
点击 #/page2
→ hash 改为 #/page2
→ 触发 hashchange
→ load() 执行
→ slice(1) 得到 /page2
→ 取到 routers['/page2']
→ 修改 #container
```

其中：

```js
location.hash // '#/page2'
location.hash.slice(1) // '/page2'
```

`slice(1)` 的目的只是去掉开头的 `#`，让结果和注册时的 `/page2` 保持一致。

## `bind(this)` 到底在防什么

如果直接把方法交给事件监听器：

```js
window.addEventListener('hashchange', this.load)
```

事件发生后，`load` 不是由路由器实例主动调用的。此时函数内部的 `this` 不能可靠地指向 `Hashrouter` 实例，就无法安全读取：

```js
this.routers
```

因此材料使用：

```js
this.load.bind(this)
```

`bind(this)` 会返回一个新函数，并把其中的 `this` 固定为当前路由器实例。

材料里的：

```js
handler.call(this)
```

也是指定函数执行上下文的方式。当前页面回调没有使用 `this`，直接 `handler()` 也能工作；`call(this)` 的价值在于为未来的路由回调访问实例状态预留能力。

## 当前示例有两个必须补的边界

### 1. 空 hash 会让 `handler` 为空

材料当前逻辑在没有 hash 时没有给 `handler` 赋值，但后面仍调用：

```js
handler.call(this)
```

静态分析可知，空 hash 或未注册路径时可能出现运行时错误。可改成：

```js
load() {
  const hash = location.hash.slice(1) || '/page1'
  const handler = this.routers[hash]

  if (handler) {
    handler.call(this)
  } else {
    container.innerHTML = '<h1>404：页面不存在</h1>'
  }
}
```

这段代码同时解决：

- 首次打开没有 hash：进入默认页；
- 地址写错：显示 404，而不是报错。

### 2. `hashchange` 不负责首次渲染

`hashchange` 只在 hash **发生改变后**触发。路由注册完后应主动执行一次：

```js
router.load()
```

否则首次打开页面时，`container` 可能还是空的。

## 一张可复用的自检表

| 检查项 | 目的 |
| --- | --- |
| 链接是否写成 `#/path` | 让 URL 改变并触发 hashchange |
| 注册路径是否与 `slice(1)` 结果一致 | 确保 `/page1` 能匹配到回调 |
| 是否使用 `bind(this)` | 确保事件回调能访问路由器实例 |
| 是否提供默认路由 | 避免首次访问空白或报错 |
| 是否处理未知路由 | 避免 `undefined.call()` |
| 注册后是否执行 `router.load()` | 支持首次渲染和直达链接 |

## Hash 路由和 History 路由怎么选

Hash 路由的优势是简单：浏览器天然提供 `hashchange`，部署时通常不需要服务端为前端路径额外回退 HTML。

但地址会带 `#`。现代框架还支持 History 路由，通常使用 `pushState` 修改路径，URL 更接近普通站点；相应地，直接访问 `/about` 时往往需要服务端回退到入口 HTML。这是后续学习 Vue Router、React Router 时需要理解的部署差异。

## 结语

手写 Hash 路由不等于要在项目里重复造框架。它真正的价值是建立一条清晰的认知链：

```text
URL 状态 → 事件监听 → 路径匹配 → 组件或 DOM 渲染
```

先把默认路由、404 和首次渲染补齐，再去学习 Vue Router 的路由配置与 History 模式，你会更容易理解路由库到底帮我们封装了什么。

**标签：** `JavaScript`、`前端路由`、`Hash路由`、`SPA`
