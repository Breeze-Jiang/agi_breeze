# 学习总结：从多页跳转到手写 Hash 路由

## 1. 整体概览

本材料围绕一个问题展开：浏览器地址变化后，怎样不重新请求完整 HTML 页面，而只替换页面的一部分内容。

学习路径分为三步：

1. **多页应用（MPA）**：`index.html` 和 `about.html` 分别是独立页面，点击链接会请求并渲染新页面。
2. **Hash 与锚点**：URL 的 `#` 后部分可以改变，并触发 `hashchange` 事件；锚点还可定位长页面中的指定位置。
3. **简易 Hash 路由**：维护“路径 → 渲染函数”的路由表，监听 hash 变化后更新 `#container`，得到 SPA 的最小实现。

材料代码仅做静态分析，**运行未验证**。

## 2. 知识地图

```text
普通链接 href="about.html"
  → 浏览器导航到另一个 HTML 页面

Hash 链接 href="#/page1"
  → URL 变为 #/page1
  → hashchange 事件
  → Hashrouter.load()
  → routers['/page1']
  → 修改 #container 的内容
```

## 3. 核心概念

### 3.1 多页应用与 SPA

材料中的 `demo/index.html` 和 `demo/about.html` 使用普通 URL 链接切换页面。它们各自包含完整 HTML 结构，因此导航时浏览器会加载另一份文档。

SPA（Single Page Application，单页应用）的思路不同：HTML 页面壳通常只加载一次，后续根据路由修改某个挂载点中的 DOM 或组件。材料将该挂载点命名为 `container`。

### 3.2 URL 中的 Hash

材料笔记将 URL 拆为：

```text
protocol://host/path?queryString#hash
```

其中 hash 从 `#` 开始。例如 `#/page2` 中：

```js
location.hash // '#/page2'
location.hash.slice(1) // '/page2'
```

改变 hash 会更新地址栏并记录浏览历史，但不会按普通页面导航那样重新请求整个 HTML 文档；浏览器会触发 `hashchange` 事件。

### 3.3 锚点与 Hash 路由的关系

`demo2/demo.html` 展示了 hash 最初的锚点用途：`href="#bottom"` 跳到页面中 `name="bottom"` 的位置。Hash 路由复用了“hash 可变化且可监听”的能力，但不再把 hash 用于页面内滚动，而是把它当作前端路径，例如 `#/page1`。

### 3.4 路由表

`Hashrouter` 用对象保存路由：

```js
this.routers = {}

register(hash, callback) {
  this.routers[hash] = callback
}
```

注册 `/page1` 后，本质是保存：

```text
'/page1' → 显示“页面一”的函数
```

这就是最小的“路由匹配表”。

### 3.5 为什么事件回调需要 `bind(this)`

材料在构造函数中注册事件：

```js
window.addEventListener('hashchange', this.load.bind(this))
```

`load` 被浏览器作为事件回调调用时，如果不绑定 `this`，函数内部无法可靠访问当前路由器实例的 `this.routers`。`bind(this)` 返回一个新函数，并固定其中的 `this` 为 `Hashrouter` 实例。

在 `load()` 中使用 `handler.call(this)` 也是同一类思路：调用匹配到的路由回调时，把回调内部的 `this` 指向路由器实例。当前回调没有使用 `this`，因此直接调用 `handler()` 也能渲染；`call` 是为后续扩展保留的上下文控制。

## 4. 简易 Hash 路由的数据流

材料中的关键逻辑可抽象为：

```js
load() {
  const hash = location.hash.slice(1)
  const handler = this.routers[hash]
  handler.call(this)
}
```

当用户点击：

```html
<a href="#/page2">首页</a>
```

执行顺序是：

1. URL 的 hash 变成 `#/page2`；
2. `hashchange` 触发；
3. `load()` 用 `slice(1)` 得到 `/page2`；
4. 从 `this.routers` 取出 `/page2` 对应的函数；
5. 函数修改 `container.innerHTML`，页面局部更新。

例如材料注册的回调：

```js
router.register('/page2', function () {
  container.innerHTML = '<h1>页面二</h1>'
})
```

这段代码来自 `demo2/index.html`，展示了“路由路径 → 挂载点渲染”的最小闭环。

## 5. 实践要点

### 路由代码需要处理默认页和 404

材料当前的 `load()` 对空 hash 没有赋值给 `handler`，仍会继续执行：

```js
handler.call(this)
```

静态分析可知：首次打开页面时没有 hash，或访问未注册路径时，`handler` 可能是 `undefined`，调用 `.call` 会报错。可以改为：

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

### 首次进入也要主动渲染

`hashchange` 只在 hash 发生变化时触发。注册完路由后应主动调用一次：

```js
router.load()
```

否则直接打开带 hash 的地址或首次进入默认页，可能不会渲染预期内容。

### DOM 拼接只适合学习示例

材料使用 `container.innerHTML` 快速切换页面，适合理解原理。实际项目通常交给 Vue Router、React Router 等路由库渲染组件，并结合路由守卫、懒加载、嵌套路由等能力。

## 6. 易混淆点、未知信息和下一步

| 易混淆点 | 说明 |
| --- | --- |
| Hash 与锚点 | 锚点用于定位页面位置；Hash 路由把 hash 当作前端路径。 |
| Hash 路由与 History 路由 | 都能实现 SPA；Hash 路由使用 `#` 和 `hashchange`，History 路由使用 `pushState` 等 API，部署时通常需要服务端回退配置。 |
| `bind` 与 `call` | `bind` 返回绑定 this 的新函数，适合注册回调；`call` 立即执行函数，并临时指定 this。 |
| URL 改变与页面刷新 | 普通链接通常导航到新文档；仅改 hash 不会按普通导航重新加载文档。 |

### 材料范围

- **深读**：`readme.md`、`demo/index.html`、`demo/about.html`、`demo2/demo.html`、`demo2/index.html`。
- **浅读**：目录结构，仅用于确认材料组成。
- **补读**：无。
- **跳过**：无关二进制、依赖和构建产物；目录中未发现这些材料。

### 事实边界

- **材料事实**：项目包含普通多页链接、锚点 hash 事件和手写 `Hashrouter` 示例。
- **外部事实**：SPA、Hash 路由和 History 路由的通用定义属于 Web 开发通识，未额外联网核验。
- **合理推断**：空 hash 与未知路由会使当前 `handler.call(this)` 失败；结论依据源码控制流。
- **未知**：未运行示例，未知实际浏览器表现、目标浏览器范围与后续是否计划接入路由框架。

### 下一步

1. 为 `load()` 增加默认路由和 404 分支；
2. 在全部 `register()` 后调用 `router.load()`；
3. 试着加入 `#/user/123` 的动态参数匹配；
4. 对比学习 `history.pushState()`，理解 Vue Router 的两种路由模式。
