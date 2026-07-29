import * as React from 'react'

interface Props {
  editingName: string
  onNameUpdate: () => void
  onEditingNameUpdates: (newEditingName: string) => void
  disabled: boolean
}

const NameEditingComponent:React.FC<Props> = (props) => {
  const { editingName, onNameUpdate, onEditingNameUpdates, disabled } = props
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEditingNameUpdates(e.target.value)
  }

  const onNameSubmit = () => {
    onNameUpdate()
  }
  return (
    <>
    <label>Update Name</label>
    <input value={editingName} onChange={onChange} />
    <button disabled={disabled}  onClick={onNameSubmit}>Change</button>
    </>
  )
}
export default NameEditingComponent