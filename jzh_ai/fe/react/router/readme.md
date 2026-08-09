# 路由
- restful 一切皆资源
- 前端路由负责 切换页面
 以前是要后端路由支持， 传统， 慢， 体验不好
 前后端分离，SPA hashRouter 
 hash 锚链接 改变url hash 部分不会刷新页面
 hashchange

## React 集成前端路由
react 开发全家桶
- react 组件开发，响应式等 UI 界面
- react-router-dom 给应用添加路由 （前端） SPA 单页应用
- zustand/pinia 状态管理
  hashRouter



## 各种路由
- 基本配置
- 路由的懒加载
  首页/页面 加载速度 优化 懒加载
  性能优化
- 动态路由
- 404 Not Found
- 鉴权路由
- http 无状态的
- 如何变为有状态？
  - 请求头 token Authorization
  - Cookie 小饼干 
  - localStorage 存储 login 登录状态
  user admin
  password 123456
- 组件内部的子组件
  props.children 拿到组件内部声明的子组件
  model 弹窗组件 mask 蒙层
  窗体  头部 尾部 主体部分 children传入
  定制性
  <Model>
    <Pay />
  </Model>

## 路由对象
  - SPA 需要前端路由，
  - url 改变， 对应不同资源 restful 设计理念
  hash #/pay browserRouter history
  - navigator 导航栏
  - location 地址栏
  - history 历史记录
  - replace 会替换当前路由， 不会添加到历史记录中
## 路由的两种选型
- hashRoouter
  url局部改变了 hash部分
  url 有点为了前端路由， url 有点丑， 后端路由不太一样
  /pay #/pay
- BrowserRouter 不用hash 方案实现SPA