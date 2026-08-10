# JavaScript 单例模式：用静态属性保证 Popup 只创建一次

在 JavaScript 中，很多初学者会把单例模式理解成“只能 `new` 一次”。更准确的说法是：**把实例的创建和获取集中到一个入口，让业务代码共享同一个对象。**

本文根据一个 `Popup` 示例解释 `static`、`getInstance()` 和 `a === b` 的逻辑，并指出当前示例存在的一个可运行性问题。源码静态阅读，**运行未验证**。

## 单例示例的目标

代码希望让所有“打开网页”的操作共用一个 `Popup` 对象，而不是每次点击按钮都：

```js
new Popup();
```

核心实现：

```js
class Popup {
  static ins;

  static getInstance() {
    if (!Popup.ins) {
      Popup.ins = new Popup();
    }
    return Popup.ins;
  }
}
```

## `static ins` 保存唯一实例

`static ins` 是类属性，访问方式是：

```js
Popup.ins
```

而不是：

```js
somePopup.ins
```

它负责保存已经创建好的对象。第一次获取实例时它为空；创建完成后，它指向唯一的 `Popup` 对象。

## `getInstance()` 控制创建时机

```js
static getInstance() {
  if (!Popup.ins) {
    Popup.ins = new Popup();
  }
  return Popup.ins;
}
```

调用流程：

```text
第一次 getInstance()
  → ins 不存在
  → new Popup()
  → 保存到 Popup.ins
  → 返回实例

第二次 getInstance()
  → ins 已存在
  → 不再 new
  → 返回原来的实例
```

这就是延迟创建：只有真正需要对象时才创建。

## 为什么 `a === b` 为 true

```js
const a = Popup.getInstance();
const b = Popup.getInstance();
console.log(a === b); // true
```

对象变量保存的是引用。`a` 和 `b` 都拿到 `Popup.ins`，所以严格比较的结果为 `true`。

这不是两个内容相同的对象，而是两个变量指向同一个对象。

## 按钮事件如何使用单例

```js
const openBtn = document.getElementById("openBtn");
openBtn.addEventListener("click", () => {
  a.open("https://www.baidu.com");
});
```

按钮点击时，事件回调调用 `a.open()`。设计意图是让 `Popup` 类统一管理打开网页这件事，而不是把逻辑散落在不同的点击事件中。

## 当前示例的关键问题

`Popup` 类中没有 `open()` 方法，但按钮事件调用了：

```js
a.open("https://www.baidu.com");
```

因此点击按钮时可能报错：

```text
TypeError: a.open is not a function
```

被注释的代码：

```js
window.open("https://www.baidu.com ", "_blank");
```

说明作者原本想让 `Popup.open()` 内部调用 `window.open()`；但这个方法还没有实现。`_blank` 通常表示在新标签页或新窗口中打开页面。

## 单例模式排查清单

| 检查项 | 正确状态 |
|---|---|
| 是否有缓存实例的静态属性 | 例如 `static ins` |
| 是否有统一获取入口 | 例如 `static getInstance()` |
| 创建逻辑是否只在实例不存在时触发 | `if (!Popup.ins)` |
| 所有业务代码是否通过入口获取实例 | `Popup.getInstance()` |
| 调用的方法是否真的定义在类中 | 当前 `open()` 未定义 |
| 是否直接绕过入口执行 `new Popup()` | 当前代码未限制，需要团队约定 |

## 面试怎么说

可以这样回答：

> 单例模式通过一个静态属性保存实例，并通过静态方法统一获取。第一次调用时创建实例，后续调用直接复用，因此适合管理配置、缓存、日志或模型等全局共享资源。JavaScript 中还要注意：如果构造函数没有额外限制，外部仍可以直接 `new`，所以单例通常依赖封装和使用约定。

## 结语

理解单例模式，不要只记“只创建一个对象”。重点是理解：**谁负责创建、实例存在哪里、后续如何复用、业务代码是否绕过统一入口。**

下一步可以给 `Popup` 补上 `open()` 方法，再在浏览器中验证按钮是否能打开新页面。本文未执行项目，运行结果未验证。

标签: JavaScript, 设计模式, 单例模式, DOM
