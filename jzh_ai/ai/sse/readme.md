# SSE Server Sent Event 服务器发送事件
## BFF 层
Backend For Frontend（为前端服务的后端）

backend 纯后端开发
java/go/node MVC 开发
MODEL VIEW CONTROLER
MVC 架构
CURD 接口请求 restful
稳定性，并发，安全
js 前端 ，后端
有需求，接口改一下
大前端工程师 自己写常见的node服务，来达成自身的需求
前端（vue/react） ->  node（bff） ->  后端（node/go/java） 交互

## 流式输出里面
前端页面非常复杂，二进制对象，解码，解析data：各种情况
抽象一下，放到到前端bff层，node 里面去做 前端简洁，难度降低
前端fetch   ->     node服务     ->     llm服务器    


vite 创建的vue项目 ， package.json  ,node_modules 文件夹 
vite工程化， 是node后端服务 ， 方便的用于bff 开发项目

## node 框架开发
- 安装并引入后端开发框架(express)
- 实例化一个app 对象, 并监听一个3000端口
- 定义路由, 

vue前端可以通过 fetch 访问bff路由 ,

## 跨域问题
- 只要域名,端口,协议(http/https) 不同，就是跨域
  fetch等请求的时候,跨域,同源策略,需要后端配置,允许前端访问
- 怎么解决 可以用vite.config.js 配置代理 解决方案
  - 请求地址改成 /api/stream
  /api 标志 请求后端api接口 ,
  不跨域了,但是502  
  - /stream 前端不会提供这个路由
  bff 后端提供了
    所有的前端请求, vite 都会拦截
    vite 工程 , proxy 配置 
    代理请求,并转发出去
    :/3000/stream
    :5173/api/stream (不跨域 502) -> vite proxy /api -> :3000/stream