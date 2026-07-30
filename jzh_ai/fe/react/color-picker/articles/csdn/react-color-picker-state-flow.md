---
tags: [React, TypeScript, Vite, 状态管理, 前端工程化]
---

# React 颜色选择器如何保持预览同步：用状态提升串起 RGB 滑块与异步列表

一个 RGB 颜色选择器看似只是三个滑块，但只要预览区和输入控件都要响应同一次操作，核心问题就变成：**颜色状态应该由谁保存，更新又该如何回流？**

本文基于一个 React + TypeScript 小项目，拆解两条可迁移的实现路径：用父组件统一管理 RGB 状态，让滑块和预览始终同步；以及将成员列表请求收敛到 `api/` 模块、在组件挂载后更新本地状态。项目代码仅做静态阅读，**运行未验证**。

## 1. 先确定唯一的颜色状态源

项目把颜色类型集中放在 `model/color.ts`：

```ts
export interface Color {
  red: number;
  green: number;
  blue: number;
}
```

`App` 负责创建 `Color` 状态，并将同一份 `color` 同时传给预览和选择器：

```ts
const [color, setColor] = useState<Color>({
  red: 20,
  green: 40,
  blue: 180,
});

<ColorBrower color={color} />
<ColorPicker color={color} onClorUpdated={setColor} />
```

这里最重要的不是 `useState` 本身，而是状态位置：`ColorPicker` 负责采集用户操作，`ColorBrower` 负责展示结果，两者都不应该再各自保存一份 RGB 值。它们的共同父组件 `App` 才是合适的唯一数据源。

## 2. 受控滑块：读取值，回调更新请求

三个滑块都使用 `value` 绑定来自 props 的通道值，范围为 0～255。以 red 通道为例：

```ts
<input
  type="range"
  min={0}
  max={255}
  value={props.color.red}
  onChange={event => {
    props.onClorUpdated({
      ...props.color,
      red: Number(event.target.value),
    });
  }}
/>
```

这段代码完成了三个动作：

1. 用 `value={props.color.red}` 让滑块由 React state 控制；
2. 用 `Number(event.target.value)` 将 DOM 输入的字符串转为数值；
3. 用对象展开保留 green、blue，只替换 red。

因此数据流是单向的：

```text
App.color → ColorPicker.value
用户拖动滑块 → onClorUpdated → App.setColor
App 重新渲染 → 新 color 再传给两个子组件
```

### 常见错误—原因—处理

| 表象 | 原因 | 处理 |
| --- | --- | --- |
| 改 red 后 green、blue 消失 | 更新对象时只构造了 `{ red: value }` | 使用 `...oldColor` 保留其他字段 |
| 类型不匹配或颜色计算异常 | `event.target.value` 是字符串 | 显式转为 `Number` |
| 滑块与预览不一致 | 两个组件各自存储颜色 | 将状态提升到共同父组件 |

## 3. 预览组件只做派生渲染

预览组件没有自己的状态，而是根据 props 生成 CSS：

```ts
const divStyle: React.CSSProperties = {
  width: '11rem',
  height: '7rem',
  backgroundColor: `rgb(${props.color.red}, ${props.color.green}, ${props.color.blue})`,
};

return <div style={divStyle}></div>;
```

这是一种值得保留的边界：当 UI 能从已有状态直接计算时，不要再创建第二个 state。`backgroundColor` 是 `color` 的派生值；重复保存它只会增加同步成本。

## 4. 异步成员列表：Effect 发起请求，State 保存结果

项目还包含一个成员表格，用于展示另一类常见数据流。成员模型放在 `model/member.ts`：

```ts
export interface MemberEntity {
  id: number;
  login: string;
  avatar_url: string;
}
```

接口函数放在 `api/memberApi.ts`，对组件暴露稳定的返回类型：

```ts
export const getMemberCollection = (): Promise<MemberEntity[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([/* 两条固定成员数据 */]);
    }, 1000);
  });
};
```

`MemberTable` 先用空数组完成首次渲染，再在挂载后的 effect 中请求数据：

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

空依赖数组 `[]` 表示在该组件实例首次挂载后执行这一 effect，而不是每次重新渲染都重新请求。状态更新后，再用 `map` 生成行，并以 `member.id` 作为列表键。

## 5. 这份目录划分解决了什么问题

README 提出了 `model` 与 `api` 两个目录。对应到源码，它们承担了不同职责：

| 目录 | 当前内容 | 组件获得的收益 |
| --- | --- | --- |
| `model/` | `Color`、`MemberEntity` 类型 | 多个模块共享相同数据契约 |
| `api/` | `getMemberCollection` | 页面不直接关心模拟延时或未来的请求实现 |
| `components/` | 选择器、预览、表格 | 每个组件专注输入、展示或列表渲染 |

后续把模拟 Promise 换成真实 HTTP 请求时，只要尽可能维持 `getMemberCollection(): Promise<MemberEntity[]>` 的契约，表格组件的调用逻辑就不必跟着重写。

## 6. 一份可复用的自检清单

实现类似交互时，可以按下面检查：

- [ ] 两个组件需要展示同一份数据时，是否只有一个状态源？
- [ ] 输入控件的 `value` 是否来自 state，更新是否通过回调回到拥有 state 的组件？
- [ ] 更新对象中的单字段时，是否保留了其他字段？
- [ ] 是否将输入字符串显式转换为领域模型需要的类型？
- [ ] 异步请求是否放在 effect 中，结果是否写入 state？
- [ ] API 返回值和列表元素是否有可复用的 TypeScript 类型？
- [ ] 列表渲染是否使用稳定的 `key`？

## 7. 边界与下一步

当前 `getMemberCollection` 只是固定数据加 1 秒延时的模拟接口，尚未体现真实接口的加载、失败、取消和认证处理。`MemberRow` 也尚未标注 props 类型；可以补上包含 `member: MemberEntity` 的接口，让类型边界与其他模块保持一致。

可迁移的结论很简单：**共享状态放在共同父组件；子组件通过 props 读取、通过回调发起更新；异步数据由 API 层提供契约，再由 effect 写入组件状态。** 先守住这三层边界，颜色预览和列表渲染都会更容易保持同步与演进。

---

## 材料与验证说明

- 材料来源：项目 README、`src/App.tsx`、颜色组件、成员表/API 及两个模型文件。
- 运行状态：运行未验证；未执行依赖安装、开发服务器、构建或 lint。
- 平台规则基线：CSDN 参考文件的 `last_verified` 为 2026-07-13；本次未联网复核编辑器与标签等易变化规则。
