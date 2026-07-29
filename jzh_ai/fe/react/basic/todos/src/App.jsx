import TodoInput from "./components/TodoInput"
import TodoList from "./components/TodoList"
import TodoStats from "./components/TodoStats"
import Demo from "./components/Demo"
import {
  useState,
  useEffect
} from "react";
import './App.css'


const App = () => {
  //副作用 生命周期 组件挂载后执行
  const [count,setCount]=useState(0)
  const [todos,setTodos] = useState(() => {
    return JSON.parse(localStorage.getItem('todos'))
  })
  useEffect(()=>{
    console.log('组件挂载后执行')
    localStorage.setItem('todos',JSON.stringify(todos))
  },[todos])
console.log('组件准备渲染')
  
  

  //添加todo的方法，父组件管理
  const addTodo = (text) => {
if(text.trim()==='') return;
//全新的状态,拷贝式赋值 +是显示类型转换，为什么？
setTodos([
  {id: + Date.now(),text,completed:false},
  ...todos
])
  }
//切换todo状态的方法
  const toggleTodo=(id)=>{
setTodos(todos.map(todo=>
  todo.id===id?{...todo,completed:!todo.completed}:todo
))
  }
  //删除todo方法
const removeTodo=(id)=>{
setTodos(todos.filter(todo=>todo.id!==id))
}
//Stats 方法
const activeCount=todos.filter(t=>!t.completed).length
const completedCount=todos.length-activeCount;


const total=todos.length;
//清出完成了的todo的方法
const clearCompleted=()=>{
setTodos(todos.filter(todo=>!todo.completed))
}

  return (
    <div>
      Count:{count}
      <button onClick={()=>setCount(count+1)}>count++</button>
      <h1>My Todo List</h1>
      {/* onAdd 自定义事件，子组件通过自定义事件通知父组件，然后执行添加todo方法addTodo() */}
      {count % 2===0 && <Demo/>}
      <TodoInput onAdd={addTodo}/>
      <TodoList todos={todos} onRemove={removeTodo} onToggle={toggleTodo}/>
      <TodoStats total={total} active={activeCount} completed={completedCount} onClearCompleted={clearCompleted}/>
    </div>

  )
}
export default App