import * as React from 'react'
import HelloComponent from './components/Hello'
import NameEditComponent from './components/NameEditComponent'

const App = () => {
  const [name, setName] = React.useState('defaultName')
  // 编辑中的
  const [editingName, setEditingName] = React.useState('defaultName')
  const loadUsername = () => {
    setTimeout(() => {
      setName('loadedName')
      setEditingName('loadedName')
    }, 2000)
  }
  React.useEffect(() => {
    // 组件挂载后
    loadUsername()
  }, [])
  const setUserNameState = () => {
    setName(editingName)
     }
  return (
    <>
      名字：{name}

      <h2>{editingName}</h2>
      <HelloComponent username={editingName} />
      <NameEditComponent
        editingName={editingName}
        onNameUpdate={setUserNameState}
        onEditingNameUpdates={setEditingName}
        disabled={editingName === "" || editingName === name} />
    </>
  )
}
export default App