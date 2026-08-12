---
title: TS type & interface 的区别
aliases:
  - TypeScript type interface 区别
  - type 和 interface 对比
  - TS 必考题 type interface
tags:
  - typescript
  - 面试
  - 前端
  - OOP
  - obsidian-note
created: 2026-08-11
source: jzh_ai/Iinterview/ts/type_interface（readme.md、1.ts、2.ts、3.ts、4.ts、UserCard.tsx、App.tsx）
status: 复习中
---

# TS type & interface 的区别

> [!abstract] 一句话总结
> `interface` 和 `type` 都能描述对象结构，但 `type` 能表达联合/元组等非对象类型，`interface` 支持声明合并与面向接口编程。大厂面试的高频考点，必须能脱口而出 4 个核心区别。

## 📌 元信息

- **主题**：TypeScript 中 `type` 和 `interface` 的区别与实战
- **适用场景**：大厂前端面试、TS 日常开发、React 组件 Props 设计
- **材料来源**：`readme.md`（知识点纲要）、`1.ts`–`4.ts`（四个区别的代码示例）、`UserCard.tsx` + `App.tsx`（React 实战）
- **难度**：⭐⭐（零基础可学，但需要理解 OOP 基本概念）

---

## 一、共同点

> [!info] 来源：readme.md「共同点」章节

`interface` 和 `type` 都可以：

1. **描述对象的结构**（对象有哪些字段、字段是什么类型）
2. **用于函数参数、返回值的类型约束**
3. **给对象、变量做类型约束**

```ts
// 两种写法等价地描述同一个对象结构
interface User {
  name: string;
  age: number;
  avatarUrl: string;
}

type UserType = {
  name: string;
  age: number;
  avatarUrl: string;
};

// 都能约束变量
const u1: User = { name: '张三', age: 18, avatarUrl: 'https://jzh.ai/avatar.png' };
const u2: UserType = { name: '李四', age: 20, avatarUrl: 'https://jzh.ai/avatar.png' };
```

> [!tip] 记忆口诀
> 「对象结构两兄弟，type interface 都能做」——这是共同点，面试先答这个再答区别。

---

## 二、4 个核心区别

### 区别 1：继承方式不同

> [!info] 来源：readme.md「继承」+ 1.ts

| 类型 | 继承关键字 | 语法 |
|------|-----------|------|
| `interface` | `extends` | `interface B extends A { ... }` |
| `type` | `&`（交叉类型） | `type B = A & { ... }` |

```ts
// interface 用 extends
interface Person {
  name: string;
}
interface Employee extends Person {
  job: string;
}

// type 用 &（交叉类型）
type PersonType = { name: string };
type EmployeeType = PersonType & { job: string };

const e1: Employee = { name: '陈俊璋', job: '字节 agent 开发工程师' };
```

> [!note] 面试答法
> 「interface 通过 extends 继承，type 通过交叉类型 `&` 实现组合，本质都是把多个类型合并成一个。」

### 区别 2：声明合并（Declaration Merging）

> [!info] 来源：readme.md「声明的合并」+ 2.ts

- `interface` **可以**同名多次声明，TS 会自动合并属性
- `type` **不可以**重复声明同名别名，会报错

```ts
// ✅ interface 同名合并
interface Animal {
  name: string;
}
interface Animal {
  age: number;
}
// 合并后 Animal = { name: string; age: number }

const dog: Animal = { name: '旺财', age: 1 };

// ❌ type 重复声明会报错
// type AnimalType = { name: string };
// type AnimalType = { age: number }; // 错误：标识符“AnimalType”重复
```

> [!warning] 注意
> 声明合并是 `interface` 独有的能力。第三方库的类型补全（`.d.ts`）经常利用这个特性扩展类型，所以库的对外类型推荐用 `interface`。

### 区别 3：能否表述非对象类型

> [!info] 来源：readme.md「能否表述非对象类型」+ 3.ts

| 能力 | `type` | `interface` |
|------|--------|-------------|
| 对象类型 | ✅ | ✅ |
| 联合类型（`A \| B`） | ✅ | ❌ |
| 元组类型 `[number, number]` | ✅ | ❌ |
| 基本类型别名 | ✅ | ❌ |

```ts
// ✅ type 可以表示非对象类型
type ID = string | number;          // 联合类型
type Point = [number, number];      // 元组类型

// ❌ interface 只能表示对象类型
// interface ID = string | number;  // 错误
```

> [!tip] 记忆
> 凡是不是「对象结构」的类型（联合、元组、字面量、基本类型别名），**只能用 type**。

### 区别 4：函数类型的写法

> [!info] 来源：readme.md「函数类型的区别」+ 4.ts

两者都能描述函数类型，但 `type` 的写法更简洁直观。

```ts
// interface 写法：用调用签名
interface AddFn {
  (a: number, b: number): number;
}
const add1: AddFn = (a, b) => a + b;
add1(1, 2);

// type 写法：箭头函数语法，更简洁
type AddType = (a: number, b: number) => number;
```

> [!note] 面试答法
> 「都能描述函数类型。interface 用调用签名 `(a, b): number`，type 用箭头函数 `(a, b) => number`，type 写法更接近实际函数表达，更方便。」

---

## 三、实战应用：React 组件 Props 设计

> [!info] 来源：UserCard.tsx + App.tsx

### 3.1 面向接口编程思想

`UserCard.tsx` 的注释揭示了为什么要用 `interface`：

```
// 接口，oop 里面的核心概念
// 抽象
// js 原型式的，函数是一等对象
// ts 大型企业开发强类型语言，类 java 传统的 oop 思路
// class extends implement interface
// 面向接口的编程 父子组件数据接口
```

**核心思想**：React 父子组件之间的数据传递，本质上就是一个「数据接口契约」。用 `interface` 定义 Props，体现的是 **面向接口编程**（OOP 的核心概念）。

### 3.2 代码结构

```tsx
// UserCard.tsx
interface User {
  name: string;
  age: number;
  avatarUrl: string;
}

interface UserCardProps {
  user: User;              // 复用 User 接口
  onEdit: (id: number) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit }: UserCardProps) => {
  return <div></div>;
};
export default UserCard;
```

```tsx
// App.tsx
import UserCard from './components/UserCard';

function App() {
  return (
    <>
      <UserCard
        user={{ name: '张三', age: 18, avatarUrl: 'https://jzh.ai/avatar.png' }}
        onEdit={() => {}}
      />
    </>
  );
}
```

### 3.3 设计亮点

> [!success] OOP 体现
> `UserCardProps` 通过 `user: User` **复用**了 `User` 接口，体现了接口的抽象与组合能力，这正是 Java 等传统 OOP 语言「面向接口编程」在 TS 中的落地。

---

## 四、面试高频问题清单

> [!important] 以下问题答案均来自材料 readme.md 与 1.ts-4.ts 代码，标注来源

### Q1：type 和 interface 有什么区别？（必问）

**答**（来源：readme.md + 1-4.ts）：
1. 继承方式：interface 用 `extends`，type 用 `&`
2. 声明合并：interface 可同名合并，type 不可重复声明
3. 非对象类型：type 能表示联合/元组/基本类型别名，interface 只能表示对象
4. 函数类型：都能表示，type 写法更简洁

### Q2：什么时候用 interface，什么时候用 type？

**答**（来源：readme.md「interface 的开发用法」+ UserCard.tsx 注释）：
- 需要被合并扩展（如库类型补全）、体现 OOP 面向接口编程（React Props）→ 用 `interface`
- 需要联合类型、元组、基本类型别名、工具类型 → 用 `type`

### Q3：什么是声明合并？举个实际应用场景？

**答**（来源：2.ts）：
同名 `interface` 多次声明会被 TS 自动合并属性。实际场景：给第三方库补充类型定义时，可以用同名 interface 扩展而不修改原始 `.d.ts`。

### Q4：React 组件的 Props 用 type 还是 interface？

**答**（来源：UserCard.tsx）：
**推荐 interface**。因为 React 组件 Props 体现的是父子组件的「数据接口契约」，符合 OOP 面向接口编程思想；且 interface 可被扩展合并，便于后续业务迭代。

### Q5：type 能继承吗？

**答**（来源：1.ts）：
能。`type` 通过交叉类型 `&` 实现组合继承，例如 `type EmployeeType = PersonType & { job: string }`，效果等价于 interface 的 `extends`。

---

## 五、决策树（怎么选）

```
需要描述对象结构？
├─ 是 → 需要被扩展/合并 或 用于 React Props / 体现 OOP？
│       ├─ 是 → 用 interface
│       └─ 否 → type / interface 均可（团队约定优先）
└─ 否（联合、元组、基本类型别名、工具类型）→ 只能用 type
```

---

## ✅ 复习清单

- [ ] 能说出 type 和 interface 的 3 个共同点
- [ ] 能脱口而出 4 个核心区别（继承、声明合并、非对象类型、函数类型）
- [ ] 能写出 interface 的 extends 继承示例
- [ ] 能写出 type 的 `&` 交叉类型继承示例
- [ ] 能解释什么是「声明合并」并说出哪个支持哪个不支持
- [ ] 能写出联合类型、元组类型用 type 的代码
- [ ] 能解释为什么 interface 不能表示联合类型
- [ ] 能写出函数类型的两种写法（interface 调用签名 + type 箭头函数）
- [ ] 能说出 React Props 推荐用 interface 的原因（面向接口编程）
- [ ] 能复述「面向接口编程」在父子组件数据传递中的体现
- [ ] 能画出 type vs interface 的决策树

---

## 🔗 相关笔记

- [[TypeScript 基础类型]]
- [[React 组件 Props 类型设计]]
- [[OOP 面向接口编程]]

## 📚 参考资料

- 材料目录：`jzh_ai/Iinterview/ts/type_interface/`
- 源文件：`readme.md`、`1.ts`、`2.ts`、`3.ts`、`4.ts`、`UserCard.tsx`、`App.tsx`
- TS 官方文档：[Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
