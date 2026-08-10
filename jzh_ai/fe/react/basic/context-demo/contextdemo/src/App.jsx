import { 
  useState,
  useEffect,
 } from 'react'
import { useMouse } from './hooks/useMouse'
function App() {
  const {x,y} = useMouse()
  return (
    <div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      {x && y ? `x:${x},y:${y}` : '鼠标未移动'}
    </div>
  )
}
export default App
