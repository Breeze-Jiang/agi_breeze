import { getTodos } from '../api/todos'
import { useEffect, useState } from 'react'



function Todos() {
  const [todos, setTodos] = useState([])
  useEffect(() => {
    (async () => {
      const data = await getTodos()
      setTodos(data.todos)
    })()
  }, [])
  return (
    <div>
      <h1>Todos</h1>
    </div>
  )
}

export default Todos
