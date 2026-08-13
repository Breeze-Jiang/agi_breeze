import React,{lazy,Suspense} from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Nav from './components/Nav'

const Home = lazy(()=>import('./pages/Home'))
const Todos = lazy(()=>import('./pages/Todos'))
function App() {


  return (
    // 路由接管
    <Router>
      <Nav/>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/todos" element={<Todos/>}/>
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App;

