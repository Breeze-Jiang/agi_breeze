// 表单交互组件
import { useState } from 'react'
const TodoInput = ({onAdd}) => {
  // console.log(onAdd);
  const [inputValue, setInputValue] = useState('')
  // 当需要报告父组件时，执行
  const handleSubmit = (e) => {
    e.preventDefault()
    onAdd(inputValue)
    setInputValue('')
  }
  return (
    <form className="todo-input" onSubmit={handleSubmit}>
      <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="添加新的todo" autoFocus /> 
      <button type="submit">添加</button> 
    </form>
  )
}



export default TodoInput
