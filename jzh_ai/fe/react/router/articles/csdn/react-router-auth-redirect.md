# React Router 实战：用 ProtectRoute 实现登录鉴权与登录后回跳

> 本文基于一个 React Router 学习项目的静态源码整理，代码部分运行未验证。重点不是堆 API，而是把“访问受保护页面—跳转登录—登录后回到原页面”这条链路讲清楚。

标签：React, React Router, 路由鉴权, 懒加载

## 一、先看完整问题

在实际应用中，支付页、订单页、个人中心通常不能让未登录用户直接访问。最常见的需求是：用户访问 `/pay`，系统发现没有登录，就跳转到 `/login`；登录成功后，不是固定回首页，而是回到用户刚才想访问的 `/pay`。

这个项目用 React Router 的 `BrowserRouter`、`Navigate`、`useNavigate`、`useLocation`，再结合 `localStorage` 完成了这条演示链路。同时，页面使用 `lazy` 和 `Suspense` 实现路由级懒加载。本文只做静态分析，未运行验证。

## 二、项目里的路由骨架

入口路由集中在 `src/App.jsx`。项目使用 `BrowserRouter` 提供路由上下文，`Routes` 管理匹配，`Route` 声明路径和页面组件：

```jsx
<Router>
  <Suspense fallback={<div>Loading...</div>}>
    <Navigation />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/user/:id" element={<UserProfile />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
</Router>
```

`BrowserRouter` 使用浏览器 History API，地址中不需要 `#`。`Route` 的 `path` 与当前 URL 匹配后，React Router 渲染对应的 `element`，页面切换不需要整页刷新。

## 三、为什么页面要懒加载？

如果直接写：

```jsx
import Home from './pages/Home'
import About from './pages/About'
```

这些页面模块会进入初始加载链路。即使用户只打开首页，其他页面代码也可能被一起下载。

项目改用：

```jsx
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Pay = lazy(() => import('./pages/Pay'))
```

并用 `Suspense` 提供加载中的占位：

```jsx
<Suspense fallback={<div>Loading...</div>}>
  <Routes>
    {/* 路由配置放在这里 */}
  </Routes>
</Suspense>
```

这里的核心是动态 `import()`：访问某个页面时才加载对应模块。懒加载适合路由页面和大型低频模块，但不建议把所有很小的组件都拆成独立资源，否则可能增加请求数量。

## 四、ProtectRoute 到底保护了什么？

路由配置中，支付页这样写：

```jsx
<Route
  path="/pay"
  element={
    <ProtectRoute>
      <Pay />
    </ProtectRoute>
  }
/>
```

渲染关系是：

```text
ProtectRoute
└── Pay
```

`ProtectRoute` 接收 `children`，根据登录状态决定返回什么：

```jsx
function ProtectRoute({ children }) {
  const isLogin = localStorage.getItem('isLogin')

  if (!isLogin) {
    return <Navigate to="/login" replace state={ { from: location.pathname } } />
  }

  return children
}
```

判断过程是：

```text
读取 isLogin
├── 有值：返回 children，也就是 Pay
└── 没值：返回 Navigate，跳转 Login
```

这里的 `localStorage` 只是学习 Demo 中的前端登录标记，用户可以在控制台手动修改它，因此不能承担真实权限控制。真实系统还必须在后端鉴权。

### 一个必须修复的静态问题

当前 `ProtectRoute.jsx` 使用了：

```jsx
location.pathname
```

但文件中没有声明 `location`，也没有调用 `useLocation()`。静态上应改为：

```jsx
import { Navigate, useLocation } from 'react-router-dom'

function ProtectRoute({ children }) {
  const location = useLocation()
  // 这里继续读取登录状态并执行保护判断
  const isLogin = localStorage.getItem('isLogin')

  if (!isLogin) {
    return (
      <Navigate
        to="/login"
        replace
        state={ { from: location.pathname } }
      />
    )
  }

  return children
}
```

这是静态发现的问题，不代表本文已经运行验证。

## 五、state 如何完成登录后回跳？

保护路由跳转时传递：

```jsx
<Navigate
  to="/login"
  replace
  state={ { from: location.pathname } }
/>
```

假设用户原来访问 `/pay`，那么登录页收到的路由 state 是：

```js
{
  from: '/pay'
}
```

登录页通过：

```jsx
const location = useLocation()
const from = location.state?.from || '/'
```

读取这个路径。`?.` 是可选链：如果用户是直接打开 `/login`，没有携带 state，也不会报错，最终使用 `/` 作为默认值。

登录成功后：

```jsx
localStorage.setItem('isLogin', 'true')
navigate(from, { replace: true })
```

于是完整链路是：

```text
访问 /pay
→ ProtectRoute 发现未登录
→ Navigate 到 /login，state.from = /pay
→ Login 用 useLocation 读取 from
→ 验证通过，保存 isLogin
→ navigate('/pay', { replace: true })
→ 回到 /pay
```

注意，传递方和读取方必须遵守同一份数据契约。如果传的是字符串：

```js
state={ { from: location.pathname } }
```

读取就应是：

```js
location.state?.from || '/'
```

如果传的是完整 location 对象，读取才是：

```js
location.state?.from?.pathname || '/'
```

## 六、登录表单如何处理？

登录页使用原生表单事件：

```jsx
<form onSubmit={handleSubmit}>
  <input name="username" placeholder="请输入用户名" required />
  <input name="password" placeholder="请输入密码" required />
  <button type="submit">登录</button>
</form>
```

提交逻辑：

```jsx
function handleSubmit(e) {
  e.preventDefault()

  const formData = new FormData(e.currentTarget)
  const username = formData.get('username')
  const password = formData.get('password')

  if (!username || !password) {
    alert('请输入用户名和密码')
    return
  }

  if (username === 'admin' && password === '123456') {
    localStorage.setItem('isLogin', 'true')
    navigate(from, { replace: true })
    return
  }

  alert('用户名或密码错误')
}
```

`preventDefault()` 阻止浏览器默认刷新；`FormData` 按 `name` 读取字段；`required` 提供浏览器原生非空校验。当前 Demo 将账号密码写在前端，只适合作为路由练习，真实项目必须调用后端接口，不能把认证逻辑放在浏览器中。

另外，密码输入框应使用：

```jsx
<input type="password" name="password" required />
```

否则输入内容会以普通文本显示。

## 七、Navigate、useNavigate 与 replace

可以这样区分：

| 能力 | 适合场景 |
|---|---|
| `Navigate` | 根据渲染条件声明式重定向，例如未登录拦截 |
| `useNavigate` | 事件或异步逻辑中主动跳转，例如登录成功 |
| `replace` | 替换当前历史记录，避免后退回到临时页或无权限页 |

保护路由使用：

```jsx
return <Navigate to="/login" replace state={ { from: location.pathname } } />
```

登录成功使用：

```jsx
navigate(from, { replace: true })
```

这样可以避免浏览器后退时重新回到刚才的登录页或无权限页面。

## 八、项目中值得继续修复的点

1. **声明 `location`**：在 `ProtectRoute` 中使用 `useLocation()`，否则 `location is not defined`。
2. **统一登录 key**：登录页写入的 key 和保护路由读取的 key 必须完全一致。本项目当前均使用 `isLogin`。
3. **清理 404 定时器**：`NotFound` 中设置了 3 秒后跳转，但当前没有保存 timer 并调用 `clearTimeout`；组件提前卸载时可能留下定时器。
4. **补充密码类型**：密码 input 使用 `type="password"`。
5. **后端鉴权**：`localStorage` 只能改善前端体验，支付等敏感接口必须由后端校验用户身份和权限。
6. **部署回退**：BrowserRouter 刷新 `/pay` 等深层路径时，服务器需要将请求回退到入口 HTML，否则可能出现服务器 404。

## 九、面试中可以这样介绍项目

> 这是一个基于 React、React Router 和 Vite 的 SPA 路由练习项目。我实现了普通路由、动态参数、嵌套路由、路由懒加载、404 页面以及受保护路由。权限路由通过 ProtectRoute 读取登录状态，未登录时使用 Navigate 跳转登录页，并通过 location state 保存用户原本访问的 pathname；登录成功后使用 useNavigate 和 replace 返回原页面。项目还使用 lazy 和 Suspense 做路由级代码分割。Demo 的登录状态使用 localStorage，仅用于演示，真实项目会由后端完成认证和权限校验。

## 十、最后的自检清单

- [ ] 能解释 BrowserRouter、Routes、Route 的关系。
- [ ] 能说明 `lazy + Suspense` 解决了什么问题。
- [ ] 能画出 `/pay → /login → /pay` 的 state 数据流。
- [ ] 能说清 `Navigate` 与 `useNavigate` 的区别。
- [ ] 能解释 `replace` 对浏览器历史记录的影响。
- [ ] 能指出 localStorage 不是后端鉴权。
- [ ] 能发现并修复 ProtectRoute 中未声明 `location` 的问题。

> 文章代码仅依据本地源码静态整理，运行未验证。
