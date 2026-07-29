import * as React from 'react'
import Hello from './components/Hello'
import NameEditComponent from './components/NameEditComponent2'
const App: React.FC = () => {
  const [username, setUsername] = React.useState('initialName')
  // const setUsernameState = (e:React.ChangeEvent<HTMLInputElement>) => {
  //   setUsername(e.target.value)
  // }
  return (
    <div>
      <Hello username={username} />
      <NameEditComponent
        initalUsername={username}
        onNameUpdate={setUsername} />
    </div>
  )
}

export default App

