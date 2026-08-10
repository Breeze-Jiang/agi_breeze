// react 全面hooks 编程 , 可以使用react , react-router-dom等提供的hooks,还可以自定义hooks
// 函数的封装,多的地方是可以将react 响应式 ,副作用业务封装等封装进去
// 在Provider  多个地方消费数据,模块化抽离到hooks目录下
import {ThemeContext} from '../ThemeContext'
import {useContext} from 'react'

// 约定以use开头
export const useTheme = () => {
  return useContext(ThemeContext)
}
