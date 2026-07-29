import {
  useState
} from 'react'

// 模拟一个重量级的计算过程
function heavyCalculation() {
  console.log('heavyCalculation')
  //网页性能优化指标 performance 性能表现 api
  const startTime = performance.now() //当前时间
  const result = []
  for(let i = 0; i < 10000; i++) {
    result.push({id:i,name:`用户${i}`})
  }
  const duration = performance.now() - startTime
  console.log(`heavyCalculation 耗时：${duration}ms`)
  return result
}

function App() {
  // const [users] = useState([
  //   {id:1,name:'陈俊璋'},
  //   {id:2,name:'王芳'},
  //   {id:3,name:'张三'}
  // ])
  // const [users] = useState(heavyCalculation())
  const [users] = useState(() => heavyCalculation())
  const [filterText, setFilterText] = useState('')
  // computed 计算属性 依赖于其他状态的计算结果 
  const filteredUsers = users.filter(user => user.name.includes(filterText))

  return (
    <div style={{ padding: "20px" }}>
      <h2>用户列表</h2>
      <input type="text" placeholder="输入用户名过滤" value={filterText} onChange={(e)=>setFilterText(e.target.value)} />
      <p>当前显示{filteredUsers.length}个用户</p>
      <ul style={{maxHeight: "300px", overflowY: "auto"}}>
        {filteredUsers.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  )
}



export default App