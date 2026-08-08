# react 常用的hooks
## useState
响应式的状态
## useEffect
响应式的副作用
## useRef
可变对象
  - 可变，但不希望触发渲染
  - 可以用于 绑定DOM 对象
react 不直接操作DOM 
但是万一要操作DOM 对象怎么办？


## DOM 编程
- js在v8引擎
- dom 在渲染引擎
js 里做dom编程 非常消耗性能
- react vue 之前原生js 做DOM 编程
- react vue新框架
  直接规避了DOM 编程，不要做DOM 编程
  react 框架帮我们做DOM 编程
  useState 数据绑定+响应式编程
  前端开发方式直接改变

## 如果非要去操作DOM 对象
不是不可以做，而是建议不要轻易去做
交给react ，
如果需要dom useRef可以实现
  - useRef 声明一个可变对象 初始值时null
  - jsx dom ref 属性绑定
  current指向这个dom 节点对象
  - 和useState 的相同点和区别
  都可以改变 useState聚焦数据状态业务useRef DOM 对象引用等。。。
  - 区别
    - useState 是响应式的状态，useRef 是非响应式的对象
    - useRef 非响应式的

## 总结定义
useRef 是react 的一个提供持久可变对象的hook函数， 经常用来引用DOM 节点对象， 它有一个current 属性， 可以指向任何值或者对象， 不触发渲染


## js ? 单线程
做一些前端交互， 脚本工作， 简单， 显示和操作的页面， 一致性， 不能出问题， 所以如果js是多线程的 可能就有问题，会冲突

页面复杂起来， 有很多任务要干， 耗时任务 ， event loop js 异步执行机制
异步无阻塞， 不要卡在这里， 前端要尽快相应用户的交互 （滚动屏幕， 点击事件）



llm ， 游戏 ， 非界面的业务逻辑， 和耗费计算时间， event loop 异步 搞不定，  用work 线程， 接下更耗时， 更复杂的任务，浏览器独立开辟的内存，复杂计算， 完成后告知主线程（消息机制）

## Web Worker 线程
浏览器提供给js 可以调用的耗时性计算，或者llm ， 游戏等复杂任务的worker线程
js 单线程， event loop 机制 运行的代码
不适合某些复杂计算业务，html5 提供的新特性。 Web Worker 线程
- 开启一个线程
new Worker(
  new URL("./worker.js", import.meta.url)
) 

## Web Worker 适合的场景
- event loop 同步代码？ + 异步代码？ 
- 耗时性的复杂专项任务
  - 游戏引擎计算
  - llm 
  - 加密等密集计算
- 先实例化
- 消息机制
  - js 单线程机制并没有改变，只是在执行一些复杂任务是，主线程和由浏览器提供的webworker 线程
  js是v8引擎的运行时
  浏览器 c++ 多进程多线程的软件
- js 主线程和worker 线程是独立的， 互不干扰 并行执行


## 总结
useRef 用来持久存放web worker 实例， 避免在每次渲染都创建新的worker 实例， 导致性能问题
并在useEffect 组件挂载后初始化优先渲染
方便监听，发送数据

JS 为主线程单线程 event loop 机制 ，主线程负责脚本执行，DOM 渲染， 用户交互等。繁重的cpu计算会阻塞主线程，造成页面卡顿，于是浏览器提供了web worker 线程， 来处理这些耗时的任务。开辟一个独立线程，承担纯计算任务
worker 无法访问DOM ，只能通过消息和主线程相互通信
它只是浏览器提供的辅助线程，页面渲染，组件更新，交互事件
依旧是不能在唯一js主线程运行，因此，js仍是单线程