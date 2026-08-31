import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/user";
function RequireAuth({ children }) {
  const token = useAuthStore(state => state.token);
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return (
    <>
      {children}
    </>
  )
}
export default RequireAuth