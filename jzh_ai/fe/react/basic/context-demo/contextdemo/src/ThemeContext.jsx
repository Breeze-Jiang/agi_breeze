// 将创建一个Theme 上下文 为深层次的组件树，提供共享主题数据
import { createContext } from 'react'

export const ThemeContext = createContext('light')