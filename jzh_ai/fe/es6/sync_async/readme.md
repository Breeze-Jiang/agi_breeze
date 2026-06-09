# JS 异步和同步
## js 有哪些异步任务
cpu执行时间 不能霸占，几十毫秒的轮询分配给进程的执行时间
进程 董事长 PID process
线程 经理  thread
主线程，还可以启动子线程

- c++ ，java 等系统级别语言有多进程架构，执行效率高，但复杂
- js 简单 ，设计为单线程架构
setTimeout

## js执行机制
- 前端script 或后端 node / bun 代码执行
- 启动一个进程 PID 负责分配资源
- 进程启动一个主线程
  js 足够简单，单线程
- 先把同步任务快速执行掉，
  可以快速把同步代码，用户需要看到的页面，
- 还有定时器，fetch 请求，事件等耗时性的异步任务 Async task
- js 
会把它放入到event loop 中  
跳过，先执行后面的同步代码，等同步代码执行完后，再到event loop 中把异步代码拿会到线程中执行

## 控制执行流程
A fetch users api接口 所有的用户
B fetch 每一个用户



## 理解Promise
- 实例化Promise对象
- 需要传递一个函数，executor
  会立即执行，是耗时性任务的容器 是同步的，用于容纳异步任务，同时会得到resolve 和 reject 两个函数能力
- resolve 表示异步任务成功解决了
  then被调用
- reject 表示异步任务失败了
  catch被调用
- 在executor 里面的异步任务成功解决后异常时，手动调用
- resolve() 函数里面可以传递一个参数，作为then 中的回调函数的参数
- reject() 函数里面可以传递一个参数，作为catch 中的回调函数的参数