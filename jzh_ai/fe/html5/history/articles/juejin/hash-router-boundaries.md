# 手写 Hash 路由时，真正要补的不是监听，而是默认页和 404

写出 `window.addEventListener('hashchange', ...)` 后，很多人会以为简易路由器已经完成了。但真正决定它是否可靠的，是两个经常被省略的边界：首次进入页面时没有触发 `hashchange`，以及路径没有注册时拿到的是 `undefined`。

本文基于一个 HTML + JavaScript Hash 路由练习，拆解路由表、事件回调的 `this` 绑定，以及默认路由和 404 的最小处理方式。材料只做静态分析，**运行未验证**。

## 先把路由器还原成三个职责

这个练习里的 `Hashrouter` 并不复杂，它只做三件事：

```text
注册路径
监听 hash 改变
匹配路径并更新挂载点
```

路由表由一个普通对象承载：

```js
register(hash, callback) {
  this.routers[hash] = callback
}
```

例如：

```js
router.register('/page3', function () {
  container.innerHTML = '<h1>页面三</h1>'
})
```

这并不是“页面文件和 URL 的映射”，而是：

```text
'/page3' → 一个修改 #container 的函数
```

因此它可以在同一份 HTML 中完成局部内容切换，这正是 SPA 的最小形态。

## 为什么点击链接后能切页面

HTML 中的：

```html
<a href="#/page2">首页</a>
```

会让地址变为 `#/page2`。路由器监听到变化后读取：

```js
location.hash // '#/page2'
```

再通过：

```js
location.hash.slice(1) // '/page2'
```

把 `#` 去掉，才能与注册时的路径键一致。

最后，路由器从 `this.routers['/page2']` 取到回调并更新 `container.innerHTML`。这条链路可以记成：

```text
hash → hashchange → load → routers[path] → container
```

## `bind(this)` 不是装饰，是上下文保证

练习中注册事件的写法是：

```js
window.addEventListener('hashchange', this.load.bind(this))
```

事件触发后，浏览器会调用回调。若把 `this.load` 直接传出去，`load()` 内部不应假设 `this` 仍然是 `Hashrouter` 实例；那么：

```js
this.routers
```

就无法可靠使用。

`bind(this)` 返回一个绑定好上下文的新函数，使 `load()` 访问到的是路由器实例。至于路由回调的：

```js
handler.call(this)
```

则是把同一个实例上下文继续交给处理函数。当前处理函数只操作 `container`，并未使用 `this`，所以不是必需；但它说明了 `call` 的用途：立即执行函数并指定 this。

## 最容易漏掉的两个分支

当前练习中的核心逻辑近似：

```js
let hash = location.hash.slice(1)
let handler

if (!hash) {
} else {
  handler = this.routers[hash]
}

handler.call(this)
```

问题不在路由表，而在最后一行没有判断 `handler` 是否存在。

### 空 hash：首次打开页面

首次进入 `/index.html` 时，hash 可能为空。此时 `handler` 没有被赋值，再调用 `.call()` 就会失败。

### 未知路径：地址拼错或手动输入

即使 hash 不为空，`#/unknown` 也找不到对应回调，结果同样是 `undefined`。

把两个边界放进 `load()`：

```js
load() {
  const path = location.hash.slice(1) || '/page1'
  const handler = this.routers[path]

  if (handler) {
    handler.call(this)
    return
  }

  container.innerHTML = '<h1>404：页面不存在</h1>'
}
```

这样就有了明确行为：

| 访问状态 | 处理结果 |
| --- | --- |
| 没有 hash | 重定向到逻辑默认页 `/page1` |
| 路径已注册 | 执行该路径的渲染函数 |
| 路径不存在 | 渲染 404 内容 |

## 再补一个容易忽略的初始化动作

`hashchange` 只描述“变化”，不描述“页面刚加载”。所以全部注册完成后还需要：

```js
router.load()
```

它让路由器在第一次渲染时就根据当前 URL 决定页面内容，也使复制 `#/page2` 的直达链接具有意义。

## 从锚点到路由：不要混淆用途

同一份材料中还有 `#top`、`#bottom` 示例。它们是传统锚点：页面滚动到指定位置。Hash 路由复用的是 hash 的 URL 状态和事件能力，但它把 `#/page1` 解释成前端页面标识，而不是 DOM 定位标识。

| 场景 | hash 示例 | 目标 |
| --- | --- | --- |
| 锚点 | `#bottom` | 定位到长页面中的元素 |
| Hash 路由 | `#/page2` | 匹配路由并替换内容 |

## 一份最小验收清单

写完 Hash 路由后，可以逐项检查：

- [ ] 点击 `#/page1` 会更新 URL；
- [ ] `hashchange` 被注册；
- [ ] `load` 中能拿到去掉 `#` 的路径；
- [ ] 路由表的 key 与路径一致；
- [ ] 回调里的 `this` 上下文可控；
- [ ] 空路径有默认页；
- [ ] 未匹配路径有 404；
- [ ] 路由注册完成后主动执行一次 `load()`。

## 结尾：理解机制后再使用路由库

Hash 路由适合理解前端路由的底层结构，也适用于对服务端配置要求低的简单场景。实际 Vue 或 React 项目一般使用路由库，因为还需要嵌套路由、组件渲染、守卫、懒加载与 History 模式。

但不论用什么框架，路由的核心都没变：**把 URL 当状态，根据状态匹配规则，再渲染对应视图。**

**摘要：** 从一个手写 `Hashrouter` 练习出发，理解 hashchange、路由表和 this 绑定；重点补齐首次加载、默认路由与 404，避免 `handler.call()` 对 undefined 的错误调用。

**标签：** JavaScript、SPA、前端路由、浏览器原理
