---
type: learning-summary
title: "JavaScript 单例模式：用一个 Popup 实例统一管理新窗口"
aliases: ["单例模式·学习总结"]
tags: [learning, JavaScript, 设计模式, 单例模式]
source_scope: "singleton 目录与项目根目录 readme.md"
coverage:
  deep_read: ["singleton/index.html", "../readme.md"]
  shallow_read: []
  supplement: []
  skipped: ["singleton/readme.ms（空文件）"]
review_status: learning
next_review: null
---

# 一页速览

> [!summary] 核心结论
> - 单例模式的目标是：一个类只提供一个共享实例。
> - 示例通过静态属性 `Popup.ins` 保存实例，通过静态方法 `getInstance()` 统一获取。
> - 第一次调用时 `new Popup()`，后续调用直接返回已保存的实例。
> - `a === b` 输出 `true`，证明两次获取的是同一个对象引用。
> - 当前材料中 `Popup.open` 没有定义，点击按钮时可能报错；源码静态阅读，运行未验证。

## 学习范围

- **深读**：`singleton/index.html`，包含 `Popup` 类、实例获取、按钮事件和打开网页的调用。
- **浅读**：项目根目录 `readme.md`，用于补充单例模式和项目学习背景。
- **补读**：无。
- **跳过**：`singleton/readme.ms`，文件为空。
- **未知**：浏览器是否允许弹窗、当前页面实际运行结果和完整项目的其他代码，材料没有提供验证结果。

## 知识地图

```text
点击按钮
  ↓
addEventListener("click", ...)
  ↓
a.open(url)
  ↓
Popup 实例负责打开网页

Popup.getInstance()
  ↓
检查 Popup.ins
  ├─ 没有：new Popup() 并保存
  └─ 有：直接返回已有实例
```

## 核心知识

### 什么是单例模式

单例模式是一种创建型设计模式，核心是控制实例数量：一个类在整个使用过程中只创建一个实例，并提供统一访问入口。[材料中出现]

适合管理全局共享资源，例如配置对象、日志对象、缓存管理器或模型管理器。它不等于“所有地方都能随便访问的全局变量”，关键在于实例创建过程被集中控制。[材料推导]

### 示例中的实现

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

- `static ins`：保存实例，属于类本身，不属于某个普通对象。
- `getInstance()`：统一获取实例的方法。
- `if (!Popup.ins)`：如果实例还不存在，就创建。
- `new Popup()`：只在第一次获取时执行。
- `return Popup.ins`：返回唯一实例。

调用：

```js
const a = Popup.getInstance();
const b = Popup.getInstance();
console.log(a === b); // true
```

`===` 比较的是对象引用。结果为 `true`，表示 `a` 和 `b` 指向同一个对象。[材料中出现]

### 事件与实例的关系

```js
const openBtn = document.getElementById("openBtn");
openBtn.addEventListener("click", () => {
  a.open("https://www.baidu.com");
});
```

按钮点击后，调用的是单例对象 `a` 的 `open` 方法。设计意图是把“打开新网页”的行为放入 `Popup` 类中统一管理。[材料推导]

但当前 `Popup` 类只有 `getInstance()`，没有定义 `open()` 方法。因此点击按钮时，可能出现：

```text
TypeError: a.open is not a function
```

这是当前示例最重要的未解决问题。

## 重点语法与 API

| 语法/API | 作用 | 标记 |
|---|---|---|
| `class` | 定义对象的模板 | [材料中出现] |
| `static` | 定义属于类本身的属性或方法 | [材料中出现] |
| `new` | 创建类的实例 | [材料中出现] |
| `===` | 严格比较值或对象引用 | [材料中出现] |
| `document.getElementById` | 根据 id 获取 DOM 元素 | [材料中出现] |
| `addEventListener` | 监听 DOM 事件 | [材料中出现] |
| `window.open` | 打开网页，`_blank` 通常表示新标签页/窗口 | [材料中出现] |

## 注释重点解读

源码注释说明 `static` 属性不需要先 `new Popup`，这一点与实现一致：`Popup.getInstance()` 可以直接调用。注释还说明 `a`、`b` 是单例实例，`a === b` 为 `true`，与代码逻辑一致。

不过注释中的“类只实例化一次”需要理解边界：当前写法只是约定通过 `getInstance()` 获取实例，如果外部直接执行 `new Popup()`，JavaScript 仍然允许创建其他实例。严格限制构造函数需要额外设计。[外部补充]

## 面试高频知识

1. **单例模式解决什么问题？** [材料推导] 控制实例数量，统一管理共享资源。
2. **为什么 `getInstance` 要写 `static`？** [材料推导] 这样还没有实例时也能调用它，负责创建第一个实例。
3. **`static ins` 存在哪里？** [材料推导] 它属于 `Popup` 类，不属于 `a` 或 `b` 的普通实例属性。
4. **`a === b` 为什么是 `true`？** [材料中出现] 两个变量都接收同一个 `Popup.ins` 引用。
5. **单例模式和全局变量一样吗？** [外部补充] 不完全一样；单例通常封装创建和访问规则，全局变量可能没有这种控制。
6. **当前代码点击按钮有什么风险？** [材料推导] `Popup.open` 未定义，调用时可能报 `is not a function`。
7. **为什么 `window.open` 可能不生效？** [材料中出现] 浏览器可能拦截非用户操作触发的弹窗；当前示例由点击事件触发，具体结果未验证。

## 复习卡片

> [!tip] 一句话记忆
> 私有/受控创建 + 静态实例保存 + 统一获取入口 = 单例模式的基本结构。

- [ ] `static` 属性和普通实例属性有什么区别？
- [ ] `getInstance()` 第一次、第二次调用分别发生什么？
- [ ] `===` 比较对象时比较的是什么？
- [ ] 为什么单例常用于配置、缓存和模型管理？
- [ ] 当前示例缺少哪个方法？点击后可能发生什么？

## 实践与复习计划

- [ ] 当天：画出 `getInstance()` 两次调用的执行流程。
- [ ] 1 天后：手写一个 `Config` 单例，并打印两次获取结果是否相同。
- [ ] 3 天后：对比单例模式、普通 `new` 创建和全局变量。
- [ ] 7 天后：补充 `open` 方法并在浏览器中验证按钮行为；运行未验证。

> [!question] 未解决问题
> 当前 `Popup` 类没有实现 `open()` 方法；`singleton/readme.ms` 为空，无法确认作者是否计划在其中补充说明。
