import axios from './config'

export const login = async(data) => {
  // 登录接口
  const res = await axios.post('/login', data)
  return res
}