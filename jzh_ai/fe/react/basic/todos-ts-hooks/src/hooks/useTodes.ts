import { useState} from 'react'
import type { Todo, FilterType } from '../types/todos'



export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const addTodo = (text: string) => {
    if(!text.trim()) return
    const newTodo: Todo = {
      id: Date.now().toString(),
      text : text.trim(),
      completed: false,
    }
    setTodos([...todos, newTodo])
  }
  const toggleTodo = (id: string) => {
    setTodos(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    )
  }
  const deleteTodo = (id: string) => {
    setTodos(prev => 
      prev.filter(item => item.id !== id)
    )
  }
  const clearCompleted = () => {
    setTodos(prev => 
      prev.filter(item => !item.completed)
    )
  }
  // const filterTodos = () => {

  // }
  return { todos, filter, addTodo, toggleTodo, deleteTodo, clearCompleted }  
}