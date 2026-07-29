# React + TypeScript
- React + ts 非常适合企业级开发
- ts 提供了类型约束，静态编译，大型语言的丰富功能

## React 的类型约束
- React.FC
react 函数组件的类型
() => void 表示没有参数，没有返回值的函数 不符合 React.FC 类型
() => ReactNode 表示返回值为 ReactNode 类型的函数 符合 React.FC 类型
react 本身就是用ts写的， ReactNode，React.FC 内置的类型声明 ，
  - ReactNode 表示 React 组件节点的类型
  - React.FC 表示 React 函数组件的类型

- Hello 组件， 向某人打招呼
React.FC 在父子组件之间props 声明类型 数据约束 ts 出现
React.FC<Props> 表示 Hello 组件的 props 类型为 Props 类型
  - Props 类型 定义组件的 需要满足的接口约束

FC<t> 泛型，泛指内部的类型，props 的类型传参
  type FC<P = {}> = FunctionComponent<P>; react 源码

FunctionComponent 函数组件类的声明 返回一定是ReactElement
type 类型别名 FC 简短一些
type FC<P = {}>  默认值为 {}， 如果传入， 就用传递的类型参数来约束
ts 里 type 和 interface 都可以定义类型 
但子组件需要满足props 中的属性或方法， 接口用来定义对象需要满足的属性和方法 Interface

- interface 自定义事件
- 函数的类型声明 (e:) => void | ReactNode
- React 合成事件  看过去像原生事件
React.ChangeEvent<HTMLInputElement> 泛指内部的需要用到的类型， 事件最重要的事件发生的元素

- 组件升级
  - 组件通信 单向数据流
    父组件负责持有状态和修改状态的方法
    props 属性 + 自定义事件 传给子组件
    多个子组件共享状态
  - 子组件
  如果不需要共享， 子组件的私有状态
  React.ChangeEvent<HTMLInputElement> 复杂性放到了内部

- useEffect
  - 副作用
  在组件挂载（mounted）后 再去请求接口，拿到数据，响应式更新
  满足组件即刻挂载， 快（第一步）， 更新状态（第二部）

- 版本变迁
  1.把子组件的event 对象 传给父组件 导致两边都要ReactEvent
  ChangeEvent<HTMLInputElement>
  影响了父组件的可读性，父组件原来的使命是持有状态和修改状态的方法 让子组件共享
  2.子组件中添加了私有的状态 editingName

  UI = fn(props)
  子组件职责非常单一， 就是负责显示

## useEffect
副作用 hook
对应三个生命周期
  - 组件挂载后
  - 组件更新后
  - 组件卸载前
  - 
  []
  - 挂载及更新后
  [todos]
  - 挂载， 任何项都跟新的执行
  第二个参数不传

  副作用 太多的生命周期， 或状态改变
  附带， 存储一下 ， 清理垃圾