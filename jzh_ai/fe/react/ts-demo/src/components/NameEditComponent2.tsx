import * as React from 'react'
// interface Props {
//   username:string
//   onChange:(e:React.ChangeEvent<HTMLInputElement>)  => void
// }
// const NameEditComponent: React.FC<Props>  = (props) => {
//   return(
//     <div>
//       <label>Update Name</label>
//       <input 
//         type="text"
//         value={props.username}
//         onChange={props.onChange}
//       />
//     </div>
//   )
// }
interface Props {
  // 接口不是json ，是以；分号结尾隔开的
  initalUsername:string
  onNameUpdate:(newName:string) => void
}
const NameEditComponent: React.FC<Props>  = (props) => {
  // 表单事件 自己打理
  const [editingName, setEditingName] = React.useState(props.initalUsername)
  const onChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value)
  }
  const onNameSubmit = () => {
    props.onNameUpdate(editingName)
  }
  return(
    <>
      <label>Update Name</label>
      <input 
        type="text"
        value={editingName}
        onChange={onChange}
      />
      <button onClick={onNameSubmit}>Update</button>
    </>
  )
}



export default NameEditComponent
