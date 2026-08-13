# 全栈项目 ： Todos
## 前后端职责和功能分离
- react + react-router + zustand（状态管理）
前端项目独立开发的三架马车
  组件（响应式） + 路由 + 状态管理（银行）
  独立的前端应用
- 后端 node koa mysql
  提供 api  / todos json 数组

## 前后端协作 
/ api 接口请求
前后端分离的了吗？  唯一一个耦合
前端要等着后端提供的接口，渲染数据状态
如何不耦合？ 前端怎么样做不用等后端的接口
此案吧界面写完 mockjs
后端把api 真正写完后，再把请求切过去

## 前端接口
前端可以做独立路由
前端也可以独立做数据接口（mock ， 开发阶段）

/api 目录 所有前端接口统一管理
- axios 标准http 请求库
  fetch / xhr App 应用升级到axios

- 前端为什么需要api 目录
  - 后端往往不能及时提供
  - 前端接口层
    - 管理所有的接口
    axios 配置
    - 先伪造数据
    baseUrl 一键切换
    前端工程里的一环,即API 工程

## 前后端联调?
- 前端独立的完成整个app
  axios 配置 /api 前缀
  / api / todos 前端接口 返回 json数据
  目前没有这个接口,那就提供
## mockjs


## 流程
前端需要数据状态, 由数据接口提供
不能直接走后端数据接口,前后端分离,可能步调不一致
前端也需要独立完备整个应用开发工程系统, 纳入了前端接口工程
- api / 目录 配置 axios baseURL / api 
  前端一类路由是页面级别路由 pages/ ...
  现在还有前端接口的路由 /api  不是react-router-dom 处理的范围
- mockjs vite 配置
  mock 目录
  export default [
    {
      url:'/api/todos',
      method:'get | post',
      timeout:2000,
      response: ...
    }
  ]

- 开始
  /todos页面 响应式的状态 todos
  接口 url https://localhost:5173/api/todos
  https://localhost:5173/todos
  axios baseURL /api