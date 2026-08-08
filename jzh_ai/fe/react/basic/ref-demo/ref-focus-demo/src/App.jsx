import { 
  useRef,
  useEffect,
  useState
 } from 'react'



// const App = () => {
//   const [count,setCount] = useState(0);
//   // ref 对象引用 null 初始的时候
//   // 未来会引用的
//   console.log('----------')
//   const inputRef = useRef(null)
//   useEffect(() => {
//     console.log(inputRef.current)
//     // 挂载后直接focus input ,不用点一下
//     inputRef.current.focus()
//   }, [])
//   return (
//     <>
//       {/* 把用户当小白，前端的职责时打造良好的用户体验
//       挂载后直接focus input ,不用点一下 */}
//       <input type="text" autoFocus placeholder="请输入用户名" 
//       ref={inputRef}
//       />
//       {count}
//       <button onClick={() => setCount(count + 1)}>增加</button>
//     </>
//   )
// }




const App = () => {
  const numRef = useRef(0) // 引用一个值
  const [,forceRender] = useState(0)// 引用一个值，用于强制渲染

  return (
    <>
      <div onClick={() => numRef.current++ + forceRender()}>
        <h1>Hello React</h1>
        <h1>{numRef.current}</h1>
      </div>
      
    </>
  )
}
export default App