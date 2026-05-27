import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'

import { AdminOrderDetailsPage, AdminOrdersPage } from '../features/admin'
import {
  AccountDashboardPage,
  AccountPage,
  OrderDetailsPage,
} from '../features/account'
import {
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
  useAuth,
} from '../features/auth'
import {
  AdminCustomRequestDetailsPage,
  AdminCustomRequestsPage,
} from '../features/customRequests'
import { CheckoutCancelPage } from '../pages/CheckoutCancelPage'
import { CheckoutSuccessPage } from '../pages/CheckoutSuccessPage'
import { HomePage } from '../pages/HomePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/admin/orders"
          element={
            <RequireAdmin>
              <AdminOrdersPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/orders/:orderId"
          element={
            <RequireAdmin>
              <AdminOrderDetailsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/custom-requests"
          element={
            <RequireAdmin>
              <AdminCustomRequestsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/custom-requests/:requestId"
          element={
            <RequireAdmin>
              <AdminCustomRequestDetailsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/account"
          element={
            <RequireAuth>
              <AccountDashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/account/profile"
          element={
            <RequireAuth>
              <AccountPage />
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

function RequireAdmin({ children }: RequireAuthProps) {
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/account" replace />
  }

  return children
}

export default App
