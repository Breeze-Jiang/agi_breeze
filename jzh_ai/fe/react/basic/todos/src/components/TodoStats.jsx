const TodoStats = ({
  total,
  active,
  completed,
  onClearCompleted
}) => {
  return (
    <div>
      <div className="todo-stats">
        <p>Total:{total} | Active:{active} | Completed:{completed}
        {
          completed > 0 && (<button onClick={onClearCompleted} className="clear-btn">Clear Completed</button>)
        }
        </p>
      </div>
    </div>
  )
}


export default TodoStats