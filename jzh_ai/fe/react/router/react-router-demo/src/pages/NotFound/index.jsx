import {
  useEffect
} from 'react'
import {
  useNavigate
} from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()
  useEffect(() => {
    setTimeout(()=>{
      navigate('/')
    },3000)
  }, [])
  return (
    <>
      <h1>404 Not Found</h1>
    </>
  )
}

export default NotFound
