# 单例模式真正解决的不是“只能 new 一次”，而是统一资源入口

看到下面这段代码时，很多人会先记住 `a === b` 是 `true`：

```js
const a = Popup.getInstance();
const b = Popup.getInstance();
console.log(a === b); // true
```

但面试或实际项目中，更重要的问题是：实例由谁创建？谁保存它？其他代码能不能绕过这个入口？本文用一个打开网页的 `Popup` 示例，把这条逻辑拆开。源码静态阅读，**运行未验证**。

## 先看最小模型

```text
Popup 类
  ↓
静态属性 ins 保存实例
  ↓
getInstance 统一返回实例
  ↓
按钮事件调用实例方法
```

单例模式的核心不是魔法，而是资源生命周期的集中管理。

## `getInstance` 做了两件事

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

第一件事：检查实例是否存在。

第二件事：不存在时创建，存在时复用。

所以执行顺序是：

```text
第一次调用：undefined → new Popup() → 保存 → 返回
第二次调用：已有实例 → 不创建 → 直接返回
```

`static` 让 `getInstance()` 在没有实例时也可以直接通过类调用：

```js
Popup.getInstance();
```

如果它不是静态方法，就必须先有一个对象，这与“由它负责创建第一个对象”的目标矛盾。

## `a === b` 证明了什么

```js
const a = Popup.getInstance();
const b = Popup.getInstance();
```

两次调用返回的都是 `Popup.ins`。对于对象，`===` 比较的是引用，因此 `true` 表示两个变量指向同一个实例，而不是仅仅“两个对象内容相同”。

这也是单例示例中最直接的验证方式。

## 和按钮事件连起来

```js
const openBtn = document.getElementById("openBtn");
openBtn.addEventListener("click", () => {
  a.open("https://www.baidu.com");
});
```

页面先找到按钮，再监听点击事件。点击发生后，调用之前获取的单例对象。

这体现了一个可迁移的工程思路：

```text
页面事件只负责触发
业务对象负责执行
实例获取由统一入口负责
```

## 这个例子目前并不完整

`Popup` 类里没有 `open()`，但点击事件调用了它：

```js
a.open("https://www.baidu.com");
```

因此运行时可能出现：

```text
TypeError: a.open is not a function
```

源码中被注释的旧写法是：

```js
window.open("https://www.baidu.com ", "_blank");
```

它暗示打开网页的行为应该封装到 `Popup` 中，但当前材料没有给出完整实现。这个问题不能被“单例模式本身正确”掩盖：设计模式解决结构问题，不能自动补齐缺失的方法。

## 初学者自检表

- `static` 属性属于类还是实例？
- 第一次调用是否真的执行了 `new Popup()`？
- 第二次调用是否复用了缓存？
- `a === b` 比较的是值还是引用？
- 点击事件调用的方法是否在类中存在？
- 是否有人绕过 `getInstance()` 直接 `new Popup()`？

## 单例模式的边界

当前代码通过静态属性实现了“单例式缓存”，但没有禁止外部直接调用：

```js
new Popup();
```

因此它依赖调用约定，而不是严格限制实例数量。对于很多前端小项目，这种实现足够直观；如果要做更严格的限制，还需要进一步封装构造过程。

## 最后一个判断

单例模式值得学习的地方，不是背下 `getInstance` 模板，而是理解资源管理：

> 当一个对象应该被多个地方共享时，把创建、缓存和访问规则集中起来，能减少重复初始化和状态分散。

这个 `Popup` 示例还缺少 `open()` 方法。补齐后再验证弹窗行为，才能把“设计意图”和“实际可运行代码”区分开。运行结果当前未验证。

标签: JavaScript, 单例模式, 设计模式, 前端开发
