import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 利用vite解决跨域问题
  server: {
    // 配置代理
    // 代理请求到后端服务
    proxy: {
      //前端想去后端请求 /api 开头的接口
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }
})
