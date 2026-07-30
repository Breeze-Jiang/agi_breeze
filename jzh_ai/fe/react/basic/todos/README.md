# todos

## React 知识
- 组件化
- 响应式
- 数据驱动（绑定）
- hooks
  useState
    惰性执行
  useEffect
- jsx
- fragment 组件

- 组件通信
  - 父子组件通信
    props 向父组件申请修改状态
    子组件是不可以直接修改父组件的数据状态，只能通过自定义事件通知父组件，父组件修改后，子组件自动更新。
  - 组件树

## 开发流程和思路

- 组件思想
- 规划组件树（项目的目录结构）
  有助于理解vibe coding
- 父子组件通信
  - todos json数组
  数据状态由父组件管理， 子组件共享（props
  子组件可以提出修改
  ）统一的数据状态
  数据和界面统一，不能出问题

## 前端本地存储
- 浏览器 有区间 存内容
  - 浏览器缓存静态资源， 
  - localStorage key:value 配置，关键数据 空间只有5MB 左右
    - setItem(key,字符串)
    - getItem(key,)
  - 前端也有类似mysql 数据库
  IndexDB 

## useEffect
- 组件挂载后执行
- 组件更新后执行
- 组件卸载前执行
- 依赖数组

- useEffect 卸载前的副作用
组件完整生命周期， willunmount
return () => {
  console.log('组件卸载前执行，清除定时器');
  clearInterval(interval)
}
定时器 ， 移除
不移除会内存泄漏