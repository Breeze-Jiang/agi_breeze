import axios from './config'

export const getRepo = async() => {
  const res = await axios.get('/repo')
  return res
}