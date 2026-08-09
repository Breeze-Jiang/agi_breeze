import {
  // location.hash 
  // 前端路由有两种形式， 一种是HashRouter 老的，html5 history 新的
  BrowserRouter as Router, // 前端路由 
  Routes,  // 路由配置数组 都是组件
  Route,   // 路由配置数组 组件
  Navigate, // 路由跳转组件
} from 'react-router-dom'
import Navigation from './components/Navigation'
import {
  lazy,
  Suspense,
} from 'react'
// import Home from './pages/Home' // SPA , 动态切换多个页面
// import About from './pages/About'
// // 只要引入了页面就会下载，执行 影响首页的加载速度



const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const UserProfile = lazy(() => import('./pages/UserProfile'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/Products/ProductDetail'))
const ProductNew = lazy(() => import('./pages/Products/ProductNew'))
const Login = lazy(() => import('./pages/Login'))
const Pay = lazy(() => import('./pages/Pay'))
const ProtectRoute = lazy(() => import('./ProtectRoute.jsx'))



const App = () => {
  return (
    <>
      {/* 前端路由接管一切 */}
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
         {/* 导航栏组件 */}
         <Navigation />
         {/* 动态页面切换 */}
         <div id="container">
          
          <Routes>
            {/* 有且只有一个路由显示 当前location.hash 对应页面级别的组件 */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/user/:id" element={<UserProfile />} />
            {/* 嵌套路由 */}
            <Route path="/products" element={<Products />} >
              <Route path=":productId" element={<ProductDetail />} />
              <Route path="new" element={<ProductNew />} />
            </Route>
            <Route path="/old-path" element={<Navigate to="/new-path" />} />
            <Route path="/login" element={<Login />} />
            {/* ProtectRoute 保护路由 门禁保安 */}
            <Route path="/pay" element={
              <ProtectRoute>
                <Pay />
              </ProtectRoute>} />
            {/* 贪婪匹配 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
         </div>
         </Suspense>
      </Router>
    </>
  )
}

export default App