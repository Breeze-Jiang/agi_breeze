# 从 `/pay` 到 `/login` 再回来：React Router 权限路由的最小闭环

很多路由 Demo 能完成页面切换，却没有把“权限拦截”和“登录后回到原页面”讲清楚。这个项目新增的内容正好形成了一条完整学习线：用 `ProtectRoute` 判断登录状态，用 `Navigate` 保存来源路径，用登录页的 `useLocation` 读取它，最后用 `useNavigate` 返回原页面。

本文基于本地项目静态源码，代码运行未验证。

## 1. 先记住这条数据流

```text
用户打开 /pay
  ↓
ProtectRoute 检查 localStorage
  ↓ 未登录
Navigate → /login
state.from = /pay
  ↓
Login 读取 location.state.from
  ↓ 登录成功
navigate(from, { replace: true })
  ↓
回到 /pay
```

其中最重要的不是某一个 API，而是两端的数据结构要一致：传递方把 `from` 放进去，登录页按同样的结构把它取出来。

## 2. ProtectRoute 是权限边界

路由配置如下：

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

这里 `Pay` 不是直接渲染，而是先经过 `ProtectRoute`。可以把它想成门禁：

```text
有登录标记 → 放行 Pay
没有登录标记 → 去 Login
```

核心代码：

```jsx
function ProtectRoute({ children }) {
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

### 这里有一个静态问题

当前源码直接用了 `location.pathname`，但没有声明 `location`。如果要读取 React Router 的 location，应使用：

```jsx
import { Navigate, useLocation } from 'react-router-dom'

function ProtectRoute({ children }) {
  const location = useLocation()
  // 这里继续读取登录状态并执行保护判断
}
```

这是静态发现错误，本文没有执行项目验证。

## 3. 为什么跳转时要带 `state`？

如果只写：

```jsx
<Navigate to="/login" />
```

登录页只能知道自己在 `/login`，不知道用户之前要去哪里。

项目传递了：

```jsx
state={ { from: location.pathname } }
```

用户从 `/pay` 被拦截时，登录页拿到的 state 可以理解为：

```js
{ from: '/pay' }
```

登录页通过：

```jsx
const location = useLocation()
const from = location.state?.from || '/'
```

读取来源路径。这里 `?.` 防止用户直接访问 `/login` 时因为没有 state 而报错；`|| '/'` 表示没有来源时默认去首页。

如果传递的是完整的 location 对象：

```jsx
state={ { from: location } }
```

那读取方式必须是：

```jsx
location.state?.from?.pathname || '/'
```

不能一边传对象、一边按字符串读取。

## 4. 登录成功为什么用 `navigate`？

登录按钮提交属于事件逻辑，适合调用 `useNavigate` 返回的函数：

```jsx
const navigate = useNavigate()

// 登录成功
navigate(from, { replace: true })
```

`Navigate` 是组件，适合“根据当前渲染条件决定是否重定向”；`navigate` 是函数，适合“点击、提交、异步请求完成后主动跳转”。

`replace: true` 会替换当前登录页历史记录。这样登录成功后按浏览器后退，不会再次回到临时登录页。

## 5. 表单本身是怎么工作的？

```jsx
<form onSubmit={handleSubmit}>
  <input name="username" required />
  <input name="password" required />
  <button type="submit">登录</button>
</form>
```

提交方法：

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

- `preventDefault`：阻止浏览器刷新页面。
- `FormData`：按 `name` 获取表单字段。
- `required`：浏览器原生非空校验。
- `localStorage`：保存 Demo 登录标记。
- `navigate`：登录成功后回跳。

当前代码中的账号验证写在前端，只适合学习路由流程。真实项目必须由后端验证账号密码，前端不能靠 `localStorage` 证明用户真的有权限。

另外，密码字段应补充：

```jsx
<input type="password" name="password" required />
```

## 6. 同一个项目还展示了哪些路由技术？

### BrowserRouter

项目使用 `BrowserRouter` 实现无 hash 的 SPA 路由。部署时需要让服务器把深层路径回退到入口 HTML，否则直接刷新 `/pay` 可能得到服务器 404。

### 动态路由

```jsx
<Route path="/user/:id" element={<UserProfile />} />
```

`:id` 是动态参数，页面可以通过 `useParams()` 获取。

### 嵌套路由

```jsx
<Route path="/products" element={<Products />}>
  <Route path=":productId" element={<ProductDetail />} />
  <Route path="new" element={<ProductNew />} />
</Route>
```

它把产品列表作为父路由，把详情和新增作为子路由组织起来。

### 路由级懒加载

```jsx
const Pay = lazy(() => import('./pages/Pay'))
```

配合：

```jsx
<Suspense fallback={<div>Loading...</div>}>
  {/* 路由 */}
</Suspense>
```

访问页面时才加载对应模块，减少初始代码量。

### 404 路由

```jsx
<Route path="*" element={<NotFound />} />
```

`*` 用来兜底未匹配路径。当前 404 页面设置了定时跳首页，但没有清理 `setTimeout`，后续可以补充清理函数。

## 7. 面试中的项目介绍

> 我使用 React、React Router 和 Vite 开发了一个 SPA 路由练习项目，覆盖 BrowserRouter、动态路由、嵌套路由、懒加载、404 兜底和权限路由。针对支付页，我通过 ProtectRoute 判断登录状态，未登录时用 Navigate 跳转到登录页，并通过路由 state 保存原始 pathname；登录成功后用 useNavigate 和 replace 返回原页面。项目使用 localStorage 仅模拟登录状态，真实系统中会把认证和权限校验放到后端。

## 8. 一张排错表

| 现象 | 优先检查 |
|---|---|
| `location is not defined` | ProtectRoute 是否调用 `useLocation()` |
| 登录后总回首页 | 是否传了 state，from 的读写结构是否一致 |
| 未登录仍能访问 Pay | `setItem` 与 `getItem` 的 key 是否一致 |
| 刷新深层路径 404 | 服务器是否配置 BrowserRouter 回退 |
| 密码明文显示 | input 是否设置 `type="password"` |
| 404 跳转时机异常 | 是否清理定时器 |

## 结语

权限路由的最小闭环可以压缩成四句话：

```text
ProtectRoute 判断能不能进。
Navigate 把未登录用户送去登录页。
state 记录用户原本想去哪。
navigate 在登录成功后把用户送回去。
```

理解这条链路后，React Router 中的权限拦截、登录回跳和历史记录控制就不再是零散 API，而是一套连续的数据流。

> 代码基于本地源码静态整理，运行未验证。
