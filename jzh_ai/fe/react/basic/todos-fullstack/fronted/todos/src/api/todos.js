// 一个模块一个js文件
import instance from './config'


// api 目录的职责 提供数据接口
// 不是直接去后端 后端没有开发好,
export const getTodos = async () => {
  const res = await instance.get('/todos')
  return res.data
}
