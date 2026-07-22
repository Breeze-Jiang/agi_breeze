// 创建一个应用实例，
import { createApp } from 'vue'
// 适合全局 组件共享的样式
import './style.css'
import App from './App.vue'
// App是根组件 会有子组件
//创建一个app挂到#app挂载点上
createApp(App).mount('#app')
