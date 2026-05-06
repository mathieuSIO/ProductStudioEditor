import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'

import { AccountDashboardPage, OrderDetailsPage } from '../features/account'
import { LoginPage, RegisterPage, useAuth } from '../features/auth'
import { HomePage } from '../pages/HomePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/account"
          element={
            <RequireAuth>
              <AccountDashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/account/orders/:orderId"
          element={
            <RequireAuth>
              <OrderDetailsPage />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

type RequireAuthProps = {
  children: React.ReactNode
}

function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  return children
}

export default App
