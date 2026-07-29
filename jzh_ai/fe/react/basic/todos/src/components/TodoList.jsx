// 列表组件
const TodoList = ({
  todos,
  onToggle,
  onRemove
}) => {
  return (
    <ul className="todo-list">
      {
        todos.length === 0 ? (<li className="empty">暂无todo</li>) : (
          todos.map(todo=>(
            <li key={todo.id} className={todo.completed ? 'completed' : ''}>
              <label>
                <input type="checkbox" checked={todo.completed} onChange={() => onToggle(todo.id)} />
              </label>
              <button onClick={() => onRemove(todo.id)}>删除</button>
            </li>
          ))  
        )
      }
    </ul>
  )
}

export default TodoList