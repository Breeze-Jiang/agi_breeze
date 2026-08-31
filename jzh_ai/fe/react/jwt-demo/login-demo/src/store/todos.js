// todos 状态的子仓 大型项目
// 中小型还是用 传统的状态共享
import { create } from 'zustand'
// create 是一个高阶函数 , 接受一个函数作为参数, 同时返回一个函数
export const useTodosStore = create((set) => ({
  todos: [],
  // action 动作
  setTodos:({todos}) => set({todos}),
}))