import { Navigate } from 'react-router-dom'



function ProtectRoute({ children }) {
  console.log(children,'---------')
  // 拦截请求 鉴权
  // html5 本地存储 域名沙盒
  const isLogin = localStorage.getItem('isLogin')
  console.log(isLogin)
  // 如果没有登录状态 则跳转到登录页
  if (!isLogin) {
    // 路由，设置state 状态对象
    // 用于传递参数
    // 例如：跳转到登录页 并传递当前路由路径
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return (
    <>
      {children}
    </>
  )
}

export default ProtectRoute