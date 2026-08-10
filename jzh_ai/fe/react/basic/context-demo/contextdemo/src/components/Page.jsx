import Child from './Child'
import { useTheme } from '../hooks/useTheme'

const Page = () => {
  const theme = useTheme()
  return (
    <>
      Page{theme}
      <br />
      <Child />
    </>
  )
}
export default Page
