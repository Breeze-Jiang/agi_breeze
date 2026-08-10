import { useState, useEffect } from 'react'

export const useMouse = () => {
    const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  useEffect(() => {
    function handleMouseMove(e) {
      setX(e.clientX)
      setY(e.clientY)
    }
    document.addEventListener('mousemove', handleMouseMove)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  },[])
  return {x,y}
}