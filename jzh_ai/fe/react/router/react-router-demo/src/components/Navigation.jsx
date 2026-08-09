// a 点击后跳转，二次处理
// 不直接用 a 标签，用 Link 组件
// 适合SPA 的路由跳转的组件功能
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/user/123">小家</Link></li>
        <li><Link to="/products">产品列表</Link></li>
        <li><Link to="/products/123">产品详情</Link></li>
        <li><Link to="/products/new">新增产品</Link></li>
        <li><Link to="/old-path">旧路径</Link></li>
        <li><Link to="/login">登录</Link></li>
        <li><Link to="/pay">支付</Link></li>
      </ul>
    </nav>
  );
}

export default Navigation