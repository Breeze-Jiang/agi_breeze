import {
  // 代码里重定向，Navigate 组件配置的时候使用
  useNavigate,
  useLocation
} from 'react-router-dom'




function Login() {
  const navigate = useNavigate() // 跳转
  const location = useLocation() // 
  // /login from 对象为空
  // /posts/new 从这里来 -> login from 对象
  // 可选链运算符 es11 
  const from = location.state?.from || '/'
  function handleSubmit(e) {
    e.preventDefault() // 阻止表单默认提交行为
    // 前端原生的表单数据对象
    const formData = new FormData(e.currentTarget)
    // 从表单数据对象中获取用户名
    const username = formData.get('username')
    const password = formData.get('password')
    if(!username || !password) {
      alert('请输入用户名和密码')
      return
    }
    if(username === 'admin' && password === '123456') {
      localStorage.setItem('isLogin', 'true')
      navigate(from, { replace: true })
      return
    } else {
      alert('用户名或密码错误')
      return
    }
  }

//   登录页中的 location 可能是：
//   {
//   pathname: '/login',
//   state: {
//     from: {
//       pathname: '/pay'
//     }
//   }
// }
  // 登录成功后，跳转到 from 路径
  // console.log(from)

  return (
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>
      <input name="username" placeholder="请输入用户名" required /> 
      <input name="password" placeholder="请输入密码" required /> 
      <button type="submit">登录</button>
    </form>
  )
}

export default Login