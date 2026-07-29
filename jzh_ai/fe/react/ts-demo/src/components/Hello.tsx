// import * as React from 'react'
// // props 类型 定义组件的 需要满足的接口约束

// const Hello: React.FC<{username:string}>  = ({username}) => {
//   return(
//     <div>
//       <h1>Hello {username}</h1>
//     </div>
//   )
// }


// export default Hello

// import * as React from 'react'
// // props 类型 定义组件的 需要满足的接口约束
// interface Props {
//   username:string
// }
// // type Props = {
// //   username:string
// // }
// const Hello: React.FC<Props>  = (props) => {
//   return(
//     <div>
//       <h1>Hello {props.username}</h1>
//     </div>
//   )
// }
import * as React from 'react'
interface Props {
  username:string
}
const HelloComponent: React.FC<Props>  = (props) => {
  return(
   <>
   <h2>Hello {props.username}</h2>
   </>
    
   
      
   
     
    
  )
}



export default HelloComponent
