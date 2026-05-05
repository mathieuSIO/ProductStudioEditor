import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { AccountDashboardPage, OrderDetailsPage } from '../features/account'
import { HomePage } from '../pages/HomePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/account" element={<AccountDashboardPage />} />
        <Route path="/account/orders/:orderId" element={<OrderDetailsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
