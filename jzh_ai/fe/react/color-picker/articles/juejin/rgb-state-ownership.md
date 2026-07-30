# RGB 滑块和颜色预览不同步？关键不是 CSS，而是状态该放在哪里

**摘要**：一个 React + TypeScript 练习项目同时实现了 RGB 颜色选择器和异步成员表。它给出的工程判断是：共享状态应放在共同父组件，子组件只读取 props 或通过回调申请更新；接口数据则由 `api/` 提供类型契约，再在 `useEffect` 中写入 state。本文只基于静态源码分析，运行未验证。

三个 RGB 滑块、一个颜色预览区域，最容易出现的不是计算公式问题，而是“滑块改了，预览没有一起变”。如果选择器和预览各存一份颜色，任何一次更新都可能造成两份数据失步。

这个小项目把颜色状态放在 `App`，把成员请求放在 `api/`，恰好提供了一个足够小但完整的观察切面：**谁拥有状态，谁就负责协调依赖它的视图；谁消费接口，谁不必知道接口当前是模拟数据还是真实请求。**

## 先看这条状态流

项目定义的颜色模型只有三个数字：

```ts
export interface Color {
  red: number;
  green: number;
  blue: number;
}
```

`App` 创建它，并把同一对象分别传给展示和编辑组件：

```ts
const [color, setColor] = useState<Color>({
  red: 20,
  green: 40,
  blue: 180,
});

<ColorBrower color={color} />
<ColorPicker color={color} onClorUpdated={setColor} />
```

可以把关系压缩成一句话：

```text
App 持有 color → 子组件读取 color → ColorPicker 回调 setColor → App 再把新 color 下发
```

预览和滑块的共同父组件是 `App`，所以它是这份共享状态最自然的位置。这样 ColorPicker 不必知道预览怎么画，ColorBrower 也不必知道用户如何拖动滑块。

## 更新一个通道时，别丢掉另外两个

选择器里以 red 为例的更新逻辑如下：

```ts
props.onClorUpdated({
  ...props.color,
  red: Number(event.target.value),
});
```

这个细节同时解决两件事：

- `range` 输入给出的 `event.target.value` 是字符串，用 `Number(...)` 对齐 `Color` 的数字字段；
- 展开已有 `color`，只覆盖 red，green 和 blue 仍然保留。

这就是对象状态更新的一个实用准则：**只变更需要变更的字段，但不要靠直接修改 props 或旧 state 来实现。** 当前源码在三个滑块中采用相同结构，因此每次操作都能回到父组件的 `setColor`。

## 为什么预览组件不需要自己的 state

预览组件只把 RGB 组合为 CSS 背景：

```ts
const divStyle: React.CSSProperties = {
  width: '11rem',
  height: '7rem',
  backgroundColor: `rgb(${props.color.red}, ${props.color.green}, ${props.color.blue})`,
};
```

`backgroundColor` 可以从 `color` 立即推导出来，因此再用一个 state 保存它只会制造第二个同步点。这个判断不局限于颜色：格式化后的价格、过滤后的数组、由多个字段拼接出的文案，只要能可靠地从已有状态算出，优先把它们视为派生数据。

## 再看另一条流：异步数据如何进表格

成员数据的类型放在 `model/member.ts`，请求函数独立放在 `api/memberApi.ts`：

```ts
export const getMemberCollection = (): Promise<MemberEntity[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([/* 固定成员数组 */]);
    }, 1000);
  });
};
```

当前实现是模拟异步响应，但它已经给出了组件侧需要依赖的契约：`Promise<MemberEntity[]>`。表格组件的职责仅是请求、保存、渲染：

```ts
const [memberCollection, setMemberCollection] =
  React.useState<MemberEntity[]>([]);

React.useEffect(() => {
  (async () => {
    const memberCollection = await getMemberCollection();
    setMemberCollection(memberCollection);
  })();
}, []);
```

`useEffect` 放置异步工作，`useState` 保存会影响 UI 的结果；状态变动后，`memberCollection.map(...)` 将成员转换为表格行，并用 `member.id` 作为 `key`。这条路径和颜色选择器并不相同，却遵守相同原则：让数据变化先回到明确的状态容器，再由渲染函数输出界面。

## 这个项目中最值得保留的目录边界

README 明确提到 `model` 与 `api`。结合源码，可以这样理解：

| 边界 | 放入什么 | 不该承担什么 |
| --- | --- | --- |
| `model/` | `Color`、`MemberEntity` 等数据形状 | 请求细节、JSX 渲染 |
| `api/` | `getMemberCollection` 等接口能力 | 表格布局与组件状态 |
| `components/` | 输入、预览、行与表格 UI | 数据结构的重复声明 |
| `App` | 跨组件共享的颜色协调 | 子组件的具体展示实现 |

当模拟接口被替换为真实请求时，保留 `getMemberCollection(): Promise<MemberEntity[]>` 这个边界，就能减少请求实现变化对 UI 的扩散。

## 一次实现前的检查表

- [ ] 同一份数据被多个组件使用时，是否只有一个状态源？
- [ ] 编辑组件是否通过回调更新，而不是直接修改 props？
- [ ] 对象局部更新时，是否保留了未变字段？
- [ ] DOM 输入值是否完成了必要的类型转换？
- [ ] 异步工作是否位于 effect，结果是否进入 state？
- [ ] 模型类型是否与 API 模块分离，避免组件重复声明？

## 不要把练习代码当成已完成的生产方案

材料中尚未实现加载态、请求失败、取消请求或真实后端协议；API 仅用固定数组和 1 秒延时模拟结果。`MemberRow` 也没有明确的 props 类型。它们是后续可补充的边界，而不是本文可以宣称已经具备的能力。

从这个练习里可以带走的结论是：**同步问题通常先是数据归属问题。让共享状态归属于共同父组件，让派生视图只读状态，让异步结果以类型化契约进入 state，组件之间的关系才会清晰。**

---

标签：React、TypeScript、前端状态管理、Vite、组件设计

材料边界：基于 README、入口组件、颜色组件、成员表、API 与模型文件的静态阅读；运行未验证，未执行构建或 lint。掘金编辑器规则使用 2026-07-13 的本地策略基线，本次未联网复核易变化项。
