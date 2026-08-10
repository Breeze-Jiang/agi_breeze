import { useTheme } from '../hooks/useTheme'

function Child() {
  const theme = useTheme()
  return (
    <>
      Child
      <button className={theme}>按钮{theme}</button>
    </>
  )
}
export default Child