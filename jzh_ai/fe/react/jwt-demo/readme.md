# jwt 登录鉴权
用的都是jwt JSON Web Token
- http 都是无状态的 Stateless ， 用户身份？ 如何识别你是谁
- Header Authorization 中携带 jwt token
  Bear 开头的 后面带上 token  这就是鉴权码
- 在login 时 ，要带着用户名和密码
{
  id: 1,
  username: 'admin',
  password: '123456'
}
JSON 身份对象  ->  JWT => token 颁发给登录者
每次带上token => authorization => decode => JSON 对象

## zustand
轻量级的状态框架 react 全家桶 react + react-router-dom + zustand
- 父子转递 组件通信 状态共享
- createContext + useContext 跨层级共享
- 登录与否， 用户信息 全局状态
  全局共享， 跨路由
  zustand 统一管理， 使用 store（状态仓库）  统一管理
  React App = UI Component + Store 

## mockjs 大前端 鉴权
- axios baseURL
- vite mockjs 插件
  /api/


## JSON Web Token
sign , verify 两个动作
sign 用户 json 对象（身份信息，json 具有强大的表现力）
cookie / session 登录方案
cookie 请求每次都会带上 sessionId
sessionId -> 内存中 session 会话对象  不太适合分布式
jwt 没有这个问题，任何一台服务器签发的token 

## 拦截器
axios 默默地做了很多
1.后端签发的token 放在localStorage
2.axios 配置里添加一个interceptors
  - request
  每个axios 请求拦下来
  config 请求配置对象
  config.headers['Authorization'] = `Bearer ${token}`;
  每次请求自动带上
  return config
  - response
  服务器返回的数据 response.data
  response.config
  response.headers


  POST   /api/login HTTP/1.1  ->  请求方法  POST  请求路径  /api/login

  Host: localhost:5173

  请求头：
  Content-Type: application/json          ->  表示：请求体中的数据是 JSON 格式。
  Accept: application/json                ->  表示：我希望服务端返回 JSON 数据。

  请求体：
  {
  "username": "admin",
  "password": "123456"
  }