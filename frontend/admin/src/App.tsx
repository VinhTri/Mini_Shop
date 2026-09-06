import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminRoute } from './components/AdminRoute'
import { AdminLayout } from './layouts/AdminLayout'
import { Categories } from './pages/Categories'
import { Dashboard } from './pages/Dashboard'
import { AdminLogin } from './pages/Login'
import { AdminOrderDetail } from './pages/OrderDetail'
import { Orders } from './pages/Orders'
import { ProductForm } from './pages/ProductForm'
import { Products } from './pages/Products'
import { Interactions } from './pages/Interactions'
import { Returns } from './pages/Returns/Returns'
import { ReturnDetail } from './pages/Returns/ReturnDetail'
import { Exchanges } from './pages/Exchanges/Exchanges'
import { ExchangeDetail } from './pages/Exchanges/ExchangeDetail'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="categories" element={<Categories />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id" element={<ProductForm />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="returns" element={<Returns />} />
          <Route path="returns/:id" element={<ReturnDetail />} />
          <Route path="exchanges" element={<Exchanges />} />
          <Route path="exchanges/:id" element={<ExchangeDetail />} />
          <Route path="interactions" element={<Interactions />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
