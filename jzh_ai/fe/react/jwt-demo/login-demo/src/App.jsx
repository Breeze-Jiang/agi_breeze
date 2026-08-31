import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// 路由守卫组件
import RequireAuth from './components/RequireAuth';
import Nav from './components/Nav';
import { getRepo } from './api/repo';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Pay = lazy(() => import('./pages/Pay'));


function App() {
  // 组件状态几乎都不放在component,  放到store
  useEffect(() => {
    (async () => {
      const res = await getRepo();
      console.log(res);
    })();
  }, []);
  return (
    <Router>
      <Nav />
      <Suspense fallback={<div>loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />}/> 
          <Route path="/login" element={<Login />}/>
          <Route path="/pay" element={
            <RequireAuth>
              <Pay />
            </RequireAuth>
          }/>
           
        </Routes>
      </Suspense>
    </Router>
  )
}
export default App