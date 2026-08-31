// 全局负责 提供用户身份状态存储
// 创建store 
import { create } from 'zustand';
// hooks 编程 自定义hooks 
export const useAuthStore = create(set => ({
  // set 修改状态的方法 
  token: localStorage.getItem('token')|| '',
  user:  JSON.parse(localStorage.getItem('user')) || null,
  // actions  动作 
  setAuth:({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({
      token,
      user
    })
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      token: '',
      user:null
    })
  }
}))